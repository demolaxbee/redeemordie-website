import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';
import { useSearch } from '../context/SearchContext';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

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
        <button className="filter-toggle" onClick={toggleFilters}>
          FILTER
        </button>
        <div className="items-count">{displayProducts.length} items</div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h3>SORT</h3>
            <select className="sort-select">
              <option value="featured">Featured</option>
              <option value="best-selling">Best selling</option>
              <option value="a-z">Alphabetically, A-Z</option>
              <option value="z-a">Alphabetically, Z-A</option>
              <option value="price-low">Price, low to high</option>
              <option value="price-high">Price, high to low</option>
              <option value="date-old">Date, old to new</option>
              <option value="date-new">Date, new to old</option>
            </select>
          </div>
          
          <div className="filter-section">
            <h3>AVAILABILITY</h3>
            <div className="filter-checkbox">
              <input type="checkbox" id="in-stock" />
              <label htmlFor="in-stock">In stock ({products.length})</label>
            </div>
          </div>
          
          <div className="filter-section price-filter">
            <h3>PRICE</h3>
            <div className="price-inputs">
              <input type="number" placeholder="From $" min="0" />
              <input type="number" placeholder="To $" min="0" />
            </div>
            <button className="apply-btn">APPLY</button>
          </div>
          
          <button className="see-results-btn">SEE RESULTS</button>
        </div>
      )}

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
                  <p className="product-price">${product.price}</p>
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