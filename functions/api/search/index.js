// functions/api/search/index.js
// GET /api/search?q=&oem=&shn=&brand=&model=&category=

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;

  const q = params.get('q') || '';
  const oem = params.get('oem') || '';
  const shn = params.get('shn') || '';
  const brand = params.get('brand') || '';
  const model = params.get('model') || '';
  const category = params.get('category') || '';
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '12');
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE 1=1';
    const args = [];

    if (q) {
      where += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(model) LIKE ?)';
      const qLow = `%${q.toLowerCase()}%`;
      args.push(qLow, qLow, qLow, qLow);
    }
    if (oem) {
      where += ' AND LOWER(oem_no) LIKE ?';
      args.push(`%${oem.toLowerCase()}%`);
    }
    if (shn) {
      where += ' AND LOWER(shn_no) LIKE ?';
      args.push(`%${shn.toLowerCase()}%`);
    }
    if (brand) {
      where += ' AND LOWER(brand) = ?';
      args.push(brand.toLowerCase());
    }
    if (model) {
      where += ' AND LOWER(model) LIKE ?';
      args.push(`%${model.toLowerCase()}%`);
    }
    if (category) {
      where += ' AND category = ?';
      args.push(category);
    }

    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM products ${where}`
    ).bind(...args).first();

    const products = await env.DB.prepare(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...args, limit, offset).all();

    return new Response(JSON.stringify({
      products: products.results,
      query: { q, oem, shn, brand, model, category },
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

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
