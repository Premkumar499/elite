import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserOrders, getFavourites } from '../services/db';
import { sanitizeText } from '../utils/sanitize';

export default function Profile() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [orders, setOrders]     = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState('');
  const [saving, setSaving]     = useState(false);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }
    const u = session.user;
    setUser(u);

    const [{ data: prof }, ordersData, favsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', u.id).single(),
      getUserOrders().catch(() => []),
      getFavourites().catch(() => []),
    ]);
    setProfile(prof);
    setName(prof?.full_name || '');
    setOrders(ordersData);
    setFavCount(favsData.length);
    setLoading(false);
  }

  async function saveName() {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: name }).eq('id', user.id);
    setProfile(p => ({ ...p, full_name: name }));
    setEditing(false);
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  if (loading) return <div style={s.loadWrap}>Loading...</div>;

  const recentOrders = orders.slice(0, 3);
  const statusColor = { pending: '#f39c12', confirmed: '#3498db', delivered: '#27ae60', cancelled: '#e74c3c' };

  return (
    <>
      <div className="title">
        <h1>MY PROFILE</h1>
        <div className="breadcrumb"><Link to="/">HOME</Link> &gt; <span>PROFILE</span></div>
      </div>

      <div style={s.page}>
        {/* Left — profile card */}
        <div style={s.left}>
          <div style={s.card}>
            <div style={s.avatarWrap}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" style={s.avatar} />
                : <div style={s.avatarFallback}>{sanitizeText((profile?.full_name || user.email || '?')[0]).toUpperCase()}</div>
              }
            </div>

            {editing ? (
              <div style={{ marginBottom: 12 }}>
                <input style={s.nameInput} value={name} onChange={e => setName(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button style={s.saveBtn} onClick={saveName} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                  <button style={s.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <h2 style={s.nameText}>{sanitizeText(profile?.full_name) || 'No name set'}</h2>
                <button style={s.editBtn} onClick={() => setEditing(true)}>
                  <i className="fas fa-edit" style={{ marginRight: 5 }}></i>Edit Name
                </button>
              </div>
            )}

            <p style={s.email}>{sanitizeText(profile?.email)}</p>
            <p style={s.provider}>via {user.app_metadata?.provider || 'email'}</p>
            <p style={s.joined}>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'}</p>

            {/* Stats */}
            <div style={s.stats}>
              <div style={s.stat}>
                <span style={s.statNum}>{orders.length}</span>
                <span style={s.statLabel}>Orders</span>
              </div>
              <div style={s.statDiv} />
              <div style={s.stat}>
                <span style={s.statNum}>{favCount}</span>
                <span style={s.statLabel}>Favourites</span>
              </div>
            </div>

            {/* Quick links */}
            <div style={s.links}>
              <Link to="/orders"     style={s.link}><i className="fas fa-box" style={{ marginRight: 8 }}></i>My Orders</Link>
              <Link to="/favourites" style={s.link}><i className="fas fa-heart" style={{ marginRight: 8 }}></i>Favourites</Link>
              <Link to="/cart"       style={s.link}><i className="fas fa-shopping-cart" style={{ marginRight: 8 }}></i>My Cart</Link>
            </div>

            <button style={s.logoutBtn} onClick={handleLogout}>
              <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>Logout
            </button>
          </div>
        </div>

        {/* Right — recent orders */}
        <div style={s.right}>
          <div style={s.card}>
            <div style={s.cardHead}>
              <h3 style={s.cardTitle}>Recent Orders</h3>
              <Link to="/orders" style={s.viewAll}>View All →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div style={s.emptyOrders}>
                <i className="fas fa-shopping-bag" style={{ fontSize: 32, color: '#ddd', marginBottom: 10 }}></i>
                <p style={{ color: '#888', margin: 0 }}>No orders yet</p>
                <Link to="/collections" className="btn" style={{ marginTop: 14, display: 'inline-block' }}>Start Shopping</Link>
              </div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} style={s.orderRow}>
                  <div>
                    <p style={s.orderId}>Order #{order.id}</p>
                    <p style={s.orderDate}>{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ ...s.orderStatus, color: statusColor[order.status] || '#888' }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                    <p style={s.orderAmt}>₹{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  loadWrap:      { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a07d56', fontSize: 18 },
  page:          { maxWidth: 960, margin: '0 auto', padding: '30px 20px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' },
  left:          {},
  right:         {},
  card:          { background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 2px 14px rgba(0,0,0,0.08)' },
  avatarWrap:    { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  avatar:        { width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '4px solid #a07d56' },
  avatarFallback:{ width: 88, height: 88, borderRadius: '50%', background: '#a07d56', color: '#fff', fontSize: 36, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #ede7db' },
  nameText:      { fontSize: 20, fontWeight: 700, color: '#333d47', margin: '0 0 6px' },
  editBtn:       { background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#a07d56' },
  nameInput:     { width: '100%', padding: '8px 12px', border: '1.5px solid #a07d56', borderRadius: 8, fontSize: 15, boxSizing: 'border-box', textAlign: 'center' },
  saveBtn:       { flex: 1, padding: '7px', background: '#a07d56', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  cancelBtn:     { flex: 1, padding: '7px', background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  email:         { textAlign: 'center', color: '#888', fontSize: 13, margin: '0 0 4px' },
  provider:      { textAlign: 'center', color: '#bbb', fontSize: 12, margin: '0 0 4px' },
  joined:        { textAlign: 'center', color: '#bbb', fontSize: 12, margin: '0 0 20px' },
  stats:         { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, background: '#f7f2e7', borderRadius: 10, padding: '14px 0', marginBottom: 20 },
  stat:          { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum:       { fontSize: 22, fontWeight: 700, color: '#a07d56' },
  statLabel:     { fontSize: 11, color: '#888', textTransform: 'uppercase' },
  statDiv:       { width: 1, height: 32, background: '#ddd' },
  links:         { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 },
  link:          { padding: '11px 14px', borderRadius: 8, color: '#333d47', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', background: '#f7f2e7', marginBottom: 4 },
  logoutBtn:     { width: '100%', padding: '11px', background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  cardHead:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle:     { fontSize: 17, fontWeight: 700, color: '#333d47', margin: 0 },
  viewAll:       { color: '#a07d56', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  emptyOrders:   { textAlign: 'center', padding: '30px 0' },
  orderRow:      { display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f5f5f5' },
  orderId:       { fontSize: 14, fontWeight: 700, color: '#333d47', margin: 0 },
  orderDate:     { fontSize: 12, color: '#aaa', margin: '3px 0 0' },
  orderStatus:   { fontSize: 12, fontWeight: 700, margin: 0, textAlign: 'right' },
  orderAmt:      { fontSize: 14, fontWeight: 700, color: '#333d47', margin: '3px 0 0' },
};
