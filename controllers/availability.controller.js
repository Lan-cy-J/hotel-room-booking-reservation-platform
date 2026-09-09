const availabilityService = require('../services/availability.service');
const ApiResponse = require('../utils/apiResponse');

class AvailabilityController {
  async searchAvailability(req, res, next) {
    try {
      const results = await availabilityService.searchAvailability(req.query);
      return ApiResponse.success(
        res,
        results,
        `Found ${results.length} available room type(s) matching search criteria`
      );
    } catch (error) {
      next(error);
    }
  }

  async checkRoomTypeAvailability(req, res, next) {
    try {
      const { roomTypeId, checkIn, checkOut } = req.query;
      const result = await availabilityService.checkRoomTypeAvailability(
        roomTypeId,
        checkIn,
        checkOut
      );
      return ApiResponse.success(res, result, 'Room type availability fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AvailabilityController();
