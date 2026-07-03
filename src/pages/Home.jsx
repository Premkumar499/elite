import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carouselImages } from '../data/products';
import { fetchProducts } from '../services/api';

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryProducts, setCategoryProducts] = useState({ Blouses: null, Bangles: null, Materials: null });
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Fetch one product per category for the Best Selling section
  useEffect(() => {
    ['Blouses', 'Bangles', 'Materials'].forEach(async (cat) => {
      try {
        const data = await fetchProducts({ category: cat });
        setCategoryProducts(prev => ({ ...prev, [cat]: data[0] || null }));
      } catch { /* silent */ }
    });
  }, []);

  const updateCarousel = (index) => {
    setCurrentIndex((index + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => updateCarousel(currentIndex + 1), 3000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex]);

  const scrollToProducts = () => {
    document.querySelector('.product-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Carousel Header */}
      <header
        className="header"
        style={{ background: `url('${carouselImages[currentIndex]}') center/cover no-repeat` }}
      >
        <div className="header-overlay"></div>
        <div className="header-content">
          <div className="header-text-container">
            <div className="header-text">
              <h2>
                <span className="italic">Unfold the Layers of Tradition.</span><br />
                <span className="italic">Celebrate Every Moment in</span> Style.
              </h2>
            </div>
            <button className="header-button" onClick={scrollToProducts}>SHOP NOW</button>
            <p className="header-subtext">Karur treasures at steal price!</p>
          </div>
        </div>
        <button className="arrow arrow-left" onClick={() => updateCarousel(currentIndex - 1)}>&#10094;</button>
        <button className="arrow arrow-right" onClick={() => updateCarousel(currentIndex + 1)}>&#10095;</button>
        <div className="pagination-dots">
          {carouselImages.map((_, i) => (
            <div key={i} className={`dot${i === currentIndex ? ' active' : ''}`} onClick={() => setCurrentIndex(i)}></div>
          ))}
        </div>
      </header>

      {/* Training */}
      <div className="training-section">
        <h2>Live Training</h2>
        <div className="training-container">
          <div className="training-card large">
            <span className="offer-tag">30% OFF</span>
            <img src="/elite studio pic/training.jpg" alt="Training" />
            <div className="training-info">
              <h3>Blouse Stitching Basics</h3>
              <p>Master the art of blouse stitching in this live, interactive session guided by professional instructors.</p>
              <button onClick={() => navigate('/training')}>Join Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <section className="product-section">
        <h2>Our Best Selling Products</h2>
        <div className="product-container">
          {[
            { label: 'Blouses', cat: 'Blouses' },
            { label: 'Aari Bangles', cat: 'Bangles' },
            { label: 'Materials', cat: 'Materials' },
          ].map(({ label, cat }) => {
            const p = categoryProducts[cat];
            return (
              <div className="product-card" key={cat}>
                <img
                  src={p?.image || '/elite studio pic/product.jpeg'}
                  alt={p?.name || label}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                  onError={e => e.target.src = '/elite studio pic/product.jpeg'}
                />
                <h3>{p?.name || label}</h3>
                <p>{p?.description ? p.description.slice(0, 60) + (p.description.length > 60 ? '…' : '') : 'Modern look with premium quality.'}</p>
                {p?.price && <p style={{ fontWeight: 700, color: '#a07d56', fontSize: 16 }}>₹{Number(p.price).toLocaleString()}</p>}
                <Link to={`/collections?category=${cat}`} className="shop-now-link">Shop Now</Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
