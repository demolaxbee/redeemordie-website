import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';
import { useCart } from '../context/CartContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import '../styles/product-detail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const { addToCart } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await fetchProducts();
        const found = products.find((p) => p.id === id);
        setProduct(found || null);
        setAllProducts(products.filter((p) => p.id !== id)); // Exclude current product
        if (found && (found as any).sizes && (found as any).sizes.length > 0) {
          setSelectedSize((found as any).sizes[0]);
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
    if (product) {
      addToCart(product, selectedSize);
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
  const availableSizes: string[] = (product as any).sizes || [];
  
  const getSizeStatus = (size: string) => {
    return availableSizes.includes(size);
  };

  return (
    <div className="product-detail">
      <div className="breadcrumb">
        <button onClick={() => navigate(-1)}>&larr; Back to Shop</button>
      </div>
      <div className="product-content">
        <div className="product-gallery">
          <img
            src={product.imageUrls[activeImageIndex] || '/placeholder-image.jpg'}
            alt={product.name}
            className="main-image"
          />
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
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price">${product.price}</div>
          </div>

          <div className="size-selector">
            <h3>Size</h3>
            <div className="size-options">
              {allSizes.map((size) => {
                const isAvailable = getSizeStatus(size);
                return (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'active' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                    onClick={() => isAvailable && setSelectedSize(size)}
                    disabled={!isAvailable}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="add-to-cart" onClick={handleAddToCart}>
            ADD TO CART
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
          {allProducts.slice(0, 3).map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="related-item">
              <div className="image-container">
                <img src={item.imageUrls[0] || '/placeholder-image.jpg'} alt={item.name} />
              </div>
              <div className="product-info">
                <div className="related-name">{item.name}</div>
                <div className="related-price">${item.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
