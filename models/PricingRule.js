const mongoose = require('mongoose');
const { PRICING_SEASONS } = require('../utils/constants');

const pricingRuleSchema = new mongoose.Schema(
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
      default: null, // null means rule applies to all room types in this hotel
      index: true
    },
    name: {
      type: String,
      required: [true, 'Rule name is required (e.g., Summer Peak Surcharge)'],
      trim: true
    },
    season: {
      type: String,
      enum: {
        values: Object.values(PRICING_SEASONS),
        message: 'Season `{VALUE}` is not supported'
      },
      required: [true, 'Season type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    multiplier: {
      type: Number,
      required: [true, 'Multiplier is required'],
      min: [0.1, 'Multiplier must be at least 0.1'],
      max: [5.0, 'Multiplier cannot exceed 5.0'],
      default: 1.0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for matching active pricing rules for a hotel
pricingRuleSchema.index({ hotelId: 1, isActive: 1, startDate: 1, endDate: 1 });

const PricingRule = mongoose.model('PricingRule', pricingRuleSchema);

module.exports = PricingRule;
