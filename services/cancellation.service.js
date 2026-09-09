const { hoursUntil } = require('../utils/dateUtils');
const ApiError = require('../utils/apiError');
const { BOOKING_STATUS } = require('../utils/constants');

class CancellationService {
  /**
   * Evaluates refund percentage and amounts based on time remaining until check-in
   *
   * Policy Rules:
   * 1. >= 48 hours before check-in: 100% refund (0% cancellation fee)
   * 2. 24 to 48 hours before check-in: 50% refund (50% cancellation fee)
   * 3. < 24 hours before check-in: 0% refund (100% cancellation fee)
   */
  calculateRefund(booking, cancellationDate = new Date()) {
    // Prohibit cancellation of checked-in or checked-out bookings
    if (booking.status === BOOKING_STATUS.CHECKED_IN || booking.status === BOOKING_STATUS.CHECKED_OUT) {
      throw ApiError.badRequest(
        `Cannot cancel booking with status '${booking.status}'. Only Reserved or Confirmed bookings are eligible.`
      );
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw ApiError.badRequest('Booking has already been cancelled.');
    }

    const hours = hoursUntil(booking.checkIn, cancellationDate);
    const totalAmount = booking.pricingSnapshot ? booking.pricingSnapshot.totalAmount : 0;

    let refundPercentage = 0;
    let policyTier = '';

    if (hours >= 48) {
      refundPercentage = 100;
      policyTier = 'Full Refund (Cancelled >= 48 hours prior to check-in)';
    } else if (hours >= 24) {
      refundPercentage = 50;
      policyTier = 'Partial 50% Refund (Cancelled between 24 and 48 hours prior to check-in)';
    } else {
      refundPercentage = 0;
      policyTier = 'No Refund (Cancelled < 24 hours prior to check-in)';
    }

    const refundAmount = Number(((totalAmount * refundPercentage) / 100).toFixed(2));
    const cancellationFee = Number((totalAmount - refundAmount).toFixed(2));

    return {
      hoursNoticeRemaining: Math.max(0, Number(hours.toFixed(1))),
      policyTier,
      refundPercentage,
      refundAmount,
      cancellationFee,
      originalTotalAmount: totalAmount
    };
  }
}

module.exports = new CancellationService();
