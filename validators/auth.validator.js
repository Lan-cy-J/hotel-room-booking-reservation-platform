const Joi = require('joi');
const { USER_ROLES } = require('../utils/constants');

const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.GUEST),
    hotelId: Joi.string().hex().length(24).when('role', {
      is: USER_ROLES.STAFF,
      then: Joi.required().messages({
        'any.required': 'hotelId is required when creating a staff account'
      }),
      otherwise: Joi.optional().allow(null, '')
    }),
    phone: Joi.string().trim().optional().allow('')
  })
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
};

module.exports = {
  registerSchema,
  loginSchema
};
