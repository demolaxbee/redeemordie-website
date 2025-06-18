import React, { useState, useEffect } from 'react';
import { Product } from '../utils/airtable';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/formatPrice';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  isAdmin = false,
  showAddToCart = true
}) => {
  const { addToCart } = useCart();
  const { currencyCode } = useCurrency();
  const [formattedPrice, setFormattedPrice] = useState(`C$${product.price.toFixed(2)}`);

  // Check if product has available sizes
  const isOutOfStock = !product.sizes || product.sizes.length === 0;

  useEffect(() => {
    const updatePrice = async () => {
      try {
        const formatted = await formatPrice(product.price, currencyCode);
        setFormattedPrice(formatted);
      } catch (error) {
        console.error('Error formatting price:', error);
        setFormattedPrice(`C$${product.price.toFixed(2)}`);
      }
    };

    updatePrice();
  }, [product.price, currencyCode]);

  if (isAdmin) {
    // Admin view is now handled directly in AdminDashboard
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) {
      return; // Don't add to cart if out of stock
    }
    
    const success = addToCart(product);
    if (!success) {
      // Could add a toast notification here for better UX
      console.warn('Failed to add product to cart');
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <Link 
        to={`/product/${product.id}`} 
        className={`product-link ${isOutOfStock ? 'pointer-events-none' : ''}`}
        onClick={isOutOfStock ? (e) => e.preventDefault() : undefined}
      >
        <div className="product-image relative">
          <img
            src={product.imageUrls[0] || '/placeholder-image.jpg'}
            alt={product.name}
            className={`product-img ${isOutOfStock ? 'opacity-50' : ''}`}
          />
          {isOutOfStock && (
            <>
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <span className="text-white text-lg font-bold">Out of Stock</span>
              </div>
            </>
          )}
        </div>
        <div className="product-info">
          <h2 className={`product-title ${isOutOfStock ? 'opacity-70' : ''}`}>{product.name}</h2>
          <p className={`product-price ${isOutOfStock ? 'opacity-70' : ''}`}>{formattedPrice}</p>
        </div>
      </Link>
      {showAddToCart && (
        <button 
          className={`add-to-cart-btn ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          title={isOutOfStock ? 'Product is out of stock' : 'Add to cart'}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      )}
    </div>
  );
};

export default ProductCard;