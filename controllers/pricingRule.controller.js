const pricingService = require('../services/pricing.service');
const ApiResponse = require('../utils/apiResponse');

class PricingRuleController {
  async createPricingRule(req, res, next) {
    try {
      const rule = await pricingService.createPricingRule(req.body);
      return ApiResponse.created(res, rule, 'Pricing rule created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPricingRules(req, res, next) {
    try {
      const rules = await pricingService.getPricingRules(req.query);
      return ApiResponse.success(res, rules, 'Pricing rules fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async updatePricingRule(req, res, next) {
    try {
      const rule = await pricingService.updatePricingRule(req.params.id, req.body);
      return ApiResponse.success(res, rule, 'Pricing rule updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deletePricingRule(req, res, next) {
    try {
      const result = await pricingService.deletePricingRule(req.params.id);
      return ApiResponse.success(res, result, 'Pricing rule deactivated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PricingRuleController();
