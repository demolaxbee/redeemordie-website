import React from 'react';
import { Product } from '../utils/airtable';
import { Link } from 'react-router-dom';

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
  if (isAdmin) {
    // Admin view is now handled directly in AdminDashboard
    return null;
  }
  
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <img
            src={product.imageUrl || '/placeholder-image.jpg'}
            alt={product.name}
            className="product-img"
          />
        </div>
        <h2 className="product-title">{product.name}</h2>
        <p className="product-price">${product.price.toFixed(2)}</p>
      </Link>
    </div>
  );
};

export default ProductCard; 