const Joi = require('joi');

const createRoomTypeSchema = {
  params: Joi.object({
    hotelId: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().optional().allow(''),
    basePrice: Joi.number().positive().required().messages({
      'number.positive': 'Base price must be a positive number'
    }),
    capacity: Joi.number().integer().min(1).required().messages({
      'number.min': 'Room capacity must be at least 1'
    }),
    totalRooms: Joi.number().integer().min(1).required().messages({
      'number.min': 'Total rooms must be at least 1'
    }),
    amenities: Joi.array().items(Joi.string().trim()).default([]),
    isActive: Joi.boolean().default(true)
  })
};

const updateRoomTypeSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().allow(''),
    basePrice: Joi.number().positive(),
    capacity: Joi.number().integer().min(1),
    totalRooms: Joi.number().integer().min(1),
    amenities: Joi.array().items(Joi.string().trim()),
    isActive: Joi.boolean()
  }).min(1)
};

const getRoomTypeByIdSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

module.exports = {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  getRoomTypeByIdSchema
};
