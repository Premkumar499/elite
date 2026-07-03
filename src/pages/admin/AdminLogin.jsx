import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'elite@admin2024';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', 'elite-admin-token');
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid password. Try again.');
    }
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <i className="fas fa-shield-alt" style={{ fontSize: 36, color: '#a07d56' }}></i>
          <h2 style={styles.title}>Admin Panel</h2>
          <p style={styles.sub}>Elite Studio</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              style={styles.input}
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f2e7' },
  card:  { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', width: '100%', maxWidth: '380px' },
  logo:  { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '24px', color: '#333d47', margin: '10px 0 4px' },
  sub:   { color: '#a07d56', fontSize: '14px', margin: 0 },
  group: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333d47', fontSize: '14px' },
  input: { width: '100%', padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  error: { color: '#e74c3c', fontSize: '14px', marginBottom: '12px' },
  btn:   { width: '100%', padding: '13px', background: '#a07d56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' },
};
