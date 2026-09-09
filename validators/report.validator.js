const Joi = require('joi');

const reportQuerySchema = {
  query: Joi.object({
    hotelId: Joi.string().hex().length(24),
    startDate: Joi.date().iso().required().messages({
      'any.required': 'startDate is required for reporting (YYYY-MM-DD)'
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'date.greater': 'endDate must be after startDate',
      'any.required': 'endDate is required for reporting (YYYY-MM-DD)'
    })
  })
};

module.exports = {
  reportQuerySchema
};
