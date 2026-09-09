const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');
const ApiError = require('../utils/apiError');

class RoomTypeService {
  async createRoomType(hotelId, roomTypeData) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      throw ApiError.notFound('Hotel not found or is inactive');
    }

    const existing = await RoomType.findOne({ hotelId, name: roomTypeData.name });
    if (existing) {
      throw ApiError.conflict(`Room type '${roomTypeData.name}' already exists in this hotel`);
    }

    return await RoomType.create({ ...roomTypeData, hotelId });
  }

  async getRoomTypesByHotel(hotelId) {
    return await RoomType.find({ hotelId, isActive: true }).sort({ basePrice: 1 });
  }

  async getRoomTypeById(id) {
    const roomType = await RoomType.findById(id).populate('hotelId', 'name city address');
    if (!roomType) {
      throw ApiError.notFound('Room type not found');
    }
    return roomType;
  }

  async updateRoomType(id, updateData) {
    const roomType = await RoomType.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!roomType) {
      throw ApiError.notFound('Room type not found');
    }
    return roomType;
  }

  async deleteRoomType(id) {
    const roomType = await RoomType.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!roomType) {
      throw ApiError.notFound('Room type not found');
    }
    return { message: 'Room type deactivated successfully' };
  }
}

module.exports = new RoomTypeService();
