// functions/api/images/[key].js
// GET /api/images/:key — R2'den resim servis et (proxy)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestGet(context) {
  const { params, env } = context;
  const key = params.key;

  if (!key || !env.IMAGES) {
    return new Response('Not found', { status: 404, headers: CORS });
  }

  // key can be "products/xxxxx.jpg" so decode it
  const decodedKey = decodeURIComponent(key);

  try {
    const object = await env.IMAGES.get(decodedKey);

    if (!object) {
      // Try with "products/" prefix if not already included
      const altKey = decodedKey.startsWith('products/') ? decodedKey : `products/${decodedKey}`;
      const altObject = await env.IMAGES.get(altKey);

      if (!altObject) {
        return new Response('Image not found', { status: 404, headers: CORS });
      }

      return new Response(altObject.body, {
        headers: {
          ...CORS,
          'Content-Type': altObject.httpMetadata?.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new Response(object.body, {
      headers: {
        ...CORS,
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
