const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'hotelId is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Room type name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price per night is required'],
      min: [0, 'Base price cannot be negative']
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1 person']
    },
    totalRooms: {
      type: Number,
      required: [true, 'Total room inventory is required'],
      min: [1, 'Total rooms must be at least 1']
    },
    amenities: [
      {
        type: String,
        trim: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of room type name within the same hotel
roomTypeSchema.index({ hotelId: 1, name: 1 }, { unique: true });

const RoomType = mongoose.model('RoomType', roomTypeSchema);

module.exports = RoomType;
