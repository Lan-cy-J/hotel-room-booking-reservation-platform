const mongoose = require('mongoose');
const { HOUSEKEEPING_STATUS } = require('../utils/constants');

const roomSchema = new mongoose.Schema(
  {
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
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true
    },
    floor: {
      type: Number,
      default: 1
    },
    housekeepingStatus: {
      type: String,
      enum: {
        values: Object.values(HOUSEKEEPING_STATUS),
        message: 'Housekeeping status `{VALUE}` is not supported'
      },
      default: HOUSEKEEPING_STATUS.CLEAN,
      index: true
    },
    lastCleanedAt: {
      type: Date,
      default: Date.now
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee room numbers are unique within a specific hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
