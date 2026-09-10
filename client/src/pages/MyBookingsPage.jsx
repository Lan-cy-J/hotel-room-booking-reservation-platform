import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { InvoiceModal } from '../components/InvoiceModal';
import { 
  CalendarCheck, 
  Building2, 
  FileText, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Modals
  const [invoiceBookingId, setInvoiceBookingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of itinerary');
  const [cancelling, setCancelling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.bookings.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        setError(res.message || 'Failed to fetch your bookings');
      }
    } catch (err) {
      setError(err.message || 'Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleConfirm = async (bookingId) => {
    try {
      const res = await api.bookings.confirm(bookingId);
      if (res.success) {
        setActionSuccess('Booking confirmed successfully!');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm booking');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setCancelling(true);
      const res = await api.bookings.cancel(cancelModalBooking._id, { reason: cancelReason });
      if (res.success) {
        setCancelModalBooking(null);
        setActionSuccess(`Reservation cancelled. Refund: $${res.data.refundSummary?.refundAmount || 0}`);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <CalendarCheck size={48} className="font-gold" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '10px' }}>
            Sign In to View Bookings
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.92rem' }}>
            Please log in to manage your active reservations, retrieve itemized invoices, or cancel bookings.
          </p>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ width: '100%' }}>
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') return ['Reserved', 'Confirmed', 'Checked-in'].includes(b.status);
    if (filter === 'COMPLETED') return b.status === 'Checked-out';
    if (filter === 'CANCELLED') return b.status === 'Cancelled';
    return true;
  });

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Guest Management
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
            My Booking History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Track, confirm, view itemized tax invoices, and manage your luxury reservations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: filter === tab ? 'var(--primary-gold)' : 'transparent',
                color: filter === tab ? '#070B19' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10B981',
            borderRadius: 'var(--radius-md)',
            color: '#A7F3D0',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '14px' }}>Loading your reservations...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '24px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#FECDD3', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <CalendarCheck size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Bookings in this Category
          </h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px' }}>
            You do not have any reservations under the "{filter.toLowerCase()}" filter.
          </p>
          <Link to="/" className="btn btn-primary btn-sm">
            Book a New Stay <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredBookings.map((b) => {
            const checkInDate = new Date(b.checkIn);
            const checkOutDate = new Date(b.checkOut);
            const canConfirm = b.status === 'Reserved';
            const canCancel = ['Reserved', 'Confirmed'].includes(b.status);

            return (
              <div
                key={b._id}
                className="glass-card"
                style={{
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                {/* Hotel & Reference */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--primary-gold-light)',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {b.bookingNumber}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{b.hotelId?.name || 'Hotel Property'}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {b.hotelId?.city} &bull; {b.roomTypeId?.name}
                  </p>
                </div>

                {/* Dates & Stay Details */}
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Stay Window
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {checkInDate.toLocaleDateString()} &rarr; {checkOutDate.toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {b.pricingSnapshot?.nights} Night{b.pricingSnapshot?.nights > 1 ? 's' : ''} &bull; {b.guestCount} Guest{b.guestCount > 1 ? 's' : ''}
                    {b.assignedRoomId && ` &bull; Room ${b.assignedRoomId.roomNumber}`}
                  </div>
                </div>

                {/* Financial Total */}
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Locked Total (incl. GST)
                  </span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }} className="font-gold">
                    ${b.pricingSnapshot?.totalAmount?.toFixed(2)}
                  </div>
                  {b.pricingSnapshot?.appliedMultiplier > 1 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Rule: {b.pricingSnapshot.ruleApplied}
                    </span>
                  )}
                  {b.status === 'Cancelled' && b.cancellationDetails && (
                    <span style={{ fontSize: '0.74rem', color: '#34D399', display: 'block' }}>
                      Refund: ${b.cancellationDetails.refundAmount?.toFixed(2)} ({b.cancellationDetails.refundPercentage}%)
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
                  {canConfirm && (
                    <button
                      onClick={() => handleConfirm(b._id)}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={15} /> Confirm Reservation
                    </button>
                  )}

                  <button
                    onClick={() => setInvoiceBookingId(b._id)}
                    className="btn btn-secondary btn-sm"
                  >
                    <FileText size={15} /> Tax Invoice
                  </button>

                  {canCancel && (
                    <button
                      onClick={() => setCancelModalBooking(b)}
                      className="btn btn-danger btn-sm"
                    >
                      <XCircle size={15} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceBookingId && (
        <InvoiceModal
          bookingId={invoiceBookingId}
          onClose={() => setInvoiceBookingId(null)}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="modal-overlay" onClick={() => setCancelModalBooking(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AlertTriangle size={24} style={{ color: '#F43F5E' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Cancel Reservation?</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Are you sure you wish to cancel booking <strong>{cancelModalBooking.bookingNumber}</strong> at {cancelModalBooking.hotelId?.name}?
            </p>

            {/* Refund Policy Matrix Reminder */}
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                marginBottom: '20px'
              }}
            >
              <strong style={{ color: 'var(--primary-gold-light)' }}>Refund Policy Schedule:</strong>
              <ul style={{ marginTop: '6px', paddingLeft: '18px', color: 'var(--text-secondary)' }}>
                <li>&ge; 48 hours prior to check-in: <strong>100% Refund</strong> ($0 Fee)</li>
                <li>24 to 48 hours prior to check-in: <strong>50% Refund</strong> (50% Fee)</li>
                <li>&lt; 24 hours prior to check-in: <strong>0% Refund</strong> (100% Fee)</li>
              </ul>
            </div>

            <div className="form-group">
              <label className="form-label">Cancellation Reason (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule change, personal reasons"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="btn btn-secondary"
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="btn btn-danger"
                disabled={cancelling}
              >
                {cancelling ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
