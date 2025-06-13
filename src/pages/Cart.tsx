import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/cart.css';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="breadcrumb">
          <Link to="/shop">HOME</Link> / CART
        </div>

        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div 
              className="empty-cart glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/shop" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              className="cart-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="cart-list">
                {cartItems.map((item) => (
                  <motion.div 
                    className="cart-item glass"
                    key={item.product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <div className="cart-item-image-container">
                      <img
                        src={item.product.imageUrls?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="cart-item-image"
                      />
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.product.name}</h3>
                      <p className="item-size">Size: {item.selectedSize || 'N/A'}</p>
                      <p className="item-price">${item.product.price.toFixed(2)}</p>
                      
                      <div className="cart-controls">
                        <div className="cart-quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                            className="quantity-btn"
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-total">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="cart-summary glass">
                <h3>Order Summary</h3>
                <div className="summary-content">
                  <textarea 
                    className="note-box" 
                    placeholder="Add Order Note (optional)"
                    rows={4}
                  />
                  <div className="summary-details">
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)} CAD</span>
                    </div>
                    <div className="summary-line">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="summary-line total">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)} CAD</span>
                    </div>
                  </div>
                  <p className="summary-note">Taxes and shipping calculated at checkout</p>
                  <Link to="/checkout" className="checkout-button">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cart;
