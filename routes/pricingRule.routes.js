const express = require('express');
const router = express.Router();
const pricingRuleController = require('../controllers/pricingRule.controller');
const validate = require('../middleware/validate.middleware');
const {
  createPricingRuleSchema,
  updatePricingRuleSchema,
  getPricingRulesQuerySchema
} = require('../validators/pricingRule.validator');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { USER_ROLES } = require('../utils/constants');

// Admin only access for pricing rules
router.use(authenticateJWT);
router.use(authorizeRoles(USER_ROLES.ADMIN));

router.get('/', validate(getPricingRulesQuerySchema), pricingRuleController.getPricingRules);
router.post('/', validate(createPricingRuleSchema), pricingRuleController.createPricingRule);
router.put('/:id', validate(updatePricingRuleSchema), pricingRuleController.updatePricingRule);
router.delete('/:id', pricingRuleController.deletePricingRule);

module.exports = router;
