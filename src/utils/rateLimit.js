/**
 * Simple client-side rate limiting
 * Prevents rapid repeated actions
 */

const rateLimitStore = new Map();

export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count++;
  rateLimitStore.set(key, record);

  if (record.count > maxAttempts) {
    const remainingMs = record.resetTime - now;
    return {
      allowed: false,
      remainingMs,
      remainingMinutes: Math.ceil(remainingMs / 60000),
    };
  }

  return { allowed: true };
}

export function resetRateLimit(key) {
  rateLimitStore.delete(key);
}
