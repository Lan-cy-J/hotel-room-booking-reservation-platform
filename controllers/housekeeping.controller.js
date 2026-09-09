const housekeepingService = require('../services/housekeeping.service');
const ApiResponse = require('../utils/apiResponse');

class HousekeepingController {
  async getRooms(req, res, next) {
    try {
      const rooms = await housekeepingService.getHousekeepingRooms(req.query, req.user);
      return ApiResponse.success(res, rooms, 'Housekeeping room list fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRoomStatus(req, res, next) {
    try {
      const room = await housekeepingService.updateRoomHousekeepingStatus(
        req.params.id,
        req.body,
        req.user
      );
      return ApiResponse.success(res, room, 'Room housekeeping status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HousekeepingController();
