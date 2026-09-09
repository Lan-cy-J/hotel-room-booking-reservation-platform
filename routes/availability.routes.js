const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const validate = require('../middleware/validate.middleware');
const {
  searchAvailabilitySchema,
  checkRoomTypeAvailabilitySchema
} = require('../validators/availability.validator');

// Public endpoints for searching availability
router.get('/search', validate(searchAvailabilitySchema), availabilityController.searchAvailability);
router.get('/check', validate(checkRoomTypeAvailabilitySchema), availabilityController.checkRoomTypeAvailability);

module.exports = router;
