import React from 'react';
import Catalog from '@/components/Catalog';
import { getDb, products, productCarCompatibility, cars } from '@/db';
import { eq, inArray } from 'drizzle-orm';
import { Disc, ShieldAlert } from 'lucide-react';

export default async function HomePage() {
  const db = getDb();

  // 1. Fetch all products
  const allProducts = await db.select().from(products);

  // 2. Fetch all cars for filters
  const allCars = await db.select().from(cars);

  // 3. Match compatibilities in a batch query to avoid N+1 database hits
  const productIds = allProducts.map((p) => p.id);
  const productsWithCompatibilities = allProducts.map((p) => ({
    ...p,
    compatibilities: [] as any[],
  }));

  if (productIds.length > 0) {
    const allCompatibilities = await db
      .select({
        productId: productCarCompatibility.productId,
        car: {
          id: cars.id,
          brand: cars.brand,
          model: cars.model,
          year: cars.year,
        },
      })
      .from(productCarCompatibility)
      .innerJoin(cars, eq(productCarCompatibility.carId, cars.id))
      .where(inArray(productCarCompatibility.productId, productIds));

    // Group compatibility records by productId
    const compatibilityGroup: Record<number, any[]> = {};
    allCompatibilities.forEach((item) => {
      if (!compatibilityGroup[item.productId]) {
        compatibilityGroup[item.productId] = [];
      }
      compatibilityGroup[item.productId].push(item.car);
    });

    // Assign compatibility arrays back to the products
    productsWithCompatibilities.forEach((p) => {
      p.compatibilities = compatibilityGroup[p.id] || [];
    });
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Navigation Header */}
      <header style={styles.header} className="glass-panel">
        <div className="container" style={styles.headerContainer}>
          <div style={styles.brand}>
            <Disc size={32} color="#ff5e00" style={styles.logoIcon} />
            <div>
              <h1 style={styles.brandName}>ŞAHANLAR EGZOZ</h1>
              <p style={styles.brandSubtitle}>Egzoz Sistemleri Katalog ve Satış</p>
            </div>
          </div>

          <a href="/admin/login" style={styles.adminLink}>
            <ShieldAlert size={16} />
            <span>Yönetici Paneli</span>
          </a>
        </div>
      </header>

      {/* Hero Brand Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBgGlow}></div>
        <div className="container" style={styles.heroContainer}>
          <h2 style={styles.heroTitle}>Premium Otomotiv Egzoz Çözümleri</h2>
          <p style={styles.heroDescription}>
            Susturucular, katalizörler, manifoldlar ve orijinal OEM uyumlu kaliteli yedek parçalar.
            Aracınızın performansını ve çevre standartlarını koruyan profesyonel parça kataloğu.
          </p>
        </div>
      </section>

      {/* Main Content & Catalog */}
      <main className="container" style={styles.mainContent}>
        <Catalog
          initialProducts={productsWithCompatibilities as any}
          initialVehicles={allCars}
        />
      </main>

      {/* Site Footer */}
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
  adminLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    padding: '10px 18px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  heroSection: {
    position: 'relative',
    padding: '60px 0 20px 0',
    overflow: 'hidden',
  },
  heroBgGlow: {
    position: 'absolute',
    top: '-50%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60vw',
    height: '60vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 94, 0, 0.04) 0%, transparent 60%)',
    zIndex: -1,
    pointerEvents: 'none',
  },
  heroContainer: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  heroDescription: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    maxWidth: '680px',
    lineHeight: '1.6',
  },
  mainContent: {
    paddingTop: '32px',
    paddingBottom: '80px',
    flex: 1,
  },
  footer: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '40px 0',
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
