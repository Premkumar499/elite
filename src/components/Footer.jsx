import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="fashion-footer">
      <div className="shipping-info">
        <div className="shipping-item"><h3>TOUCH OF QUALITY</h3></div>
        <div className="shipping-item"><h3>SECURE CHECKOUT</h3></div>
      </div>
      <div className="footer-links-container">
        <div className="footer-column">
          <h4>CUSTOMER SERVICE</h4>
          <ul>
            <li><a href="#">Daily Classes</a></li>
            <li><a href="#">Ask Queries</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>OUR COLLECTIONS</h4>
          <ul>
            <li><Link to="/collections">Work Blouses</Link></li>
            <li><Link to="/collections">Aari Bangles</Link></li>
            <li><Link to="/collections">Aari Materials</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>ABOUT US</h4>
          <ul>
            <li><span>Contact Us: 7539930671</span></li>
            <li><span>Email: premkumar34541@gmail.com</span></li>
            <li><span>Store Locator: PRK Avenue, Karur-639005</span></li>
          </ul>
        </div>
        <div className="footer-column social-column">
          <h4>FOLLOW US</h4>
          <div className="footer-icons">
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-whatsapp"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; 2025 Fashion Store. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
