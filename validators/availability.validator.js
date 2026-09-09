const Joi = require('joi');

const searchAvailabilitySchema = {
  query: Joi.object({
    hotelId: Joi.string().hex().length(24),
    city: Joi.string().trim(),
    checkIn: Joi.date().iso().required().messages({
      'any.required': 'Check-in date (checkIn) is required in ISO format (YYYY-MM-DD)'
    }),
    checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required().messages({
      'date.greater': 'Check-out date (checkOut) must be strictly after checkIn date',
      'any.required': 'Check-out date (checkOut) is required in ISO format (YYYY-MM-DD)'
    }),
    guests: Joi.number().integer().min(1).default(1)
  }).or('hotelId', 'city').messages({
    'object.missing': 'Either hotelId or city must be provided for availability search'
  })
};

const checkRoomTypeAvailabilitySchema = {
  query: Joi.object({
    roomTypeId: Joi.string().hex().length(24).required(),
    checkIn: Joi.date().iso().required(),
    checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required()
  })
};

module.exports = {
  searchAvailabilitySchema,
  checkRoomTypeAvailabilitySchema
};
