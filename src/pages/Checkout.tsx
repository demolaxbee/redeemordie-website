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

const normalizeProvince = (value: string) => value?.trim().toLowerCase();

const isSaskatchewan = (province: string) => {
  const normalized = normalizeProvince(province);
  return normalized === 'saskatchewan' || normalized === 'sk';
};

const calculateShippingCost = (countryCode: string, province: string) => {
  const country = (countryCode || '').trim().toUpperCase();
  if (country === 'CA') {
    if (isSaskatchewan(province)) {
      return 0;
    }
    return 20;
  }
  return 30;
};

if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe configuration missing');
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!); 

const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" },
  { code: "BN", name: "Brunei Darussalam" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CX", name: "Christmas Island" },
  { code: "CC", name: "Cocos (Keeling) Islands" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo, Democratic Republic" },
  { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FK", name: "Falkland Islands" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GF", name: "French Guiana" },
  { code: "PF", name: "French Polynesia" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" },
  { code: "GD", name: "Grenada" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GG", name: "Guernsey" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "VA", name: "Holy See" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea, North" },
  { code: "KR", name: "Korea, South" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MK", name: "Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NC", name: "New Caledonia" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestinian Territory" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "BL", name: "Saint Barthélemy" },
  { code: "SH", name: "Saint Helena" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "MF", name: "Saint Martin" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SZ", name: "Swaziland" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syrian Arab Republic" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "VG", name: "Virgin Islands, British" },
  { code: "VI", name: "Virgin Islands, U.S." },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
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
  onShippingCostChange: (cost: number) => void;
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
  const { currencyCode } = useCurrency();
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
  const hasSubdivision = !!subdivisions[form.country];
  const shippingCost = calculateShippingCost(form.country, subdivision);

  useEffect(() => {
    onShippingCostChange(shippingCost);
  }, [shippingCost, onShippingCostChange]);

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
    total: subtotalCAD + shippingCost,
    currency: 'CAD',
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

      if (stockPayload.items.length > 0) {
        const stockResponse = await fetch(`${BACKEND_URL}/api/update-stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stockPayload),
        });

        if (!stockResponse.ok) {
          const stockError = await stockResponse.json().catch(() => null);
          throw new Error(stockError?.error || 'Failed to update stock');
        }
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
          order: orderLineItems,
          shipping_cost: shippingCost,
          total: orderSummary.total,
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
          required
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
      <button className="checkout-submit" type="submit" disabled={loading || !stripe}>
        {loading ? 'Processing...' : 'Pay Now'}
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
  const [shippingCost, setShippingCost] = useState(calculateShippingCost('', ''));
  const totalDueCAD = subtotalCAD + shippingCost;

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
                    <span>Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  <div className="breakdown-line">
                    <span>Shipping</span>
                    <PriceDisplay 
                      price={shippingCost} 
                      currencyCode={currencyCode} 
                      showAsSpan={true}
                    />
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <PriceDisplay 
                      price={totalDueCAD} 
                      currencyCode={currencyCode} 
                      showAsSpan={true}
                    />
                  </div>
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
