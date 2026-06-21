'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Key, Mail, AlertTriangle, Disc } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı.');
      }

      // Successfully logged in! Redirect to dashboard.
      // We use router.push and then force a reload or normal navigation
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background glow effects */}
      <div style={styles.glowBg1}></div>
      <div style={styles.glowBg2}></div>

      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <Disc size={36} color="#ff5e00" style={styles.spinIcon} />
          </div>
          <h1 style={styles.title}>ŞAHANLAR EGZOZ</h1>
          <p style={styles.subtitle}>Yönetim Paneli Girişi</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" style={styles.label}>
              <Mail size={14} style={{ marginRight: 6 }} /> E-POSTA
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@egzozcu.com"
              required
              disabled={loading}
              className="form-input"
              style={styles.input}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={styles.label}>
              <Key size={14} style={{ marginRight: 6 }} /> ŞİFRE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="form-input"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {loading ? (
              <span style={styles.spinner}></span>
            ) : (
              <>
                <span>Giriş Yap</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>Test Giriş Bilgileri:</p>
          <p style={styles.infoText}><strong>E-posta:</strong> admin@egzozcu.com</p>
          <p style={styles.infoText}><strong>Şifre:</strong> Egzoz123!_Admin</p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBg1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 94, 0, 0.08) 0%, transparent 70%)',
    zIndex: -1,
  },
  glowBg2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '50vw',
    height: '50vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 42, 0, 0.06) 0%, transparent 70%)',
    zIndex: -1,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    animation: 'fadeIn 0.6s ease-out',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(255, 94, 0, 0.08)',
    border: '1px solid rgba(255, 94, 0, 0.2)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#fff',
    marginBottom: '4px',
    background: 'linear-gradient(to right, #ffffff, #9ea0a8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    fontWeight: '400',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
  },
  input: {
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  submitBtn: {
    marginTop: '10px',
    width: '100%',
    height: '46px',
    fontSize: '15px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    fontSize: '14px',
    marginBottom: '20px',
    animation: 'fadeIn 0.3s ease-out',
  },
  infoBox: {
    marginTop: '28px',
    padding: '16px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '13px',
  },
  infoTitle: {
    color: 'var(--accent)',
    fontWeight: '600',
    marginBottom: '6px',
  },
  infoText: {
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    animation: 'spin 1s ease-in-out infinite',
  },
};
