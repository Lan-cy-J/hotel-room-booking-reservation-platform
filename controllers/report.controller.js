const reportService = require('../services/report.service');
const ApiResponse = require('../utils/apiResponse');

class ReportController {
  async getOccupancyReport(req, res, next) {
    try {
      const report = await reportService.getOccupancyReport(req.query);
      return ApiResponse.success(res, report, 'Occupancy report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRevenueReport(req, res, next) {
    try {
      const report = await reportService.getRevenueReport(req.query);
      return ApiResponse.success(res, report, 'Revenue report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const summary = await reportService.getDashboardSummary();
      return ApiResponse.success(res, summary, 'Dashboard summary metrics fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
