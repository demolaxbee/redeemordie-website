import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import emailjs from '@emailjs/browser';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/formatPrice';
import '../styles/checkout.css';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_API_BASE_URL || 'https://redeemordie-website.onrender.com';

type ShippingMethod = 'delivery' | 'pickup';

const pickupCities = new Set(['toronto', 'saskatoon']);

const normalizeCity = (city: string) => city.trim().toLowerCase();

const calculateShippingCost = (countryCode: string, shippingMethod: ShippingMethod): number | null => {
  if (shippingMethod === 'pickup') {
    return 0;
  }
  const country = (countryCode || '').trim().toUpperCase();
  if (country === 'CA') {
    return 20;
  }
  if (country === 'US') {
    return 27;
  }
  return null; // Other countries not supported
};

if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe configuration missing');
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!); 

const countries = [
  { code: "CA", name: "Canada" },
  { code: "US", name: "United States" }
];

const subdivisions: Record<string, { label: string, options: string[] }> = {
  CA: { label: 'Province', options: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon'
  ] },
  US: { label: 'State', options: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ] },
  NG: { label: 'State', options: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ] },
  AU: { label: 'State/Territory', options: [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
  ] },
  GB: { label: 'County', options: [
    'Bedfordshire', 'Berkshire', 'Bristol', 'Buckinghamshire', 'Cambridgeshire', 'Cheshire', 'City of London', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon', 'Dorset', 'Durham', 'East Riding of Yorkshire', 'East Sussex', 'Essex', 'Gloucestershire', 'Greater London', 'Greater Manchester', 'Hampshire', 'Herefordshire', 'Hertfordshire', 'Isle of Wight', 'Kent', 'Lancashire', 'Leicestershire', 'Lincolnshire', 'Merseyside', 'Middlesex', 'Norfolk', 'North Yorkshire', 'Northamptonshire', 'Northumberland', 'Nottinghamshire', 'Oxfordshire', 'Rutland', 'Shropshire', 'Somerset', 'South Yorkshire', 'Staffordshire', 'Suffolk', 'Surrey', 'Tyne and Wear', 'Warwickshire', 'West Midlands', 'West Sussex', 'West Yorkshire', 'Wiltshire', 'Worcestershire'
  ] },
  // Add more as needed
};

interface CheckoutFormProps {
  onShippingCostChange: (cost: number | null) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onShippingCostChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { 
    cartItems, 
    subtotalCAD,
    clearCart
  } = useCart();
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
  const [subdivision, setSubdivision] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('delivery');
  const hasSubdivision = !!subdivisions[form.country];
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const cityValue = normalizeCity(form.city);
  const isPickupAvailable = form.country === 'CA' && pickupCities.has(cityValue);
  const isShippingReady = !!form.country && (form.country !== 'CA' || subdivision.trim() !== '');
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!isPickupAvailable && shippingMethod === 'pickup') {
      setShippingMethod('delivery');
    }
  }, [isPickupAvailable, shippingMethod]);

  useEffect(() => {
    if (!isShippingReady) {
      setShippingCost(null);
      onShippingCostChange(null);
      return;
    }
    const calculatedCost = calculateShippingCost(form.country, shippingMethod);
    setShippingCost(calculatedCost);
    onShippingCostChange(calculatedCost);
  }, [form.country, subdivision, shippingMethod, isShippingReady, onShippingCostChange]);

  // Real order summary from cart context with new pricing structure
  const orderSummary = {
    items: cartItems.map(item => ({
      productId: item.productId,
      size: item.selectedSize,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    })),
    subtotal: subtotalCAD,
    shipping: shippingCost,
    total: subtotalCAD + (shippingCost ?? 0),
    currency: 'CAD',
  };
  const itemCount = orderSummary.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isShippingReady) {
      setError('Please select your country and province to calculate shipping.');
      return;
    }
    if (isPaying) return;
    setIsPaying(true);
    setLoading(true);
    setError(null);
    try {
      const itemsForMetadata = orderSummary.items.map(item => ({
        name: item.productName,
        size: item.size,
        qty: item.quantity,
      }));
      const orderNote = typeof window !== 'undefined' ? localStorage.getItem('orderNote') : '';
      const taxAmount = 0;
      // 1. Create PaymentIntent on backend
      const res = await fetch(`${BACKEND_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(orderSummary.total * 100), // Stripe expects cents
          currency: orderSummary.currency.toLowerCase(),
          paymentIntentId,
          receiptEmail: form.email,
          itemCount,
          items: itemsForMetadata,
          shippingCountry: form.country,
          shippingRegion: subdivision,
          shippingMethod,
          shippingCost: shippingCost ?? 0,
          taxAmount,
          subtotal: orderSummary.subtotal,
          ...(orderNote ? { orderNote } : {}),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Failed to get payment secret');
      }
      const { clientSecret, paymentIntentId: newPaymentIntentId } = await res.json();
      if (!clientSecret) throw new Error('Failed to get payment secret');
      if (newPaymentIntentId) {
        setPaymentIntentId(newPaymentIntentId);
      }

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

      // 3. Update Airtable stock levels
      const stockPayload = {
        items: orderSummary.items
          .filter(item => item.productId && item.size)
          .map(item => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          }))
      };

      let stockUpdateOk = true;
      if (stockPayload.items.length > 0) {
        const stockResponse = await fetch(`${BACKEND_URL}/api/update-stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockPayload),
        });

        if (!stockResponse.ok) {
          const stockError = await stockResponse.json().catch(() => null);
          const stockCode = stockError?.code || stockError?.error;
          switch (stockCode) {
            case 'AIRTABLE_CONFIG_MISSING':
              setError('Inventory system unavailable. Please try again later.');
              stockUpdateOk = false;
              break;
            case 'INSUFFICIENT_STOCK':
              setError('One of your items sold out. Please adjust your cart.');
              stockUpdateOk = false;
              break;
            case 'PRODUCT_NOT_FOUND':
              setError('A product in your cart is no longer available.');
              stockUpdateOk = false;
              break;
            case 'already_processed':
              stockUpdateOk = true;
              break;
            default:
              setError('An unexpected checkout error occurred.');
              stockUpdateOk = false;
          }
        }
      }

      if (!stockUpdateOk) {
        return;
      }

      // 4. Send order email to admin via EmailJS with size detail
      const orderLineItems = orderSummary.items.map(i => {
        const sizeLabel = i.size ? ` (Size: ${i.size})` : '';
        return `${i.quantity}x ${i.productName}${sizeLabel}`;
      }).join(', ');

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_ORDER_TEMPLATE_ID!,
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: `${form.address}, ${form.city}, ${subdivision ? subdivision + ', ' : ''}${form.country}, ${form.postal}`,
          shipping_method: shippingMethod,
          order: orderLineItems,
          total: orderSummary.total,
          ...(shippingCost !== null ? { shipping_cost: shippingCost } : {}),
        },
        process.env.REACT_APP_EMAILJS_USER_ID
      );

      // Clear the cart after stock update and confirmation email
      clearCart();
      // Redirect to thank you page
      navigate('/thank-you');
    } catch (err: any) {
      setError(err.message || 'Payment failed, please try again.');
    } finally {
      setLoading(false);
      setIsPaying(false);
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
      {isPickupAvailable && (
        <div className="shipping-method-options" role="radiogroup" aria-label="Delivery method">
          <button
            type="button"
            className={`shipping-method-option ${shippingMethod === 'delivery' ? 'active' : ''}`}
            onClick={() => setShippingMethod('delivery')}
          >
            Delivery
          </button>
          <button
            type="button"
            className={`shipping-method-option ${shippingMethod === 'pickup' ? 'active' : ''}`}
            onClick={() => setShippingMethod('pickup')}
          >
            Pickup in {form.city || 'Toronto / Saskatoon'}
          </button>
        </div>
      )}
      <select
        name="country"
        value={form.country}
        onChange={handleChange}
        required
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      {hasSubdivision ? (
        <select
          name="subdivision"
          value={subdivision}
          onChange={e => setSubdivision(e.target.value)}
          required={form.country === 'CA'}
          className="checkout-subdivision-select"
        >
          <option value="">{subdivisions[form.country].label}</option>
          {subdivisions[form.country].options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          name="subdivision"
          type="text"
          placeholder="Region/State/Province (optional)"
          value={subdivision}
          onChange={e => setSubdivision(e.target.value)}
          className="checkout-subdivision-input"
        />
      )}
      <input name="postal" type="text" placeholder="Postal Code" value={form.postal} onChange={handleChange} required />
      <h2>Payment</h2>
      <div className="card-element-wrapper">
        <CardElement
          options={{
            style: {
              base: {
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                '::placeholder': {
                  color: '#bbbbbb',
                },
                backgroundColor: '#1e1e1e',
                padding: '12px',
              },
              invalid: {
                color: '#ff4d4f',
                iconColor: '#ff4d4f',
              },
            },
          }}
        />
      </div>
      {error && <div className="checkout-error">{error}</div>}
      <button className="checkout-submit" type="submit" disabled={loading || !stripe || isPaying}>
        {loading || isPaying ? 'Processing...' : 'Pay Now'}
      </button>

    </form>
  );
};

const Checkout: React.FC = () => {
  const { 
    cartItems, 
    subtotalCAD,
    formattedSubtotal
  } = useCart();
  const { currencyCode } = useCurrency();
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const totalDueCAD = subtotalCAD + (shippingCost ?? 0);
  const isShippingReady = shippingCost !== null;

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="breadcrumb">
            <Link to="/">HOME</Link> / <Link to="/cart">CART</Link> / CHECKOUT
          </div>
          <div className="empty-checkout">
            <h1>Your cart is empty</h1>
            <Link to="/shop" className="shop-btn">Shop our products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="breadcrumb">
            <Link to="/">HOME</Link> / <Link to="/cart">CART</Link> / CHECKOUT
          </div>
          
          <div className="checkout-content">
            <div className="checkout-form-section">
              <CheckoutForm onShippingCostChange={setShippingCost} />
            </div>
            
            <div className="checkout-summary-section">
              <div className="order-summary">
                <h2>Order Summary</h2>
                <div className="summary-items">
                  {cartItems.map((item) => (
                    <div className="summary-item" key={`${item.product.id}-${item.selectedSize}`}>
                      <div className="item-details">
                        <span className="item-name">{item.product.name}</span>
                        <span className="item-size">Size: {item.selectedSize}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      </div>
                      <PriceDisplay 
                        price={item.product.price * item.quantity} 
                        currencyCode={currencyCode} 
                        showAsSpan={true}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="pricing-breakdown">
                  <div className="breakdown-line">
                    <span>Subtotal:</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  <div className="breakdown-line">
                    <span>Shipping:</span>
                    {shippingCost === null ? (
                      <span>Calculated at checkout</span>
                    ) : shippingCost === 0 ? (
                      <span>Free pickup</span>
                    ) : (
                      <PriceDisplay 
                        price={shippingCost} 
                        currencyCode={currencyCode} 
                        showAsSpan={true}
                      />
                    )}
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <PriceDisplay 
                      price={totalDueCAD} 
                      currencyCode={currencyCode} 
                      showAsSpan={true}
                    />
                  </div>
                  {!isShippingReady && (
                    <div className="currency-note">
                      <p>Total will update after shipping is calculated</p>
                    </div>
                  )}
                  {shippingCost === 0 && isShippingReady && (
                    <div className="currency-note">
                      <p>Pickup selected. No delivery fee will be charged.</p>
                    </div>
                  )}
                  {currencyCode !== 'CAD' && (
                    <div className="currency-note">
                      <p>You'll be charged C${totalDueCAD.toFixed(2)} CAD</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

// PriceDisplay component for checkout
interface PriceDisplayProps {
  price: number;
  currencyCode: string;
  showAsSpan?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, currencyCode, showAsSpan = false }) => {
  const [formattedPrice, setFormattedPrice] = useState(`C$${price.toFixed(2)}`);

  useEffect(() => {
    const updatePrice = async () => {
      try {
        const formatted = await formatPrice(price, currencyCode);
        setFormattedPrice(formatted);
      } catch (error) {
        console.error('Error formatting price:', error);
        setFormattedPrice(`C$${price.toFixed(2)}`);
      }
    };

    updatePrice();
  }, [price, currencyCode]);

  return showAsSpan ? <span>{formattedPrice}</span> : <p>{formattedPrice}</p>;
};

export default Checkout; 
