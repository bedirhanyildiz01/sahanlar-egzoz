'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Search,
  Upload,
  X,
  Check,
  Disc,
  Filter,
  Car,
  Tag,
  Hash
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

const CATEGORIES = ['Susturucu', 'Katalizör', 'Manifold', 'DPF', 'Spiral', 'Borular', 'Diğer'];
const STATUSES = ['Aktif', 'Pasif', 'Sıfır', 'İkinci El', 'Revizyonlu'];

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formShn, setFormShn] = useState('');
  const [formOem, setFormOem] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formStatus, setFormStatus] = useState(STATUSES[0]);
  const [formPrice, setFormPrice] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formCompatibilities, setFormCompatibilities] = useState<number[]>([]);

  // Sub-form for adding new vehicle dynamically inside the product modal
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [vehicleError, setVehicleError] = useState('');

  // General operations state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Products
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json() as Product[];
      if (prodRes.ok) {
        setProducts(prodData);
      }

      // Fetch Vehicles
      const vehRes = await fetch('/api/cars');
      const vehData = await vehRes.json() as Vehicle[];
      if (vehRes.ok) {
        setVehicles(vehData);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (e) {
      console.error('Çıkış hatası:', e);
    }
  };

  // Open modal for creating product
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormShn('');
    setFormOem('');
    setFormCategory(CATEGORIES[0]);
    setFormStatus(STATUSES[0]);
    setFormPrice('');
    setFormImage('');
    setFormCompatibilities([]);
    setSubmitError('');
    setIsProductModalOpen(true);
  };

  // Open modal for editing product
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description || '');
    setFormShn(product.shnCode);
    setFormOem(product.oemCode);
    setFormCategory(product.category);
    setFormStatus(product.status);
    setFormPrice(product.price ? product.price.toString() : '');
    setFormImage(product.imageUrl || '');
    setFormCompatibilities(product.compatibilities.map((c) => c.id));
    setSubmitError('');
    setIsProductModalOpen(true);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json() as { url?: string; error?: string };
      if (res.ok) {
        setFormImage(data.url || '');
      } else {
        alert('Görsel yüklenemedi: ' + data.error);
      }
    } catch (err) {
      alert('Görsel yüklenirken bağlantı hatası oluştu.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle adding a brand new vehicle dynamically
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleError('');

    if (!newBrand.trim() || !newModel.trim()) {
      setVehicleError('Marka ve model alanları zorunludur.');
      return;
    }

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: newBrand.trim(),
          model: newModel.trim(),
          year: newYear ? parseInt(newYear, 10) : null,
        }),
      });

      const data = await res.json() as Vehicle & { error?: string };

      if (res.ok || res.status === 200) {
        // Add to vehicles list if not already there
        if (!vehicles.find((v) => v.id === data.id)) {
          setVehicles((prev) => [...prev, data]);
        }
        // Auto select this vehicle in the compatibility list
        if (!formCompatibilities.includes(data.id)) {
          setFormCompatibilities((prev) => [...prev, data.id]);
        }

        // Reset inputs
        setNewBrand('');
        setNewModel('');
        setNewYear('');
        setIsAddingVehicle(false);
      } else {
        setVehicleError(data.error || 'Araç eklenemedi.');
      }
    } catch (err) {
      setVehicleError('Bağlantı hatası oluştu.');
    }
  };

  // Toggle compatibility select
  const toggleCompatibility = (carId: number) => {
    setFormCompatibilities((prev) =>
      prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId]
    );
  };

  // Handle Product Submit (Insert or Update)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      name: formName,
      description: formDesc,
      shnCode: formShn,
      oemCode: formOem,
      category: formCategory,
      status: formStatus,
      price: formPrice ? parseFloat(formPrice) : null,
      imageUrl: formImage,
      compatibilityIds: formCompatibilities,
    };

    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as { error?: string };

      if (res.ok) {
        setIsProductModalOpen(false);
        fetchData();
      } else {
        setSubmitError(data.error || 'İşlem tamamlanamadı.');
      }
    } catch (err) {
      setSubmitError('Bir bağlantı hatası oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json() as { error?: string };
        alert('Silme başarısız: ' + data.error);
      }
    } catch (e) {
      alert('Silme sırasında bağlantı hatası oluştu.');
    }
  };

  // Client-side filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shnCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.oemCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div style={styles.container}>
      {/* Sidebar Navbar */}
      <aside style={styles.sidebar} className="glass-panel">
        <div style={styles.brand}>
          <Disc size={28} color="#ff5e00" style={styles.brandIcon} />
          <div>
            <h2 style={styles.brandTitle}>ŞAHANLAR</h2>
            <p style={styles.brandSubtitle}>EGZOZ YÖNETİM</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={{ ...styles.navItem, ...styles.navItemActive }}>
            <Disc size={18} />
            <span>Katalog Ürünleri</span>
          </div>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn} className="btn">
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <header style={styles.mainHeader}>
          <div>
            <h1 style={styles.pageTitle}>Ürün Yönetimi</h1>
            <p style={styles.pageSubtitle}>Katalogdaki parçaları ekleyin, düzenleyin veya silin.</p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Yeni Ürün Ekle</span>
          </button>
        </header>

        {/* Filters and Search Bar */}
        <section style={styles.filterSection} className="glass-panel">
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Ürün Adı, OEM Kodu veya SHN Kodu ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.dropdownFilters}>
            <div style={styles.filterGroup}>
              <Tag size={16} color="var(--text-secondary)" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-select"
                style={styles.filterSelect}
              >
                <option value="all">Tüm Kategoriler</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <Filter size={16} color="var(--text-secondary)" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
                style={styles.filterSelect}
              >
                <option value="all">Tüm Durumlar</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Products Table */}
        {loading ? (
          <div style={styles.loaderContainer}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Yükleniyor...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={styles.emptyContainer} className="glass-panel">
            <Hash size={48} color="var(--text-muted)" />
            <p style={styles.emptyTitle}>Kayıtlı Ürün Bulunamadı</p>
            <p style={styles.emptySubtitle}>Arama kriterlerinizi değiştirmeyi veya yeni ürün eklemeyi deneyin.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper} className="glass-panel">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Görsel</th>
                  <th style={styles.th}>Ürün Adı</th>
                  <th style={styles.th}>SHN Kodu</th>
                  <th style={styles.th}>OEM Kodu</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Durum</th>
                  <th style={styles.th}>Uyumlu Araçlar</th>
                  <th style={styles.th}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.imageThumbnail}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} style={styles.thumbImg} />
                        ) : (
                          <ImageIcon size={20} color="var(--text-muted)" />
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.productName}>{product.name}</div>
                      {product.price && <div style={styles.productPrice}>{product.price} TL</div>}
                    </td>
                    <td style={styles.td}>
                      <code style={styles.code}>{product.shnCode}</code>
                    </td>
                    <td style={styles.td}>
                      <code style={styles.code}>{product.oemCode}</code>
                    </td>
                    <td style={styles.td}>
                      <span className="badge badge-gray">{product.category}</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        className={`badge ${
                          product.status === 'Aktif' || product.status === 'Sıfır'
                            ? 'badge-green'
                            : 'badge-orange'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.compatibilityCell}>
                        {product.compatibilities.length === 0 ? (
                          <span style={styles.noVehicles}>Uyumlu araç yok</span>
                        ) : (
                          product.compatibilities.map((c) => (
                            <span key={c.id} className="badge badge-gray" style={styles.compBadge}>
                              {c.brand} {c.model}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => openEditModal(product)}
                          style={styles.actionBtn}
                          title="Düzenle"
                        >
                          <Edit2 size={16} color="var(--success)" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={styles.actionBtn}
                          title="Sil"
                        >
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="glass-panel">
            <header style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} style={styles.closeModalBtn}>
                <X size={20} />
              </button>
            </header>

            {submitError && (
              <div style={styles.modalError}>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} style={styles.modalForm}>
              <div style={styles.modalScrollableArea}>
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Ürün Adı *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      placeholder="Örn: Renault Megane 4 Arka Susturucu"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">SHN Kodu *</label>
                    <input
                      type="text"
                      value={formShn}
                      onChange={(e) => setFormShn(e.target.value)}
                      required
                      placeholder="Örn: SHN-4028"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">OEM Kodu (Benzersiz) *</label>
                    <input
                      type="text"
                      value={formOem}
                      onChange={(e) => setFormOem(e.target.value)}
                      required
                      placeholder="Örn: 200109283R"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Kategori *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="form-select"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Durum *</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="form-select"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Fiyat (Opsiyonel, TL)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Fiyat girin (TL)"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Ürün teknik özellikleri ve detayları..."
                    className="form-textarea"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="form-group">
                  <label className="form-label">Ürün Görseli</label>
                  <div style={styles.imageUploadWrapper}>
                    <div style={styles.imageUploadPreview}>
                      {formImage ? (
                        <img src={formImage} alt="Preview" style={styles.uploadPreviewImg} />
                      ) : (
                        <ImageIcon size={32} color="var(--text-muted)" />
                      )}
                    </div>
                    <div style={styles.imageUploadControls}>
                      <label style={styles.fileUploadBtn} className="btn btn-secondary">
                        <Upload size={16} />
                        <span>{uploadingImage ? 'Yükleniyor...' : 'Görsel Seç'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          style={styles.imageRemoveBtn}
                          className="btn btn-danger"
                        >
                          Görseli Kaldır
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Compatibility Selector section */}
                <div className="form-group" style={{ marginTop: 24 }}>
                  <div style={styles.compHeader}>
                    <label className="form-label">Uyumlu Araç Modelleri ({formCompatibilities.length})</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                      style={styles.addVehToggleBtn}
                    >
                      {isAddingVehicle ? 'İptal' : '+ Yeni Araç Tanımla'}
                    </button>
                  </div>

                  {/* Add New Vehicle Sub-Form */}
                  {isAddingVehicle && (
                    <div style={styles.addVehBox}>
                      <h4 style={styles.addVehBoxTitle}>Yeni Araç Modeli Kaydet</h4>
                      {vehicleError && <p style={styles.vehErrorText}>{vehicleError}</p>}
                      <div style={styles.addVehFormRow}>
                        <input
                          type="text"
                          placeholder="Marka (Örn: Tofaş)"
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          style={styles.addVehInput}
                        />
                        <input
                          type="text"
                          placeholder="Model/Seri (Örn: Şahin)"
                          value={newModel}
                          onChange={(e) => setNewModel(e.target.value)}
                          style={styles.addVehInput}
                        />
                        <input
                          type="number"
                          placeholder="Yıl (İsteğe bağlı)"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          style={{ ...styles.addVehInput, maxWidth: 100 }}
                        />
                        <button
                          type="button"
                          onClick={handleAddVehicle}
                          style={styles.addVehSubmitBtn}
                        >
                          Kaydet ve Seç
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Compatibility list */}
                  <div style={styles.vehicleSelectionGrid}>
                    {vehicles.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        Hiç araç tanımlanmamış. Yeni bir araç tanımlayarak başlayın.
                      </p>
                    ) : (
                      vehicles.map((car) => {
                        const isSelected = formCompatibilities.includes(car.id);
                        return (
                          <div
                            key={car.id}
                            onClick={() => toggleCompatibility(car.id)}
                            style={{
                              ...styles.vehicleCard,
                              ...(isSelected ? styles.vehicleCardSelected : {}),
                            }}
                          >
                            <div style={styles.vehicleCardIcon}>
                              <Car size={14} color={isSelected ? 'white' : 'var(--text-secondary)'} />
                            </div>
                            <div style={styles.vehicleCardContent}>
                              <div style={styles.vehicleCardText}>
                                {car.brand} {car.model}
                              </div>
                              {car.year && <div style={styles.vehicleCardYear}>{car.year}</div>}
                            </div>
                            {isSelected && (
                              <div style={styles.vehicleCardCheck}>
                                <Check size={12} color="white" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <footer style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  style={styles.modalCancelBtn}
                  className="btn btn-secondary"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={styles.modalSubmitBtn}
                >
                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    background: 'var(--bg-primary)',
  },
  sidebar: {
    width: '280px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: '24px',
    bottom: '24px',
    left: '24px',
    zIndex: 10,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  brandIcon: {
    animation: 'spin 12s linear infinite',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#fff',
    lineHeight: '1.1',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: 'var(--accent)',
    fontWeight: '700',
    letterSpacing: '2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    background: 'var(--accent-light)',
    color: 'var(--accent)',
  },
  logoutBtn: {
    marginTop: 'auto',
    width: '100%',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
  },
  mainContent: {
    flex: 1,
    padding: '40px 40px 40px 344px', // 280px sidebar + 24px layout gaps
  },
  mainHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  filterSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '20px 24px',
    marginBottom: '32px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0 16px',
    height: '46px',
    flex: 1,
    minWidth: '280px',
  },
  searchIcon: {
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    fontSize: '14px',
    outline: 'none',
  },
  dropdownFilters: {
    display: 'flex',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0 16px',
    height: '46px',
  },
  filterSelect: {
    border: 'none',
    background: 'none',
    padding: 0,
    fontSize: '14px',
    cursor: 'pointer',
    width: 'auto',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    textAlign: 'center',
    gap: '12px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginTop: '8px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    maxWidth: '380px',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    boxShadow: 'var(--shadow-lg)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  th: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  imageThumbnail: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productName: {
    fontWeight: '700',
    color: '#fff',
    fontSize: '15px',
  },
  productPrice: {
    color: 'var(--accent)',
    fontWeight: '600',
    fontSize: '13px',
    marginTop: '2px',
  },
  code: {
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.04)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  compatibilityCell: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    maxWidth: '240px',
  },
  compBadge: {
    fontSize: '11px',
    fontWeight: '500',
  },
  noVehicles: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
    animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid var(--border-color)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#fff',
  },
  closeModalBtn: {
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  modalScrollableArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  imageUploadWrapper: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    background: 'var(--bg-secondary)',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
  },
  imageUploadPreview: {
    width: '90px',
    height: '90px',
    borderRadius: '8px',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  uploadPreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageUploadControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fileUploadBtn: {
    position: 'relative',
    overflow: 'hidden',
    height: '42px',
  },
  imageRemoveBtn: {
    height: '42px',
  },
  compHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  addVehToggleBtn: {
    fontSize: '13px',
    color: 'var(--accent)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  addVehBox: {
    background: 'rgba(255, 94, 0, 0.04)',
    border: '1px solid rgba(255, 94, 0, 0.15)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
    animation: 'fadeIn 0.2s ease-out',
  },
  addVehBoxTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  addVehFormRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  addVehInput: {
    flex: 1,
    minWidth: '120px',
    padding: '10px 12px',
    fontSize: '13px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
  },
  addVehSubmitBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  vehErrorText: {
    color: 'var(--danger)',
    fontSize: '12px',
    marginBottom: '8px',
  },
  vehicleSelectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '10px',
    maxHeight: '240px',
    overflowY: 'auto',
    background: 'rgba(0,0,0,0.2)',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
  },
  vehicleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  vehicleCardSelected: {
    borderColor: 'var(--accent)',
    background: 'rgba(255, 94, 0, 0.05)',
  },
  vehicleCardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.03)',
  },
  vehicleCardContent: {
    flex: 1,
  },
  vehicleCardText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    lineHeight: '1.2',
  },
  vehicleCardYear: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  vehicleCardCheck: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    padding: '24px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalCancelBtn: {
    height: '46px',
  },
  modalSubmitBtn: {
    height: '46px',
    minWidth: '120px',
  },
  modalError: {
    margin: '0 24px',
    marginTop: '24px',
    padding: '12px 16px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    color: 'var(--danger)',
    fontSize: '14px',
  },
};
