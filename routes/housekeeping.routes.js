const express = require('express');
const router = express.Router();
const housekeepingController = require('../controllers/housekeeping.controller');
const validate = require('../middleware/validate.middleware');
const { updateRoomSchema, getRoomsQuerySchema } = require('../validators/room.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

// Staff and Admin only
router.use(authenticateJWT);
router.use(authorizeRoles(USER_ROLES.STAFF, USER_ROLES.ADMIN));

router.get('/rooms', validate(getRoomsQuerySchema), housekeepingController.getRooms);
router.put('/rooms/:id/status', validate(updateRoomSchema), housekeepingController.updateRoomStatus);

module.exports = router;
