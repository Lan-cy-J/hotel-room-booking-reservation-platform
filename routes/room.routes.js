const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const validate = require('../middleware/validate.middleware');
const {
  createRoomSchema,
  updateRoomSchema,
  getRoomsQuerySchema
} = require('../validators/room.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

// Staff and Admin routes
router.use(authenticateJWT);
router.use(authorizeRoles(USER_ROLES.STAFF, USER_ROLES.ADMIN));

router.get('/', validate(getRoomsQuerySchema), roomController.getRooms);
router.post('/', validate(createRoomSchema), roomController.createRoom);
router.get('/:id', roomController.getRoomById);
router.put('/:id', validate(updateRoomSchema), roomController.updateRoom);

module.exports = router;
