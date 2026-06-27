// public/js/api.js
// Cloudflare Functions API istemcisi

const API_BASE = '/api';

export const api = {
  // ── Ürünler ──────────────────────────────────────────────────
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Ürünler yüklenemedi');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Ürün bulunamadı');
    return res.json();
  },

  async createProduct(data, token) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ürün eklenemedi');
    }
    return res.json();
  },

  async updateProduct(id, data, token) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ürün güncellenemedi');
    }
    return res.json();
  },

  async deleteProduct(id, token) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ürün silinemedi');
    }
    return res.json();
  },

  // ── Arama ─────────────────────────────────────────────────────
  async search(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/search?${query}`);
    if (!res.ok) throw new Error('Arama başarısız');
    return res.json();
  },

  // ── Kategoriler ───────────────────────────────────────────────
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Kategoriler yüklenemedi');
    return res.json();
  },

  // ── Resim Yükleme ─────────────────────────────────────────────
  async uploadImage(file, token) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Resim yüklenemedi');
    }
    return res.json();
  },

  // ── Auth ──────────────────────────────────────────────────────
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Giriş başarısız');
    }
    return res.json();
  },

  async verifyToken(token) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
};

// Durum etiket çevirisi
export const statusLabels = {
  active: 'Aktif',
  inactive: 'Pasif',
  in_stock: 'Stokta',
  out_of_stock: 'Stok Yok',
};

// Kategori listesi
export const categoryList = [
  { id: 'Binek', name: 'Binek Araç', icon: '🚗' },
  { id: 'Ticari', name: 'Ticari Araç', icon: '🚐' },
  { id: 'Kamyon', name: 'Kamyon', icon: '🚛' },
  { id: 'Motorsiklet', name: 'Motorsiklet', icon: '🏍️' },
  { id: 'Spor', name: 'Spor Egzoz', icon: '🏎️' },
  { id: 'Genel', name: 'Genel', icon: '⚙️' },
];
