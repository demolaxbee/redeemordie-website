import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="thank-you-container">
      <div className="thank-you-content">
        <h1>Thanks for your order!</h1>
        <Link to="/shop" className="continue-shopping-btn">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default ThankYou; 