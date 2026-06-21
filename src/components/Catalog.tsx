'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Car,
  ChevronRight,
  Filter,
  Tag,
  Disc,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number | null;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  shnCode: string;
  oemCode: string;
  category: string;
  status: string;
  imageUrl: string | null;
  price: number | null;
  createdAt: string;
  compatibilities: Vehicle[];
}

interface CatalogProps {
  initialProducts: Product[];
  initialVehicles: Vehicle[];
}

const CATEGORIES = ['Susturucu', 'Katalizör', 'Manifold', 'DPF', 'Spiral', 'Borular', 'Diğer'];

export default function Catalog({ initialProducts, initialVehicles }: CatalogProps) {
  const [products] = useState<Product[]>(initialProducts);
  const [vehicles] = useState<Vehicle[]>(initialVehicles);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');

  // Dynamic Brands list extracted from vehicles
  const brands = useMemo(() => {
    const uniqueBrands = new Set(vehicles.map((v) => v.brand));
    return Array.from(uniqueBrands).sort();
  }, [vehicles]);

  // Dynamic Models list filtered by selected brand
  const filteredModels = useMemo(() => {
    if (selectedBrand === 'all') {
      // return unique models across all brands
      const uniqueModels = new Set(vehicles.map((v) => v.model));
      return Array.from(uniqueModels).sort();
    }
    const brandModels = vehicles
      .filter((v) => v.brand.toLowerCase() === selectedBrand.toLowerCase())
      .map((v) => v.model);
    return Array.from(new Set(brandModels)).sort();
  }, [selectedBrand, vehicles]);

  // Live filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search matches name, OEM code, SHN code
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.shnCode.toLowerCase().includes(query) ||
        product.oemCode.toLowerCase().includes(query);

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      // Brand / Model filters
      let matchesBrand = selectedBrand === 'all';
      let matchesModel = selectedModel === 'all';

      if (selectedBrand !== 'all' || selectedModel !== 'all') {
        const hasCompatibleCar = product.compatibilities.some((car) => {
          const brandMatch =
            selectedBrand === 'all' ||
            car.brand.toLowerCase() === selectedBrand.toLowerCase();
          const modelMatch =
            selectedModel === 'all' ||
            car.model.toLowerCase() === selectedModel.toLowerCase();
          return brandMatch && modelMatch;
        });
        if (hasCompatibleCar) {
          matchesBrand = true;
          matchesModel = true;
        } else {
          // If product lists compatibility but it doesn't match selected filters
          if (selectedBrand !== 'all') matchesBrand = false;
          if (selectedModel !== 'all') matchesModel = false;
        }
      }

      // Hide passive products from public catalog
      const isActive = product.status !== 'Pasif';

      return matchesSearch && matchesCategory && matchesBrand && matchesModel && isActive;
    });
  }, [products, search, selectedCategory, selectedBrand, selectedModel]);

  // Clear all filters
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedModel('all');
  };

  return (
    <div style={styles.catalogLayout}>
      {/* Upper Smart Search Bar */}
      <section style={styles.searchHero}>
        <div style={styles.searchTitleWrapper}>
          <h2 style={styles.searchHeroTitle}>GELİŞMİŞ PARÇA ARAMA</h2>
          <p style={styles.searchHeroSubtitle}>OEM Kodu, SHN Kodu veya Parça Adı ile Anında Arayın</p>
        </div>

        <div style={styles.searchBarWrapper}>
          <Search size={22} color="var(--accent)" style={styles.searchBarIcon} />
          <input
            type="text"
            placeholder="Örn: 200109283R, SHN-4028, Megane 4 Susturucu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchBarInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={styles.clearSearchBtn}>
              Temizle
            </button>
          )}
        </div>
      </section>

      {/* Catalog Split Layout */}
      <div style={styles.splitContent}>
        {/* Sidebar Filters */}
        <aside style={styles.filterSidebar} className="glass-panel">
          <div style={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="var(--accent)" />
              <h3 style={styles.sidebarTitle}>FİLTRELER</h3>
            </div>
            {(selectedCategory !== 'all' || selectedBrand !== 'all' || selectedModel !== 'all' || search) && (
              <button onClick={resetFilters} style={styles.resetBtn}>
                Sıfırla
              </button>
            )}
          </div>

          <hr style={styles.divider} />

          {/* Category Selector */}
          <div style={styles.filterBox}>
            <label className="form-label" style={styles.filterLabel}>
              <Tag size={14} style={{ marginRight: 6 }} /> Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={styles.select}
            >
              <option value="all">Tüm Kategoriler</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Selector */}
          <div style={styles.filterBox}>
            <label className="form-label" style={styles.filterLabel}>
              <Car size={14} style={{ marginRight: 6 }} /> Araç Markası
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel('all'); // reset model when brand changes
              }}
              className="form-select"
              style={styles.select}
            >
              <option value="all">Tüm Markalar</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selector */}
          <div style={styles.filterBox}>
            <label className="form-label" style={styles.filterLabel}>
              <Car size={14} style={{ marginRight: 6 }} /> Araç Modeli / Serisi
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="form-select"
              style={styles.select}
              disabled={filteredModels.length === 0}
            >
              <option value="all">Tüm Modeller</option>
              {filteredModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <section style={styles.gridArea}>
          <div style={styles.resultsHeader}>
            <p style={styles.resultsCount}>
              Toplam <strong>{filteredProducts.length}</strong> ürün listeleniyor
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={styles.noResults} className="glass-panel">
              <Disc size={48} color="var(--text-muted)" style={{ animation: 'none' }} />
              <h4 style={styles.noResultsTitle}>Aradığınız Kriterlere Uygun Ürün Bulunamadı</h4>
              <p style={styles.noResultsText}>
                Farklı bir arama kelimesi yazmayı veya filtreleri sıfırlamayı deneyin.
              </p>
              <button onClick={resetFilters} className="btn btn-primary" style={{ marginTop: 12 }}>
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} style={styles.cardLink}>
                  <article style={styles.productCard} className="glass-panel">
                    {/* Image frame */}
                    <div style={styles.cardImageContainer}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={styles.cardImg} />
                      ) : (
                        <ImageIcon size={36} color="var(--text-muted)" />
                      )}
                      <span style={styles.cardCategoryBadge}>{product.category}</span>
                    </div>

                    {/* Info content */}
                    <div style={styles.cardInfo}>
                      <h4 style={styles.cardTitle}>{product.name}</h4>

                      <div style={styles.codesRow}>
                        <div style={styles.codeItem}>
                          <span style={styles.codeLabel}>SHN:</span>
                          <span style={styles.codeValue}>{product.shnCode}</span>
                        </div>
                        <div style={styles.codeItem}>
                          <span style={styles.codeLabel}>OEM:</span>
                          <span style={styles.codeValue}>{product.oemCode}</span>
                        </div>
                      </div>

                      {/* Compatibility Vehicles */}
                      <div style={styles.compatWrapper}>
                        <div style={styles.compatTitle}>
                          <Car size={12} style={{ marginRight: 4 }} />
                          <span>Uyumlu Araçlar:</span>
                        </div>
                        <div style={styles.compatList}>
                          {product.compatibilities.length === 0 ? (
                            <span style={styles.noCompat}>Genel Uyumlu</span>
                          ) : (
                            product.compatibilities.slice(0, 3).map((car) => (
                              <span key={car.id} style={styles.compatLabel}>
                                {car.brand} {car.model}
                              </span>
                            ))
                          )}
                          {product.compatibilities.length > 3 && (
                            <span style={styles.compatMore}>
                              +{product.compatibilities.length - 3} model daha
                            </span>
                          )}
                        </div>
                      </div>

                      <hr style={styles.cardDivider} />

                      {/* Card Footer action */}
                      <div style={styles.cardFooter}>
                        {product.price ? (
                          <span style={styles.cardPrice}>{product.price} TL</span>
                        ) : (
                          <span style={styles.priceOnAsk}>Fiyat Sorunuz</span>
                        )}
                        <div style={styles.detailsLink}>
                          <span>Detaylar</span>
                          <ArrowRight size={14} style={styles.arrow} />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  catalogLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animation: 'fadeIn 0.6s ease-out',
  },
  searchHero: {
    background: 'linear-gradient(to bottom, var(--bg-secondary), rgba(19, 19, 22, 0.5))',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    boxShadow: 'var(--shadow-md)',
  },
  searchTitleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  searchHeroTitle: {
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#fff',
  },
  searchHeroSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  searchBarWrapper: {
    width: '100%',
    maxWidth: '680px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    height: '56px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
    transition: 'border-color 0.2s',
  },
  searchBarIcon: {
    marginRight: '16px',
  },
  searchBarInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#fff',
    background: 'none',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  splitContent: {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  filterSidebar: {
    width: '300px',
    padding: '24px',
    position: 'sticky',
    top: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: '#fff',
  },
  resetBtn: {
    fontSize: '13px',
    color: 'var(--accent)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  divider: {
    border: 0,
    height: '1px',
    background: 'var(--border-color)',
  },
  filterBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'none',
  },
  select: {
    cursor: 'pointer',
    fontSize: '14px',
  },
  gridArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    textAlign: 'center',
    gap: '16px',
  },
  noResultsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginTop: '12px',
  },
  noResultsText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '380px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  cardLink: {
    display: 'block',
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'var(--shadow-sm)',
    borderWidth: '1px',
  },
  cardImageContainer: {
    height: '180px',
    background: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderBottom: '1px solid var(--border-color)',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(10, 10, 12, 0.75)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(4px)',
    padding: '4px 10px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
  },
  cardInfo: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    lineHeight: '1.4',
    height: '44px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  codesRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  codeItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  codeLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'monospace',
  },
  compatWrapper: {
    marginBottom: '16px',
  },
  compatTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  compatList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  compatLabel: {
    fontSize: '10px',
    padding: '2px 6px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  noCompat: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  compatMore: {
    fontSize: '10px',
    color: 'var(--accent)',
    fontWeight: '600',
    alignSelf: 'center',
    paddingLeft: '4px',
  },
  cardDivider: {
    border: 0,
    height: '1px',
    background: 'var(--border-color)',
    marginTop: 'auto',
    marginBottom: '14px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  priceOnAsk: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  detailsLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  arrow: {
    transition: 'transform 0.2s',
  },
};
