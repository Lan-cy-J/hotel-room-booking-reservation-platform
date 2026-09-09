const PricingRule = require('../models/PricingRule');
const Hotel = require('../models/Hotel');
const ApiError = require('../utils/apiError');
const { calculateNights, normalizeDate } = require('../utils/dateUtils');

class PricingService {
  async createPricingRule(ruleData) {
    const hotel = await Hotel.findById(ruleData.hotelId);
    if (!hotel || !hotel.isActive) {
      throw ApiError.notFound('Hotel not found or is inactive');
    }

    return await PricingRule.create(ruleData);
  }

  async getPricingRules(query = {}) {
    const filter = { isActive: true };
    if (query.hotelId) filter.hotelId = query.hotelId;
    if (query.roomTypeId) filter.roomTypeId = query.roomTypeId;
    if (query.season) filter.season = query.season;

    return await PricingRule.find(filter)
      .populate('hotelId', 'name city')
      .populate('roomTypeId', 'name')
      .sort({ createdAt: -1 });
  }

  async updatePricingRule(id, updateData) {
    const rule = await PricingRule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!rule) {
      throw ApiError.notFound('Pricing rule not found');
    }
    return rule;
  }

  async deletePricingRule(id) {
    const rule = await PricingRule.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!rule) {
      throw ApiError.notFound('Pricing rule not found');
    }
    return { message: 'Pricing rule deactivated successfully' };
  }

  /**
   * Calculates dynamic pricing snapshot for a prospective or new booking
   */
  async calculateBookingPricing(hotelId, roomTypeId, basePricePerNight, checkIn, checkOut) {
    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      throw ApiError.badRequest('Check-out date must be at least 1 night after check-in date');
    }

    const normCheckIn = normalizeDate(checkIn);
    const normCheckOut = normalizeDate(checkOut);

    // Look for active pricing rules covering the hotel and date range
    const matchingRules = await PricingRule.find({
      hotelId,
      isActive: true,
      $or: [
        { roomTypeId: roomTypeId },
        { roomTypeId: null }
      ],
      // Overlap with requested dates: rule.startDate < requested.checkOut AND rule.endDate > requested.checkIn
      startDate: { $lt: normCheckOut },
      endDate: { $gt: normCheckIn }
    }).sort({ multiplier: -1 });

    let appliedMultiplier = 1.0;
    let ruleApplied = 'Standard Base Rate';

    if (matchingRules.length > 0) {
      const topRule = matchingRules[0];
      appliedMultiplier = topRule.multiplier;
      ruleApplied = `${topRule.name} (${topRule.season.toUpperCase()} Multiplier: ${appliedMultiplier}x)`;
    }

    const taxRatePercent = parseFloat(process.env.TAX_RATE_PERCENT) || 12;
    const effectivePricePerNight = Number((basePricePerNight * appliedMultiplier).toFixed(2));
    const subtotal = Number((effectivePricePerNight * nights).toFixed(2));
    const taxAmount = Number(((subtotal * taxRatePercent) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    return {
      nights,
      basePricePerNight,
      appliedMultiplier,
      ruleApplied,
      subtotal,
      taxRatePercent,
      taxAmount,
      totalAmount
    };
  }
}

module.exports = new PricingService();
