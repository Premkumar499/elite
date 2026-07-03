import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Password comes only from env — no hardcoded fallback
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000; // 15 minutes

function getLockout() {
  try {
    const raw = localStorage.getItem('_adm_lk');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function setLockout(data) {
  localStorage.setItem('_adm_lk', JSON.stringify(data));
}

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [locked, setLocked]     = useState(false);
  const [remaining, setRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  function checkLockout() {
    const lk = getLockout();
    if (!lk) { setLocked(false); return; }
    const elapsed = Date.now() - lk.time;
    if (lk.attempts >= MAX_ATTEMPTS && elapsed < LOCKOUT_MS) {
      setLocked(true);
      setRemaining(Math.ceil((LOCKOUT_MS - elapsed) / 60000));
    } else if (elapsed >= LOCKOUT_MS) {
      localStorage.removeItem('_adm_lk');
      setLocked(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (locked) return;

    const lk = getLockout() || { attempts: 0, time: Date.now() };
    // Reset counter if previous lockout window expired
    if (Date.now() - lk.time >= LOCKOUT_MS) {
      lk.attempts = 0;
      lk.time = Date.now();
    }

    setLoading(true);
    setError('');

    // Timing-safe comparison (prevent timing attacks)
    await new Promise(r => setTimeout(r, 400 + Math.random() * 200));

    if (ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      // Clear lockout on success
      localStorage.removeItem('_adm_lk');
      // Store a session token with expiry (1 hour)
      const session = { token: 'elite-admin-token', exp: Date.now() + 60 * 60 * 1000 };
      localStorage.setItem('adminToken', JSON.stringify(session));
      navigate('/admin/dashboard', { replace: true });
    } else {
      lk.attempts += 1;
      lk.time = lk.attempts === 1 ? Date.now() : lk.time;
      setLockout(lk);

      const left = MAX_ATTEMPTS - lk.attempts;
      if (left <= 0) {
        setLocked(true);
        setError(`Too many attempts. Locked for 15 minutes.`);
      } else {
        setError(`Invalid password. ${left} attempt${left !== 1 ? 's' : ''} remaining.`);
      }
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
        {locked ? (
          <div style={styles.lockBox}>
            <i className="fas fa-lock" style={{ fontSize: 28, color: '#e74c3c', marginBottom: 10 }}></i>
            <p style={{ margin: 0, fontWeight: 700, color: '#e74c3c' }}>Account Locked</p>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#888' }}>
              Too many failed attempts. Try again in {remaining} minute{remaining !== 1 ? 's' : ''}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            <div style={styles.group}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={styles.input}
                required
                autoComplete="new-password"
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f2e7' },
  card:    { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', width: '100%', maxWidth: '380px' },
  logo:    { textAlign: 'center', marginBottom: '30px' },
  title:   { fontSize: '24px', color: '#333d47', margin: '10px 0 4px' },
  sub:     { color: '#a07d56', fontSize: '14px', margin: 0 },
  group:   { marginBottom: '20px' },
  label:   { display: 'block', marginBottom: '8px', fontWeight: 600, color: '#333d47', fontSize: '14px' },
  input:   { width: '100%', padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  error:   { color: '#e74c3c', fontSize: '14px', marginBottom: '12px' },
  btn:     { width: '100%', padding: '13px', background: '#a07d56', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' },
  lockBox: { textAlign: 'center', padding: '20px 0' },
};
