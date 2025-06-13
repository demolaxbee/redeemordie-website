import React, { useState } from 'react';
import { Product } from '../utils/airtable';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  isAdmin = false 
}) => {
  const { addToCart } = useCart();

  if (isAdmin) {
    // Admin view is now handled directly in AdminDashboard
    return null;
  }
  
  


  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img
            src={product.imageUrls[0] || '/placeholder-image.jpg'}
            alt={product.name}
            className="product-img"
          />
        </div>
        <div className="product-info">
          <h2 className="product-title">{product.name}</h2>
          <p className="product-price">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <button 
        className="add-to-cart-btn"
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard; 