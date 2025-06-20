import React from 'react';
import '../styles/footer-pages.css';

const DeliveryReturns: React.FC = () => {
  return (
    <div className="delivery-returns">
      <h1>Delivery & Returns</h1>

      <h2>Delivery Policy</h2>
      <p>We currently deliver locally within Saskatoon and internationally.</p>
      <p><strong>Estimated delivery time:</strong> 7 to 14 business days from the date of order confirmation.</p>
      
      <p><strong>Please note:</strong> Delays may occur due to customs, courier issues, or other unforeseen circumstances. We will do our best to keep you updated.</p>

      <h2>No Returns Policy</h2>
      <p><strong>All sales are final.</strong></p>
      <p>Due to the nature of our business and limited inventory, we do not accept returns or exchanges. Please ensure your order details are correct before confirming your purchase. If you receive a damaged or incorrect item, please contact us within 3 days of delivery.</p>

      <h2>Contact Us</h2>
      <p>If you have any questions about delivery or need to report a damaged/incorrect item, please fill out the form on the contact page Or contact us at:</p>
      <p>
        <strong>Email:</strong> redeemordie66@gmail.com<br />
        <strong>Business Address:</strong> Saskatoon, SK, Canada
      </p>
    </div>
  );
};

export default DeliveryReturns; 