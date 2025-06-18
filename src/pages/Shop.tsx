import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';
import { useSearch } from '../context/SearchContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatPrice } from '../utils/formatPrice';

interface PriceDisplayProps {
  price: number;
  currencyCode: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ price, currencyCode }) => {
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

  return <p className="product-price">{formattedPrice}</p>;
};

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { searchQuery, searchResults, clearSearch } = useSearch();
  const { currencyCode } = useCurrency();
  
  // Determine which products to display
  const displayProducts = searchQuery.trim() ? searchResults : products;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>{searchQuery.trim() ? `SEARCH RESULTS FOR "${searchQuery}"` : 'SHOP ALL'}</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <span>{searchQuery.trim() ? 'Search Results' : 'Shop All'}</span>
          {searchQuery.trim() && (
            <button className="clear-search-btn" onClick={clearSearch}>
              Clear Search
            </button>
          )}
        </div>
      </div>

      <div className="shop-controls">
        <div className="items-count">{displayProducts.length} items</div>
      </div>

      <div className="products-grid">
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <div className="product-card" key={product.id}>
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
                  <PriceDisplay price={product.price} currencyCode={currencyCode} />
                </div>
              </Link>
            </div>
          ))
        ) : searchQuery.trim() ? (
          <div className="no-results">
            <h3>No products found for "{searchQuery}"</h3>
            <p>Try adjusting your search terms or browse all products.</p>
            <button className="browse-all-btn" onClick={clearSearch}>
              Browse All Products
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Shop; 