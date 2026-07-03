import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Favourites from './pages/Favourites';
import Training from './pages/Training';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import { supabase } from './lib/supabase';

// Wraps protected routes — redirects to /login if no session
function AuthGuard({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'auth' : 'unauth');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'auth' : 'unauth');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === 'loading') return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f2e7', fontSize: 18, color: '#a07d56' }}>Loading...</div>;
  if (status === 'unauth') return <Navigate to="/login" replace />;
  return children;
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/favourites"  element={<Favourites />} />
        <Route path="/training"    element={<Training />} />
        <Route path="/about"       element={<About />} />
        <Route path="/profile"     element={<Profile />} />
        <Route path="/cart"        element={<Cart />} />
        <Route path="/checkout"    element={<Checkout />} />
        <Route path="/orders"      element={<Orders />} />
      </Routes>
      <Footer />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login"     element={<Login />} />
      <Route path="/signup"    element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin login page */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin panel with sidebar */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard"   element={<AdminDashboard />} />
        <Route path="products"    element={<AdminProducts />} />
        <Route path="orders"      element={<AdminOrders />} />
        <Route path="users"       element={<AdminUsers />} />
        <Route path="enrollments" element={<AdminEnrollments />} />
      </Route>

      {/* Public site — requires login */}
      <Route path="*" element={<AuthGuard><PublicLayout /></AuthGuard>} />
    </Routes>
  );
}
