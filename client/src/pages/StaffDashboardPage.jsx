import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Building2, 
  LogIn, 
  LogOut, 
  Sparkles, 
  BedDouble, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';

export const StaffDashboardPage = () => {
  const { user, isStaff, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('FRONTDESK'); // FRONTDESK or HOUSEKEEPING

  // Frontdesk Bookings
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Housekeeping Rooms
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Check-In Modal
  const [checkInBooking, setCheckInBooking] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  // Notifications
  const [notification, setNotification] = useState(null);

  const staffHotelId = user?.hotelId?._id || user?.hotelId;

  // Load Bookings for Staff's Hotel
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.bookings.getAll({
        hotelId: staffHotelId
      });
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch staff bookings:', err.message);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load Physical Rooms for Staff's Hotel
  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await api.housekeeping.getRooms({
        hotelId: staffHotelId
      });
      if (res.success && res.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch rooms:', err.message);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (user && (isStaff || isAdmin)) {
      fetchBookings();
      fetchRooms();
    }
  }, [user]);

  // Open Check-In Modal: fetch physical rooms matching roomType
  const handleOpenCheckIn = async (booking) => {
    setCheckInBooking(booking);
    setCheckInError(null);
    setSelectedRoomId('');

    try {
      const res = await api.rooms.getAll({
        hotelId: booking.hotelId?._id || booking.hotelId,
        roomTypeId: booking.roomTypeId?._id || booking.roomTypeId
      });
      if (res.success && res.data) {
        setAvailableRooms(res.data);
        // Pre-select first clean room
        const firstClean = res.data.find((r) => r.housekeepingStatus === 'clean');
        if (firstClean) setSelectedRoomId(firstClean._id);
      }
    } catch (err) {
      setCheckInError('Failed to fetch rooms for assignment');
    }
  };

  // Execute Check-in
  const handleExecuteCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInBooking || !selectedRoomId) return;

    try {
      setCheckingIn(true);
      setCheckInError(null);

      const res = await api.bookings.checkIn(checkInBooking._id, {
        assignedRoomId: selectedRoomId
      });

      if (res.success) {
        setNotification(`Guest ${checkInBooking.guestId?.name} checked-in successfully!`);
        setCheckInBooking(null);
        fetchBookings();
        fetchRooms();
      }
    } catch (err) {
      setCheckInError(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  // Execute Check-out
  const handleExecuteCheckOut = async (booking) => {
    if (!window.confirm(`Check out guest ${booking.guestId?.name}? This will automatically mark room as 'dirty'.`)) {
      return;
    }

    try {
      const res = await api.bookings.checkOut(booking._id);
      if (res.success) {
        setNotification(`Guest checked out. Room is now flagged as 'dirty' for housekeeping.`);
        fetchBookings();
        fetchRooms();
      }
    } catch (err) {
      alert(err.message || 'Check-out failed');
    }
  };

  // Update Housekeeping Status
  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      const res = await api.housekeeping.updateStatus(roomId, {
        housekeepingStatus: newStatus
      });
      if (res.success) {
        setNotification(`Room status updated to '${newStatus}'.`);
        fetchRooms();
      }
    } catch (err) {
      alert(err.message || 'Failed to update housekeeping status');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Staff Scope Header */}
      <div
        className="glass-card"
        style={{
          padding: '24px 30px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          border: '1px solid var(--border-gold)'
        }}
      >
        <div>
          <span className="badge badge-checked-in" style={{ marginBottom: '6px' }}>
            Frontdesk & Operations Console
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
            {user?.hotelId?.name || (isAdmin ? 'Global Property Console' : 'Assigned Hotel Operations')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Logged in as <strong>{user?.name}</strong> &bull; Scoped Hotel:{' '}
            <span className="font-gold">{user?.hotelId?.city || (isAdmin ? 'All Locations' : 'N/A')}</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '5px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <button
            onClick={() => setActiveTab('FRONTDESK')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'FRONTDESK' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'FRONTDESK' ? '#070B19' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogIn size={16} /> Check-In & Check-Out
          </button>
          <button
            onClick={() => setActiveTab('HOUSEKEEPING')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'HOUSEKEEPING' ? '#34D399' : 'transparent',
              color: activeTab === 'HOUSEKEEPING' ? '#070B19' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} /> Housekeeping Board
          </button>
        </div>
      </div>

      {notification && (
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
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* TAB 1: FRONT-DESK CHECK-IN / CHECK-OUT */}
      {activeTab === 'FRONTDESK' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Active Guest Reservations</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Verify cleanliness, assign physical rooms, check-in guests, and process check-outs.
              </p>
            </div>
            <button onClick={fetchBookings} className="btn btn-secondary btn-sm">
              Refresh
            </button>
          </div>

          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              Loading reservations...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No active reservations found for this property.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Guest</th>
                    <th>Room Type</th>
                    <th>Stay Window</th>
                    <th>Assigned Room</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const isConfirmed = b.status === 'Confirmed';
                    const isCheckedIn = b.status === 'Checked-in';

                    return (
                      <tr key={b._id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-gold-light)' }}>
                          {b.bookingNumber}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.guestId?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.guestId?.email}</div>
                        </td>
                        <td>
                          <div>{b.roomTypeId?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.guestCount} Guest(s)</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.88rem' }}>
                            {new Date(b.checkIn).toLocaleDateString()} &rarr; {new Date(b.checkOut).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {b.pricingSnapshot?.nights} night(s)
                          </div>
                        </td>
                        <td>
                          {b.assignedRoomId ? (
                            <span style={{ fontWeight: 700, color: '#38BDF8' }}>
                              Room {b.assignedRoomId.roomNumber} (Fl {b.assignedRoomId.floor})
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Not Assigned</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={b.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {isConfirmed && (
                            <button
                              onClick={() => handleOpenCheckIn(b)}
                              className="btn btn-primary btn-sm"
                            >
                              <LogIn size={14} /> Check-In
                            </button>
                          )}
                          {isCheckedIn && (
                            <button
                              onClick={() => handleExecuteCheckOut(b)}
                              className="btn btn-danger btn-sm"
                            >
                              <LogOut size={14} /> Check-Out
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOUSEKEEPING BOARD */}
      {activeTab === 'HOUSEKEEPING' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Physical Room Inventory & Cleanliness</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Rooms must be in <span style={{ color: '#34D399', fontWeight: 700 }}>Clean</span> state before front-desk check-in can proceed.
              </p>
            </div>
            <button onClick={fetchRooms} className="btn btn-secondary btn-sm">
              Refresh Board
            </button>
          </div>

          {loadingRooms ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              Loading housekeeping rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No rooms registered for this property yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {rooms.map((room) => {
                const status = room.housekeepingStatus;

                return (
                  <div
                    key={room._id}
                    style={{
                      padding: '18px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${
                        status === 'clean'
                          ? 'rgba(16, 185, 129, 0.4)'
                          : status === 'dirty'
                          ? 'rgba(244, 63, 94, 0.4)'
                          : status === 'cleaning'
                          ? 'rgba(245, 158, 11, 0.4)'
                          : 'rgba(168, 85, 247, 0.4)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                          Room {room.roomNumber}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Floor {room.floor} &bull; {room.roomTypeId?.name}
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      Last Cleaned: {room.lastCleanedAt ? new Date(room.lastCleanedAt).toLocaleString() : 'N/A'}
                    </div>

                    {/* Quick State Toggle Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        onClick={() => handleUpdateStatus(room._id, 'clean')}
                        disabled={status === 'clean'}
                        className="btn btn-success btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px' }}
                      >
                        ✓ Mark Clean
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(room._id, 'dirty')}
                        disabled={status === 'dirty'}
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px' }}
                      >
                        ⚡ Mark Dirty
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(room._id, 'cleaning')}
                        disabled={status === 'cleaning'}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px' }}
                      >
                        ⏳ In Cleaning
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(room._id, 'maintenance')}
                        disabled={status === 'maintenance'}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px' }}
                      >
                        🔧 Maintenance
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Check-In Modal with Room Allocation */}
      {checkInBooking && (
        <div className="modal-overlay" onClick={() => setCheckInBooking(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
              Check-In Guest & Assign Physical Room
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Guest: <strong>{checkInBooking.guestId?.name}</strong> &bull; Room Type:{' '}
              <span className="font-gold">{checkInBooking.roomTypeId?.name}</span>
            </p>

            {checkInError && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid #F43F5E',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FECDD3',
                  fontSize: '0.85rem',
                  marginBottom: '16px'
                }}
              >
                {checkInError}
              </div>
            )}

            <form onSubmit={handleExecuteCheckIn}>
              <div className="form-group">
                <label className="form-label">
                  Select Clean Physical Room (Cleanliness Verified)
                </label>

                {availableRooms.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '12px 0' }}>
                    No physical rooms created for this room type.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {availableRooms.map((r) => {
                      const isClean = r.housekeepingStatus === 'clean';

                      return (
                        <label
                          key={r._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: selectedRoomId === r._id ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            border: `1px solid ${selectedRoomId === r._id ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                            cursor: isClean ? 'pointer' : 'not-allowed',
                            opacity: isClean ? 1 : 0.5
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="radio"
                              name="assignedRoom"
                              value={r._id}
                              checked={selectedRoomId === r._id}
                              disabled={!isClean}
                              onChange={(e) => setSelectedRoomId(e.target.value)}
                            />
                            <div>
                              <div style={{ fontWeight: 700 }}>Room {r.roomNumber}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor {r.floor}</div>
                            </div>
                          </div>

                          <StatusBadge status={r.housekeepingStatus} />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setCheckInBooking(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={checkingIn || !selectedRoomId}
                >
                  {checkingIn ? 'Checking In...' : 'Verify & Complete Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
