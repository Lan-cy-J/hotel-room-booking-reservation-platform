const ApiError = require('../utils/apiError');

/**
 * Middleware generator for Joi validation
 * @param {Object} schema - Object containing optional { body, query, params } Joi schemas
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validSchema = {};
    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        validSchema[key] = schema[key];
      }
    });

    const objectToValidate = {};
    Object.keys(validSchema).forEach((key) => {
      objectToValidate[key] = req[key];
    });

    const joiCombinedSchema = require('joi').object(validSchema);
    const { value, error } = joiCombinedSchema.validate(objectToValidate, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      return next(ApiError.badRequest('Validation failed', errorDetails));
    }

    // Assign validated values
    Object.assign(req, value);
    return next();
  };
};

module.exports = validate;
