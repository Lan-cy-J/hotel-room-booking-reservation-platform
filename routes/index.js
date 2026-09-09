const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const hotelRoutes = require('./hotel.routes');
const roomTypeRoutes = require('./roomType.routes');
const roomRoutes = require('./room.routes');
const availabilityRoutes = require('./availability.routes');
const pricingRuleRoutes = require('./pricingRule.routes');
const bookingRoutes = require('./booking.routes');
const housekeepingRoutes = require('./housekeeping.routes');
const invoiceRoutes = require('./invoice.routes');
const reportRoutes = require('./report.routes');

// System Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Hotel Room Booking & Reservation API (P03)',
    modules: [
      'Auth & Guests',
      'Hotels',
      'Room Types',
      'Physical Rooms',
      'Availability Search Engine',
      'Dynamic Pricing Rules',
      'Booking Workflow & FSM Lifecycle',
      'Check-in / Check-out',
      'Housekeeping Management',
      'Cancellation & Refund Policy',
      'Guest Booking History',
      'Invoice Generation Summary',
      'Admin Occupancy & Revenue Reports'
    ]
  });
});

// Mount Module Routes
router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/room-types', roomTypeRoutes);
router.use('/rooms', roomRoutes);
router.use('/availability', availabilityRoutes);
router.use('/pricing-rules', pricingRuleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/housekeeping', housekeepingRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
