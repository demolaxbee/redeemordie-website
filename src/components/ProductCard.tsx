import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, EMPTY_STOCK } from '../utils/airtable';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// import { useCurrency } from '../context/CurrencyContext';
// import { formatPrice } from '../utils/formatPrice';

/**
 * Props interface for ProductCard component
 */
interface ProductCardProps {
  /** Product data to display */
  product: Product;
  /** Optional callback for editing product (admin functionality) */
  onEdit?: (product: Product) => void;
  /** Optional callback for deleting product (admin functionality) */
  onDelete?: (productId: string) => void;
  /** Whether to render in admin mode */
  isAdmin?: boolean;
  /** Whether to show the "Add to Cart" button */
  showAddToCart?: boolean;
}

const productCardPhotos = [
  '/product-card-photos/IMG_8342.JPG',
  '/product-card-photos/IMG_8343.JPG',
  '/product-card-photos/IMG_8344.JPG',
  '/product-card-photos/IMG_8345.JPG',
  '/product-card-photos/IMG_8351.JPG',
  '/product-card-photos/IMG_8352.JPG',
  '/product-card-photos/IMG_8353.JPG',
  '/product-card-photos/IMG_8354.JPG',
  '/product-card-photos/IMG_8355.JPG',
  '/product-card-photos/IMG_8361.JPG',
  '/product-card-photos/_IMG9366.JPG',
  '/product-card-photos/_IMG9381.JPG',
  '/product-card-photos/_IMG9398.JPG',
  '/product-card-photos/_IMG9461.JPG',
  '/product-card-photos/_IMG9465.JPG',
  '/product-card-photos/_IMG9468.JPG',
  '/product-card-photos/_IMG9470.JPG',
];

/**
 * ProductCard Component
 * 
 * Displays a single product in a card format with:
 * - Product image with out-of-stock overlay
 * - Product name and price
 * - Add to cart functionality
 * - Responsive design
 * - Currency conversion support
 * 
 * @component
 * @param {ProductCardProps} props - Component props
 * @returns {JSX.Element | null} The rendered product card or null for admin mode
 */
const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  isAdmin = false,
  showAddToCart = true
}) => {
  // Cart context for adding items
  const { addToCart } = useCart();
  const initialSlide = useMemo(
    () =>
      Array.from(product.id).reduce(
        (total, character) => total + character.charCodeAt(0),
        0
      ) % productCardPhotos.length,
    [product.id]
  );
  const [activeSlide, setActiveSlide] = useState(initialSlide);

  useEffect(() => {
    setActiveSlide(initialSlide);

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % productCardPhotos.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [initialSlide]);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.src =
      productCardPhotos[(activeSlide + 1) % productCardPhotos.length];
  }, [activeSlide]);

  // Currency context for price formatting
  // const { currencyCode } = useCurrency();
  
  // Local state for formatted price (updates when currency changes)
  // Commented out because price display is temporarily removed from the product card.
  // const [formattedPrice, setFormattedPrice] = useState(`C$${product.price.toFixed(2)}`);

  const totalStock = Object.values(product.stock || EMPTY_STOCK).reduce(
    (sum, qty) => sum + (qty || 0),
    0
  );
  const isOutOfStock = totalStock <= 0;

  /**
   * Update formatted price when currency or product price changes
   * Handles currency conversion and formatting
   */
  /*
  useEffect(() => {
    const updatePrice = async () => {
      try {
        const formatted = await formatPrice(product.price, currencyCode);
        setFormattedPrice(formatted);
      } catch (error) {
        console.error('Error formatting price:', error);
        // Fallback to default Canadian dollar format
        setFormattedPrice(`C$${product.price.toFixed(2)}`);
      }
    };

    updatePrice();
  }, [product.price, currencyCode]);
  */

  // Return null for admin mode (admin functionality handled elsewhere)
  if (isAdmin) {
    return null;
  }

  /**
   * Handle adding product to cart
   * Prevents adding out-of-stock items
   * 
   * @param {React.MouseEvent} e - Click event
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Don't allow adding out-of-stock items
    if (isOutOfStock) {
      return;
    }
    
    // Attempt to add to cart and handle failure
    const success = addToCart(product);
    if (!success) {
      // TODO: Add toast notification for better UX
      console.warn('Failed to add product to cart');
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {/* Product link wrapper - navigates to product detail page */}
      <Link 
        to={`/product/${product.id}`} 
        className="product-link"
      >
        {/* Product image container with relative positioning */}
        <div className="product-image relative">
          <AnimatePresence initial={false}>
            <motion.img
              key={productCardPhotos[activeSlide]}
              src={productCardPhotos[activeSlide]}
              alt={`${product.name} campaign`}
              className={`product-img product-card-slide ${isOutOfStock ? 'opacity-50' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </AnimatePresence>
          
          {/* Out of stock overlay - only shown when product is unavailable */}
          {isOutOfStock && (
            <>
              {/* Semi-transparent overlay with centered text */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <span className="text-white text-lg font-bold">Out of Stock</span>
              </div>
            </>
          )}
        </div>
        
        {/* Product information section (temporarily hidden so only the image appears)
        <div className="product-info">
          <h2 className={`product-title ${isOutOfStock ? 'opacity-70' : ''}`}>{product.name}</h2>
          <p className={`product-price ${isOutOfStock ? 'opacity-70' : ''}`}>{formattedPrice}</p>
        </div>
        */}
      </Link>
      
      {/* Add to cart button - conditionally rendered */}
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
