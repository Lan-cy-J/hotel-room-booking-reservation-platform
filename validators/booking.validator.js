const Joi = require('joi');
const { BOOKING_STATUS } = require('../utils/constants');

const createBookingSchema = {
  body: Joi.object({
    hotelId: Joi.string().hex().length(24).required(),
    roomTypeId: Joi.string().hex().length(24).required(),
    checkIn: Joi.date().iso().required().messages({
      'any.required': 'checkIn date is required (YYYY-MM-DD)'
    }),
    checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required().messages({
      'date.greater': 'checkOut date must be strictly after checkIn date',
      'any.required': 'checkOut date is required (YYYY-MM-DD)'
    }),
    guestCount: Joi.number().integer().min(1).required().messages({
      'number.min': 'guestCount must be at least 1'
    }),
    // Optional guestId if Admin/Staff is booking on behalf of a guest
    guestId: Joi.string().hex().length(24).optional()
  })
};

const checkInSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    assignedRoomId: Joi.string().hex().length(24).required().messages({
      'any.required': 'assignedRoomId (physical room) is required for check-in'
    })
  })
};

const cancelBookingSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    reason: Joi.string().trim().min(3).max(250).optional().default('Cancelled by guest')
  })
};

const getBookingsQuerySchema = {
  query: Joi.object({
    hotelId: Joi.string().hex().length(24),
    roomTypeId: Joi.string().hex().length(24),
    status: Joi.string().valid(...Object.values(BOOKING_STATUS)),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    guestId: Joi.string().hex().length(24)
  })
};

module.exports = {
  createBookingSchema,
  checkInSchema,
  cancelBookingSchema,
  getBookingsQuerySchema
};
