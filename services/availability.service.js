const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');
const pricingService = require('./pricing.service');
const ApiError = require('../utils/apiError');
const { ACTIVE_BOOKING_STATUSES } = require('../utils/constants');
const { normalizeDate, calculateNights } = require('../utils/dateUtils');

class AvailabilityService {
  /**
   * Core logic to count active overlapping bookings for a given roomType and date range
   */
  async getOverlappingBookingsCount(roomTypeId, checkIn, checkOut, excludeBookingId = null) {
    const normCheckIn = normalizeDate(checkIn);
    const normCheckOut = normalizeDate(checkOut);

    const query = {
      roomTypeId,
      status: { $in: ACTIVE_BOOKING_STATUSES },
      checkIn: { $lt: normCheckOut },
      checkOut: { $gt: normCheckIn }
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    return await Booking.countDocuments(query);
  }

  /**
   * Check remaining availability for a single room type
   */
  async checkRoomTypeAvailability(roomTypeId, checkIn, checkOut, excludeBookingId = null) {
    const roomType = await RoomType.findById(roomTypeId).populate('hotelId', 'name city isActive');
    if (!roomType || !roomType.isActive || !roomType.hotelId.isActive) {
      throw ApiError.notFound('Room type or its hotel not found or inactive');
    }

    const occupiedCount = await this.getOverlappingBookingsCount(
      roomTypeId,
      checkIn,
      checkOut,
      excludeBookingId
    );

    const availableRooms = Math.max(0, roomType.totalRooms - occupiedCount);
    const nights = calculateNights(checkIn, checkOut);

    // Calculate dynamic pricing breakdown
    const pricingEstimate = await pricingService.calculateBookingPricing(
      roomType.hotelId._id,
      roomType._id,
      roomType.basePrice,
      checkIn,
      checkOut
    );

    return {
      roomTypeId: roomType._id,
      roomTypeName: roomType.name,
      hotel: {
        id: roomType.hotelId._id,
        name: roomType.hotelId.name,
        city: roomType.hotelId.city
      },
      capacity: roomType.capacity,
      totalInventory: roomType.totalRooms,
      occupiedCount,
      availableRooms,
      isAvailable: availableRooms > 0,
      nights,
      pricingEstimate
    };
  }

  /**
   * Search availability across a hotel or an entire city
   */
  async searchAvailability(searchParams) {
    const { hotelId, city, checkIn, checkOut, guests = 1 } = searchParams;

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      throw ApiError.badRequest('Check-out date must be at least 1 night after check-in date');
    }

    // Step 1: Find target hotels
    const hotelFilter = { isActive: true };
    if (hotelId) {
      hotelFilter._id = hotelId;
    } else if (city) {
      hotelFilter.city = new RegExp(`^${city}$`, 'i');
    }

    const hotels = await Hotel.find(hotelFilter);
    if (hotels.length === 0) {
      return [];
    }

    const hotelIds = hotels.map((h) => h._id);

    // Step 2: Find all active room types for these hotels with capacity >= requested guests
    const roomTypes = await RoomType.find({
      hotelId: { $in: hotelIds },
      capacity: { $gte: Number(guests) },
      isActive: true
    }).populate('hotelId', 'name city address rating amenities');

    // Step 3: Check availability and price for each room type
    const results = [];

    for (const roomType of roomTypes) {
      const occupiedCount = await this.getOverlappingBookingsCount(
        roomType._id,
        checkIn,
        checkOut
      );

      const availableRooms = roomType.totalRooms - occupiedCount;

      if (availableRooms > 0) {
        const pricing = await pricingService.calculateBookingPricing(
          roomType.hotelId._id,
          roomType._id,
          roomType.basePrice,
          checkIn,
          checkOut
        );

        results.push({
          hotel: {
            id: roomType.hotelId._id,
            name: roomType.hotelId.name,
            city: roomType.hotelId.city,
            address: roomType.hotelId.address,
            rating: roomType.hotelId.rating,
            amenities: roomType.hotelId.amenities
          },
          roomType: {
            id: roomType._id,
            name: roomType.name,
            description: roomType.description,
            capacity: roomType.capacity,
            amenities: roomType.amenities,
            basePricePerNight: roomType.basePrice,
            totalInventory: roomType.totalRooms,
            availableRooms
          },
          searchCriteria: {
            checkIn: normalizeDate(checkIn),
            checkOut: normalizeDate(checkOut),
            nights,
            requestedGuests: Number(guests)
          },
          pricing
        });
      }
    }

    return results;
  }
}

module.exports = new AvailabilityService();
