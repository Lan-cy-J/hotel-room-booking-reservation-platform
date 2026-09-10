import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  Calendar, 
  Users, 
  Sparkles, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Building,
  ShieldCheck
} from 'lucide-react';

export const BookingModal = ({ roomType, hotel, initialDates, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(initialDates?.checkIn || new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState(
    initialDates?.checkOut ||
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [guestCount, setGuestCount] = useState(1);
  const [pricingEstimate, setPricingEstimate] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Recalculate price whenever dates change
  useEffect(() => {
    if (!roomType || !checkIn || !checkOut) return;

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-out date must be strictly after check-in date');
      setPricingEstimate(null);
      return;
    }

    setError(null);
    const fetchPricing = async () => {
      try {
        setLoadingPrice(true);
        const res = await api.availability.check({
          roomTypeId: roomType._id || roomType.id,
          checkIn,
          checkOut
        });
        if (res.success && res.data) {
          setPricingEstimate(res.data.pricingEstimate);
        }
      } catch (err) {
        console.warn('Live pricing check error:', err.message);
      } finally {
        setLoadingPrice(false);
      }
    };

    fetchPricing();
  }, [roomType, checkIn, checkOut]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-out date must be strictly after check-in date');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        hotelId: hotel._id || hotel.id,
        roomTypeId: roomType._id || roomType.id,
        checkIn,
        checkOut,
        guestCount: Number(guestCount)
      };

      const res = await api.bookings.create(payload);
      if (res.success && res.data) {
        setBookingSuccess(res.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.message || 'Booking reservation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmImmediately = async () => {
    if (!bookingSuccess) return;
    try {
      setSubmitting(true);
      await api.bookings.confirm(bookingSuccess._id);
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message || 'Failed to confirm booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!roomType) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }} className="gradient-text">
              {bookingSuccess ? 'Reservation Confirmed!' : 'Reserve Your Stay'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {hotel?.name} &bull; {roomType.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {bookingSuccess ? (
          <div>
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <CheckCircle size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34D399', marginBottom: '6px' }}>
                Booking Reserved!
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Your booking reference number is:
              </p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: 'var(--primary-gold-light)',
                  border: '1px solid var(--border-gold)'
                }}
              >
                {bookingSuccess.bookingNumber}
              </span>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-reserved">Reserved</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Stay Dates:</span>
                <span>{new Date(checkIn).toLocaleDateString()} &rarr; {new Date(checkOut).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Locked Total:</span>
                <span className="font-gold">${bookingSuccess.pricingSnapshot?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => navigate('/my-bookings')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                View in My Bookings
              </button>
              <button
                onClick={handleConfirmImmediately}
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Confirming...' : 'Confirm Now'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#FECDD3',
                  fontSize: '0.88rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Check-In
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={checkIn}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Check-Out
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} /> Guests
              </label>
              <select
                className="form-select"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              >
                {Array.from({ length: roomType.capacity || 2 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'Guest' : 'Guests'} (Max {roomType.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Pricing Breakdown Card */}
            <div
              style={{
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-gold-light)' }}>
                  Pricing Snapshot (Auto-Locked)
                </span>
                {pricingEstimate?.appliedMultiplier > 1 && (
                  <span className="badge badge-cleaning" style={{ fontSize: '0.7rem' }}>
                    <Sparkles size={11} /> {pricingEstimate.ruleApplied}
                  </span>
                )}
              </div>

              {loadingPrice ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculating dynamic rate...</div>
              ) : pricingEstimate ? (
                <div style={{ fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Base Rate ({pricingEstimate.nights} night{pricingEstimate.nights > 1 ? 's' : ''} &times; ${pricingEstimate.basePricePerNight}):
                    </span>
                    <span>${(pricingEstimate.basePricePerNight * pricingEstimate.nights).toFixed(2)}</span>
                  </div>

                  {pricingEstimate.appliedMultiplier !== 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--primary-gold-light)' }}>
                      <span>Seasonal Surcharge ({pricingEstimate.appliedMultiplier}x):</span>
                      <span>+${(pricingEstimate.subtotal - pricingEstimate.basePricePerNight * pricingEstimate.nights).toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    <span>Taxes & Fees (12% GST):</span>
                    <span>${pricingEstimate.taxAmount.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      marginTop: '8px',
                      borderTop: '1px dashed var(--border-gold)',
                      fontWeight: 800,
                      fontSize: '1.05rem'
                    }}
                  >
                    <span>Total Amount:</span>
                    <span className="font-gold" style={{ fontSize: '1.25rem' }}>
                      ${pricingEstimate.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Select valid dates to calculate pricing.</div>
              )}
            </div>

            {/* Cancellation Policy Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}
            >
              <ShieldCheck size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Flexible Cancellation:</strong> 100% refund up to 48 hours prior to check-in; 50% refund between 24 and 48 hours.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || loadingPrice || !pricingEstimate}
              >
                {submitting ? 'Locking Reservation...' : 'Confirm & Reserve'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
