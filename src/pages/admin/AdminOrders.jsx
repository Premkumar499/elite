import { useState, useEffect } from 'react';
import { adminGetAllOrders, adminUpdateOrderStatus, adminDeleteOrder } from '../../services/adminDb';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { sanitizeText } from '../../utils/sanitize';

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];
const STATUS_COLOR = {
  pending:   { bg: '#fff3cd', color: '#856404' },
  confirmed: { bg: '#d1ecf1', color: '#0c5460' },
  delivered: { bg: '#c3e6cb', color: '#155724' },
  cancelled: { bg: '#f8d7da', color: '#721c24' },
};

export default function AdminOrders() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [filter, setFilter]       = useState('all');
  const [product, setProduct]     = useState(null);
  const [prodLoading, setProdLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId]   = useState(null);

  useEffect(() => { 
    load();

    // Realtime: sync on any DB change (insert, update, delete)
    const channel = supabaseAdmin
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe();

    return () => supabaseAdmin.removeChannel(channel);
  }, []);

  async function load() {
    setLoading(true);
    try { setOrders(await adminGetAllOrders()); }
    catch { }
    finally { setLoading(false); }
  }

  async function handleStatus(orderId, status) {
    await adminUpdateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }

  async function deleteOrder(orderId) {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    setDeleteError('');
    setDeletingId(orderId);
    try {
      await adminDeleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expanded === orderId) setExpanded(null);
    } catch (e) {
      setDeleteError('Delete failed: ' + e.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function openProduct(productId) {
    if (!productId) return;
    setProdLoading(true);
    setProduct({ loading: true });
    const { data } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    setProduct(data || null);
    setProdLoading(false);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>Orders</h1>
          <p style={s.sub}>{orders.length} total orders</p>
        </div>
        {/* Filter tabs */}
        <div style={s.tabs}>
          {['all', ...STATUSES].map(st => (
            <button key={st} style={{ ...s.tab, ...(filter === st ? s.tabActive : {}) }}
              onClick={() => setFilter(st)}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={s.loading}>Loading orders...</div> : (
        <>
          {deleteError && (
            <div style={{ background: '#fde8e8', color: '#e74c3c', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {deleteError}
            </div>
          )}
          {filtered.length === 0 ? <div style={s.loading}>No orders found.</div> :
        filtered.map(order => {
          const sc = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} style={s.card}>
              <div style={s.cardHead} onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div style={s.headLeft}>
                  <span style={s.orderId}>#{order.id}</span>
                  <div>
                    <p style={s.customerName}>{sanitizeText(order.user_name || 'Unknown')}</p>
                    <p style={s.customerEmail}>{sanitizeText(order.user_email)}</p>
                  </div>
                </div>
                <div style={s.headRight}>
                  <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span style={s.amt}>₹{order.total_amount.toLocaleString()}</span>
                  <span style={s.date}>{new Date(order.created_at).toLocaleDateString()}</span>
                  <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#aaa' }}></i>
                </div>
              </div>

              {isOpen && (
                <div style={s.body}>
                  <div style={s.bodyGrid}>
                    <div><label style={s.lbl}>Phone</label><p style={s.val}>{sanitizeText(order.phone || '—')}</p></div>
                    <div><label style={s.lbl}>Address</label><p style={s.val}>{sanitizeText(order.address || '—')}</p></div>
                    {order.notes && <div style={{ gridColumn: '1/-1' }}><label style={s.lbl}>Notes</label><p style={s.val}>{sanitizeText(order.notes)}</p></div>}
                  </div>

                  <div style={s.itemsList}>
                    {order.order_items?.map(item => (
                      <div key={item.id} style={{ ...s.itemRow, cursor: 'pointer' }}
                        onClick={() => openProduct(item.product_id)}
                        title="Click to view product details">
                        <img src={item.image} alt={item.name} style={s.itemImg}
                          onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{sanitizeText(item.name)}</span>
                        <span style={{ color: '#888', fontSize: 13 }}>x{item.quantity}</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        <i className="fas fa-external-link-alt" style={{ color: '#a07d56', fontSize: 11, marginLeft: 6 }}></i>
                      </div>
                    ))}
                  </div>

                  {/* Status update */}
                  <div style={s.statusRow}>
                    <span style={s.lbl}>Update Status:</span>
                    <div style={s.statusBtns}>
                      {STATUSES.map(st => (
                        <button key={st}
                          style={{ ...s.stBtn, ...(order.status === st ? { background: '#a07d56', color: '#fff' } : {}) }}
                          onClick={() => handleStatus(order.id, st)}>
                          {st}
                        </button>
                      ))}
                    </div>
                    <button style={s.deleteBtn} onClick={() => deleteOrder(order.id)} title="Delete order" disabled={deletingId === order.id}>
                      {deletingId === order.id
                        ? <i className="fas fa-spinner fa-spin"></i>
                        : <><i className="fas fa-trash" style={{ marginRight: 5 }}></i>Delete</>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      }</>
      )}

      {/* Product Detail Modal */}
      {product && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setProduct(null)}>
          <div style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.modalTitle}>Product Details</h2>
              <button style={s.closeBtn} onClick={() => setProduct(null)}>&times;</button>
            </div>
            {product.loading ? (
              <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading...</p>
            ) : (
              <div>
                <div style={s.prodTop}>
                  <img src={product.image} alt={product.name} style={s.prodImg}
                    onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                  <div style={{ flex: 1 }}>
                    <h3 style={s.prodName}>{product.name}</h3>
                    <p style={s.prodPrice}>₹{Number(product.price).toLocaleString()}</p>
                    <span style={{ ...s.catBadge, background: { Blouses: '#a07d56', Bangles: '#e74c3c', Materials: '#27ae60' }[product.category] || '#888' }}>
                      {product.category}
                    </span>
                    <p style={{ marginTop: 10, fontSize: 13 }}>
                      <strong>Stock:</strong>{' '}
                      <span style={{ color: product.stock === 'In Stock' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{product.stock}</span>
                    </p>
                  </div>
                </div>
                <div style={s.prodGrid}>
                  <ProdRow label="Material"    value={product.material} />
                  <ProdRow label="Vendor"      value={product.vendor} />
                  <ProdRow label="Product ID"  value={`#${product.id}`} />
                  <ProdRow label="Added"       value={product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'} />
                  <ProdRow label="Description" value={product.description} fullWidth />
                </div>
                {product.images?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', margin: '16px 0 8px' }}>Images</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {product.images.map((src, i) => (
                        <img key={i} src={src} alt={`img-${i}`} style={s.thumb}
                          onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  heading:     { fontSize: 26, color: '#333d47', margin: '0 0 4px' },
  sub:         { color: '#888', margin: 0 },
  tabs:        { display: 'flex', gap: 6, flexWrap: 'wrap' },
  tab:         { padding: '6px 14px', border: '1.5px solid #ddd', borderRadius: 20, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#555', fontWeight: 600 },
  tabActive:   { background: '#a07d56', color: '#fff', border: '1.5px solid #a07d56' },
  loading:     { textAlign: 'center', padding: 40, color: '#888' },
  card:        { background: '#fff', borderRadius: 12, marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' },
  cardHead:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' },
  headLeft:    { display: 'flex', alignItems: 'center', gap: 14 },
  orderId:     { background: '#f0ece3', color: '#a07d56', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700 },
  customerName:{ fontSize: 14, fontWeight: 700, color: '#333d47', margin: 0 },
  customerEmail:{ fontSize: 12, color: '#888', margin: 0 },
  headRight:   { display: 'flex', alignItems: 'center', gap: 14 },
  badge:       { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  amt:         { fontWeight: 700, fontSize: 15, color: '#333d47' },
  date:        { fontSize: 12, color: '#aaa' },
  body:        { borderTop: '1px solid #f5f5f5', padding: '16px 20px' },
  bodyGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  lbl:         { fontSize: 11, color: '#aaa', textTransform: 'uppercase', fontWeight: 600 },
  val:         { fontSize: 14, color: '#333d47', margin: '4px 0 0' },
  itemsList:   { marginBottom: 16 },
  itemRow:     { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f8f8f8' },
  itemImg:     { width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 },
  statusRow:   { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  statusBtns:  { display: 'flex', gap: 6, flexWrap: 'wrap' },
  stBtn:       { padding: '5px 12px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#f8f8f8', color: '#555', fontWeight: 600, textTransform: 'capitalize' },
  deleteBtn:   { padding: '6px 14px', background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  // Product modal
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal:       { background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHead:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:  { fontSize: 20, fontWeight: 700, color: '#333d47', margin: 0 },
  closeBtn:    { background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#888', lineHeight: 1 },
  prodTop:     { display: 'flex', gap: 20, marginBottom: 20 },
  prodImg:     { width: 140, height: 140, objectFit: 'cover', borderRadius: 10, flexShrink: 0, border: '1px solid #eee' },
  prodName:    { fontSize: 18, fontWeight: 700, color: '#333d47', margin: '0 0 6px' },
  prodPrice:   { fontSize: 20, fontWeight: 700, color: '#a07d56', margin: '0 0 8px' },
  catBadge:    { color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  prodGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', background: '#f7f2e7', borderRadius: 10, padding: 16 },
  thumb:       { width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' },
};

function ProdRow({ label, value, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <p style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', fontWeight: 600, margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 14, color: '#333d47', margin: 0 }}>{value || '—'}</p>
    </div>
  );
}
