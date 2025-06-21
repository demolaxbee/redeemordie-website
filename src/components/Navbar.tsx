import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { fetchProducts, Product } from '../utils/airtable';
import CurrencySelector from './CurrencySelector';
import '../styles/navbar.css';

/**
 * Navbar Component
 * 
 * Main navigation component that provides:
 * - Logo and brand navigation
 * - Search functionality with suggestions
 * - Shopping cart access
 * - Mobile-responsive menu
 * - Currency selection
 * 
 * @component
 * @returns {JSX.Element} The rendered navbar component
 */
const Navbar: React.FC = () => {
  // State for search functionality
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  
  // React Router hooks for navigation and location tracking
  const location = useLocation();
  const navigate = useNavigate();
  
  // Context hooks for cart and search functionality
  const { cartItems, totalItems, formattedTotal, updateQuantity, isCartOpen, toggleCart, closeCart } = useCart();
  const { searchQuery, setSearchQuery, setSearchResults, filterProducts, clearSearch } = useSearch();
  
  // Ref for focusing search input when opened
  const searchInputRef = useRef<HTMLInputElement>(null);

  /**
   * Load all products from Airtable on component mount
   * Used for search suggestions and functionality
   */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);

  /**
   * Update search suggestions based on current search query
   * Shows up to 5 matching products as suggestions
   */
  useEffect(() => {
    if (searchQuery.trim() && allProducts.length > 0) {
      const suggestions = filterProducts(allProducts, searchQuery).slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, allProducts, filterProducts]);

  /**
   * Toggle mobile menu visibility
   * Handles hamburger menu animation and mobile navigation
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * Toggle search overlay visibility
   * Focuses search input when opened and clears search when closed
   */
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Small delay to ensure overlay is rendered before focusing
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      clearSearch();
    }
  };

  /**
   * Handle search form submission
   * Navigates to shop page with filtered results
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = filterProducts(allProducts, searchQuery);
      setSearchResults(results);
      setIsSearchOpen(false);
      navigate('/shop');
    }
  };

  /**
   * Handle search input changes
   * Updates search query state for real-time suggestions
   */
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handle clicking on a search suggestion
   * Navigates directly to the product detail page
   */
  const handleSuggestionClick = (product: Product) => {
    setIsSearchOpen(false);
    clearSearch();
    navigate(`/product/${product.id}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left section: Logo and main navigation links */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img
              src="/redeemOrDie-logo.PNG"
              alt="RedeemOrDie Logo"
              className="navbar-logo-img"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
          {/* Main navigation links - only visible on desktop */}
          <div className="navbar-main-links">
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>SHOP</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
          </div>
        </div>

        {/* Right section: Currency selector, search, and cart icons */}
        <div className="navbar-right">
          <CurrencySelector />
          {/* Search button - opens search overlay */}
          <button className="icon-btn search-btn" onClick={toggleSearch} aria-label="Search">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Cart button with item count badge */}
          <Link to="/cart" className="icon-btn cart-btn" onClick={toggleCart} aria-label="Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Show cart item count if items exist */}
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>
        </div>

        {/* Mobile menu hamburger button - only visible on mobile */}
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile menu overlay with smooth animations */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>SHOP</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)}>Cart ({totalItems})</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay with form and suggestions */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="search-container">
              {/* Close button for search overlay */}
              <button className="close-search" onClick={toggleSearch}>×</button>
              
              {/* Search form with input and submit button */}
              <form className="search-form" onSubmit={handleSearchSubmit}>
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  autoFocus 
                />
                <button type="submit">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
              
              {/* Search suggestions dropdown */}
              {searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  <h4>Suggestions</h4>
                  {searchSuggestions.map((product) => (
                    <div 
                      key={product.id} 
                      className="search-suggestion-item"
                      onClick={() => handleSuggestionClick(product)}
                    >
                      <img 
                        src={product.imageUrls[0] || '/placeholder-image.jpg'} 
                        alt={product.name}
                        className="suggestion-image"
                      />
                      <div className="suggestion-info">
                        <div className="suggestion-name">{product.name}</div>
                        <div className="suggestion-price">${product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 