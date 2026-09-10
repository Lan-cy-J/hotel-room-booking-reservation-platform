import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  CalendarCheck, 
  BedDouble, 
  Sparkles, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isGuest, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: 'rgba(7, 11, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F3C68F 0%, #D4AF37 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070B19',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.4)'
            }}
          >
            <Building2 size={22} strokeWidth={2.4} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }} className="gradient-text">
              AuraStays
            </span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '-4px' }}>
              Luxury Collection
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive('/') ? 'var(--primary-gold-light)' : 'var(--text-secondary)',
              backgroundColor: isActive('/') ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BedDouble size={16} />
            Explore & Book
          </Link>

          {/* Guest Nav */}
          {(!user || isGuest) && (
            <Link
              to="/my-bookings"
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/my-bookings') ? 'var(--primary-gold-light)' : 'var(--text-secondary)',
                backgroundColor: isActive('/my-bookings') ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CalendarCheck size={16} />
              My Bookings
            </Link>
          )}

          {/* Staff Nav */}
          {isStaff && (
            <>
              <Link
                to="/staff/frontdesk"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive('/staff/frontdesk') ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  backgroundColor: isActive('/staff/frontdesk') ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ClipboardList size={16} />
                Front-Desk Check-In
              </Link>
              <Link
                to="/staff/housekeeping"
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive('/staff/housekeeping') ? '#34D399' : 'var(--text-secondary)',
                  backgroundColor: isActive('/staff/housekeeping') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={16} />
                Housekeeping Board
              </Link>
            </>
          )}

          {/* Admin Nav */}
          {isAdmin && (
            <Link
              to="/admin"
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/admin') ? '#C084FC' : 'var(--text-secondary)',
                backgroundColor: isActive('/admin') ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LayoutDashboard size={16} />
              Admin Analytics & Pricing
            </Link>
          )}
        </nav>

        {/* User Status / Login Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#8B5CF6' : isStaff ? '#0284C7' : '#D4AF37',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role} {user.hotelId?.name ? `(${user.hotelId.city})` : ''}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '8px 10px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
