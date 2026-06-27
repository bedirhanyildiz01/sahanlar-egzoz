// functions/api/auth/verify.js
// GET /api/auth/verify  — Token doğrulama

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return new Response(JSON.stringify({ valid: false, error: 'Token bulunamadı' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const jwtSecret = env.JWT_SECRET || 'sahanlar-egzoz-secret-key-2024';
    const payload = await verifyToken(token, jwtSecret);

    if (!payload) {
      return new Response(JSON.stringify({ valid: false, error: 'Geçersiz token' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ valid: true, user: { username: payload.sub } }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

async function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(data));
    if (!valid) return null;

    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token süresi dolmuş
    }

    return payload;
  } catch {
    return null;
  }
}

export { verifyToken, getTokenFromRequest };
