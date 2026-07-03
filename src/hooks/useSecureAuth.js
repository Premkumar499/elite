/**
 * Secure Authentication Hook
 * Adds additional security checks to authentication
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { initSessionMonitor, checkInactivity, updateActivity } from '../utils/sessionMonitor';

export function useSecureAuth(requireAuth = true) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    // Monitor session activity
    if (!initSessionMonitor()) {
      handleSecurityViolation('Session fingerprint mismatch');
      return;
    }

    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      if (checkInactivity()) {
        handleSecurityViolation('Session expired due to inactivity');
      }
    }, 60000);

    // Update activity on user interaction
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    return () => {
      clearInterval(inactivityCheck);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && requireAuth) {
      navigate('/login');
      setLoading(false);
      return;
    }
    
    setUser(session?.user || null);
    setLoading(false);
  }

  function handleSecurityViolation(reason) {
    supabase.auth.signOut();
    sessionStorage.clear();
    navigate('/login', { state: { securityAlert: reason } });
  }

  return { user, loading };
}
