import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb, products, productCarCompatibility, cars } from '@/db';
import { eq } from 'drizzle-orm';
import {
  ChevronLeft,
  Car,
  Tag,
  Hash,
  Info,
  Calendar,
  Compass,
  Disc
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage(props: PageProps) {
  const { id } = await props.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const db = getDb();

  // 1. Fetch Product details
  const productResult = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (productResult.length === 0) {
    notFound();
  }

  const product = productResult[0];

  // 2. Fetch all compatibilities
  const compatibilities = await db
    .select({
      id: cars.id,
      brand: cars.brand,
      model: cars.model,
      year: cars.year,
    })
    .from(productCarCompatibility)
    .innerJoin(cars, eq(productCarCompatibility.carId, cars.id))
    .where(eq(productCarCompatibility.productId, productId));

  return (
    <div style={styles.pageWrapper}>
      {/* Site Header */}
      <header style={styles.header} className="glass-panel">
        <div className="container" style={styles.headerContainer}>
          <Link href="/" style={styles.brand}>
            <Disc size={32} color="#ff5e00" style={styles.logoIcon} />
            <div>
              <h1 style={styles.brandName}>ŞAHANLAR EGZOZ</h1>
              <p style={styles.brandSubtitle}>Egzoz Sistemleri Katalog ve Satış</p>
            </div>
          </Link>
          <Link href="/" style={styles.backCatalogLink}>
            <ChevronLeft size={16} />
            <span>Kataloğa Dön</span>
          </Link>
        </div>
      </header>

      {/* Main product detail card container */}
      <main className="container" style={styles.mainContent}>
        {/* Breadcrumbs */}
        <div style={styles.breadcrumbs}>
          <Link href="/" style={styles.breadcrumbLink}>Katalog</Link>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbActive}>{product.category}</span>
          <span style={styles.breadcrumbSeparator}>/</span>
          <span style={styles.breadcrumbActive}>{product.name}</span>
        </div>

        {/* Product Details Section */}
        <section style={styles.detailCard} className="glass-panel">
          {/* Left Column: Image Viewer */}
          <div style={styles.imageColumn}>
            <div style={styles.imageContainer}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={styles.productImg} />
              ) : (
                <Disc size={72} color="var(--text-muted)" style={{ opacity: 0.1, animation: 'spin 30s linear infinite' }} />
              )}
            </div>
          </div>

          {/* Right Column: Spec Sheet */}
          <div style={styles.specColumn}>
            <div style={styles.statusRow}>
              <span className="badge badge-orange" style={{ fontSize: '11px' }}>
                {product.category}
              </span>
              <span
                className={`badge ${
                  product.status === 'Aktif' || product.status === 'Sıfır'
                    ? 'badge-green'
                    : 'badge-blue'
                }`}
                style={{ fontSize: '11px' }}
              >
                {product.status}
              </span>
            </div>

            <h2 style={styles.productTitle}>{product.name}</h2>

            {product.price ? (
              <div style={styles.priceTag}>{product.price} TL</div>
            ) : (
              <div style={styles.priceAsk}>Fiyat Bilgisi İçin İletişime Geçin</div>
            )}

            <hr style={styles.divider} />

            {/* Product Key Metadata Codes */}
            <div style={styles.metadataGrid}>
              <div style={styles.metaItem}>
                <div style={styles.metaLabelIcon}>
                  <Hash size={16} color="var(--accent)" />
                  <span style={styles.metaLabelText}>OEM Kodu</span>
                </div>
                <code style={styles.metaCodeValue}>{product.oemCode}</code>
              </div>

              <div style={styles.metaItem}>
                <div style={styles.metaLabelIcon}>
                  <Compass size={16} color="var(--accent)" />
                  <span style={styles.metaLabelText}>SHN Kodu</span>
                </div>
                <code style={styles.metaCodeValue}>{product.shnCode}</code>
              </div>
            </div>

            {/* Description */}
            <div style={styles.descriptionSection}>
              <h3 style={styles.sectionTitle}>
                <Info size={16} style={{ marginRight: 6 }} />
                <span>Ürün Açıklaması</span>
              </h3>
              <p style={styles.descriptionText}>
                {product.description || 'Bu egzoz yedek parçası için detaylı bir açıklama belirtilmemiştir.'}
              </p>
            </div>
          </div>
        </section>

        {/* Compatibility Vehicles Section */}
        <section style={styles.compatibilitySection} className="glass-panel">
          <header style={styles.compatibilityHeader}>
            <Car size={22} color="var(--accent)" />
            <h3 style={styles.compatibilityTitle}>Bu Parçanın Uyumlu Olduğu Tüm Araçlar</h3>
          </header>

          <div style={styles.tableWrapper}>
            {compatibilities.length === 0 ? (
              <div style={styles.emptyCompat}>
                <Info size={24} color="var(--text-muted)" />
                <p style={{ marginTop: 8 }}>Bu parçaya ait spesifik araç uyumluluk bilgisi bulunmamaktadır.</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Genel veya evrensel parça olabilir.</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Marka</th>
                    <th style={styles.th}>Seri / Model</th>
                    <th style={styles.th}>Üretim Yılı</th>
                  </tr>
                </thead>
                <tbody>
                  {compatibilities.map((car) => (
                    <tr key={car.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.carBrandText}>{car.brand}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.carModelText}>{car.model}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.carYearWrapper}>
                          <Calendar size={14} color="var(--text-muted)" />
                          <span>{car.year || 'Tüm Yıllar'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerContainer}>
          <div>
            <h3 style={styles.footerLogoText}>ŞAHANLAR EGZOZ</h3>
            <p style={styles.footerTextMuted}>Orijinal OEM Uyumlu Egzoz Kataloğu</p>
          </div>
          <div style={styles.footerDetails}>
            <p>© 2026 Şahanlar Egzoz. Tüm Hakları Saklıdır.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
              Cloudflare Pages • D1 Database • Edge Network
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    borderRadius: 0,
    borderTop: 0,
    borderLeft: 0,
    borderRight: 0,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  headerContainer: {
    height: '80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    animation: 'spin 20s linear infinite',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.1',
    letterSpacing: '0.5px',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    marginTop: '2px',
  },
  backCatalogLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--accent)',
    transition: 'color 0.2s',
  },
  mainContent: {
    paddingTop: '32px',
    paddingBottom: '80px',
    flex: 1,
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  breadcrumbLink: {
    color: 'var(--text-secondary)',
    transition: 'color 0.2s',
  },
  breadcrumbSeparator: {
    color: 'var(--text-muted)',
  },
  breadcrumbActive: {
    color: '#fff',
    fontWeight: '500',
  },
  detailCard: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '40px',
    padding: '40px',
    marginBottom: '32px',
    boxShadow: 'var(--shadow-lg)',
  },
  imageColumn: {
    flex: '1 1 300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: '400px',
    height: '350px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  specColumn: {
    flex: '1.2 1 360px',
    display: 'flex',
    flexDirection: 'column',
  },
  statusRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  productTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff',
    lineHeight: '1.2',
    marginBottom: '16px',
  },
  priceTag: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--accent)',
    marginBottom: '24px',
  },
  priceAsk: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginBottom: '24px',
  },
  divider: {
    border: 0,
    height: '1px',
    background: 'var(--border-color)',
    marginBottom: '24px',
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  metaItem: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaLabelIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metaLabelText: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metaCodeValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'monospace',
  },
  descriptionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
  },
  descriptionText: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  compatibilitySection: {
    padding: '40px',
    boxShadow: 'var(--shadow-lg)',
  },
  compatibilityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
  },
  compatibilityTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  emptyCompat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  th: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '14px 20px',
    verticalAlign: 'middle',
  },
  carBrandText: {
    fontWeight: '700',
    color: '#fff',
  },
  carModelText: {
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  carYearWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
  },
  footer: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '40px 0',
    marginTop: 'auto',
  },
  footerContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogoText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#fff',
  },
  footerTextMuted: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  footerDetails: {
    textAlign: 'right',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
};
