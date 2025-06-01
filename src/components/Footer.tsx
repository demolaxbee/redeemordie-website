import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <span>FOLLOW US ON @REDEEMORDIE</span>
        </div>
        
        <div className="footer-right">
          <Link to="/delivery-returns">Delivery & Returns</Link>
          {/* <Link to="/terms">Terms & Conditions</Link> */}
          <span>© {new Date().getFullYear()} - RedeemOrDie | Powered by ROD</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 