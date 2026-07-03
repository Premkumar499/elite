import { supabase } from '../lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function adminHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "X-Admin-Secret": getToken(),
    ...extra,
  };
}

// ── Public — fetch directly from Supabase (no Flask needed) ──────────────────
export async function fetchProducts({ category, minPrice, maxPrice, search } = {}) {
  let query = supabase.from('products').select('*');
  if (category) query = query.eq('category', category);
  if (minPrice !== undefined && minPrice > 0) query = query.gte('price', minPrice);
  if (maxPrice !== undefined && maxPrice < 20000) query = query.lte('price', maxPrice);
  if (search) query = query.ilike('name', `%${search}%`);
  query = query.order('id');
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('products').select('category');
  if (error) throw new Error(error.message);
  return [...new Set(data.map(r => r.category))].sort();
}

// ── Admin — still goes through Flask ─────────────────────────────────────────
export function adminLogin(password) {
  return request("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
}

export function fetchStats() {
  return request("/api/admin/stats", { headers: adminHeaders() });
}

export function createProduct(data) {
  return request("/api/products/create", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export function updateProduct(id, data) {
  return request(`/api/products/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id) {
  return request(`/api/products/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}
