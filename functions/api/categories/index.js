// functions/api/categories/index.js
// GET /api/categories — Kategori + marka listesi

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const categoriesResult = await env.DB.prepare(
      `SELECT category, COUNT(*) as count FROM products WHERE status != 'inactive' GROUP BY category ORDER BY count DESC`
    ).all();

    const brandsResult = await env.DB.prepare(
      `SELECT brand, COUNT(*) as count FROM products WHERE brand != '' AND status != 'inactive' GROUP BY brand ORDER BY count DESC`
    ).all();

    const modelsResult = await env.DB.prepare(
      `SELECT brand, model, COUNT(*) as count FROM products WHERE model != '' AND status != 'inactive' GROUP BY brand, model ORDER BY brand, model`
    ).all();

    const statsResult = await env.DB.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        COUNT(DISTINCT brand) as brands,
        COUNT(DISTINCT category) as categories
       FROM products WHERE status != 'inactive'`
    ).first();

    return new Response(JSON.stringify({
      categories: categoriesResult.results,
      brands: brandsResult.results,
      models: modelsResult.results,
      stats: statsResult,
    }), { headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
