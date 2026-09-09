const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');
const ApiError = require('../utils/apiError');
const { USER_ROLES } = require('../utils/constants');

class RoomService {
  async createRoom(roomData, user) {
    const { hotelId, roomTypeId, roomNumber } = roomData;

    // Staff scoping check
    if (user.role === USER_ROLES.STAFF && user.hotelId.toString() !== hotelId.toString()) {
      throw ApiError.forbidden('Staff members can only add rooms to their assigned hotel');
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel || !hotel.isActive) {
      throw ApiError.notFound('Hotel not found or is inactive');
    }

    const roomType = await RoomType.findOne({ _id: roomTypeId, hotelId, isActive: true });
    if (!roomType) {
      throw ApiError.notFound('Room type not found in the specified hotel');
    }

    const existingRoom = await Room.findOne({ hotelId, roomNumber });
    if (existingRoom) {
      throw ApiError.conflict(`Room number '${roomNumber}' already exists in this hotel`);
    }

    return await Room.create(roomData);
  }

  async getRooms(query = {}, user = null) {
    const filter = { isActive: true };

    // Staff scoping
    if (user && user.role === USER_ROLES.STAFF) {
      filter.hotelId = user.hotelId;
    } else if (query.hotelId) {
      filter.hotelId = query.hotelId;
    }

    if (query.roomTypeId) {
      filter.roomTypeId = query.roomTypeId;
    }
    if (query.housekeepingStatus) {
      filter.housekeepingStatus = query.housekeepingStatus;
    }

    return await Room.find(filter)
      .populate('hotelId', 'name city')
      .populate('roomTypeId', 'name capacity basePrice')
      .populate('assignedStaffId', 'name email')
      .sort({ roomNumber: 1 });
  }

  async getRoomById(id, user = null) {
    const room = await Room.findById(id)
      .populate('hotelId', 'name city')
      .populate('roomTypeId', 'name capacity basePrice');

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    if (user && user.role === USER_ROLES.STAFF && user.hotelId.toString() !== room.hotelId._id.toString()) {
      throw ApiError.forbidden('Staff cannot access rooms from another hotel');
    }

    return room;
  }

  async updateRoom(id, updateData, user) {
    const room = await Room.findById(id);
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    if (user.role === USER_ROLES.STAFF && user.hotelId.toString() !== room.hotelId.toString()) {
      throw ApiError.forbidden('Staff cannot update rooms from another hotel');
    }

    if (updateData.roomNumber && updateData.roomNumber !== room.roomNumber) {
      const duplicate = await Room.findOne({
        hotelId: room.hotelId,
        roomNumber: updateData.roomNumber,
        _id: { $ne: id }
      });
      if (duplicate) {
        throw ApiError.conflict(`Room number '${updateData.roomNumber}' already exists in this hotel`);
      }
    }

    Object.assign(room, updateData);
    await room.save();
    return room;
  }
}

module.exports = new RoomService();
