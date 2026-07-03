import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    initAndRedirect();
  }, []);

  async function initAndRedirect() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const u = session.user;

    // Upsert profile for new Google OAuth users
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', u.id)
      .single();

    if (!existing) {
      await supabase.from('profiles').insert({
        id: u.id,
        full_name: u.user_metadata?.full_name || '',
        email: u.email,
        avatar_url: u.user_metadata?.avatar_url || null,
      });
    }

    navigate('/', { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f2e7', fontSize: 18, color: '#a07d56' }}>
      Loading...
    </div>
  );
}
