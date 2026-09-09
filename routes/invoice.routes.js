const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

router.use(authenticateJWT);

router.get('/:bookingId', invoiceController.getInvoiceByBookingId);

module.exports = router;
