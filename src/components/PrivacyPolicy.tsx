import React from 'react';
import '../styles/footer-pages.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy">
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> December 2024</p>

      <p>At RedeemorDie ("we", "our", or "us"), your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information when you use our website and services.</p>

      <h2>1. Information We Collect</h2>
      <p>We collect personal information that you provide when placing an order or contacting us, including:</p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Shipping and billing address</li>
        <li>Phone number</li>
        <li>Payment details (processed securely through third-party providers like Stripe or PayPal)</li>
      </ul>
      <p>We may also collect basic analytics about how users interact with our site to improve your experience.</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and deliver orders</li>
        <li>Communicate order updates and support requests</li>
        <li>Improve our website and services</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>We do not sell or share your personal information with third parties for marketing purposes.</p>

      <h2>3. Data Security</h2>
      <p>We take reasonable steps to protect your personal information from unauthorized access, disclosure, or misuse. All payment transactions are encrypted and processed through secure platforms.</p>

      <h2>4. Contact Us</h2>
      <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
      <p>
        <strong>Email:</strong> redeemordie66@gmail.com<br />
        <strong>Business Address:</strong> Saskatoon, SK, Canada
      </p>
    </div>
  );
};

export default PrivacyPolicy; 