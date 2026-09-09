const roomService = require('../services/room.service');
const ApiResponse = require('../utils/apiResponse');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const room = await roomService.createRoom(req.body, req.user);
      return ApiResponse.created(res, room, 'Physical room created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRooms(req, res, next) {
    try {
      const rooms = await roomService.getRooms(req.query, req.user);
      return ApiResponse.success(res, rooms, 'Rooms fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req, res, next) {
    try {
      const room = await roomService.getRoomById(req.params.id, req.user);
      return ApiResponse.success(res, room, 'Room fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const room = await roomService.updateRoom(req.params.id, req.body, req.user);
      return ApiResponse.success(res, room, 'Room updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
