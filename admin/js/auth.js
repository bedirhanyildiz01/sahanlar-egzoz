// admin/js/auth.js
// Admin panel kimlik doğrulama yönetimi

const TOKEN_KEY = 'sahanlar_admin_token';
const USER_KEY = 'sahanlar_admin_user';

export const auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  },

  async requireAuth() {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      this.clearSession();
      window.location.href = '/admin/index.html';
      return false;
    }
    return true;
  },

  logout() {
    this.clearSession();
    window.location.href = '/admin/index.html';
  },
};

export default auth;
