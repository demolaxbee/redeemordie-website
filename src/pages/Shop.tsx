import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string;
  category: 'Hoodies'
}

const categories = ['All', 'Hoodies', 'T-Shirts', 'Pants', 'Accessories'];

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All' || 
    product.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="shop-page">
      <div className="container">
        <h1></h1>
        
        {/* Filters */}
        <div className="shop-filters">
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', margin: '4rem 0' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '4rem 0' }}>No products found.</div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -10 }}
              >
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="placeholder-image"></div>
                  )}
                </div>
                <h3>{product.name}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
                <Link to={`/product/${product.id}`} className="button">
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop; 