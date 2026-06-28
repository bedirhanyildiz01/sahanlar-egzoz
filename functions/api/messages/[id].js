// functions/api/messages/[id].js
// GET    /api/messages/:id — Mesaj detayı (auth gerekli)
// PUT    /api/messages/:id — Okundu işaretle (auth gerekli)
// DELETE /api/messages/:id — Mesaj sil (auth gerekli)

import { verifyToken, getTokenFromRequest } from '../auth/verify.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function requireAuth(request, env) {
  const token = getTokenFromRequest(request);
  const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
  return verifyToken(token, jwtSecret);
}

// GET — Mesaj detayı
export async function onRequestGet(context) {
  const { request, params, env } = context;
  const auth = await requireAuth(request, env);
  if (!auth) return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });

  try {
    const msg = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(params.id).first();
    if (!msg) return new Response(JSON.stringify({ error: 'Mesaj bulunamadı' }), { status: 404, headers: CORS });

    // Otomatik olarak okundu işaretle
    if (!msg.is_read) {
      await env.DB.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').bind(params.id).run();
      msg.is_read = 1;
    }

    return new Response(JSON.stringify({ message: msg }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

// PUT — Okundu/okunmadı toggle
export async function onRequestPut(context) {
  const { request, params, env } = context;
  const auth = await requireAuth(request, env);
  if (!auth) return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });

  try {
    const body = await request.json();
    const isRead = body.is_read ? 1 : 0;

    await env.DB.prepare('UPDATE messages SET is_read = ? WHERE id = ?').bind(isRead, params.id).run();

    return new Response(JSON.stringify({ success: true }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

// DELETE — Mesaj sil
export async function onRequestDelete(context) {
  const { request, params, env } = context;
  const auth = await requireAuth(request, env);
  if (!auth) return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });

  try {
    const msg = await env.DB.prepare('SELECT id FROM messages WHERE id = ?').bind(params.id).first();
    if (!msg) return new Response(JSON.stringify({ error: 'Mesaj bulunamadı' }), { status: 404, headers: CORS });

    await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(params.id).run();

    return new Response(JSON.stringify({ success: true, message: 'Mesaj silindi' }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
