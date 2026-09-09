const invoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/apiResponse');

class InvoiceController {
  async getInvoiceByBookingId(req, res, next) {
    try {
      const invoice = await invoiceService.generateInvoice(req.params.bookingId, req.user);
      return ApiResponse.success(res, invoice, 'Invoice generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
