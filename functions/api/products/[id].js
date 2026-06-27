// functions/api/products/[id].js
// GET    /api/products/:id  — Ürün detayı
// PUT    /api/products/:id  — Ürün güncelle (auth gerekli)
// DELETE /api/products/:id  — Ürün sil (auth gerekli)

import { verifyToken, getTokenFromRequest } from '../auth/verify.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { params, env } = context;
  const { id } = params;

  try {
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();

    if (!product) {
      return new Response(JSON.stringify({ error: 'Ürün bulunamadı' }), { status: 404, headers: CORS });
    }

    // İlgili ürünler (aynı kategori)
    const related = await env.DB.prepare(
      'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4'
    ).bind(product.category, id).all();

    return new Response(JSON.stringify({ product, related: related.results }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestPut(context) {
  const { request, params, env } = context;
  const { id } = params;

  const token = getTokenFromRequest(request);
  const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
  const auth = await verifyToken(token, jwtSecret);
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });
  }

  try {
    const body = await request.json();
    const { name, description, shn_no, oem_no, brand, model, category, status, image_url } = body;

    const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(id).first();
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Ürün bulunamadı' }), { status: 404, headers: CORS });
    }

    await env.DB.prepare(
      `UPDATE products SET
        name = ?, description = ?, shn_no = ?, oem_no = ?,
        brand = ?, model = ?, category = ?, status = ?,
        image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(
      name, description, shn_no, oem_no, brand, model, category, status, image_url, id
    ).run();

    const updated = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify({ success: true, product: updated }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestDelete(context) {
  const { request, params, env } = context;
  const { id } = params;

  const token = getTokenFromRequest(request);
  const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
  const auth = await verifyToken(token, jwtSecret);
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });
  }

  try {
    const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    if (!product) {
      return new Response(JSON.stringify({ error: 'Ürün bulunamadı' }), { status: 404, headers: CORS });
    }

    // R2'den resmi sil (varsa)
    if (product.image_url && env.IMAGES) {
      const key = product.image_url.split('/').pop();
      try { await env.IMAGES.delete(key); } catch {}
    }

    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true, message: 'Ürün silindi' }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
