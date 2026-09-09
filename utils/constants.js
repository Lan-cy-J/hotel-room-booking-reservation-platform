const USER_ROLES = {
  GUEST: 'guest',
  STAFF: 'staff',
  ADMIN: 'admin'
};

const BOOKING_STATUS = {
  RESERVED: 'Reserved',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked-in',
  CHECKED_OUT: 'Checked-out',
  CANCELLED: 'Cancelled'
};

const HOUSEKEEPING_STATUS = {
  CLEAN: 'clean',
  DIRTY: 'dirty',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance'
};

const PRICING_SEASONS = {
  PEAK: 'peak',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
  REGULAR: 'regular',
  OFF_PEAK: 'off-peak'
};

// Allowed Finite State Machine transitions for booking status
const ALLOWED_STATUS_TRANSITIONS = {
  [BOOKING_STATUS.RESERVED]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CHECKED_IN]: [BOOKING_STATUS.CHECKED_OUT],
  [BOOKING_STATUS.CHECKED_OUT]: [],
  [BOOKING_STATUS.CANCELLED]: []
};

// Active statuses that occupy inventory (for availability calculation)
const ACTIVE_BOOKING_STATUSES = [
  BOOKING_STATUS.RESERVED,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN
];

module.exports = {
  USER_ROLES,
  BOOKING_STATUS,
  HOUSEKEEPING_STATUS,
  PRICING_SEASONS,
  ALLOWED_STATUS_TRANSITIONS,
  ACTIVE_BOOKING_STATUSES
};
