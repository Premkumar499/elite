import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, placeOrder } from '../services/db';

const CONTACT_NUMBER = '+91 75393 03671';

export default function Checkout() {
  const [cart, setCart]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(null); // order id after success
  const [form, setForm]       = useState({ phone: '', address: '', notes: '' });
  const navigate = useNavigate();

  useEffect(() => {
    getCart()
      .then(data => { setCart(data); if (data.length === 0) navigate('/cart'); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = cart.reduce((s, i) => s + i.products.price * i.quantity, 0);

  function handleInputChange(e) {
    const { name, value } = e.target;
    // Basic XSS protection - strip HTML tags
    const clean = value.replace(/<[^>]*>/g, '');
    setForm(prev => ({ ...prev, [name]: clean }));
  }

  async function handleOrder() {
    // Validate required fields
    if (!form.phone.trim() || !form.address.trim()) {
      setError('Phone and address are required.');
      return;
    }
    // Phone validation
    if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone.trim())) {
      setError('Please enter a valid phone number.');
      return;
    }

    setPlacing(true); 
    setError('');
    try {
      const order = await placeOrder({ 
        phone: form.phone.trim(), 
        address: form.address.trim(), 
        notes: form.notes.trim(), 
        cartItems: cart 
      });
      setDone(order.id);
    } catch (e) {
      setError('Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>;

  // Success screen after order placed
  if (done) {
    return (
      <div style={s.page}>
        <div style={s.successCard}>
          <div style={s.checkIcon}>
            <i className="fas fa-check-circle" style={{ fontSize: 56, color: '#27ae60' }}></i>
          </div>
          <h2 style={s.successTitle}>Order Placed!</h2>
          <p style={s.successSub}>Order <strong>#{done}</strong> has been received.</p>
          <div style={s.contactBox}>
            <p style={s.contactLabel}>We'll reach out to confirm your order. Contact us at:</p>
            <a href={`tel:${CONTACT_NUMBER}`} style={s.contactNum}>
              <i className="fas fa-phone-alt" style={{ marginRight: 8 }}></i>
              {CONTACT_NUMBER}
            </a>
          </div>
          <div style={s.successActions}>
            <button style={s.ordersBtn} onClick={() => navigate('/orders')}>View My Orders</button>
            <button style={s.shopBtn} onClick={() => navigate('/collections')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.heading}>
          <i className="fas fa-shopping-bag" style={{ marginRight: 10, color: '#a07d56' }}></i>
          Confirm Your Order
        </h2>

        {/* Items list */}
        <div style={s.items}>
          {cart.map(i => (
            <div key={i.id} style={s.item}>
              <img src={i.products.image} alt={i.products.name} style={s.itemImg}
                onError={e => e.target.src = '/elite studio pic/product.jpeg'} />
              <div style={s.itemInfo}>
                <p style={s.itemName}>{i.products.name}</p>
                <p style={s.itemMeta}>Qty: {i.quantity} × ₹{i.products.price.toLocaleString()}</p>
              </div>
              <span style={s.itemTotal}>₹{(i.products.price * i.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={s.totalRow}>
          <span style={s.totalLabel}>Total Amount</span>
          <span style={s.totalAmt}>₹{total.toLocaleString()}</span>
        </div>

        {/* Delivery Form */}
        <div style={s.formSection}>
          <h3 style={s.formTitle}>Delivery Information</h3>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              placeholder="Your contact number"
              style={s.formInput}
              required
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Delivery Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleInputChange}
              placeholder="Complete delivery address"
              style={s.formTextarea}
              rows={3}
              required
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Special Instructions (Optional)</label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleInputChange}
              placeholder="Any special delivery instructions"
              style={s.formInput}
            />
          </div>
        </div>

        {/* Note */}
        <div style={s.note}>
          <i className="fas fa-info-circle" style={{ color: '#a07d56', marginRight: 8 }}></i>
          After placing your order, our team will contact you at <strong>{CONTACT_NUMBER}</strong> to confirm delivery details and payment.
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button style={s.btn} onClick={handleOrder} disabled={placing}>
          {placing
            ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Placing Order...</>
            : <><i className="fas fa-check" style={{ marginRight: 8 }}></i>Place Order — ₹{total.toLocaleString()}</>
          }
        </button>

        <button style={s.backBtn} onClick={() => navigate('/cart')}>← Back to Cart</button>
      </div>
    </div>
  );
}

const s = {
  page:          { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', background: '#f7f2e7' },
  card:          { background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 500, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
  heading:       { fontSize: 22, color: '#333d47', marginBottom: 24 },
  items:         { marginBottom: 20 },
  item:          { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  itemImg:       { width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  itemInfo:      { flex: 1 },
  itemName:      { fontSize: 14, fontWeight: 600, color: '#333d47', margin: 0 },
  itemMeta:      { fontSize: 12, color: '#888', margin: '3px 0 0' },
  itemTotal:     { fontSize: 15, fontWeight: 700, color: '#333d47' },
  totalRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '2px solid #f0f0f0', marginBottom: 20 },
  totalLabel:    { fontSize: 16, fontWeight: 700, color: '#333d47' },
  totalAmt:      { fontSize: 22, fontWeight: 700, color: '#a07d56' },
  note:          { background: '#f7f2e7', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#555', marginBottom: 20, lineHeight: 1.6 },
  error:         { color: '#e74c3c', fontSize: 13, marginBottom: 12 },
  btn:           { width: '100%', padding: '15px', background: '#a07d56', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  backBtn:       { width: '100%', padding: '12px', background: 'none', color: '#888', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 14, cursor: 'pointer' },
  // Success screen
  successCard:   { background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 460, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center' },
  checkIcon:     { marginBottom: 16 },
  successTitle:  { fontSize: 26, fontWeight: 700, color: '#333d47', marginBottom: 8 },
  successSub:    { color: '#888', fontSize: 15, marginBottom: 24 },
  contactBox:    { background: '#f7f2e7', borderRadius: 12, padding: '20px', marginBottom: 28 },
  contactLabel:  { fontSize: 13, color: '#777', marginBottom: 12 },
  contactNum:    { fontSize: 22, fontWeight: 700, color: '#a07d56', textDecoration: 'none', display: 'block' },
  successActions:{ display: 'flex', gap: 12 },
  ordersBtn:     { flex: 1, padding: '12px', background: '#333d47', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  shopBtn:       { flex: 1, padding: '12px', background: '#f7f2e7', color: '#a07d56', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  // Form styles
  formSection:   { background: '#f7f2e7', borderRadius: 12, padding: 20, marginBottom: 20 },
  formTitle:     { fontSize: 16, fontWeight: 700, color: '#333d47', marginBottom: 16 },
  formGroup:     { marginBottom: 16 },
  formLabel:     { display: 'block', fontSize: 14, fontWeight: 600, color: '#333d47', marginBottom: 6 },
  formInput:     { width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  formTextarea:  { width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
};
