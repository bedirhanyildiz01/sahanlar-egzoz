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

// ── Global Live Predictive Search (Google / Spotlight Style) ─────
export function setupLiveSearch(inputEl) {
  if (!inputEl) return;
  const parent = inputEl.parentElement;
  if (!parent) return;

  // Create or select dropdown container
  let dropdown = parent.querySelector('.live-search-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'live-search-dropdown';
    parent.appendChild(dropdown);
  }

  let debounceTimer = null;
  let activeIndex = -1;
  let currentItems = [];

  function highlightMatch(text, query) {
    if (!query || !text) return text || '';
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return String(text).replace(regex, '<mark>$1</mark>');
  }

  async function performSearch() {
    const q = inputEl.value.trim();
    if (q.length < 2) {
      dropdown.classList.remove('is-open');
      dropdown.innerHTML = '';
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
      if (!res.ok) return;
      const data = await res.json();
      const products = data.products || [];
      const total = data.pagination?.total || products.length;

      if (products.length === 0) {
        dropdown.innerHTML = `
          <div class="live-search-header">
            <span>Arama Sonucu</span>
            <span>0 Bulundu</span>
          </div>
          <div class="live-search-empty">
            <p><strong>"${q}"</strong> ile eşleşen parça bulunamadı.</p>
            <a href="https://wa.me/905444394560?text=${encodeURIComponent('Merhaba, ' + q + ' parçasını arıyorum.')}" target="_blank">
              💬 WhatsApp'tan Parça Sorun
            </a>
          </div>
        `;
      } else {
        dropdown.innerHTML = `
          <div class="live-search-header">
            <span>Önerilen Parçalar</span>
            <span>${total} Eşleşme</span>
          </div>
          <div class="live-search-results">
            ${products.map((p, idx) => `
              <a href="/product-detail.html?id=${p.id}" class="live-search-item" data-index="${idx}">
                ${p.image_url 
                  ? `<img src="${p.image_url}" alt="${p.name}" class="live-search-thumb" loading="lazy">`
                  : `<div class="live-search-thumb-placeholder">🔩</div>`
                }
                <div class="live-search-info">
                  <div class="live-search-title">${highlightMatch(p.name, q)}</div>
                  <div class="live-search-meta">
                    <span class="live-search-badge">${p.shn_no || p.brand || 'ŞHN'}</span>
                    ${p.oem_no ? `<span>OEM: ${highlightMatch(p.oem_no, q)}</span>` : ''}
                    <span class="live-search-category">• ${p.category || 'Egzoz'}</span>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
          <div class="live-search-footer">
            <span>Tüm ${total} sonucu gör</span>
            <span>Enter ↵</span>
          </div>
        `;

        const footer = dropdown.querySelector('.live-search-footer');
        footer?.addEventListener('click', () => {
          window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
        });
      }

      dropdown.classList.add('is-open');
      activeIndex = -1;
      currentItems = dropdown.querySelectorAll('.live-search-item');
    } catch (err) {
      console.error('Live search error:', err);
    }
  }

  inputEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 160);
  });

  inputEl.addEventListener('focus', () => {
    if (inputEl.value.trim().length >= 2) {
      performSearch();
    }
  });

  inputEl.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('is-open')) {
      if (e.key === 'Enter' && inputEl.value.trim()) {
        window.location.href = `/search.html?q=${encodeURIComponent(inputEl.value.trim())}`;
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % (currentItems.length || 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + currentItems.length) % (currentItems.length || 1);
      updateSelection();
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentItems[activeIndex]) {
        e.preventDefault();
        currentItems[activeIndex].click();
      } else if (inputEl.value.trim()) {
        window.location.href = `/search.html?q=${encodeURIComponent(inputEl.value.trim())}`;
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('is-open');
    }
  });

  function updateSelection() {
    currentItems.forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === activeIndex);
    });
    if (currentItems[activeIndex]) {
      currentItems[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  document.addEventListener('click', (e) => {
    if (!parent.contains(e.target)) {
      dropdown.classList.remove('is-open');
    }
  });
}

// Initialize live search for header and hero inputs
function initGlobalLiveSearch() {
  const navSearchInput = document.getElementById('nav-search-input');
  if (navSearchInput) setupLiveSearch(navSearchInput);

  const heroSearchInput = document.getElementById('hero-search-input');
  if (heroSearchInput) setupLiveSearch(heroSearchInput);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalLiveSearch);
} else {
  initGlobalLiveSearch();
}

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

// ── Intersection Observer (Scroll Animations & Reveal) ────────────
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      entry.target.classList.add('visible');
      entry.target.classList.add('is-visible');

      // Auto-trigger counters if present inside entry
      entry.target.querySelectorAll?.('.num[data-target]')?.forEach(numEl => {
        triggerCounter(numEl);
      });
      if (entry.target.classList.contains('num') && entry.target.dataset.target) {
        triggerCounter(entry.target);
      }

      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

function triggerCounter(numEl) {
  if (numEl.dataset.counted) return;
  numEl.dataset.counted = 'true';
  const target = parseInt(numEl.dataset.target, 10) || 0;
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Smooth easeOutExpo (Emil Kowalski / Linear curve)
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    numEl.textContent = Math.floor(eased * target).toLocaleString('tr-TR') + '+';
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      numEl.textContent = target.toLocaleString('tr-TR') + '+';
    }
  };
  requestAnimationFrame(step);
}

document.querySelectorAll('[data-animate], .reveal-on-scroll, .stats-banner, .about-grid, .contact-action-cards, .value-pillars-grid').forEach(el => {
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

  // ── Anatomy Spotlight Interaction (Emil Kowalski Style) ──
  const anatomyItems = document.querySelectorAll('.anatomy-item');
  const exhaustImg = document.querySelector('.anatomy-exhaust-img');

  anatomyItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (exhaustImg) {
        exhaustImg.style.transition = 'transform 0.4s var(--ease-spring), filter 0.4s ease';
        exhaustImg.style.transform = 'scale(1.04)';
        exhaustImg.style.filter = 'drop-shadow(0 15px 25px rgba(211, 47, 47, 0.25))';
      }
    });

    item.addEventListener('mouseleave', () => {
      if (exhaustImg) {
        exhaustImg.style.transform = 'scale(1)';
        exhaustImg.style.filter = 'none';
      }
    });
  });

  // ── Contact Form Micro-Interactions ──
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Gönder';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Gönderiliyor...</span>';
      }

      const formData = {
        name: document.getElementById('contact-name')?.value || '',
        email: document.getElementById('contact-email')?.value || '',
        phone: document.getElementById('contact-phone')?.value || '',
        subject: document.getElementById('contact-subject')?.value || '',
        oem_no: document.getElementById('contact-oem')?.value || '',
        message: document.getElementById('contact-message')?.value || '',
      };

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          showToast('Mesajınız başarıyla iletildi! En kısa sürede dönüş yapacağız.', 'success');
          contactForm.reset();
        } else {
          showToast('Mesaj gönderilirken bir hata oluştu. Lütfen telefon veya WhatsApp ile ulaşın.', 'error');
        }
      } catch (err) {
        showToast('İletişim hatası. WhatsApp üzerinden bize direkt yazabilirsiniz.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // ── Vehicle & Parts Finder Console ──
  const finderBtn = document.getElementById('finder-submit-btn');
  finderBtn?.addEventListener('click', () => {
    const brand = document.getElementById('finder-brand')?.value || '';
    const category = document.getElementById('finder-category')?.value || '';
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (category) params.set('category', category);
    window.location.href = `/products.html?${params.toString()}`;
  });
});



