const Joi = require('joi');
const { PRICING_SEASONS } = require('../utils/constants');

const createPricingRuleSchema = {
  body: Joi.object({
    hotelId: Joi.string().hex().length(24).required(),
    roomTypeId: Joi.string().hex().length(24).optional().allow(null),
    name: Joi.string().trim().min(2).max(100).required(),
    season: Joi.string()
      .valid(...Object.values(PRICING_SEASONS))
      .required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'date.greater': 'End date must be strictly after start date'
    }),
    multiplier: Joi.number().min(0.1).max(5.0).required(),
    isActive: Joi.boolean().default(true)
  })
};

const updatePricingRuleSchema = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    season: Joi.string().valid(...Object.values(PRICING_SEASONS)),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    multiplier: Joi.number().min(0.1).max(5.0),
    isActive: Joi.boolean()
  }).min(1)
};

const getPricingRulesQuerySchema = {
  query: Joi.object({
    hotelId: Joi.string().hex().length(24),
    roomTypeId: Joi.string().hex().length(24),
    season: Joi.string().valid(...Object.values(PRICING_SEASONS))
  })
};

module.exports = {
  createPricingRuleSchema,
  updatePricingRuleSchema,
  getPricingRulesQuerySchema
};
