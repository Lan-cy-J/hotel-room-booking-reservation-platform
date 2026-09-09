const roomTypeService = require('../services/roomType.service');
const ApiResponse = require('../utils/apiResponse');

class RoomTypeController {
  async createRoomType(req, res, next) {
    try {
      const roomType = await roomTypeService.createRoomType(req.params.hotelId, req.body);
      return ApiResponse.created(res, roomType, 'Room type created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRoomTypesByHotel(req, res, next) {
    try {
      const roomTypes = await roomTypeService.getRoomTypesByHotel(req.params.hotelId);
      return ApiResponse.success(res, roomTypes, 'Room types fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRoomTypeById(req, res, next) {
    try {
      const roomType = await roomTypeService.getRoomTypeById(req.params.id);
      return ApiResponse.success(res, roomType, 'Room type fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRoomType(req, res, next) {
    try {
      const roomType = await roomTypeService.updateRoomType(req.params.id, req.body);
      return ApiResponse.success(res, roomType, 'Room type updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteRoomType(req, res, next) {
    try {
      const result = await roomTypeService.deleteRoomType(req.params.id);
      return ApiResponse.success(res, result, 'Room type deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomTypeController();
