import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import backgroundImage from './background.png';
import { sendNewsletterEmail } from '../utils/emailService';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      await sendNewsletterEmail({ email });
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
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="background-video"
          poster="/fallback-image.jpg"
        >
          <source src="/background-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
              className="navbar-logo-img"
              style={{ height: '200px', width: 'auto' }}
            />
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="tagline"
          >
            Where Style Meets Street
          </motion.p>
        </motion.div>

        {/* Newsletter signup */}
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