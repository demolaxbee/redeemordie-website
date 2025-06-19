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
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Stripe Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  if (!amount || !currency) {
    return res.status(400).json({ error: 'Amount and currency required' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    res.send({ clientSecret: paymentIntent.client_secret });
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

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
