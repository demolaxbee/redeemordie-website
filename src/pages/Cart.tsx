import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/cart.css';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  return (
    <div className="cart-page">
      <div className="breadcrumb">
        <Link to="/shop">HOME</Link> / CART
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <Link to="/shop" className="button">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.product.id}>
                <img
                  src={item.product.imageUrls?.[0] || '/placeholder-image.jpg'}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>Size: {item.selectedSize || 'N/A'}</p>
                  <p>${item.product.price.toFixed(2)}</p>
                  <div className="cart-quantity-controls">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-link" onClick={() => removeFromCart(item.product.id)}>
                    Remove
                  </button>
                </div>
                <div className="cart-line-total">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <textarea className="note-box" placeholder="Add Order Note" />
            <div className="summary-line">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)} CAD</span>
            </div>
            <p className="summary-note">Taxes and shipping calculated at checkout</p>
            <button className="checkout-button">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
