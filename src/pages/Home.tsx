import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            RedeemOrDie
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Redemption Wears Red.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/shop" className="button">Shop Now</Link>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="new-arrivals">
        <div className="container">
          <h2>New Arrivals</h2>
          <div className="product-grid">
            {/* Placeholder for product cards */}
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                className="product-card"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="product-image">
                  {/* Placeholder image */}
                  <div className="placeholder-image"></div>
                </div>
                <h3>Product Name</h3>
                <p className="price">$99.99</p>
                <Link to={`/product/${item}`} className="button">View Details</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Mission Section */}
      <section className="brand-mission">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mission-content"
          >
            <h2>Our Mission</h2>
            <p>
              RedeemOrDie is more than just a clothing brand. We're a movement that
              celebrates individuality, strength, and the power of redemption. Our
              designs reflect the raw energy of street culture while maintaining
              the highest standards of quality and craftsmanship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="featured-collection">
        <div className="container">
          <h2>Featured Collection</h2>
          <div className="collection-grid">
            {/* Placeholder for featured items */}
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="collection-item"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="collection-image">
                  {/* Placeholder image */}
                  <div className="placeholder-image"></div>
                </div>
                <div className="collection-info">
                  <h3>Collection Name</h3>
                  <p>Limited Edition</p>
                  <Link to="/shop" className="button">Shop Collection</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 