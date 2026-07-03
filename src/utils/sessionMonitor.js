/**
 * Session Activity Monitor
 * Detects suspicious session activity and potential hijacking
 */

const SESSION_KEY = '_session_fp';
const ACTIVITY_KEY = '_last_activity';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Generate browser fingerprint
function generateFingerprint() {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function initSessionMonitor() {
  const fingerprint = generateFingerprint();
  const stored = sessionStorage.getItem(SESSION_KEY);
  
  if (stored && stored !== fingerprint) {
    // Potential session hijacking detected
    return false;
  }
  
  sessionStorage.setItem(SESSION_KEY, fingerprint);
  updateActivity();
  return true;
}

export function updateActivity() {
  sessionStorage.setItem(ACTIVITY_KEY, Date.now().toString());
}

export function checkInactivity() {
  const lastActivity = sessionStorage.getItem(ACTIVITY_KEY);
  if (!lastActivity) return false;
  
  const elapsed = Date.now() - parseInt(lastActivity);
  return elapsed > INACTIVITY_TIMEOUT;
}

export function clearSessionData() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ACTIVITY_KEY);
}
