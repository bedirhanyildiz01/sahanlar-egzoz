-- Şahanlar Egzoz — D1 Database Migration
-- 0001_init.sql

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    shn_no TEXT,
    oem_no TEXT,
    brand TEXT,
    model TEXT,
    category TEXT DEFAULT 'Genel',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'in_stock', 'out_of_stock')),
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler (hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_products_shn ON products(shn_no);
CREATE INDEX IF NOT EXISTS idx_products_oem ON products(oem_no);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Örnek veriler
INSERT INTO products (name, description, shn_no, oem_no, brand, model, category, status, image_url) VALUES
('BMW E46 Egzoz Manifoldu', 'Orijinal kalitede BMW E46 serisi için egzoz manifoldu. Paslanmaz çelik yapısı ile uzun ömürlü kullanım sağlar.', 'SHN-001', '18100-11J00', 'BMW', 'E46', 'Binek', 'in_stock', null),
('Volkswagen Golf 4 Katalizör', 'VW Golf 4 için yüksek verimli katalizör dönüştürücü. Euro 4 standardına uygundur.', 'SHN-002', '1J0254350HX', 'Volkswagen', 'Golf 4', 'Binek', 'in_stock', null),
('Toyota Corolla Susturucu', 'Toyota Corolla E120 için arka susturucu. Ses izolasyonu mükemmel düzeydedir.', 'SHN-003', '17430-0D040', 'Toyota', 'Corolla E120', 'Binek', 'in_stock', null),
('Ford Transit Egzoz Borusu', 'Ford Transit için orta boru. Yüksek sıcaklığa dayanıklı çelik malzeme.', 'SHN-004', '6C11-5F297-AA', 'Ford', 'Transit', 'Ticari', 'in_stock', null),
('Mercedes Sprinter Manifold Contası', 'Mercedes Sprinter için egzoz manifold contası. Orijinal ölçülerde üretilmiştir.', 'SHN-005', 'A6421411380', 'Mercedes', 'Sprinter', 'Ticari', 'in_stock', null);
