import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS, used only in admin pages
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY
);
