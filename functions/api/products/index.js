// functions/api/products/index.js
// GET  /api/products  — Ürün listesi (filtre + sayfalama)
// POST /api/products  — Yeni ürün ekle (auth gerekli)

import { verifyToken, getTokenFromRequest } from '../auth/verify.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '12');
  const offset = (page - 1) * limit;
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const model = params.get('model') || '';
  const status = params.get('status') || '';
  const sort = params.get('sort') || 'created_at_desc';

  try {
    let where = 'WHERE 1=1';
    const args = [];

    if (category) { where += ' AND category = ?'; args.push(category); }
    if (brand) { where += ' AND brand = ?'; args.push(brand); }
    if (model) { where += ' AND LOWER(model) LIKE ?'; args.push(`%${model.toLowerCase()}%`); }
    if (status) { where += ' AND status = ?'; args.push(status); }

    const orderMap = {
      'created_at_desc': 'created_at DESC',
      'created_at_asc': 'created_at ASC',
      'name_asc': 'name ASC',
      'name_desc': 'name DESC',
    };
    const orderBy = orderMap[sort] || 'created_at DESC';

    const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM products ${where}`)
      .bind(...args).first();

    const products = await env.DB.prepare(
      `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    ).bind(...args, limit, offset).all();

    return new Response(JSON.stringify({
      products: products.results,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit),
      },
    }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Auth kontrolü
  const token = getTokenFromRequest(request);
  const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
  const payload = await verifyToken(token, jwtSecret);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });
  }

  try {
    const body = await request.json();
    const { name, description, shn_no, oem_no, brand, model, category, status, image_url } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Ürün adı zorunludur' }), { status: 400, headers: CORS });
    }

    const result = await env.DB.prepare(
      `INSERT INTO products (name, description, shn_no, oem_no, brand, model, category, status, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      name,
      description || '',
      shn_no || '',
      oem_no || '',
      brand || '',
      model || '',
      category || 'Genel',
      status || 'active',
      image_url || null
    ).run();

    const newProduct = await env.DB.prepare('SELECT * FROM products WHERE id = ?')
      .bind(result.meta.last_row_id).first();

    return new Response(JSON.stringify({ success: true, product: newProduct }), {
      status: 201,
      headers: CORS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
