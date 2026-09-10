import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ShieldCheck, Heart, Building2 } from 'lucide-react';

// Protected Route Guard for Staff/Admin
const ProtectedStaffRoute = ({ children }) => {
  const { user, loading, isStaff, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || (!isStaff && !isAdmin)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Protected Route Guard for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />

          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public & Guest Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Staff Routes */}
              <Route
                path="/staff/*"
                element={
                  <ProtectedStaffRoute>
                    <StaffDashboardPage />
                  </ProtectedStaffRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboardPage />
                  </ProtectedAdminRoute>
                }
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Luxury Footer */}
          <footer
            style={{
              backgroundColor: '#050814',
              borderTop: '1px solid var(--border-subtle)',
              padding: '40px 0 24px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem'
            }}
          >
            <div className="container">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} className="font-gold" />
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                    AuraStays
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    &bull; P03 Hotel Room Booking & Reservation Platform
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem' }}>
                  <span>5th Semester CIA-3 Project</span>
                  <span>MongoDB Aggregations</span>
                  <span>Finite State Machine (FSM)</span>
                  <span>Cleanliness Enforcement</span>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '20px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                Crafted for Hospitality & Tourism &bull; Active Branch: <span className="font-gold">mahima-frontend</span> &bull; All Rights Reserved.
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
