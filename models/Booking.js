const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../utils/constants');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'guestId is required'],
      index: true
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'hotelId is required'],
      index: true
    },
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'roomTypeId is required'],
      index: true
    },
    assignedRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
      index: true
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
      index: true
    },
    guestCount: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Guest count must be at least 1']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BOOKING_STATUS),
        message: 'Booking status `{VALUE}` is not supported'
      },
      default: BOOKING_STATUS.RESERVED,
      index: true
    },
    statusHistory: [
      {
        fromStatus: { type: String },
        toStatus: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String }
      }
    ],

    // Locked Dynamic Pricing Snapshot at time of booking
    pricingSnapshot: {
      nights: { type: Number, required: true },
      basePricePerNight: { type: Number, required: true },
      appliedMultiplier: { type: Number, default: 1.0 },
      ruleApplied: { type: String, default: 'Standard Base Rate' },
      subtotal: { type: Number, required: true },
      taxRatePercent: { type: Number, default: 12 },
      taxAmount: { type: Number, required: true },
      totalAmount: { type: Number, required: true }
    },

    // Actual check-in / check-out timestamps
    actualCheckIn: { type: Date, default: null },
    actualCheckOut: { type: Date, default: null },

    // Cancellation & Refund tracking
    cancellationDetails: {
      cancelledAt: { type: Date },
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String },
      refundPercentage: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      cancellationFee: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Compound index for high performance date-overlap availability lookups
bookingSchema.index({
  hotelId: 1,
  roomTypeId: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
