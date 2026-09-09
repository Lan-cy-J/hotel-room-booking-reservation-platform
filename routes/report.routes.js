const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const validate = require('../middleware/validate.middleware');
const { reportQuerySchema } = require('../validators/report.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

// Admin only reporting routes
router.use(authenticateJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN));

router.get('/occupancy', validate(reportQuerySchema), reportController.getOccupancyReport);
router.get('/revenue', validate(reportQuerySchema), reportController.getRevenueReport);
router.get('/dashboard', reportController.getDashboardSummary);

module.exports = router;
