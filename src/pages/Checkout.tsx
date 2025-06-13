import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import emailjs from '@emailjs/browser';
import { useCart } from '../context/CartContext';
import '../styles/checkout.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!); // TODO: Replace with your Stripe public key

const BACKEND_URL = 'http://localhost:4242'; // Update if your backend runs elsewhere

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, totalPrice } = useCart();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Real order summary from cart context
  const orderSummary = {
    items: cartItems.map(item => ({
      name: item.product.name + (item.selectedSize ? ` (Size: ${item.selectedSize})` : ''),
      price: item.product.price,
      qty: item.quantity,
    })),
    subtotal: totalPrice,
    shipping: 0,
    total: totalPrice,
    currency: 'CAD',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Create PaymentIntent on backend
      const res = await fetch(`${BACKEND_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(orderSummary.total * 100), // Stripe expects cents
          currency: orderSummary.currency.toLowerCase(),
        }),
      });
      const { clientSecret } = await res.json();
      if (!clientSecret) throw new Error('Failed to get payment secret');

      // 2. Confirm card payment
      const cardElement = elements?.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');
      const paymentResult = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: {
              line1: form.address,
              city: form.city,
              country: form.country,
              postal_code: form.postal,
            },
          },
        },
      });
      if (paymentResult?.error) throw new Error(paymentResult.error.message);
      if (paymentResult?.paymentIntent?.status !== 'succeeded') throw new Error('Payment not successful');

      // 3. Send order email to admin via EmailJS
      await emailjs.send(
        'YOUR_SERVICE_ID', // replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // replace with your EmailJS template ID
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: `${form.address}, ${form.city}, ${form.country}, ${form.postal}`,
          order: orderSummary.items.map(i => `${i.qty}x ${i.name}`).join(', '),
          total: orderSummary.total,
        },
        'YOUR_USER_ID' // replace with your EmailJS public key
      );

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2>Contact</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="phone" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} required />
      <h2>Delivery</h2>
      <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
      <input name="address" type="text" placeholder="Address" value={form.address} onChange={handleChange} required />
      <input name="city" type="text" placeholder="City" value={form.city} onChange={handleChange} required />
      <input name="country" type="text" placeholder="Country" value={form.country} onChange={handleChange} required />
      <input name="postal" type="text" placeholder="Postal Code" value={form.postal} onChange={handleChange} required />
      <h2>Payment</h2>
      <div className="card-element-wrapper">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      {error && <div className="checkout-error">{error}</div>}
      <button className="checkout-submit" type="submit" disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {success && <div className="checkout-success">Payment successful! Thank you for your order.</div>}
    </form>
  );
};

const Checkout: React.FC = () => {
  const { cartItems, totalPrice } = useCart();
  const orderSummary = {
    items: cartItems.map(item => ({
      name: item.product.name + (item.selectedSize ? ` (Size: ${item.selectedSize})` : ''),
      price: item.product.price,
      qty: item.quantity,
    })),
    subtotal: totalPrice,
    shipping: 0,
    total: totalPrice,
    currency: 'CAD',
  };

  return (
    <div className="checkout-page">
      <div className="checkout-main">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
      <div className="checkout-summary">
        <div className="summary-box">
          {orderSummary.items.map((item, idx) => (
            <div className="summary-item" key={idx}>
              <span>{item.qty}x {item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span>
            <span>${orderSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>${orderSummary.total.toFixed(2)} {orderSummary.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 