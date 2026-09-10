import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);

      // Redirect depending on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff/frontdesk');
      } else {
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill helper for demonstration
  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #F3C68F 0%, #D4AF37 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070B19',
              margin: '0 auto 14px',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
            }}
          >
            <KeyRound size={26} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Access your reservations and hotel management console.
          </p>
        </div>

        {/* 1-Click Fast Demo Accounts */}
        <div
          style={{
            backgroundColor: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '24px'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-gold-light)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            ⚡ 1-Click Fast Demo Accounts
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('john.doe@example.com', 'guest123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <UserCheck size={14} className="font-gold" /> Guest (John)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff.ny@hotelchain.com', 'staff123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Building2 size={14} style={{ color: '#38BDF8' }} /> Staff (NY)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff.la@hotelchain.com', 'staff123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Building2 size={14} style={{ color: '#34D399' }} /> Staff (LA)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hotelchain.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.76rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={14} style={{ color: '#C084FC' }} /> Global Admin
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid #F43F5E',
              borderRadius: 'var(--radius-sm)',
              color: '#FECDD3',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} className="font-gold" /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. guest@example.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} className="font-gold" /> Password
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-gold-light)', fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};
