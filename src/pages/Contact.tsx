import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="contact-page">
      <div className="container">
        {/* Hero Section */}
        <section className="contact-hero">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Get in touch with our team
          </motion.p>
        </section>

        <div className="contact-content">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="contact-info"
          >
            <h2>Contact Information</h2>
            <div className="info-item">
              <h3>Email</h3>
              <p>reedeemordie66@gmail.com</p>
            </div>
            <div className="info-item">
              <h3>Phone</h3>
              <p>+1 (306) 716-3574</p>
            </div>
            <div className="info-item">
              <h3>Address</h3>
              <p>
                1015 13th Street East<br />
                Saskatoon, Saskatchewan S7H0B8<br />
                Canada
              </p>
            </div>
            <div className="info-item">
              <h3>Social Media</h3>
              <div className="social-links">
                <a href="https://www.instagram.com/redeemordie" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://www.tiktok.com/@redeemordieclub" target="_blank" rel="noopener noreferrer">TikTok</a>
                <a href="https://x.com/redeemordie1?s=11" target="_blank" rel="noopener noreferrer">X</a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="contact-form"
          >
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Customer Support</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 