/**
 * Admin-only Supabase helpers — uses service role client.
 * Only imported by pages under src/pages/admin/
 */
import { supabaseAdmin } from '../lib/supabaseAdmin';

export async function adminGetAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(id, name, price, quantity, image, product_id)')
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

export async function adminDeleteOrder(orderId) {
  // Delete child rows first to avoid FK constraint errors
  await supabaseAdmin
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  const { data, error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', orderId)
    .select();

  if (error) throw new Error(error.message);

  // If no rows deleted, RLS is blocking — try SECURITY DEFINER RPC
  if (!data || data.length === 0) {
    const { error: rpcErr } = await supabaseAdmin.rpc('admin_delete_order', { p_order_id: orderId });
    if (rpcErr) throw new Error('Delete blocked by RLS. Create the admin_delete_order function in Supabase SQL Editor.');
  }
}

export async function adminGetAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
