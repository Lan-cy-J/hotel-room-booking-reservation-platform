const hotelService = require('../services/hotel.service');
const ApiResponse = require('../utils/apiResponse');

class HotelController {
  async createHotel(req, res, next) {
    try {
      const hotel = await hotelService.createHotel(req.body);
      return ApiResponse.created(res, hotel, 'Hotel property created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllHotels(req, res, next) {
    try {
      const hotels = await hotelService.getAllHotels(req.query);
      return ApiResponse.success(res, hotels, 'Hotels fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHotelById(req, res, next) {
    try {
      const hotel = await hotelService.getHotelById(req.params.id);
      return ApiResponse.success(res, hotel, 'Hotel fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateHotel(req, res, next) {
    try {
      const hotel = await hotelService.updateHotel(req.params.id, req.body);
      return ApiResponse.success(res, hotel, 'Hotel updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteHotel(req, res, next) {
    try {
      const result = await hotelService.deleteHotel(req.params.id);
      return ApiResponse.success(res, result, 'Hotel deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HotelController();
