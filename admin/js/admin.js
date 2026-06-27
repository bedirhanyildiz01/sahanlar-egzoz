// admin/js/admin.js
// Shared admin utilities

import { auth } from './auth.js';

// ── Toast ───────────────────────────────────────────────────────────
const toastContainer = document.getElementById('toast-container') || (() => {
  const d = document.createElement('div');
  d.id = 'toast-container';
  d.className = 'toast-container';
  document.body.appendChild(d);
  return d;
})();

export function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.25s ease reverse';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ── Active Sidebar Link ─────────────────────────────────────────────
const path = window.location.pathname;
document.querySelectorAll('.sidebar-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href && path.includes(href.split('/').pop().split('.')[0])) {
    link.classList.add('active');
  }
});

// ── Topbar Username ─────────────────────────────────────────────────
const user = auth.getUser();
const usernameEl = document.getElementById('sidebar-username');
const avatarEl = document.getElementById('sidebar-avatar');
if (user && usernameEl) usernameEl.textContent = user.username || 'Admin';
if (user && avatarEl) avatarEl.textContent = (user.username || 'A')[0].toUpperCase();

// ── Logout ─────────────────────────────────────────────────────────
document.getElementById('logout-btn')?.addEventListener('click', () => {
  if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
    auth.logout();
  }
});

// ── Mobile Sidebar ─────────────────────────────────────────────────
const sidebarToggle = document.getElementById('sidebar-toggle');
const adminSidebar = document.querySelector('.admin-sidebar');
sidebarToggle?.addEventListener('click', () => {
  adminSidebar?.classList.toggle('open');
});

// ── Status Labels & Colors ─────────────────────────────────────────
export const statusConfig = {
  in_stock: { label: 'Stokta', class: 'status-in_stock', icon: '✓' },
  active: { label: 'Aktif', class: 'status-active', icon: '●' },
  out_of_stock: { label: 'Stok Yok', class: 'status-out_of_stock', icon: '✗' },
  inactive: { label: 'Pasif', class: 'status-inactive', icon: '◯' },
};

export function renderStatusBadge(status) {
  const cfg = statusConfig[status] || { label: status, class: 'status-inactive', icon: '●' };
  return `<span class="status-badge ${cfg.class}">${cfg.icon} ${cfg.label}</span>`;
}

// ── Format Date ─────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

// ── Confirm Modal ───────────────────────────────────────────────────
export function showConfirmModal({ title, message, onConfirm, confirmText = 'Onayla', cancelText = 'İptal' }) {
  const overlay = document.getElementById('confirm-modal');
  if (!overlay) return;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-text').textContent = confirmText;
  overlay.classList.add('open');

  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  function close() {
    overlay.classList.remove('open');
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  }

  document.getElementById('confirm-btn').addEventListener('click', () => { close(); onConfirm(); });
  document.getElementById('cancel-btn').addEventListener('click', close);
}

export default { showToast, renderStatusBadge, formatDate, showConfirmModal };
