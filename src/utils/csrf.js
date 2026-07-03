/**
 * CSRF Token Management
 * Client-side CSRF protection for forms and API requests
 */

const TOKEN_KEY = '_csrf_token';
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export function generateCSRFToken() {
  const token = {
    value: Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''),
    expires: Date.now() + TOKEN_EXPIRY,
  };
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  return token.value;
}

export function getCSRFToken() {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (!stored) return generateCSRFToken();
  
  try {
    const token = JSON.parse(stored);
    if (Date.now() > token.expires) return generateCSRFToken();
    return token.value;
  } catch {
    return generateCSRFToken();
  }
}

export function validateCSRFToken(token) {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  if (!stored) return false;
  
  try {
    const storedToken = JSON.parse(stored);
    if (Date.now() > storedToken.expires) return false;
    return storedToken.value === token;
  } catch {
    return false;
  }
}

export function clearCSRFToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
