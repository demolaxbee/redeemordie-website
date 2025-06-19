import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/cart.css';

interface PriceDisplayProps {
  price: number;
  currencyCode: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, currencyCode, className }) => {
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

  return <span className={className || 'item-price'}>{formattedPrice}</span>;
};

const Cart: React.FC = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    subtotalCAD,
    taxCAD,
    shippingCAD,
    totalPriceCAD, 
    formattedSubtotal,
    formattedTax,
    formattedShipping,
    formattedTotal 
  } = useCart();
  const { currencyCode } = useCurrency();
  const [orderNote, setOrderNote] = useState('');

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="breadcrumb">
          <Link to="/">HOME</Link> / CART
        </div>

        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div 
              className="empty-cart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1>Your cart is empty</h1>
              <Link to="/shop" className="shop-products-btn">
                Shop our products
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              className="cart-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="cart-items">
                {cartItems.map((item) => (
                  <motion.div 
                    className="cart-item"
                    key={`${item.product.id}-${item.selectedSize}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <div className="cart-item-image">
                      <img
                        src={item.product.imageUrls?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="item-info">
                        <h3 className="item-name">{item.product.name}</h3>
                        <p className="item-size">{item.selectedSize || 'N/A'}</p>
                        <PriceDisplay price={item.product.price} currencyCode={currencyCode} className="item-price" />
                      </div>
                      
                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                            className="quantity-btn"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="quantity">{item.quantity}</span>
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
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="summary-line">
                  <span>Tax (2%)</span>
                  <span>{formattedTax}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping</span>
                  <span>{formattedShipping}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
                {currencyCode !== 'CAD' && (
                  <div className="currency-note">
                    <p>You'll be charged C${totalPriceCAD.toFixed(2)} CAD</p>
                  </div>
                )}
              </div>

              <div className="order-note-section">
                <textarea 
                  className="order-note-input" 
                  placeholder="Add Order Note"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="cart-actions">
                <Link to="/checkout" className="checkout-btn">
                  CHECKOUT
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cart;
