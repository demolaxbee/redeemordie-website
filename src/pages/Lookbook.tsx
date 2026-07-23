import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../styles/lookbook.css';

interface LookbookPhoto {
  display: string;
  original: string;
  orientation: 'portrait' | 'landscape';
}

const lookbookPhotos: LookbookPhoto[] = [
  { display: '/lookbook-optimized/IMG_8342.jpg', original: '/lookbook-photos/IMG_8342.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8343.jpg', original: '/lookbook-photos/IMG_8343.JPG', orientation: 'landscape' },
  { display: '/lookbook-optimized/IMG_8344.jpg', original: '/lookbook-photos/IMG_8344.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8345.jpg', original: '/lookbook-photos/IMG_8345.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8351.jpg', original: '/lookbook-photos/IMG_8351.JPG', orientation: 'landscape' },
  { display: '/lookbook-optimized/IMG_8352.jpg', original: '/lookbook-photos/IMG_8352.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8353.jpg', original: '/lookbook-photos/IMG_8353.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8354.jpg', original: '/lookbook-photos/IMG_8354.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8355.jpg', original: '/lookbook-photos/IMG_8355.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/IMG_8361.jpg', original: '/lookbook-photos/IMG_8361.JPG', orientation: 'landscape' },
  { display: '/lookbook-optimized/_IMG9366.jpg', original: '/lookbook-photos/_IMG9366.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/_IMG9381.jpg', original: '/lookbook-photos/_IMG9381.JPG', orientation: 'landscape' },
  { display: '/lookbook-optimized/_IMG9398.jpg', original: '/lookbook-photos/_IMG9398.JPG', orientation: 'landscape' },
  { display: '/lookbook-optimized/_IMG9461.jpg', original: '/lookbook-photos/_IMG9461.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/_IMG9465.jpg', original: '/lookbook-photos/_IMG9465.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/_IMG9468.jpg', original: '/lookbook-photos/_IMG9468.JPG', orientation: 'portrait' },
  { display: '/lookbook-optimized/_IMG9470.jpg', original: '/lookbook-photos/_IMG9470.JPG', orientation: 'landscape' },
  { display: '/lookbook-optimized/542CB16B-F69F-4E58-9BA3-6B1903C49A76.jpg', original: '/lookbook-photos/542CB16B-F69F-4E58-9BA3-6B1903C49A76.JPEG', orientation: 'portrait' },
  { display: '/lookbook-optimized/C109E6E1-0895-45F4-8A7A-D2C249EF9B05.jpg', original: '/lookbook-photos/C109E6E1-0895-45F4-8A7A-D2C249EF9B05.JPEG', orientation: 'portrait' },
  { display: '/lookbook-optimized/5F0C195E-7A0F-40B7-93BC-3FB8D45FE0E3.jpg', original: '/lookbook-photos/5F0C195E-7A0F-40B7-93BC-3FB8D45FE0E3.JPEG', orientation: 'portrait' },
  { display: '/lookbook-optimized/9AC95DC4-071F-44A4-9D65-E4C33462FF14.jpg', original: '/lookbook-photos/9AC95DC4-071F-44A4-9D65-E4C33462FF14.JPEG', orientation: 'portrait' },
  { display: '/lookbook-optimized/233E0D2C-A37B-43BF-BD93-78FAD6D12068.jpg', original: '/lookbook-photos/233E0D2C-A37B-43BF-BD93-78FAD6D12068.JPEG', orientation: 'landscape' },
];

const Lookbook: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedIndex(null);
      if (event.key === 'ArrowLeft') {
        setSelectedIndex((current) =>
          current === null ? null : (current - 1 + lookbookPhotos.length) % lookbookPhotos.length
        );
      }
      if (event.key === 'ArrowRight') {
        setSelectedIndex((current) =>
          current === null ? null : (current + 1) % lookbookPhotos.length
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex]);

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === null ? null : (current - 1 + lookbookPhotos.length) % lookbookPhotos.length
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current === null ? null : (current + 1) % lookbookPhotos.length
    );
  };

  return (
    <div className="lookbook-page">
      <section className="lookbook-hero">
        <img
          src="/lookbook-optimized/IMG_8343.jpg"
          alt="Redeem Or Die Summer 2026 campaign"
          className="lookbook-hero-image"
        />
        <div className="lookbook-hero-overlay" />
        <motion.div
          className="lookbook-hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <span>Redeem Or Die presents</span>
          <h1>Summer<br />2026</h1>
          <p>Collection 01 — Toronto</p>
        </motion.div>
        <a className="lookbook-scroll-cue" href="#lookbook-gallery">
          <span>Scroll to explore</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="lookbook-intro" aria-labelledby="lookbook-heading">
        <p>R / D — 001</p>
        <h2 id="lookbook-heading">Built for the saints<br />.</h2>
        <span>Summer 2026</span>
      </section>

      <section id="lookbook-gallery" className="lookbook-gallery" aria-label="Summer 2026 campaign photographs">
        {lookbookPhotos.map((photo, index) => (
          <motion.figure
            key={photo.display}
            className={`lookbook-shot lookbook-shot--${photo.orientation}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.7, delay: (index % 2) * 0.08 }}
          >
            <button
              type="button"
              className="lookbook-shot-button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Open look ${String(index + 1).padStart(2, '0')} full screen`}
            >
              <img
                src={photo.display}
                alt={`Summer 2026 look ${String(index + 1).padStart(2, '0')}`}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
              <span className="lookbook-shot-expand" aria-hidden="true">View</span>
            </button>
            <figcaption>
              <span>Look {String(index + 1).padStart(2, '0')}</span>
              <span>Summer 2026</span>
            </figcaption>
          </motion.figure>
        ))}
      </section>

      <section className="lookbook-closing">
        <img
          src="/lookbook-optimized/233E0D2C-A37B-43BF-BD93-78FAD6D12068.jpg"
          alt=""
          loading="lazy"
        />
        <div className="lookbook-closing-overlay" />
        <div className="lookbook-closing-copy">
          <p>Summer 2026</p>
          <h2>Wear the<br />decision.</h2>
          <Link to="/shop">Shop the collection <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="lookbook-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Look ${selectedIndex + 1} of ${lookbookPhotos.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <button
              type="button"
              className="lookbook-lightbox-close"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close image viewer"
              autoFocus
            >
              ×
            </button>
            <button
              type="button"
              className="lookbook-lightbox-nav lookbook-lightbox-nav--previous"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous image"
            >
              ←
            </button>
            <motion.img
              key={lookbookPhotos[selectedIndex].original}
              src={lookbookPhotos[selectedIndex].original}
              alt={`Summer 2026 look ${selectedIndex + 1}`}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
            />
            <div className="lookbook-lightbox-count">
              {String(selectedIndex + 1).padStart(2, '0')} / {String(lookbookPhotos.length).padStart(2, '0')}
            </div>
            <button
              type="button"
              className="lookbook-lightbox-nav lookbook-lightbox-nav--next"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
            >
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lookbook;
