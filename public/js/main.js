// public/js/main.js
// Global site functionality

// ── Header Scroll Effect ─────────────────────────────────────────
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Mobile Navigation ────────────────────────────────────────────
const hamburger = document.getElementById('nav-hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileClose = document.getElementById('mobile-close');
const mobileBackdrop = document.getElementById('mobile-backdrop');

function openMobileNav() {
  if (mobileNav) {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileNav() {
  if (mobileNav) {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
}

hamburger?.addEventListener('click', openMobileNav);
mobileClose?.addEventListener('click', closeMobileNav);
mobileBackdrop?.addEventListener('click', closeMobileNav);

// ── Active Nav Link ──────────────────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href && currentPath.includes(href) && href !== '/') {
    link.classList.add('active');
  } else if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
    link.classList.add('active');
  }
});

// ── Global Header Search ─────────────────────────────────────────
const navSearchInput = document.getElementById('nav-search-input');
navSearchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && navSearchInput.value.trim()) {
    window.location.href = `/search.html?q=${encodeURIComponent(navSearchInput.value.trim())}`;
  }
});

// ── Toast Notifications ──────────────────────────────────────────
const toastContainer = document.getElementById('toast-container') || createToastContainer();

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  div.className = 'toast-container';
  document.body.appendChild(div);
  return div;
}

export function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Intersection Observer (Scroll Animations) ─────────────────────
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('[data-animate]').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ── Counter Animation ─────────────────────────────────────────────
export function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('tr-TR');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('tr-TR');
  };
  requestAnimationFrame(step);
}

// ── Utility: Format Date ─────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── Utility: Status Label ─────────────────────────────────────────
export function statusLabel(status) {
  const map = {
    active: 'Aktif', inactive: 'Pasif',
    in_stock: 'Stokta', out_of_stock: 'Stok Yok',
  };
  return map[status] || status;
}

// ── Utility: Product Card HTML ────────────────────────────────────
export function renderProductCard(product) {
  const statusClass = `status-${product.status}`;
  const statusText = statusLabel(product.status);

  return `
    <div class="product-card" onclick="window.location.href='/product-detail.html?id=${product.id}'">
      <div class="product-card-image">
        ${product.image_url
          ? `<img src="${product.image_url}" alt="${product.name}" loading="lazy">`
          : `<div class="placeholder-img">⚙️<span>Fotoğraf yok</span></div>`
        }
        <span class="product-status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="product-card-body">
        <span class="product-category-tag">${product.category || 'Genel'}</span>
        <h3 class="product-card-title">${product.name}</h3>
        <div class="product-card-meta">
          ${product.shn_no ? `
            <div class="product-meta-row">
              <span class="meta-label">ŞHN No</span>
              <span class="meta-value">${product.shn_no}</span>
            </div>` : ''}
          ${product.oem_no ? `
            <div class="product-meta-row">
              <span class="meta-label">OEM No</span>
              <span class="meta-value">${product.oem_no}</span>
            </div>` : ''}
          ${product.brand ? `
            <div class="product-meta-row">
              <span class="meta-label">Araç</span>
              <span class="meta-value brand-model">${product.brand}${product.model ? ' ' + product.model : ''}</span>
            </div>` : ''}
        </div>
      </div>
      <div class="product-card-footer">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.location.href='/product-detail.html?id=${product.id}'">
          Detay Gör
        </button>
      </div>
    </div>
  `;
}

// ── Skeleton Cards ────────────────────────────────────────────────
export function renderSkeletonCards(count = 6) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div style="padding:16px">
        <div class="skeleton skeleton-line short" style="margin-bottom:8px"></div>
        <div class="skeleton skeleton-line medium" style="margin-bottom:6px"></div>
        <div class="skeleton skeleton-line" style="margin-bottom:6px"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>
  `).join('');
}

// ── WhatsApp Widget Toggle ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const wpFloat = document.getElementById('whatsapp-float');
  const wpPopup = document.getElementById('whatsapp-popup');
  const wpClose = document.getElementById('whatsapp-popup-close');

  if (wpFloat && wpPopup) {
    wpFloat.addEventListener('click', (e) => {
      e.stopPropagation();
      wpPopup.classList.toggle('open');
    });

    wpClose?.addEventListener('click', (e) => {
      e.stopPropagation();
      wpPopup.classList.remove('open');
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
      if (!wpPopup.contains(e.target) && e.target !== wpFloat) {
        wpPopup.classList.remove('open');
      }
    });
  }
});

