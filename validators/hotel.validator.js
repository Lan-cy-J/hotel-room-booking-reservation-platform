const Joi = require('joi');

const createHotelSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    city: Joi.string().trim().min(2).max(100).required(),
    address: Joi.string().trim().min(5).required(),
    amenities: Joi.array().items(Joi.string().trim()).default([]),
    rating: Joi.number().min(1).max(5).default(4.0),
    contactEmail: Joi.string().email().optional().allow(''),
    contactPhone: Joi.string().trim().optional().allow(''),
    isActive: Joi.boolean().default(true)
  })
};

const updateHotelSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150),
    city: Joi.string().trim().min(2).max(100),
    address: Joi.string().trim().min(5),
    amenities: Joi.array().items(Joi.string().trim()),
    rating: Joi.number().min(1).max(5),
    contactEmail: Joi.string().email().allow(''),
    contactPhone: Joi.string().trim().allow(''),
    isActive: Joi.boolean()
  }).min(1)
};

const getHotelByIdSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

module.exports = {
  createHotelSchema,
  updateHotelSchema,
  getHotelByIdSchema
};
