import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserOrders } from '../services/db';

const STATUS_COLOR = {
  pending:   { bg: '#fff3cd', color: '#856404' },
  confirmed: { bg: '#d1ecf1', color: '#0c5460' },
  delivered: { bg: '#c3e6cb', color: '#155724' },
  cancelled: { bg: '#f8d7da', color: '#721c24' },
};

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();
  const newOrderId = location.state?.newOrder;

  useEffect(() => {
    getUserOrders()
      .then(data => { setOrders(data); if (newOrderId) setExpanded(newOrderId); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="title">
        <h1>MY ORDERS</h1>
        <div className="breadcrumb">
          <Link to="/">HOME</Link> &gt; <span>ORDERS</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '30px 20px' }}>
        {newOrderId && (
          <div style={s.success}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <i className="fas fa-check-circle" style={{ fontSize: 22, color: '#27ae60' }}></i>
              <strong style={{ fontSize: 16 }}>Order #{newOrderId} placed successfully!</strong>
            </div>
            <p style={{ margin: '0 0 8px', color: '#155724' }}>
              We've received your order and will process it shortly.
            </p>
            <div style={s.contactBox}>
              <i className="fas fa-phone-alt" style={{ color: '#a07d56', marginRight: 8 }}></i>
              For queries, contact us: <strong>+91 75393 03671</strong>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={s.empty}>
            <i className="fas fa-box-open" style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}></i>
            <h3 style={{ color: '#333d47', marginBottom: 8 }}>No orders yet</h3>
            <Link to="/collections" className="btn">Start Shopping</Link>
          </div>
        ) : (
          orders.map(order => {
            const sc = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} style={s.card}>
                <div style={s.cardHeader} onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div>
                    <span style={s.orderId}>Order #{order.id}</span>
                    <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div style={s.meta}>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    <span style={s.totalAmt}>₹{order.total_amount.toLocaleString()}</span>
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#888' }}></i>
                  </div>
                </div>

                {isOpen && (
                  <div style={s.cardBody}>
                    <div style={s.detailGrid}>
                      <div><span style={s.detailLabel}>Phone</span><p style={s.detailVal}>{order.phone}</p></div>
                      <div><span style={s.detailLabel}>Address</span><p style={s.detailVal}>{order.address}</p></div>
                      {order.notes && <div style={{ gridColumn: '1/-1' }}><span style={s.detailLabel}>Notes</span><p style={s.detailVal}>{order.notes}</p></div>}
                    </div>
                    <h4 style={s.itemsTitle}>Items</h4>
                    {order.order_items.map(item => (
                      <div key={item.id} style={s.itemRow}>
                        <img src={item.image} alt={item.name} style={s.itemImg}
                          onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                        <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
                        <span style={s.itemQty}>x{item.quantity}</span>
                        <span style={s.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={s.orderTotal}>
                      Total: <strong style={{ color: '#a07d56' }}>₹{order.total_amount.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

const s = {
  success:     { background: '#d4edda', color: '#155724', padding: '16px 20px', borderRadius: 10, marginBottom: 20, fontSize: 14, border: '1px solid #c3e6cb' },
  contactBox:  { background: '#fff', borderRadius: 8, padding: '10px 16px', fontSize: 14, color: '#333d47', display: 'inline-block', marginTop: 4 },
  empty:       { textAlign: 'center', padding: '60px 20px' },
  card:        { background: '#fff', borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer' },
  orderId:     { fontWeight: 700, color: '#333d47', marginRight: 10 },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  meta:        { display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#555' },
  totalAmt:    { fontWeight: 700, color: '#333d47' },
  cardBody:    { borderTop: '1px solid #f0f0f0', padding: '16px 20px' },
  detailGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  detailLabel: { fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  detailVal:   { fontSize: 14, color: '#333d47', margin: '4px 0 0' },
  itemsTitle:  { fontSize: 13, fontWeight: 700, color: '#888', marginBottom: 10, textTransform: 'uppercase' },
  itemRow:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  itemImg:     { width: 44, height: 44, objectFit: 'cover', borderRadius: 6 },
  itemQty:     { fontSize: 13, color: '#888' },
  itemPrice:   { fontSize: 14, fontWeight: 700, color: '#333d47' },
  orderTotal:  { textAlign: 'right', fontSize: 15, borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 8 },
};
