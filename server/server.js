const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const cache = new NodeCache({ stdTTL: 43200 }); // 12 hours cache

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe PaymentIntent Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Exchange rate API endpoint
app.get('/api/rates', async (req, res) => {
  const { from = 'CAD', to } = req.query;
  
  if (!to) {
    return res.status(400).json({ error: 'Target currency (to) is required' });
  }

  // If converting to the same currency, return 1
  if (from === to) {
    return res.json({ rate: 1, from, to, cached: false });
  }

  const cacheKey = `${from}_${to}`;
  
  try {
    // Check cache first
    const cachedRate = cache.get(cacheKey);
    if (cachedRate) {
      return res.json({ rate: cachedRate, from, to, cached: true });
    }

    // Fetch from exchange rate API
    const apiKey = process.env.EXCHANGE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Exchange API key not configured' });
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`
    );
    
    if (!response.ok) {
      throw new Error(`Exchange API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result !== 'success') {
      throw new Error(`Exchange API error: ${data['error-type'] || 'Unknown error'}`);
    }

    const rate = data.conversion_rate;
    
    // Cache the rate for 12 hours
    cache.set(cacheKey, rate);
    
    res.json({ rate, from, to, cached: false });
    
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch exchange rate',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 