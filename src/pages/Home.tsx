import React, { useCallback, useEffect, useRef, useState } from 'react';
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
];

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const showPreviousSlide = useCallback(() => {
    setActiveSlide((current) =>
      current === 0 ? campaignImages.length - 1 : current - 1
    );
  }, []);

  const showNextSlide = useCallback(() => {
    setActiveSlide((current) => (current + 1) % campaignImages.length);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isSlideshowPaused || prefersReducedMotion) return;

    const interval = window.setInterval(showNextSlide, 5000);
    return () => window.clearInterval(interval);
  }, [isSlideshowPaused, showNextSlide]);

  useEffect(() => {
    campaignImages.slice(1).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  const handleSlideshowKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') showPreviousSlide();
    if (e.key === 'ArrowRight') showNextSlide();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;

    const swipeDistance = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(swipeDistance) > 50) {
      swipeDistance > 0 ? showPreviousSlide() : showNextSlide();
    }
    touchStartX.current = null;
  };

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
        <img
          src="/rmd-timi.png"
          alt="Hero"
          className="background-image"
        />
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

        <motion.section
          className="campaign-slideshow"
          aria-label="Redeem Or Die campaign gallery"
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={handleSlideshowKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsSlideshowPaused(true)}
          onMouseLeave={() => setIsSlideshowPaused(false)}
          onFocus={() => setIsSlideshowPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsSlideshowPaused(false);
            }
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="campaign-slideshow-frame">
            <div
              className="campaign-slide-backdrop"
              style={{ backgroundImage: `url(${campaignImages[activeSlide]})` }}
              aria-hidden="true"
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={campaignImages[activeSlide]}
                src={campaignImages[activeSlide]}
                alt={`Redeem Or Die campaign look ${activeSlide + 1} of ${campaignImages.length}`}
                className="campaign-slide-image"
                initial={{ opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                draggable="false"
              />
            </AnimatePresence>

            <button
              type="button"
              className="campaign-arrow campaign-arrow-previous"
              onClick={showPreviousSlide}
              aria-label="Show previous campaign photo"
            >
              &#8249;
            </button>
            <button
              type="button"
              className="campaign-arrow campaign-arrow-next"
              onClick={showNextSlide}
              aria-label="Show next campaign photo"
            >
              &#8250;
            </button>

            <div className="campaign-slide-count" aria-live="polite">
              {String(activeSlide + 1).padStart(2, '0')} / {String(campaignImages.length).padStart(2, '0')}
            </div>
          </div>

          <div className="campaign-dots" aria-label="Choose a campaign photo">
            {campaignImages.map((image, index) => (
              <button
                type="button"
                key={image}
                className={`campaign-dot${index === activeSlide ? ' active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show campaign photo ${index + 1}`}
                aria-current={index === activeSlide ? 'true' : undefined}
              />
            ))}
          </div>
        </motion.section>

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
