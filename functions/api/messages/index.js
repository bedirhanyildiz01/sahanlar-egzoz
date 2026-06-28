// functions/api/messages/index.js
// GET  /api/messages — Mesajları listele (auth gerekli)
// POST /api/messages — Yeni mesaj ekle (halka açık, iletişim formu)

import { verifyToken, getTokenFromRequest } from '../auth/verify.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// POST — Yeni mesaj kaydet (iletişim formundan)
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { name, email, phone, subject, oem_no, message } = body;

    if (!name || !message) {
      return new Response(JSON.stringify({ error: 'Ad ve mesaj alanları zorunludur' }), {
        status: 400, headers: CORS,
      });
    }

    const result = await env.DB.prepare(
      `INSERT INTO messages (name, email, phone, subject, oem_no, message) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      name,
      email || null,
      phone || null,
      subject || null,
      oem_no || null,
      message
    ).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'Mesajınız başarıyla gönderildi',
      id: result.meta?.last_row_id,
    }), { status: 201, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: CORS,
    });
  }
}

// GET — Mesajları listele (sadece admin)
export async function onRequestGet(context) {
  const { request, env } = context;

  const token = getTokenFromRequest(request);
  const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
  const auth = await verifyToken(token, jwtSecret);
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), {
      status: 401, headers: CORS,
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 50);
    const offset = (page - 1) * limit;
    const filter = url.searchParams.get('filter'); // 'unread', 'read', or null for all

    let whereClause = '';
    const bindings = [];

    if (filter === 'unread') {
      whereClause = 'WHERE is_read = 0';
    } else if (filter === 'read') {
      whereClause = 'WHERE is_read = 1';
    }

    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM messages ${whereClause}`
    ).bind(...bindings).first();

    const total = countResult?.total || 0;

    const messages = await env.DB.prepare(
      `SELECT * FROM messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();

    // Okunmamış mesaj sayısı
    const unreadResult = await env.DB.prepare(
      'SELECT COUNT(*) as unread FROM messages WHERE is_read = 0'
    ).first();

    return new Response(JSON.stringify({
      messages: messages.results,
      unread: unreadResult?.unread || 0,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: CORS,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
