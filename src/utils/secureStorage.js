/**
 * Secure Storage Wrapper
 * Adds encryption and integrity checks to localStorage
 */

// Simple XOR encryption (for obfuscation, not cryptographic security)
function xorEncrypt(text, key) {
  const keyChars = key.split('');
  return btoa(text.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ keyChars[i % keyChars.length].charCodeAt(0))
  ).join(''));
}

function xorDecrypt(encoded, key) {
  try {
    const text = atob(encoded);
    const keyChars = key.split('');
    return text.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ keyChars[i % keyChars.length].charCodeAt(0))
    ).join('');
  } catch {
    return null;
  }
}

// Generate a key based on browser characteristics
function getStorageKey() {
  return navigator.userAgent.slice(0, 32) + window.location.hostname;
}

export function secureSetItem(key, value) {
  try {
    const data = JSON.stringify({
      value,
      timestamp: Date.now(),
      checksum: simpleHash(JSON.stringify(value)),
    });
    const encrypted = xorEncrypt(data, getStorageKey());
    localStorage.setItem(key, encrypted);
    return true;
  } catch {
    return false;
  }
}

export function secureGetItem(key) {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = xorDecrypt(encrypted, getStorageKey());
    if (!decrypted) return null;
    
    const data = JSON.parse(decrypted);
    
    // Verify integrity
    if (data.checksum !== simpleHash(JSON.stringify(data.value))) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.value;
  } catch {
    return null;
  }
}

export function secureRemoveItem(key) {
  localStorage.removeItem(key);
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
