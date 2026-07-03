import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); });
    }, { threshold: 0.1 });
    cardsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>About Elite Studio</h1>
          <p>Preserving the Timeless Art of Aari Embroidery</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Our Story</h2>
              <p className="lead">Elite Studio was born from a passion to preserve and celebrate the ancient art of Aari embroidery, bringing this exquisite craftsmanship to modern blouse designs.</p>
              <p>Founded in the heart of Karur, Tamil Nadu - a region renowned for its textile heritage - Elite Studio has been dedicated to creating stunning Aari work blouses that blend traditional techniques with contemporary fashion sensibilities.</p>
              <p>Our journey began with a simple mission: to ensure that the intricate art of Aari embroidery continues to flourish in today's world. What started as a small workshop has now grown into a celebrated studio, known for its exceptional quality and innovative designs.</p>
              <div className="highlight-box">
                <i className="fas fa-quote-left"></i>
                <p><em>"Every stitch tells a story, every pattern carries heritage, and every blouse we create is a masterpiece of tradition."</em></p>
                <span>- Elite Studio Philosophy</span>
              </div>
            </div>
            <div className="about-image">
              <img src="/elite studio pic/fashion-designers-work-beautiful-young-260nw-2458032929.webp" alt="Aari Work Craftsmanship" />
            </div>
          </div>
        </div>
      </section>

      {/* Aari Excellence */}
      <section className="aari-excellence">
        <div className="container">
          <h2>The Art of Aari Embroidery</h2>
          <div className="excellence-grid">
            {[
              { icon: 'fa-magic', title: 'Traditional Techniques', text: 'Our master craftspeople use authentic Aari needles and time-honored techniques passed down through generations.' },
              { icon: 'fa-gem', title: 'Premium Materials', text: 'We use only the finest threads, beads, sequins, and fabrics to ensure every blouse stands the test of time.' },
              { icon: 'fa-palette', title: 'Custom Designs', text: 'From traditional motifs to contemporary patterns, we create bespoke Aari work designs for your personal style.' },
              { icon: 'fa-heart', title: 'Handcrafted with Love', text: 'Every piece is meticulously handcrafted by skilled artisans who pour their passion into wearable works of art.' },
            ].map((card, i) => (
              <div key={i} className="excellence-card" ref={el => cardsRef.current[i] = el}>
                <div className="icon-wrapper"><i className={`fas ${card.icon}`}></i></div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="container">
          <h2>Our Specializations</h2>
          <div className="services-grid">
            {[
              { img: '/elite studio pic/collection model.jpg', title: 'Traditional Aari Blouses', desc: 'Classic designs featuring intricate thread work, mirror work, and traditional motifs perfect for weddings and festivals.', items: ['Bridal blouse designs', 'Festival wear collections', 'Heritage pattern recreations'] },
              { img: '/elite studio pic/product.jpeg', title: 'Contemporary Aari Designs', desc: 'Modern interpretations of Aari work that blend seamlessly with today\'s fashion trends and lifestyle.', items: ['Office-wear elegant blouses', 'Party-wear statement pieces', 'Casual chic designs'] },
              { img: '/elite studio pic/training.jpg', title: 'Aari Work Training', desc: 'Learn the beautiful art of Aari embroidery from our master craftspeople through comprehensive training programs.', items: ['Beginner to advanced courses', 'Live hands-on training', 'Certificate programs'] },
            ].map((s, i) => (
              <div key={i} className="service-item">
                <img src={s.img} alt={s.title} />
                <div className="service-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ul>{s.items.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Master Craftsperson</h2>
          <div className="team-grid single-mentor">
            <div className="team-member">
              <div className="member-image">
                <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="Priya Sharma" />
              </div>
              <div className="member-info">
                <h3>Priya Sharma</h3>
                <p className="position">Master Artisan &amp; Training Head</p>
                <p>With over 15 years of experience in Aari embroidery, Priya leads our design team and training programs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            {[
              { icon: 'fa-award', title: 'Excellence', text: 'We never compromise on quality. Every piece that leaves our studio meets the highest standards of craftsmanship.' },
              { icon: 'fa-users', title: 'Heritage', text: 'We honor traditional techniques while embracing innovation to keep this beautiful art form relevant.' },
              { icon: 'fa-handshake', title: 'Trust', text: 'Building lasting relationships through transparency, reliability, and exceptional service.' },
              { icon: 'fa-leaf', title: 'Sustainability', text: 'We use eco-friendly materials and support fair trade practices.' },
            ].map((v, i) => (
              <div key={i} className="value-item">
                <i className={`fas ${v.icon}`}></i>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact-section">
        <div className="container">
          <h2>Visit Our Studio</h2>
          <div className="contact-content">
            <div className="contact-info">
              {[
                { icon: 'fa-map-marker-alt', title: 'Location', text: 'PRK Avenue, Muthuladam Patti,\nThanthonimalai, Karur - 639005\nTamil Nadu, India' },
                { icon: 'fa-phone', title: 'Phone', text: '+91 7539930671' },
                { icon: 'fa-envelope', title: 'Email', text: 'premkumar34541@gmail.com' },
                { icon: 'fa-clock', title: 'Studio Hours', text: 'Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: 10:00 AM - 5:00 PM' },
              ].map((c, i) => (
                <div key={i} className="contact-item">
                  <i className={`fas ${c.icon}`}></i>
                  <div>
                    <h3>{c.title}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cta-section">
              <h3>Ready to Experience Elite Craftsmanship?</h3>
              <p>Visit our studio to see our beautiful Aari work blouses in person, or join our training program to learn this magnificent art yourself.</p>
              <div className="cta-buttons">
                <Link to="/collections" className="btn btn-primary">View Collections</Link>
                <Link to="/training" className="btn btn-secondary">Join Training</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership + Footer */}
      <div className="membership-section">
        <div className="membership-content">
          <h2>Become a Forever</h2>
          <p>Join now to discover a world of exclusive fashion rewards.</p>
          <button className="join-button">JOIN US</button>
        </div>
      </div>
    </>
  );
}
