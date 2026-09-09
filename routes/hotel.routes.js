const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const roomTypeController = require('../controllers/roomType.controller');
const validate = require('../middleware/validate.middleware');
const {
  createHotelSchema,
  updateHotelSchema,
  getHotelByIdSchema
} = require('../validators/hotel.validator');
const { createRoomTypeSchema } = require('../validators/roomType.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

// Public routes
router.get('/', hotelController.getAllHotels);
router.get('/:id', validate(getHotelByIdSchema), hotelController.getHotelById);

// Admin-only routes
router.post(
  '/',
  authenticateJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(createHotelSchema),
  hotelController.createHotel
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(updateHotelSchema),
  hotelController.updateHotel
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(getHotelByIdSchema),
  hotelController.deleteHotel
);

// Nested Room Type routes under a hotel
router.get('/:hotelId/room-types', roomTypeController.getRoomTypesByHotel);
router.post(
  '/:hotelId/room-types',
  authenticateJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(createRoomTypeSchema),
  roomTypeController.createRoomType
);

module.exports = router;
