import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="shipping-banner">
        WORLDWIDE SHIPPING :)
      </div>
      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" className="navbar-logo">
            RedeemOrDie
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className={`navbar-toggle ${isOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Links */}
          <motion.div 
            className={`navbar-links ${isOpen ? 'active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''} onClick={() => setIsOpen(false)}>Catalog</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={() => setIsOpen(false)}>Contact</Link>
            <Link to="/cart" onClick={() => setIsOpen(false)} className="cart-link">
              Cart (0)
            </Link>
          </motion.div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 