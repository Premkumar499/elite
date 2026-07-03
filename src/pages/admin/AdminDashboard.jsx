import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default function AdminDashboard() {
  const [stats, setStats]               = useState(null);
  const [recent, setRecent]             = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [newEnrollments, setNewEnrollments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([loadStats(), loadOrders(), loadEnrollments()])
      .catch(() => {})
      .finally(() => setLoading(false));

    // Real-time: listen for ALL changes (INSERT, UPDATE, DELETE)
    const orderChannel = supabaseAdmin
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadOrders();
        loadStats();
      })
      .subscribe();

    const enrollChannel = supabaseAdmin
      .channel('dashboard-enrollments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => loadEnrollments())
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(orderChannel);
      supabaseAdmin.removeChannel(enrollChannel);
    };
  }, []);

  async function loadStats() {
    const { count: total_products } = await supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true });
    setStats({ total_products: total_products || 0 });
  }

  async function loadOrders() {
    const { data } = await supabaseAdmin
      .from('orders')
      .select('id, user_name, user_email, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) {
      setRecentOrders(data);
      setPendingCount(data.filter(o => o.status === 'pending').length);
    }
  }

  async function loadEnrollments() {
    const { data } = await supabaseAdmin
      .from('enrollments')
      .select('id, first_name, last_name, email, phone, payment_plan, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setNewEnrollments(data);
  }

  if (loading) return <div style={s.loading}>Loading dashboard...</div>;
  if (!stats) return <div style={s.loading}>Unable to load dashboard. Check your Supabase connection.</div>;

  const statusColor = { pending: '#f39c12', confirmed: '#3498db', delivered: '#27ae60', cancelled: '#e74c3c' };
  const newEnrollCount = newEnrollments.filter(e => e.status === 'new').length;
  const enrollStatusColor = { new: '#e74c3c', contacted: '#3498db', enrolled: '#27ae60', cancelled: '#888' };

  return (
    <div>
      <h1 style={s.heading}>Dashboard</h1>
      <p style={s.sub}>Welcome back, Admin</p>

      {/* Alerts row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {pendingCount > 0 && (
          <div style={s.alert} onClick={() => navigate('/admin/orders')}>
            <i className="fas fa-shopping-bag" style={{ marginRight: 10, fontSize: 16 }}></i>
            You have <strong style={{ margin: '0 4px' }}>{pendingCount} pending order{pendingCount > 1 ? 's' : ''}</strong> waiting for confirmation.
            <span style={s.alertLink}>Review Orders →</span>
          </div>
        )}
        {newEnrollCount > 0 && (
          <div style={{ ...s.alert, background: '#e8f5e9', border: '1px solid #a5d6a7', color: '#1b5e20' }} onClick={() => navigate('/admin/enrollments')}>
            <i className="fas fa-user-graduate" style={{ marginRight: 10, fontSize: 16 }}></i>
            You have <strong style={{ margin: '0 4px' }}>{newEnrollCount} new enrollment{newEnrollCount > 1 ? 's' : ''}</strong> waiting to be contacted.
            <span style={{ ...s.alertLink, color: '#27ae60' }}>Review Enrollments →</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={s.grid3}>
        <StatCard icon="fa-box-open"      color="#a07d56" label="Total Products"     value={stats.total_products} />
        <StatCard icon="fa-shopping-bag"  color="#e74c3c" label="Pending Orders"     value={pendingCount} />
        <StatCard icon="fa-user-graduate" color="#27ae60" label="New Enrollments"    value={newEnrollCount} />
      </div>

      <div style={s.row}>
        {/* Recent Orders */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={s.cardTitle}>Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} style={s.viewAll}>View All →</button>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14 }}>No orders yet.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>{['Customer', 'Amount', 'Status', 'Date'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} style={s.tr}>
                    <td style={s.td}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{o.user_name || 'Unknown'}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{o.user_email}</p>
                    </td>
                    <td style={s.td}>₹{o.total_amount.toLocaleString()}</td>
                    <td style={s.td}>
                      <span style={{ color: statusColor[o.status] || '#888', fontWeight: 600, fontSize: 12 }}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#aaa', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Enrollments */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={s.cardTitle}>
              Recent Enrollments
              {newEnrollCount > 0 && <span style={s.newDot}>{newEnrollCount} new</span>}
            </h3>
            <button onClick={() => navigate('/admin/enrollments')} style={s.viewAll}>View All →</button>
          </div>
          {newEnrollments.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14 }}>No enrollments yet.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>{['Name', 'Plan', 'Status', 'Date'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {newEnrollments.map(e => (
                  <tr key={e.id} style={s.tr}>
                    <td style={s.td}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{e.first_name} {e.last_name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{e.phone}</p>
                    </td>
                    <td style={{ ...s.td, color: '#a07d56', fontWeight: 600, fontSize: 13 }}>{e.payment_plan || '—'}</td>
                    <td style={s.td}>
                      <span style={{ color: enrollStatusColor[e.status] || '#888', fontWeight: 600, fontSize: 12, textTransform: 'capitalize' }}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#aaa', fontSize: 12 }}>{new Date(e.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.iconWrap, background: `${color}20` }}>
        <i className={`fas ${icon}`} style={{ color, fontSize: 22 }}></i>
      </div>
      <div>
        <p style={s.statLabel}>{label}</p>
        <p style={s.statValue}>{value}</p>
      </div>
    </div>
  );
}

const s = {
  loading:   { padding: 40, textAlign: 'center', color: '#666' },
  heading:   { fontSize: 26, color: '#333d47', margin: '0 0 4px' },
  sub:       { color: '#888', marginBottom: 20 },
  alert:     { background: '#fff3cd', border: '1px solid #ffc107', color: '#856404', padding: '14px 20px', borderRadius: 10, marginBottom: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 },
  alertLink: { marginLeft: 'auto', color: '#a07d56', fontWeight: 700, textDecoration: 'underline' },
  grid3:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 },
  statCard:  { background: '#fff', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  iconWrap:  { width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { color: '#888', fontSize: 13, margin: '0 0 4px' },
  statValue: { color: '#333d47', fontSize: 24, fontWeight: 700, margin: 0 },
  row:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 },
  card:      { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  cardTitle: { margin: '0 0 16px', color: '#333d47', fontSize: 16, fontWeight: 700 },
  catRow:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  catBadge:  { color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  barWrap:   { flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  bar:       { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  catCount:  { fontWeight: 700, color: '#333d47', minWidth: 20 },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th:        { textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0' },
  tr:        { borderBottom: '1px solid #f7f7f7' },
  td:        { padding: '10px 12px', fontSize: 14, color: '#333d47' },
  viewAll:   { background: 'none', border: 'none', color: '#a07d56', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  newDot:    { background: '#e74c3c', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700, marginLeft: 8 },
};
