import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mock product data
const mockProduct = {
  id: 1,
  name: 'Redemption Hoodie',
  price: 89.99,
  description: 'Premium quality hoodie with unique design elements. Made from 100% cotton for maximum comfort and durability.',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Black', 'Red'],
  images: ['placeholder1', 'placeholder2', 'placeholder3']
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    // Add to cart functionality will be implemented later
    console.log('Added to cart:', {
      product: mockProduct,
      size: selectedSize,
      color: selectedColor,
      quantity
    });
  };

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-content">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <div className="placeholder-image"></div>
            </div>
            <div className="thumbnail-list">
              {mockProduct.images.map((_, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="placeholder-image"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1>{mockProduct.name}</h1>
            <p className="price">${mockProduct.price.toFixed(2)}</p>
            <p className="description">{mockProduct.description}</p>

            {/* Size Selection */}
            <div className="size-selector">
              <h3>Size</h3>
              <div className="size-options">
                {mockProduct.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="color-selector">
              <h3>Color</h3>
              <div className="color-options">
                {mockProduct.colors.map(color => (
                  <button
                    key={color}
                    className={`color-button ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.toLowerCase() }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="quantity-selector">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-button"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-button"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              className="button add-to-cart"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 