import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/formatPrice';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import '../styles/product-detail.css';
import { toast } from 'react-toastify';

interface PriceDisplayProps {
  price: number;
  currencyCode: string;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, currencyCode, className = "product-price" }) => {
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

  return <div className={className}>{formattedPrice}</div>;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [sizeChartOpen, setSizeChartOpen] = useState(true);
  const { addToCart } = useCart();
  const { currencyCode } = useCurrency();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await fetchProducts();
        const found = products.find((p) => p.id === id);
        setProduct(found || null);
        setAllProducts(products.filter((p) => p.id !== id)); // Exclude current product
        if (found && found.sizes && found.sizes.length > 0) {
          setSelectedSize(found.sizes[0]);
        } else {
          setSelectedSize(''); // No sizes available
        }
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check if product is out of stock (no sizes available)
    const isOutOfStock = !product.sizes || product.sizes.length === 0;
    
    if (isOutOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }

    // Check if a valid size is selected
    if (!selectedSize || !product.sizes?.includes(selectedSize)) {
      toast.error('Please select a valid size.');
      return;
    }

    const success = addToCart(product, selectedSize);
    if (success) {
      toast.success(`${product.name} (Size: ${selectedSize}) added to cart!`);
    } else {
      toast.error('Failed to add product to cart. Please try again.');
    }
  };  

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-screen">
        <div>{error || 'Product not found.'}</div>
        <button onClick={() => navigate(-1)}>Back to Shop</button>
      </div>
    );
  }

  // All possible sizes
  const allSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableSizes: string[] = product.sizes || [];
  const isOutOfStock = availableSizes.length === 0;
  
  const getSizeStatus = (size: string) => {
    return availableSizes.includes(size);
  };

  const isValidSizeSelected = selectedSize && availableSizes.includes(selectedSize);

  return (
    <div className="product-detail">
      <div className="breadcrumb">
        <button onClick={() => navigate(-1)}>&larr; Back to Shop</button>
      </div>
      <div className="product-content">
        <div className="product-gallery">
          <div className="relative">
            <img
              src={product.imageUrls[activeImageIndex] || '/placeholder-image.jpg'}
              alt={product.name}
              className="main-image"
            />
          </div>
          <div className="thumbnail-row">
            {product.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.name} ${index + 1}`}
                className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              />
            ))}
          </div>
        </div>
        <div className="product-info">
          <div className="product-header">
            <h1 className={`product-title ${isOutOfStock ? 'opacity-70' : ''}`}>{product.name}</h1>
            <PriceDisplay price={product.price} currencyCode={currencyCode} />
          </div>

          <div className="size-selector">
            <h3>Size</h3>
            <div className="size-options">
              {allSizes.map((size) => {
                const isAvailable = getSizeStatus(size);
                return (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'active' : ''} ${!isAvailable ? 'unavailable opacity-40 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    onClick={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                    title={!isAvailable ? `Size ${size} is not available` : `Select size ${size}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {!isValidSizeSelected && availableSizes.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                Please select a size to add to cart
              </p>
            )}
          </div>

          <button 
            className={`add-to-cart ${
              isOutOfStock || !isValidSizeSelected 
                ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                : 'hover:bg-gray-800'
            }`}
            onClick={handleAddToCart}
            disabled={isOutOfStock || !isValidSizeSelected}
            title={
              isOutOfStock 
                ? 'Product is out of stock' 
                : !isValidSizeSelected 
                ? 'Please select a size' 
                : 'Add to cart'
            }
          >
            {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>

          <div className="accordion-section">
            <div className="accordion-header" onClick={() => setDescriptionOpen(!descriptionOpen)}>
              <span>DESCRIPTION</span> <span>{descriptionOpen ? '-' : '+'}</span>
            </div>
            {descriptionOpen && (
              <div className="accordion-content">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          <div className="accordion-section">
            <div className="accordion-header" onClick={() => setSizeChartOpen(!sizeChartOpen)}>
              <span>SIZE CHART</span> <span>{sizeChartOpen ? '-' : '+'}</span>
            </div>
            {sizeChartOpen && (
              <div className="accordion-content">
                <p>Size chart details go here (fill in later).</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="related-section">
        <h2>You May Also Like</h2>
        <div className="related-products">
          {allProducts.slice(0, 3).map((item) => {
            const itemOutOfStock = !item.sizes || item.sizes.length === 0;
            return (
              <Link key={item.id} to={`/product/${item.id}`} className="related-item">
                <div className="image-container relative">
                  <img 
                    src={item.imageUrls[0] || '/placeholder-image.jpg'} 
                    alt={item.name}
                  />
                  {itemOutOfStock && (
                    <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <div className={`related-name ${itemOutOfStock ? 'opacity-70' : ''}`}>{item.name}</div>
                  <PriceDisplay price={item.price} currencyCode={currencyCode} className={`related-price ${itemOutOfStock ? 'opacity-70' : ''}`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
