const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const validate = require('../middleware/validate.middleware');
const {
  createBookingSchema,
  checkInSchema,
  cancelBookingSchema,
  getBookingsQuerySchema
} = require('../validators/booking.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

router.use(authenticateJWT);

// Guest booking history endpoint
router.get('/my-bookings', bookingController.getMyBookings);

// Booking creation
router.post(
  '/',
  authorizeRoles(USER_ROLES.GUEST, USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(createBookingSchema),
  bookingController.createBooking
);

// Staff and Admin list all bookings
router.get(
  '/',
  authorizeRoles(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(getBookingsQuerySchema),
  bookingController.getAllBookings
);

// Get single booking by ID
router.get('/:id', bookingController.getBookingById);

// Lifecycle Transitions
// 1. Reserved -> Confirmed
router.put(
  '/:id/confirm',
  authorizeRoles(USER_ROLES.GUEST, USER_ROLES.STAFF, USER_ROLES.ADMIN),
  bookingController.confirmBooking
);

// 2. Confirmed -> Checked-in (Staff / Admin only)
router.put(
  '/:id/checkin',
  authorizeRoles(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  validate(checkInSchema),
  bookingController.checkInBooking
);

// 3. Checked-in -> Checked-out (Staff / Admin only)
router.put(
  '/:id/checkout',
  authorizeRoles(USER_ROLES.STAFF, USER_ROLES.ADMIN),
  bookingController.checkOutBooking
);

// 4. Cancel Booking (Guest owner / Admin)
router.put(
  '/:id/cancel',
  authorizeRoles(USER_ROLES.GUEST, USER_ROLES.ADMIN),
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

module.exports = router;
