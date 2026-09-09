const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomType.controller');
const validate = require('../middleware/validate.middleware');
const {
  updateRoomTypeSchema,
  getRoomTypeByIdSchema
} = require('../validators/roomType.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

// Public route to view single room type
router.get('/:id', validate(getRoomTypeByIdSchema), roomTypeController.getRoomTypeById);

// Admin-only modification routes
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(updateRoomTypeSchema),
  roomTypeController.updateRoomType
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles(USER_ROLES.ADMIN),
  validate(getRoomTypeByIdSchema),
  roomTypeController.deleteRoomType
);

module.exports = router;
