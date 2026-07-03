import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartQty, removeFromCart } from '../services/db';

export default function Cart() {
  const [cart, setCart]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setCart(await getCart()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleQty(productId, qty) {
    await updateCartQty(productId, qty);
    load();
  }

  async function handleRemove(productId) {
    await removeFromCart(productId);
    load();
  }

  const total = cart.reduce((s, i) => s + i.products.price * i.quantity, 0);

  return (
    <>
      <div className="title">
        <h1>MY CART</h1>
        <div className="breadcrumb">
          <Link to="/">HOME</Link> &gt; <span>CART</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading cart...</p>
        ) : cart.length === 0 ? (
          <div style={s.empty}>
            <i className="fas fa-shopping-cart" style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}></i>
            <h3 style={{ color: '#333d47', marginBottom: 8 }}>Your cart is empty</h3>
            <p style={{ color: '#888', marginBottom: 20 }}>Add some products to get started.</p>
            <Link to="/collections" className="btn">Browse Products</Link>
          </div>
        ) : (
          <div style={s.layout}>
            {/* Items */}
            <div style={s.items}>
              {cart.map(item => (
                <div key={item.id} style={s.row}>
                  <img src={item.products.image} alt={item.products.name} style={s.img}
                    onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
                  <div style={s.info}>
                    <p style={s.name}>{item.products.name}</p>
                    <p style={s.price}>₹{item.products.price.toLocaleString()}</p>
                    <div style={s.qtyRow}>
                      <button style={s.qBtn} onClick={() => handleQty(item.product_id, item.quantity - 1)}>−</button>
                      <span style={s.qty}>{item.quantity}</span>
                      <button style={s.qBtn} onClick={() => handleQty(item.product_id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div style={s.right}>
                    <p style={s.subtotal}>₹{(item.products.price * item.quantity).toLocaleString()}</p>
                    <button style={s.del} onClick={() => handleRemove(item.product_id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={s.summary}>
              <h3 style={s.sumTitle}>Order Summary</h3>
              <div style={s.sumRow}>
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div style={s.sumRow}>
                <span>Shipping</span>
                <span style={{ color: '#27ae60' }}>Free</span>
              </div>
              <div style={{ ...s.sumRow, fontWeight: 700, fontSize: 18, borderTop: '1px solid #eee', paddingTop: 12, marginTop: 4 }}>
                <span>Total</span>
                <span style={{ color: '#a07d56' }}>₹{total.toLocaleString()}</span>
              </div>
              <button style={s.checkoutBtn} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
              <Link to="/collections" style={s.continueLink}>← Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  empty:       { textAlign: 'center', padding: '60px 20px' },
  layout:      { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' },
  items:       { display: 'flex', flexDirection: 'column', gap: 16 },
  row:         { background: '#fff', borderRadius: 12, padding: 16, display: 'flex', gap: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  img:         { width: 90, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  info:        { flex: 1 },
  name:        { fontSize: 15, fontWeight: 600, color: '#333d47', margin: '0 0 4px' },
  price:       { fontSize: 14, color: '#a07d56', fontWeight: 700, margin: '0 0 10px' },
  qtyRow:      { display: 'flex', alignItems: 'center', gap: 10 },
  qBtn:        { width: 28, height: 28, border: '1.5px solid #ddd', borderRadius: 6, background: '#f7f2e7', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty:         { fontSize: 15, fontWeight: 700, minWidth: 24, textAlign: 'center' },
  right:       { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' },
  subtotal:    { fontSize: 15, fontWeight: 700, color: '#333d47' },
  del:         { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer' },
  summary:     { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', position: 'sticky', top: 90 },
  sumTitle:    { fontSize: 17, fontWeight: 700, color: '#333d47', margin: '0 0 20px' },
  sumRow:      { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: '#555' },
  checkoutBtn: { width: '100%', padding: 13, background: '#a07d56', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16 },
  continueLink:{ display: 'block', textAlign: 'center', marginTop: 12, color: '#888', fontSize: 13, textDecoration: 'none' },
};
