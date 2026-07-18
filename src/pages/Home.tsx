import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { subscribeToNewsletter } from '../utils/newsletterService';
// import { sendNewsletterEmail } from '../utils/emailService';

const campaignImages = [
  '/5F0C195E-7A0F-40B7-93BC-3FB8D45FE0E3.JPEG',
  '/9AC95DC4-071F-44A4-9D65-E4C33462FF14.JPEG',
  '/233E0D2C-A37B-43BF-BD93-78FAD6D12068.JPEG',
  '/542CB16B-F69F-4E58-9BA3-6B1903C49A76.JPEG',
  '/C109E6E1-0895-45F4-8A7A-D2C249EF9B05.JPEG',
  '/rmd-timi.png',
];

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % campaignImages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    campaignImages.slice(1).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      await subscribeToNewsletter({ email });
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      setSubmitError(true);
      console.error('Newsletter signup error:', error);
      setTimeout(() => {
        setSubmitError(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home">
      {/* Full-page background image/video with overlay */}
      <div className="home-background">
        <div className="overlay"></div>
        <AnimatePresence initial={false}>
          <motion.img
            key={campaignImages[activeSlide]}
            src={campaignImages[activeSlide]}
            alt=""
            className="background-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>

      {/* Central content */}
      <div className="home-content">
        <motion.div 
          className="centered-content glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="brand-name"
          >
            <img
              src="/redeemOrDie-logo.PNG"
              alt="RedeemOrDie Logo"
              // className="navbar-logo-img"
              style={{ height: '200px', width: 'auto' }}
            />
          </motion.h1>
          
          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="tagline"
          >
            Where Style Meets Street
          </motion.p> */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="shop-now-container"
          >
            <Link to="/shop" className="shop-now-btn">
              SHOP NOW
            </Link>
          </motion.div>
        </motion.div>

        {/* Newsletter signupp*/}
        <motion.div 
          className="newsletter-container glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3>Join Our Community</h3>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="YOUR EMAIL..."
                value={email}
                onChange={handleEmailChange}
                required
                className="glass-input"
              />
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'} <span className="arrow">→</span>
              </button>
            </div>
          </form>
          <AnimatePresence>
            {isSubmitted && (
              <motion.div 
                className="submission-message success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Thank you for subscribing!
              </motion.div>
            )}
            {submitError && (
              <motion.div 
                className="submission-message error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Sorry, there was an error. Please try again.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 
