import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Validate session token and expiry
    try {
      const raw = localStorage.getItem('adminToken');
      if (!raw) { navigate('/admin/login'); return; }
      const session = JSON.parse(raw);
      if (!session.token || !session.exp || Date.now() > session.exp) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
    } catch {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      return;
    }
    loadPending();

    // Real-time: listen for ALL order changes including deletes
    const channel = supabaseAdmin
      .channel('admin-orders-layout')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadPending();
      })
      .subscribe();

    return () => supabaseAdmin.removeChannel(channel);
  }, []);

  async function loadPending() {
    const { count } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    setPendingCount(count || 0);
  }

  function logout() {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  }

  const links = [
    { to: '/admin/dashboard',   icon: 'fa-chart-bar',    label: 'Dashboard' },
    { to: '/admin/products',    icon: 'fa-box-open',     label: 'Products' },
    { to: '/admin/orders',      icon: 'fa-shopping-bag', label: 'Orders',      badge: pendingCount },
    { to: '/admin/enrollments', icon: 'fa-graduation-cap', label: 'Enrollments' },
    { to: '/admin/users',       icon: 'fa-users',        label: 'Users' },
  ];

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <i className="fas fa-store" style={{ marginRight: 8 }}></i>
          Elite Studio
        </div>
        <nav style={s.nav}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={{ ...s.navLink, ...(location.pathname === l.to ? s.navActive : {}) }}>
              <i className={`fas ${l.icon}`} style={{ marginRight: 10 }}></i>
              {l.label}
              {l.badge > 0 && (
                <span style={s.badge}>{l.badge}</span>
              )}
            </Link>
          ))}
        </nav>
        <button onClick={logout} style={s.logout}>
          <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>Logout
        </button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell:     { display: 'flex', minHeight: '100vh', background: '#f0ece3' },
  sidebar:   { width: 230, background: '#333d47', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh' },
  brand:     { color: '#e7d191', fontWeight: 700, fontSize: 18, padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  nav:       { flex: 1, padding: '20px 0' },
  navLink:   { display: 'flex', alignItems: 'center', padding: '12px 24px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' },
  navActive: { background: 'rgba(160,125,86,0.25)', color: '#e7d191', borderLeft: '3px solid #a07d56' },
  badge:     { marginLeft: 'auto', background: '#e74c3c', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 7px', minWidth: 20, textAlign: 'center' },
  logout:    { margin: '0 16px 16px', padding: '10px', background: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  main:      { flex: 1, padding: '32px', overflowY: 'auto' },
};
