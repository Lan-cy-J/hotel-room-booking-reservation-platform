import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  DollarSign, 
  Building, 
  Bed, 
  Users, 
  Sparkles, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Percent,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, OCCUPANCY, REVENUE, PRICING
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Occupancy Report
  const [occupancyReport, setOccupancyReport] = useState(null);
  const [occStartDate, setOccStartDate] = useState('2026-06-01');
  const [occEndDate, setOccEndDate] = useState('2026-06-30');
  const [loadingOcc, setLoadingOcc] = useState(false);

  // Revenue Report
  const [revenueReport, setRevenueReport] = useState(null);
  const [revStartDate, setRevStartDate] = useState('2026-01-01');
  const [revEndDate, setRevEndDate] = useState('2026-12-31');
  const [loadingRev, setLoadingRev] = useState(false);

  // Pricing Rules
  const [pricingRules, setPricingRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [hotelsList, setHotelsList] = useState([]);

  // New Rule Form
  const [newRuleData, setNewRuleData] = useState({
    hotelId: '',
    name: '',
    season: 'peak',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    multiplier: 1.25
  });

  const fetchDashboard = async () => {
    try {
      setLoadingMetrics(true);
      const res = await api.reports.getDashboard();
      if (res.success && res.data) {
        setDashboardMetrics(res.data);
      }
    } catch (err) {
      console.warn('Dashboard summary error:', err.message);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchOccupancy = async () => {
    try {
      setLoadingOcc(true);
      const res = await api.reports.getOccupancy({
        startDate: occStartDate,
        endDate: occEndDate
      });
      if (res.success && res.data) {
        setOccupancyReport(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch occupancy report');
    } finally {
      setLoadingOcc(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      setLoadingRev(true);
      const res = await api.reports.getRevenue({
        startDate: revStartDate,
        endDate: revEndDate
      });
      if (res.success && res.data) {
        setRevenueReport(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch revenue report');
    } finally {
      setLoadingRev(false);
    }
  };

  const fetchPricingRules = async () => {
    try {
      setLoadingRules(true);
      const [rulesRes, hotelsRes] = await Promise.all([
        api.pricingRules.getAll(),
        api.hotels.getAll()
      ]);
      if (rulesRes.success) setPricingRules(rulesRes.data || []);
      if (hotelsRes.success && hotelsRes.data?.length > 0) {
        setHotelsList(hotelsRes.data);
        setNewRuleData((prev) => ({ ...prev, hotelId: hotelsRes.data[0]._id }));
      }
    } catch (err) {
      console.warn('Pricing rules error:', err.message);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboard();
      fetchOccupancy();
      fetchRevenue();
      fetchPricingRules();
    }
  }, [user]);

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const res = await api.pricingRules.create(newRuleData);
      if (res.success) {
        setShowCreateRuleModal(false);
        fetchPricingRules();
      }
    } catch (err) {
      alert(err.message || 'Failed to create pricing rule');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Admin Header */}
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
          <span className="badge badge-maintenance" style={{ marginBottom: '6px' }}>
            Executive Headquarters Console
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Platform Analytics & Governance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            MongoDB aggregation intelligence, real-time occupancy rates, and revenue engine.
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '5px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '4px'
          }}
        >
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'DASHBOARD' ? '#A855F7' : 'transparent',
              color: activeTab === 'DASHBOARD' ? '#FFF' : 'var(--text-secondary)'
            }}
          >
            Overview KPIs
          </button>
          <button
            onClick={() => setActiveTab('OCCUPANCY')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'OCCUPANCY' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'OCCUPANCY' ? '#070B19' : 'var(--text-secondary)'
            }}
          >
            Occupancy Report
          </button>
          <button
            onClick={() => setActiveTab('REVENUE')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'REVENUE' ? '#34D399' : 'transparent',
              color: activeTab === 'REVENUE' ? '#070B19' : 'var(--text-secondary)'
            }}
          >
            Revenue Aggregation
          </button>
          <button
            onClick={() => setActiveTab('PRICING')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'PRICING' ? 'var(--primary-gold)' : 'transparent',
              color: activeTab === 'PRICING' ? '#070B19' : 'var(--text-secondary)'
            }}
          >
            Pricing Rules
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE KPI DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div>
          {loadingMetrics ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading KPI metrics...</div>
          ) : dashboardMetrics ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary-gold-light)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Net Revenue</span>
                  <DollarSign size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }} className="font-gold">
                  ${dashboardMetrics.totalNetRevenue?.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  All properties after refund deductions
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--accent-blue)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Bookings</span>
                  <BarChart3 size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {dashboardMetrics.totalBookings}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Lifetime system reservations
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34D399', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Active In-House</span>
                  <Users size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34D399' }}>
                  {dashboardMetrics.activeCheckedInGuests}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Currently checked-in guests
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F43F5E', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>Rooms Needing Cleaning</span>
                  <Bed size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F43F5E' }}>
                  {dashboardMetrics.roomsRequiringCleaning}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Dirty / Cleaning in progress
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: OCCUPANCY REPORT (AGGREGATION) */}
      {activeTab === 'OCCUPANCY' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Occupancy Rate Analytics</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Calculated as (Total Occupied Room Nights / Total Available Room Nights) &times; 100
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); fetchOccupancy(); }}
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '8px 12px' }}
                  value={occStartDate}
                  onChange={(e) => setOccStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '8px 12px' }}
                  value={occEndDate}
                  onChange={(e) => setOccEndDate(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loadingOcc} style={{ height: '38px' }}>
                {loadingOcc ? 'Calculating...' : 'Run Query'}
              </button>
            </form>
          </div>

          {occupancyReport ? (
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Hotel Property</th>
                  <th>Location</th>
                  <th>Total Physical Rooms</th>
                  <th>Available Room-Nights</th>
                  <th>Occupied Nights</th>
                  <th style={{ textAlign: 'right' }}>Occupancy Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {occupancyReport.occupancyByHotel?.map((h) => (
                  <tr key={h.hotelId}>
                    <td style={{ fontWeight: 700 }}>{h.hotelName}</td>
                    <td>{h.city}</td>
                    <td>{h.totalRooms} rooms</td>
                    <td>{h.totalAvailableRoomNights} nights</td>
                    <td>{h.totalOccupiedNights} nights</td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: h.occupancyRatePercent > 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: h.occupancyRatePercent > 70 ? '#34D399' : '#38BDF8',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: '0.85rem'
                        }}
                      >
                        {h.occupancyRatePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading occupancy data...</div>
          )}
        </div>
      )}

      {/* TAB 3: REVENUE REPORT (AGGREGATION) */}
      {activeTab === 'REVENUE' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Financial & Revenue Aggregation</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                MongoDB Pipeline: Gross Revenue, 12% GST Tax, Cancellations, Refunds, and Net Revenue.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); fetchRevenue(); }}
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '8px 12px' }}
                  value={revStartDate}
                  onChange={(e) => setRevStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '8px 12px' }}
                  value={revEndDate}
                  onChange={(e) => setRevEndDate(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loadingRev} style={{ height: '38px' }}>
                {loadingRev ? 'Aggregating...' : 'Run Pipeline'}
              </button>
            </form>
          </div>

          {revenueReport ? (
            <div>
              {/* Grand Totals Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: 'rgba(212, 175, 55, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-gold)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Bookings</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{revenueReport.summary?.totalBookings}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Revenue</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>${revenueReport.summary?.grossRevenue?.toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Refunds</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F43F5E' }}>-${revenueReport.summary?.totalRefunds?.toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Revenue</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800 }} className="font-gold">${revenueReport.summary?.netRevenue?.toFixed(2)}</div>
                </div>
              </div>

              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>Hotel Property</th>
                    <th>City</th>
                    <th>Bookings</th>
                    <th>Gross ($)</th>
                    <th>Tax (GST) ($)</th>
                    <th>Refunds ($)</th>
                    <th style={{ textAlign: 'right' }}>Net Revenue ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueReport.breakdownByHotel?.map((h) => (
                    <tr key={h.hotelId}>
                      <td style={{ fontWeight: 700 }}>{h.hotelName}</td>
                      <td>{h.city}</td>
                      <td>{h.totalBookings} (Active: {h.completedOrActiveBookings})</td>
                      <td>${h.grossRevenue?.toFixed(2)}</td>
                      <td>${h.totalTaxCollected?.toFixed(2)}</td>
                      <td style={{ color: '#F43F5E' }}>-${h.totalRefunds?.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }} className="font-gold">
                        ${h.netRevenue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading revenue aggregation...</div>
          )}
        </div>
      )}

      {/* TAB 4: DYNAMIC PRICING RULES */}
      {activeTab === 'PRICING' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dynamic Seasonal Pricing Multipliers</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Multipliers are automatically evaluated at booking time and permanently snapshotted into the booking document.
              </p>
            </div>
            <button onClick={() => setShowCreateRuleModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add Pricing Multiplier
            </button>
          </div>

          {loadingRules ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading pricing rules...</div>
          ) : (
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Hotel</th>
                  <th>Season</th>
                  <th>Effective Dates</th>
                  <th>Multiplier</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pricingRules.map((rule) => (
                  <tr key={rule._id}>
                    <td style={{ fontWeight: 700 }}>{rule.name}</td>
                    <td>{rule.hotelId?.name || 'All Hotels'}</td>
                    <td>
                      <span className="badge badge-cleaning" style={{ textTransform: 'uppercase' }}>
                        {rule.season}
                      </span>
                    </td>
                    <td>
                      {new Date(rule.startDate).toLocaleDateString()} &rarr; {new Date(rule.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-gold-light)', fontSize: '1.05rem' }}>
                      {rule.multiplier}x
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-clean">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Pricing Rule Modal */}
      {showCreateRuleModal && (
        <div className="modal-overlay" onClick={() => setShowCreateRuleModal(false)}>
          <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
              Create Dynamic Pricing Rule
            </h3>

            <form onSubmit={handleCreateRule}>
              <div className="form-group">
                <label className="form-label">Target Hotel</label>
                <select
                  className="form-select"
                  value={newRuleData.hotelId}
                  onChange={(e) => setNewRuleData({ ...newRuleData, hotelId: e.target.value })}
                  required
                >
                  {hotelsList.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Rule Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRuleData.name}
                  onChange={(e) => setNewRuleData({ ...newRuleData, name: e.target.value })}
                  placeholder="e.g. Summer Weekend Surcharge"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Season Category</label>
                <select
                  className="form-select"
                  value={newRuleData.season}
                  onChange={(e) => setNewRuleData({ ...newRuleData, season: e.target.value })}
                >
                  <option value="peak">Peak</option>
                  <option value="weekend">Weekend</option>
                  <option value="holiday">Holiday</option>
                  <option value="regular">Regular</option>
                  <option value="off-peak">Off-Peak</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newRuleData.startDate}
                    onChange={(e) => setNewRuleData({ ...newRuleData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newRuleData.endDate}
                    onChange={(e) => setNewRuleData({ ...newRuleData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Multiplier (e.g. 1.25 = +25% surcharge)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="5.0"
                  className="form-input"
                  value={newRuleData.multiplier}
                  onChange={(e) => setNewRuleData({ ...newRuleData, multiplier: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateRuleModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
