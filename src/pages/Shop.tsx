import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';
import { useSearch } from '../context/SearchContext';
import ProductCard from '../components/ProductCard';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { searchQuery, searchResults, clearSearch } = useSearch();
  
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
            <ProductCard key={product.id} product={product} showAddToCart={false} />
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