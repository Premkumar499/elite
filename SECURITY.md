# Security Documentation - Elite Studio

## 🔒 Security Features Implemented

### 1. **DevTools Protection**
- Right-click context menu disabled
- F12, Ctrl+Shift+I/J/C disabled
- View source (Ctrl+U) disabled
- DevTools detection with automatic redirect
- **Note**: Determined users with technical skills can still bypass this. For true security, never expose sensitive keys in frontend code.

### 2. **Authentication Security**
- Admin login with brute-force protection (5 attempts max, 15-minute lockout)
- Session-based tokens with 1-hour expiry
- Timing-safe password comparison to prevent timing attacks
- Admin password moved to environment variable

### 3. **Input Validation & XSS Protection**
- All user inputs sanitized (Training enrollment, Checkout forms)
- HTML tag stripping on text inputs
- Email and phone number validation
- XSS protection utility (`src/utils/sanitize.js`)

### 4. **Code Security**
- All `console.log` statements removed in production builds
- Source maps disabled in production
- Obfuscated chunk names
- Content Security Policy (CSP) headers

### 5. **Database Security**
- User-scoped queries (`getCart`, `getUserOrders` filter by `user_id`)
- Service role key isolated to `src/lib/supabaseAdmin.js` (admin only)
- Admin functions in separate `src/services/adminDb.js`

### 6. **HTTP Security Headers**
- `X-Frame-Options: DENY` - prevents clickjacking
- `X-Content-Type-Options: nosniff` - prevents MIME sniffing
- `Content-Security-Policy` - restricts resource loading
- `Referrer-Policy: strict-origin-when-cross-origin`

### 7. **Advanced Session Security**
- CSRF token generation and validation (`src/utils/csrf.js`)
- Session fingerprinting to detect hijacking (`src/utils/sessionMonitor.js`)
- Automatic logout after 30 minutes of inactivity
- Secure storage wrapper with obfuscation (`src/utils/secureStorage.js`)
- Browser fingerprint validation on session resume

### 8. **API Request Security**
- Rate limiting utility for client-side throttling
- Request origin validation
- Automatic CSRF token injection in forms

---

## ⚠️ **CRITICAL: Known Limitations**

### **The Service Role Key Problem**
**STATUS: UNFIXABLE WITHOUT BACKEND**

Any environment variable prefixed with `VITE_` is bundled into the JavaScript that ships to browsers. This means:

- ✅ `VITE_SUPABASE_ANON_KEY` is safe to expose (public by design)
- ❌ `VITE_SUPABASE_SERVICE_KEY` is **EXPOSED** in the browser bundle

**The service role key bypasses all Row Level Security (RLS)**. A skilled attacker who:
1. Bypasses DevTools protection
2. Inspects the JavaScript bundle
3. Extracts the service role key

...can then directly access your Supabase database with full privileges.

---

## 🛡️ **Production Security Checklist**

### **Before Going Live:**

1. **Rotate All Supabase Keys**
   - Go to Supabase Dashboard → Settings → API
   - Regenerate the service role key
   - Update `.env` with new keys
   - **Never commit `.env` to git**

2. **Enable Row Level Security (RLS)**
   ```sql
   -- Run in Supabase SQL Editor
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
   ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

   -- Allow users to only see their own data
   CREATE POLICY "Users see own cart" ON cart
     FOR ALL USING (auth.uid() = user_id);

   CREATE POLICY "Users see own orders" ON orders
     FOR ALL USING (auth.uid() = user_id);

   CREATE POLICY "Users see own favourites" ON favourites
     FOR ALL USING (auth.uid() = user_id);

   CREATE POLICY "Users see own profile" ON profiles
     FOR ALL USING (auth.uid() = id);

   -- Service role has full access (for admin operations)
   CREATE POLICY "Service role full access orders" ON orders
     FOR ALL TO service_role USING (true) WITH CHECK (true);

   CREATE POLICY "Service role full access order_items" ON order_items
     FOR ALL TO service_role USING (true) WITH CHECK (true);
   ```

3. **Create the Admin Delete Function**
   ```sql
   -- Run in Supabase SQL Editor
   CREATE OR REPLACE FUNCTION admin_delete_order(p_order_id bigint)
   RETURNS void
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     DELETE FROM order_items WHERE order_id = p_order_id;
     DELETE FROM orders WHERE id = p_order_id;
   END;
   $$;
   ```

4. **Enable Realtime**
   - Go to Table Editor → `orders` → Enable Realtime toggle
   - Do the same for `enrollments` table

5. **Update Environment Variables**
   ```bash
   # Copy example and fill real values
   cp .env.example .env
   
   # Set a STRONG admin password (not the default)
   VITE_ADMIN_PASSWORD=your-very-strong-password-here-123!@#
   ```

6. **Build for Production**
   ```bash
   npm run build
   # All console.* calls will be removed automatically
   # Source maps disabled
   # Code minified and obfuscated
   ```

---

## 🚨 **For True Production Security**

This is a **frontend-only** app, which has inherent security limitations. For production:

### **Option 1: Backend API (Recommended)**
Move admin operations to a Node.js/Python backend:
- Admin login returns a JWT (not stored in localStorage)
- Service role key lives on the server only
- Backend validates all admin requests
- Backend talks to Supabase with service role key
- Frontend uses anon key only

### **Option 2: Supabase Edge Functions**
- Create Supabase Edge Functions for admin operations
- Functions use service role internally
- Frontend calls functions with authenticated requests
- Service key never exposed to client

### **Option 3: Supabase Auth Roles**
- Use Supabase Auth to manage admin users
- Set custom claims (`role: 'admin'`)
- Create RLS policies that check `auth.jwt() ->> 'role' = 'admin'`
- No service role key needed in frontend

---

## 📋 **Security Maintenance**

### Regular Tasks:
- [ ] Rotate Supabase keys every 90 days
- [ ] Update admin password monthly
- [ ] Review RLS policies quarterly
- [ ] Monitor Supabase logs for suspicious activity
- [ ] Keep dependencies updated (`npm audit`, `npm update`)
- [ ] Review session security logs weekly
- [ ] Test CSRF protection quarterly
- [ ] Audit XSS sanitization coverage monthly

### If Compromised:
1. **Immediately** regenerate all Supabase keys
2. Check Supabase logs for unauthorized access
3. Reset admin password
4. Review and update RLS policies
5. Deploy new build with rotated keys

---

## 📞 Contact

For security issues, contact: **[your-security-email@example.com]**

**Never report security vulnerabilities publicly** (GitHub Issues, etc.)

---

**Remember**: The DevTools protection is a deterrent, not true security. Treat all frontend code as public.
