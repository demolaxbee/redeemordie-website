import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Our Story
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Redemption Wears Red.
          </motion.p>
        </section>

        {/* Brand Story */}
        <section className="brand-story">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="story-content"
          >
            <h2>The Beginning</h2>
            <p>
              RedeemOrDie was born from a vision to create more than just clothing.
              It's a movement that celebrates the power of transformation and the
              strength that comes from embracing one's true self.
            </p>
            <p>
              Founded in 2023, our brand emerged from the streets, drawing
              inspiration from urban culture, art, and the raw energy of city life.
              We believe that fashion is a form of self-expression and a way to
              tell your story without saying a word.
            </p>
          </motion.div>
        </section>

        {/* Mission & Values */}
        <section className="mission-values">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="values-content"
          >
            <h2>Our Mission</h2>
            <p>
              We're committed to creating high-quality streetwear that empowers
              individuals to express their unique style and identity. Our mission
              is to inspire confidence and authenticity through our designs.
            </p>

            <div className="values-grid">
              <div className="value-item">
                <h3>Quality</h3>
                <p>
                  We use premium materials and expert craftsmanship to ensure
                  every piece meets our high standards.
                </p>
              </div>
              <div className="value-item">
                <h3>Authenticity</h3>
                <p>
                  Our designs are born from real experiences and genuine passion
                  for street culture.
                </p>
              </div>
              <div className="value-item">
                <h3>Innovation</h3>
                <p>
                  We constantly push boundaries and explore new ideas to create
                  unique, forward-thinking designs.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="team-content"
          >
            <h2>Meet the Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-image">
                  <div className="placeholder-image"></div>
                </div>
                <h3>John Doe</h3>
                <p>Founder & Creative Director</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <div className="placeholder-image"></div>
                </div>
                <h3>Jane Smith</h3>
                <p>Head of Design</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <div className="placeholder-image"></div>
                </div>
                <h3>Mike Johnson</h3>
                <p>Production Manager</p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default About; 