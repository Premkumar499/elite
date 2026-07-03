/**
 * Supabase DB helpers — cart, favourites, orders
 */
import { supabase } from '../lib/supabase';

// ── Auth helper ──────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// ── Cart ─────────────────────────────────────────────────────────────────────
export async function getCart() {
  const { data, error } = await supabase
    .from('cart')
    .select('*, products(id, name, price, image, stock)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addToCart(productId, quantity = 1) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not logged in');
  const { error } = await supabase.from('cart').upsert(
    { user_id: user.id, product_id: productId, quantity },
    { onConflict: 'user_id,product_id', ignoreDuplicates: false }
  );
  if (error) throw error;
}

export async function updateCartQty(productId, quantity) {
  const user = await getCurrentUser();
  if (!user) return;
  if (quantity < 1) return removeFromCart(productId);
  await supabase.from('cart').update({ quantity }).eq('user_id', user.id).eq('product_id', productId);
}

export async function removeFromCart(productId) {
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from('cart').delete().eq('user_id', user.id).eq('product_id', productId);
}

export async function clearCart() {
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from('cart').delete().eq('user_id', user.id);
}

// ── Favourites ────────────────────────────────────────────────────────────────
export async function getFavourites() {
  const { data, error } = await supabase
    .from('favourites')
    .select('*, products(id, name, price, image, category)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addFavourite(productId) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not logged in');
  const { error } = await supabase.from('favourites').upsert(
    { user_id: user.id, product_id: productId },
    { onConflict: 'user_id,product_id', ignoreDuplicates: true }
  );
  if (error) throw error;
}

export async function removeFavourite(productId) {
  const user = await getCurrentUser();
  if (!user) return;
  await supabase.from('favourites').delete().eq('user_id', user.id).eq('product_id', productId);
}

export async function isFavourite(productId) {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data } = await supabase
    .from('favourites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();
  return !!data;
}

// ── Orders ────────────────────────────────────────────────────────────────────
export async function placeOrder({ phone, address, notes, cartItems }) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const total = cartItems.reduce((sum, i) => sum + i.products.price * i.quantity, 0);

  // Get profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      user_email: user.email,
      user_name: profile?.full_name || '',
      phone,
      address,
      notes,
      total_amount: total,
      status: 'pending',
    })
    .select()
    .single();
  if (orderErr) throw orderErr;

  // Create order items
  const items = cartItems.map(i => ({
    order_id: order.id,
    product_id: i.product_id,
    name: i.products.name,
    price: i.products.price,
    quantity: i.quantity,
    image: i.products.image,
  }));
  const { error: itemsErr } = await supabase.from('order_items').insert(items);
  if (itemsErr) throw itemsErr;

  // Clear cart after order
  await clearCart();
  return order;
}

export async function getUserOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(id, name, price, quantity, image, product_id)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function adminGetAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(id, name, price, quantity, image)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminUpdateOrderStatus(orderId, status) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}

export async function adminGetAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
