const Room = require('../models/Room');
const ApiError = require('../utils/apiError');
const { HOUSEKEEPING_STATUS, USER_ROLES } = require('../utils/constants');

class HousekeepingService {
  async getHousekeepingRooms(query = {}, user = null) {
    const filter = { isActive: true };

    if (user && user.role === USER_ROLES.STAFF) {
      filter.hotelId = user.hotelId;
    } else if (query.hotelId) {
      filter.hotelId = query.hotelId;
    }

    if (query.housekeepingStatus) {
      filter.housekeepingStatus = query.housekeepingStatus;
    }

    return await Room.find(filter)
      .populate('hotelId', 'name city')
      .populate('roomTypeId', 'name capacity')
      .populate('assignedStaffId', 'name email')
      .sort({ housekeepingStatus: 1, roomNumber: 1 });
  }

  async updateRoomHousekeepingStatus(roomId, updateData, user) {
    const { housekeepingStatus, assignedStaffId } = updateData;

    const room = await Room.findById(roomId);
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    // Staff scoping
    if (user.role === USER_ROLES.STAFF && user.hotelId.toString() !== room.hotelId.toString()) {
      throw ApiError.forbidden('Staff can only update housekeeping for their assigned hotel');
    }

    if (housekeepingStatus) {
      room.housekeepingStatus = housekeepingStatus;
      if (housekeepingStatus === HOUSEKEEPING_STATUS.CLEAN) {
        room.lastCleanedAt = new Date();
      }
    }

    if (assignedStaffId !== undefined) {
      room.assignedStaffId = assignedStaffId;
    }

    await room.save();
    return room;
  }
}

module.exports = new HousekeepingService();
