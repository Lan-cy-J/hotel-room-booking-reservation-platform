const Hotel = require('../models/Hotel');
const ApiError = require('../utils/apiError');

class HotelService {
  async createHotel(hotelData) {
    const existing = await Hotel.findOne({ name: hotelData.name, city: hotelData.city });
    if (existing) {
      throw ApiError.conflict(`Hotel '${hotelData.name}' in city '${hotelData.city}' already exists`);
    }
    return await Hotel.create(hotelData);
  }

  async getAllHotels(query = {}) {
    const filter = { isActive: true };
    if (query.city) {
      filter.city = new RegExp(`^${query.city}$`, 'i');
    }
    if (query.amenities) {
      const amenitiesArr = Array.isArray(query.amenities)
        ? query.amenities
        : query.amenities.split(',').map((a) => a.trim());
      filter.amenities = { $all: amenitiesArr };
    }
    return await Hotel.find(filter).sort({ rating: -1, name: 1 });
  }

  async getHotelById(id) {
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw ApiError.notFound('Hotel not found');
    }
    return hotel;
  }

  async updateHotel(id, updateData) {
    const hotel = await Hotel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!hotel) {
      throw ApiError.notFound('Hotel not found');
    }
    return hotel;
  }

  async deleteHotel(id) {
    const hotel = await Hotel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!hotel) {
      throw ApiError.notFound('Hotel not found');
    }
    return { message: 'Hotel deactivated successfully' };
  }
}

module.exports = new HotelService();
