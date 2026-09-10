import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { BookingModal } from '../components/BookingModal';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Waves, 
  Coffee, 
  Check,
  Building,
  ArrowRight
} from 'lucide-react';

export const HomePage = () => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  const [hotels, setHotels] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Booking Modal State
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // Load all hotels on mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await api.hotels.getAll();
        if (res.success && res.data) {
          setHotels(res.data);
        }
      } catch (err) {
        console.warn('Failed to load hotels:', err.message);
      }
    };
    fetchHotels();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setSearching(true);
      setSearchError(null);

      const params = {
        checkIn,
        checkOut,
        guests: Number(guests)
      };
      if (city) {
        params.city = city;
      } else {
        // If no city selected, default to search first hotel or NY
        params.city = 'New York';
      }

      const res = await api.availability.search(params);
      if (res.success) {
        setSearchResults(res.data || []);
      } else {
        setSearchError(res.message || 'Availability lookup failed');
      }
    } catch (err) {
      setSearchError(err.message || 'Error checking room availability');
    } finally {
      setSearching(false);
    }
  };

  const openBooking = (roomData) => {
    setSelectedRoomType(roomData.roomType);
    setSelectedHotel(roomData.hotel);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 60px',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid var(--border-gold)',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--primary-gold-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '20px'
            }}
          >
            <Sparkles size={14} /> Premier Hospitality & Booking Engine
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 800,
              maxWidth: '900px',
              margin: '0 auto 20px',
              lineHeight: 1.15
            }}
          >
            Experience Unrivaled Luxury <br />
            <span className="gradient-text">Tailored to Perfection</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '650px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}
          >
            Real-time availability, dynamic seasonal pricing, atomic reservation guarantees, and verified immaculate rooms.
          </p>

          {/* Search Bar Floating Card */}
          <div
            className="glass-card"
            style={{
              maxWidth: '1020px',
              margin: '0 auto',
              padding: '24px',
              boxShadow: 'var(--shadow-lg), var(--shadow-gold)',
              border: '1px solid var(--border-gold)'
            }}
          >
            <form
              onSubmit={handleSearch}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
                gap: '16px',
                alignItems: 'end'
              }}
            >
              {/* Destination */}
              <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} className="font-gold" /> Destination
                </label>
                <select
                  className="form-select"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">All Destinations</option>
                  <option value="New York">New York, NY</option>
                  <option value="Los Angeles">Los Angeles, CA</option>
                </select>
              </div>

              {/* Check-In */}
              <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} className="font-gold" /> Check-In
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              {/* Check-Out */}
              <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} className="font-gold" /> Check-Out
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              {/* Guests */}
              <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} className="font-gold" /> Guests
                </label>
                <select
                  className="form-select"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={searching}
                style={{ height: '48px', whiteSpace: 'nowrap' }}
              >
                {searching ? (
                  'Checking...'
                ) : (
                  <>
                    <Search size={18} /> Find Available Rooms
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Search Results Area */}
      {searchResults !== null && (
        <section className="container" style={{ marginTop: '20px', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Available Rooms & Suites
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Live inventory matching your criteria ({checkIn} &rarr; {checkOut}, {guests} guest{guests > 1 ? 's' : ''})
              </p>
            </div>
            <span className="badge badge-available" style={{ fontSize: '0.85rem' }}>
              {searchResults.length} Option{searchResults.length === 1 ? '' : 's'} Found
            </span>
          </div>

          {searchError && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#FDA4AF', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              {searchError}
            </div>
          )}

          {searchResults.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}
            >
              <Building size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Rooms Available for These Dates
              </h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 20px' }}>
                All room inventory for this destination is fully reserved during your chosen date window. Please try adjusting your dates.
              </p>
              <button onClick={() => setCity('')} className="btn btn-secondary btn-sm">
                View All Available Properties
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {searchResults.map((item) => {
                const isFewRoomsLeft = item.roomType.availableRooms <= 3;

                return (
                  <div
                    key={item.roomType.id}
                    className="glass-card glass-card-interactive"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Card Header Banner */}
                    <div
                      style={{
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(13, 21, 45, 0.8) 100%)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--primary-gold-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.hotel.city} &bull; {item.hotel.name}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                          {item.roomType.name}
                        </h3>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#FBBF24'
                        }}
                      >
                        <Star size={13} fill="#FBBF24" /> {item.hotel.rating || 4.8}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                        {item.roomType.description || 'Luxuriously appointed accommodation featuring artisanal furnishings, premium bedding, and curated designer amenities.'}
                      </p>

                      {/* Amenities Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {(item.roomType.amenities || ['King Bed', 'City View', 'Fast WiFi', 'Minibar']).map((amenity, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Capacity & Availability Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: 'auto' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={14} /> Accommodates up to {item.roomType.capacity} Guests
                        </span>

                        <span
                          className={`badge ${isFewRoomsLeft ? 'badge-cleaning' : 'badge-available'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {isFewRoomsLeft ? `Only ${item.roomType.availableRooms} Left!` : `${item.roomType.availableRooms} Available`}
                        </span>
                      </div>

                      {/* Dynamic Pricing Footer */}
                      <div
                        style={{
                          paddingTop: '16px',
                          borderTop: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {item.pricing?.appliedMultiplier > 1 && (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.72rem',
                                color: 'var(--primary-gold-light)',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                marginBottom: '2px'
                              }}
                            >
                              ⚡ {item.pricing.appliedMultiplier}x Seasonal Rate
                            </span>
                          )}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.45rem', fontWeight: 800 }} className="font-gold">
                              ${item.roomType.basePricePerNight}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ night</span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Est. Total: ${(item.pricing?.totalAmount || item.roomType.basePricePerNight * (item.searchCriteria?.nights || 1) * 1.12).toFixed(2)} (incl. 12% GST)
                          </span>
                        </div>

                        <button
                          onClick={() => openBooking(item)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '10px 18px' }}
                        >
                          Book Now <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Featured Luxury Properties Section */}
      <section className="container" style={{ marginTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-gold-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Our Signature Flagships
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>
            World-Class Destinations
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '8px auto 0' }}>
            Each property is meticulously curated to deliver timeless elegance and bespoke hospitality.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className="glass-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                border: '1px solid var(--border-gold)',
                background: 'linear-gradient(180deg, rgba(17, 27, 54, 0.8) 0%, rgba(7, 11, 25, 0.95) 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge badge-clean" style={{ marginBottom: '6px' }}>
                    {hotel.city}
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{hotel.name}</h3>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--primary-gold-light)',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  <Star size={16} fill="var(--primary-gold-light)" /> {hotel.rating}
                </div>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {hotel.address}
              </p>

              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Property Highlights
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {hotel.amenities?.map((amenity, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setCity(hotel.city);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                  handleSearch();
                }}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Explore Rooms in {hotel.city}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedRoomType && (
        <BookingModal
          roomType={selectedRoomType}
          hotel={selectedHotel}
          initialDates={{ checkIn, checkOut }}
          onClose={() => setSelectedRoomType(null)}
          onSuccess={() => {
            // refresh search after booking
            handleSearch();
          }}
        />
      )}
    </div>
  );
};
