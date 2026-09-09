const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const availabilityService = require('./availability.service');
const pricingService = require('./pricing.service');
const cancellationService = require('./cancellation.service');
const ApiError = require('../utils/apiError');
const { generateBookingNumber } = require('../utils/bookingNumberGenerator');
const {
  BOOKING_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
  HOUSEKEEPING_STATUS,
  USER_ROLES
} = require('../utils/constants');
const { normalizeDate } = require('../utils/dateUtils');

class BookingService {
  /**
   * Finite State Machine status transition validator
   */
  validateStatusTransition(currentStatus, targetStatus) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw ApiError.badRequest(
        `Invalid booking status transition: Cannot transition from '${currentStatus}' to '${targetStatus}'. Allowed target statuses: [${allowed.join(', ')}]`
      );
    }
  }

  /**
   * Create a new reservation
   */
  async createBooking(bookingData, user) {
    const { hotelId, roomTypeId, checkIn, checkOut, guestCount } = bookingData;

    // Determine target guestId
    let guestId = user._id;
    if (bookingData.guestId && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.STAFF)) {
      guestId = bookingData.guestId;
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      throw ApiError.notFound('Hotel not found or is inactive');
    }

    const roomType = await RoomType.findOne({ _id: roomTypeId, hotelId, isActive: true });
    if (!roomType) {
      throw ApiError.notFound('Room type not found in the specified hotel');
    }

    if (guestCount > roomType.capacity) {
      throw ApiError.badRequest(
        `Guest count (${guestCount}) exceeds room capacity (${roomType.capacity})`
      );
    }

    // Step 1: Real-time availability check to prevent overbooking
    const occupiedCount = await availabilityService.getOverlappingBookingsCount(
      roomTypeId,
      checkIn,
      checkOut
    );

    const availableRooms = roomType.totalRooms - occupiedCount;
    if (availableRooms <= 0) {
      throw ApiError.conflict(
        `No rooms available for '${roomType.name}' between ${new Date(checkIn).toISOString().slice(0, 10)} and ${new Date(checkOut).toISOString().slice(0, 10)}. Fully booked.`
      );
    }

    // Step 2: Calculate dynamic pricing snapshot
    const pricingSnapshot = await pricingService.calculateBookingPricing(
      hotelId,
      roomTypeId,
      roomType.basePrice,
      checkIn,
      checkOut
    );

    // Step 3: Create Booking with locked snapshot
    const bookingNumber = generateBookingNumber();
    const normCheckIn = normalizeDate(checkIn);
    const normCheckOut = normalizeDate(checkOut);

    const booking = await Booking.create({
      bookingNumber,
      guestId,
      hotelId,
      roomTypeId,
      checkIn: normCheckIn,
      checkOut: normCheckOut,
      guestCount,
      status: BOOKING_STATUS.RESERVED,
      pricingSnapshot,
      statusHistory: [
        {
          fromStatus: null,
          toStatus: BOOKING_STATUS.RESERVED,
          changedAt: new Date(),
          changedBy: user._id,
          note: 'Initial reservation created'
        }
      ]
    });

    return await booking.populate([
      { path: 'hotelId', select: 'name city address rating' },
      { path: 'roomTypeId', select: 'name capacity amenities' },
      { path: 'guestId', select: 'name email phone' }
    ]);
  }

  /**
   * Get single booking by ID with ownership enforcement
   */
  async getBookingById(id, user) {
    const booking = await Booking.findById(id).populate([
      { path: 'hotelId', select: 'name city address contactPhone contactEmail' },
      { path: 'roomTypeId', select: 'name capacity basePrice amenities' },
      { path: 'guestId', select: 'name email phone' },
      { path: 'assignedRoomId', select: 'roomNumber floor housekeepingStatus' }
    ]);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Guest ownership check
    if (user.role === USER_ROLES.GUEST && booking.guestId._id.toString() !== user._id.toString()) {
      throw ApiError.forbidden('Access denied: You can only view your own bookings');
    }

    // Staff scoping check
    if (user.role === USER_ROLES.STAFF && booking.hotelId._id.toString() !== user.hotelId.toString()) {
      throw ApiError.forbidden('Staff cannot access bookings belonging to another hotel');
    }

    return booking;
  }

  /**
   * Get all bookings (with role scoping and filters)
   */
  async getAllBookings(query = {}, user) {
    const filter = {};

    if (user.role === USER_ROLES.GUEST) {
      filter.guestId = user._id;
    } else if (user.role === USER_ROLES.STAFF) {
      filter.hotelId = user.hotelId;
    } else if (query.hotelId) {
      filter.hotelId = query.hotelId;
    }

    if (query.guestId && user.role !== USER_ROLES.GUEST) {
      filter.guestId = query.guestId;
    }
    if (query.roomTypeId) {
      filter.roomTypeId = query.roomTypeId;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.startDate && query.endDate) {
      filter.checkIn = { $gte: normalizeDate(query.startDate) };
      filter.checkOut = { $lte: normalizeDate(query.endDate) };
    }

    return await Booking.find(filter)
      .populate('hotelId', 'name city')
      .populate('roomTypeId', 'name capacity')
      .populate('guestId', 'name email')
      .populate('assignedRoomId', 'roomNumber floor housekeepingStatus')
      .sort({ createdAt: -1 });
  }

  /**
   * Transition: Reserved -> Confirmed
   */
  async confirmBooking(id, user) {
    const booking = await this.getBookingById(id, user);

    this.validateStatusTransition(booking.status, BOOKING_STATUS.CONFIRMED);

    booking.status = BOOKING_STATUS.CONFIRMED;
    booking.statusHistory.push({
      fromStatus: BOOKING_STATUS.RESERVED,
      toStatus: BOOKING_STATUS.CONFIRMED,
      changedAt: new Date(),
      changedBy: user._id,
      note: 'Booking confirmed'
    });

    await booking.save();
    return booking;
  }

  /**
   * Transition: Confirmed -> Checked-in (Staff/Admin only)
   */
  async checkInBooking(id, checkInData, user) {
    const { assignedRoomId } = checkInData;
    const booking = await Booking.findById(id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Staff scoping
    if (user.role === USER_ROLES.STAFF && booking.hotelId.toString() !== user.hotelId.toString()) {
      throw ApiError.forbidden('Staff can only check-in bookings for their assigned hotel');
    }

    this.validateStatusTransition(booking.status, BOOKING_STATUS.CHECKED_IN);

    // Verify physical room
    const room = await Room.findById(assignedRoomId);
    if (!room) {
      throw ApiError.notFound('Assigned physical room not found');
    }

    if (room.hotelId.toString() !== booking.hotelId.toString()) {
      throw ApiError.badRequest('Assigned room does not belong to the booking hotel');
    }

    if (room.roomTypeId.toString() !== booking.roomTypeId.toString()) {
      throw ApiError.badRequest('Assigned room type does not match booking room type');
    }

    // Housekeeping check: Room must be clean to check in
    if (room.housekeepingStatus !== HOUSEKEEPING_STATUS.CLEAN) {
      throw ApiError.badRequest(
        `Cannot assign room ${room.roomNumber} for check-in because its housekeeping status is '${room.housekeepingStatus}'. Room must be 'clean'.`
      );
    }

    booking.status = BOOKING_STATUS.CHECKED_IN;
    booking.assignedRoomId = room._id;
    booking.actualCheckIn = new Date();
    booking.statusHistory.push({
      fromStatus: BOOKING_STATUS.CONFIRMED,
      toStatus: BOOKING_STATUS.CHECKED_IN,
      changedAt: new Date(),
      changedBy: user._id,
      note: `Checked-in to physical room ${room.roomNumber}`
    });

    await booking.save();

    return await this.getBookingById(id, user);
  }

  /**
   * Transition: Checked-in -> Checked-out (Staff/Admin only)
   */
  async checkOutBooking(id, user) {
    const booking = await Booking.findById(id);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Staff scoping
    if (user.role === USER_ROLES.STAFF && booking.hotelId.toString() !== user.hotelId.toString()) {
      throw ApiError.forbidden('Staff can only check-out bookings for their assigned hotel');
    }

    this.validateStatusTransition(booking.status, BOOKING_STATUS.CHECKED_OUT);

    booking.status = BOOKING_STATUS.CHECKED_OUT;
    booking.actualCheckOut = new Date();
    booking.statusHistory.push({
      fromStatus: BOOKING_STATUS.CHECKED_IN,
      toStatus: BOOKING_STATUS.CHECKED_OUT,
      changedAt: new Date(),
      changedBy: user._id,
      note: 'Checked-out successfully'
    });

    await booking.save();

    // Trigger housekeeping state update: Set assigned room to 'dirty'
    if (booking.assignedRoomId) {
      await Room.findByIdAndUpdate(booking.assignedRoomId, {
        housekeepingStatus: HOUSEKEEPING_STATUS.DIRTY
      });
    }

    return await this.getBookingById(id, user);
  }

  /**
   * Transition: Reserved/Confirmed -> Cancelled (Guest owner / Admin)
   */
  async cancelBooking(id, cancelData, user) {
    const booking = await Booking.findById(id);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Ownership check
    if (user.role === USER_ROLES.GUEST && booking.guestId.toString() !== user._id.toString()) {
      throw ApiError.forbidden('You can only cancel your own bookings');
    }

    this.validateStatusTransition(booking.status, BOOKING_STATUS.CANCELLED);

    // Calculate refund according to policy
    const refundInfo = cancellationService.calculateRefund(booking);

    const prevStatus = booking.status;
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      cancelledBy: user._id,
      reason: cancelData.reason || 'Cancelled by user',
      refundPercentage: refundInfo.refundPercentage,
      refundAmount: refundInfo.refundAmount,
      cancellationFee: refundInfo.cancellationFee
    };

    booking.statusHistory.push({
      fromStatus: prevStatus,
      toStatus: BOOKING_STATUS.CANCELLED,
      changedAt: new Date(),
      changedBy: user._id,
      note: `Cancelled. Refund: $${refundInfo.refundAmount} (${refundInfo.refundPercentage}%), Fee: $${refundInfo.cancellationFee}`
    });

    await booking.save();

    return {
      booking: await this.getBookingById(id, user),
      refundSummary: refundInfo
    };
  }
}

module.exports = new BookingService();
