const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/apiResponse');

class BookingController {
  async createBooking(req, res, next) {
    try {
      const booking = await bookingService.createBooking(req.body, req.user);
      return ApiResponse.created(res, booking, 'Reservation created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const bookings = await bookingService.getAllBookings({}, req.user);
      return ApiResponse.success(res, bookings, 'My booking history fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req, res, next) {
    try {
      const bookings = await bookingService.getAllBookings(req.query, req.user);
      return ApiResponse.success(res, bookings, 'Bookings fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req, res, next) {
    try {
      const booking = await bookingService.getBookingById(req.params.id, req.user);
      return ApiResponse.success(res, booking, 'Booking details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req, res, next) {
    try {
      const booking = await bookingService.confirmBooking(req.params.id, req.user);
      return ApiResponse.success(res, booking, 'Booking status updated to Confirmed');
    } catch (error) {
      next(error);
    }
  }

  async checkInBooking(req, res, next) {
    try {
      const booking = await bookingService.checkInBooking(req.params.id, req.body, req.user);
      return ApiResponse.success(res, booking, 'Guest checked-in successfully');
    } catch (error) {
      next(error);
    }
  }

  async checkOutBooking(req, res, next) {
    try {
      const booking = await bookingService.checkOutBooking(req.params.id, req.user);
      return ApiResponse.success(res, booking, 'Guest checked-out successfully and room marked as dirty');
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const result = await bookingService.cancelBooking(req.params.id, req.body, req.user);
      return ApiResponse.success(res, result, 'Booking cancelled and refund processed');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
