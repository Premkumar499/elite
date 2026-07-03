import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCart } from '../services/db';

export default function Navbar() {
  const [sideOpen, setSideOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => { setSideOpen(false); }, [location]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session) loadCartCount();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session) loadCartCount(); else setCartCount(0);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Refresh cart count when navigating
  useEffect(() => {
    if (user) loadCartCount();
  }, [location, user]);

  async function loadCartCount() {
    try {
      const cart = await getCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    } catch { setCartCount(0); }
  }

  useEffect(() => {
    const handler = (e) => {
      if (sideOpen && !e.target.closest('.side-navbar') && !e.target.closest('.navbar-menu-toggle')) {
        setSideOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [sideOpen]);

  const navLinks = [
    { to: '/',           label: 'Home' },
    { to: '/collections',label: 'Collections' },
    { to: '/training',   label: 'Live Training' },
    { to: '/favourites', label: 'Favourite' },
    { to: '/about',      label: 'About Us' },
  ];

  return (
    <>
      <div className={`side-navbar${sideOpen ? ' active' : ''}`}>
        <div className="side-navbar-links">
          {navLinks.map(l => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart {cartCount > 0 && `(${cartCount})`}</Link>
        </div>
      </div>

      <nav className="navbar">
        <Link to="/" className="title-text">Elite Studio</Link>
        <div className="navbar-links">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={location.pathname === l.to ? 'active' : ''}>{l.label}</Link>
          ))}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 16 }}>
          {/* Cart */}
          <Link to="/cart" style={{ color: '#fff', position: 'relative', textDecoration: 'none' }}>
            <i className="fas fa-shopping-cart" style={{ fontSize: 20 }}></i>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8,
                background: '#e74c3c', color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </Link>

          {/* Profile */}
          <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>
            <i className="fas fa-user-circle" style={{ fontSize: 22 }}></i>
          </Link>

          {/* Mobile toggle */}
          <button className="navbar-menu-toggle" onClick={() => setSideOpen(o => !o)}>&#9776;</button>
        </div>
      </nav>
    </>
  );
}
