const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Stripe = require('stripe');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const cache = new NodeCache({ stdTTL: 43200 }); // 12-hour TTL

const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const airtableBaseUrl = AIRTABLE_BASE_ID ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}` : null;
const airtableHeaders = AIRTABLE_TOKEN
  ? {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    }
  : null;

const sizeFieldMap = {
  XS: 'Stock_XS',
  S: 'Stock_S',
  M: 'Stock_M',
  L: 'Stock_L',
  XL: 'Stock_XL',
  XXL: 'Stock_XXL'
};

const normalizeAmount = (value, fallback = 0) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : fallback;
};

const formatAmount = (value, currency) => {
  const normalized = normalizeAmount(value).toFixed(2);
  return `${String(currency || '').toUpperCase()} ${normalized}`;
};

const buildIntentDetails = ({
  amount,
  currency,
  receiptEmail,
  itemCount,
  items,
  shippingCountry,
  shippingRegion,
  shippingCost,
  taxAmount,
  subtotal,
  orderNote
}) => {
  const totalAmount = normalizeAmount(amount) / 100;
  const normalizedShipping = normalizeAmount(shippingCost);
  const normalizedTax = normalizeAmount(taxAmount);
  const normalizedSubtotal = normalizeAmount(subtotal);
  const normalizedItemCount = Math.max(0, Math.floor(normalizeAmount(itemCount)));
  const itemLabel = `${normalizedItemCount} item${normalizedItemCount === 1 ? '' : 's'}`;

  const metadata = {
    items: JSON.stringify(Array.isArray(items) ? items : []),
    shipping_country: String(shippingCountry || ''),
    'shipping_province/state': String(shippingRegion || ''),
    shipping_cost: normalizedShipping.toFixed(2),
    tax_amount: normalizedTax.toFixed(2),
    subtotal: normalizedSubtotal.toFixed(2)
  };

  if (orderNote) {
    metadata.order_note = String(orderNote);
  }

  return {
    ...(receiptEmail ? { receipt_email: receiptEmail } : {}),
    description: `${itemLabel} | shipping ${formatAmount(normalizedShipping, currency)} | tax ${formatAmount(normalizedTax, currency)} | total ${formatAmount(totalAmount, currency)}`,
    metadata
  };
};

// Set up security headers
app.use(helmet());

// Trust proxy for platforms like Render
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// JSON body parsing
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://www.redeemordie.com',
  'https://redeemordie.com',
  // 'http://localhost:3000',  // Development
  // 'http://127.0.0.1:3000'   // Development
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Stripe Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  const {
    amount,
    currency,
    paymentIntentId,
    receiptEmail,
    itemCount,
    items,
    shippingCountry,
    shippingRegion,
    shippingCost,
    taxAmount,
    subtotal,
    orderNote
  } = req.body;
  if (!amount || !currency) {
    return res.status(400).json({ error: 'Amount and currency required' });
  }

  try {
    let paymentIntent;
    const intentDetails = buildIntentDetails({
      amount,
      currency,
      receiptEmail,
      itemCount,
      items,
      shippingCountry,
      shippingRegion,
      shippingCost,
      taxAmount,
      subtotal,
      orderNote
    });
    const intentParams = {
      amount,
      currency,
      ...intentDetails
    };

    if (paymentIntentId) {
      try {
        paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
          ...intentParams
        });
      } catch (updateError) {
        console.warn(`Failed to update PaymentIntent ${paymentIntentId}, creating new one.`, updateError.message);
        paymentIntent = await stripe.paymentIntents.create({ ...intentParams });
      }
    } else {
      paymentIntent = await stripe.paymentIntents.create({ ...intentParams });
    }

    res.send({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Newsletter via Brevo
app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Brevo API not configured' });

  try {
    const response = await axios.post('https://api.brevo.com/v3/contacts', {
      email,
      updateEnabled: true
    }, {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// Exchange Rate API with caching
app.get('/api/rates', async (req, res) => {
  const { from = 'CAD', to } = req.query;
  if (!to) return res.status(400).json({ error: 'Target currency required' });
  if (from === to) return res.json({ rate: 1, from, to });

  const cacheKey = `${from}_${to}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ rate: cached, from, to, cached: true });

  const apiKey = process.env.EXCHANGE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Exchange API key missing' });

  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`);
    const rate = response.data.conversion_rate;
    cache.set(cacheKey, rate);
    res.json({ rate, from, to, cached: false });
  } catch (error) {
    console.error('Exchange rate error:', error);
    res.status(500).json({ error: 'Rate lookup failed' });
  }
});

// Update Airtable stock counts after checkout
app.post('/api/update-stock', async (req, res) => {
  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return res.status(500).json({ error: 'Airtable configuration missing' });
  }

  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided' });
  }

  const aggregatedUpdates = items.reduce((acc, item) => {
    const productId = item?.productId;
    const sizeKey = (item?.size || '').toUpperCase();
    const quantity = Number(item?.quantity);

    if (!productId || !sizeFieldMap[sizeKey] || !Number.isFinite(quantity) || quantity <= 0) {
      return acc;
    }

    if (!acc[productId]) {
      acc[productId] = {};
    }
    acc[productId][sizeKey] = (acc[productId][sizeKey] || 0) + quantity;
    return acc;
  }, {});

  const productIds = Object.keys(aggregatedUpdates);
  if (productIds.length === 0) {
    return res.status(400).json({ error: 'No valid stock updates found' });
  }

  try {
    for (const productId of productIds) {
      const recordUrl = `${airtableBaseUrl}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${productId}`;
      const recordResponse = await axios.get(recordUrl, { headers: airtableHeaders });
      const currentFields = recordResponse.data?.fields || {};
      const fieldsToUpdate = {};

      Object.entries(aggregatedUpdates[productId]).forEach(([sizeKey, qty]) => {
        const airtableField = sizeFieldMap[sizeKey];
        if (!airtableField) return;
        const currentValue = Number(currentFields[airtableField]) || 0;
        fieldsToUpdate[airtableField] = Math.max(currentValue - qty, 0);
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        continue;
      }

      await axios.patch(recordUrl, { fields: fieldsToUpdate }, { headers: airtableHeaders });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Stock update error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
