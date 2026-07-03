import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const [error, setError] = useState('');

  async function handleGoogleSignup() {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) setError(error.message);
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.sub}>Elite Studio</p>
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button onClick={handleGoogleSignup} style={s.googleBtn}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ width: 20, height: 20, marginRight: 10 }}
          />
          Continue with Google
        </button>

        <p style={s.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f2e7' },
  card:       { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', width: '100%', maxWidth: '400px' },
  logo:       { textAlign: 'center', marginBottom: '28px' },
  title:      { fontSize: '26px', color: '#333d47', margin: '0 0 4px' },
  sub:        { color: '#a07d56', fontSize: '14px', margin: 0 },
  error:      { color: '#e74c3c', fontSize: '13px', marginBottom: '16px', textAlign: 'center' },
  googleBtn:  { width: '100%', padding: '13px', background: '#fff', color: '#333', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  switchText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' },
  link:       { color: '#a07d56', fontWeight: 600, textDecoration: 'none' },
};
