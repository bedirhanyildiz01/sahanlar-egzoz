// functions/api/upload/index.js
// POST /api/upload — Cloudflare R2'ye resim yükleme (auth gerekli)

import { verifyToken, getTokenFromRequest } from '../auth/verify.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function onRequestPost(context) {
  const { request, env } = context;

  // Auth kontrolü
  const token = getTokenFromRequest(request);
  const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
  const auth = await verifyToken(token, jwtSecret);
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401, headers: CORS });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return new Response(JSON.stringify({ error: 'Resim dosyası bulunamadı' }), {
        status: 400, headers: CORS,
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Sadece JPEG, PNG ve WebP formatları kabul edilir' }), {
        status: 400, headers: CORS,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'Dosya boyutu 5MB\'dan büyük olamaz' }), {
        status: 400, headers: CORS,
      });
    }

    // Benzersiz dosya adı oluştur
    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
    const filename = `products/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    await env.IMAGES.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // API proxy üzerinden URL oluştur
    const imageUrl = `/api/images/${encodeURIComponent(filename)}`;

    return new Response(JSON.stringify({
      success: true,
      url: imageUrl,
      filename,
    }), { status: 201, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Yükleme hatası: ' + err.message }), {
      status: 500, headers: CORS,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
