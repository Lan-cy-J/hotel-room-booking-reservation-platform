const Booking = require('../models/Booking');
const ApiError = require('../utils/apiError');
const { BOOKING_STATUS, USER_ROLES } = require('../utils/constants');

class InvoiceService {
  /**
   * Generates a complete itemized invoice summary for a booking
   */
  async generateInvoice(bookingId, user) {
    const booking = await Booking.findById(bookingId).populate([
      { path: 'hotelId', select: 'name city address contactEmail contactPhone rating' },
      { path: 'roomTypeId', select: 'name capacity amenities basePrice' },
      { path: 'guestId', select: 'name email phone' },
      { path: 'assignedRoomId', select: 'roomNumber floor' }
    ]);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Ownership check for Guest
    if (user.role === USER_ROLES.GUEST && booking.guestId._id.toString() !== user._id.toString()) {
      throw ApiError.forbidden('Access denied: You can only view invoices for your own bookings');
    }

    // Staff scoping check
    if (user.role === USER_ROLES.STAFF && booking.hotelId._id.toString() !== user.hotelId.toString()) {
      throw ApiError.forbidden('Staff cannot access invoices for bookings from another hotel');
    }

    const { pricingSnapshot, cancellationDetails } = booking;
    const baseTotal = Number((pricingSnapshot.basePricePerNight * pricingSnapshot.nights).toFixed(2));
    const dynamicAdjustment = Number((pricingSnapshot.subtotal - baseTotal).toFixed(2));

    let paymentStatus = 'PAID';
    let netPaidAmount = pricingSnapshot.totalAmount;

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      if (cancellationDetails && cancellationDetails.refundPercentage === 100) {
        paymentStatus = 'FULLY REFUNDED';
        netPaidAmount = 0;
      } else if (cancellationDetails && cancellationDetails.refundPercentage === 50) {
        paymentStatus = 'PARTIALLY REFUNDED';
        netPaidAmount = cancellationDetails.cancellationFee;
      } else {
        paymentStatus = 'RETAINED AS CANCELLATION FEE';
        netPaidAmount = pricingSnapshot.totalAmount;
      }
    }

    const invoice = {
      invoiceNumber: `INV-${booking.bookingNumber.replace('BK-', '')}`,
      invoiceDate: booking.createdAt,
      bookingNumber: booking.bookingNumber,
      bookingStatus: booking.status,
      hotel: {
        id: booking.hotelId._id,
        name: booking.hotelId.name,
        address: booking.hotelId.address,
        city: booking.hotelId.city,
        contactEmail: booking.hotelId.contactEmail,
        contactPhone: booking.hotelId.contactPhone
      },
      guest: {
        id: booking.guestId._id,
        name: booking.guestId.name,
        email: booking.guestId.email,
        phone: booking.guestId.phone
      },
      stayDetails: {
        roomType: booking.roomTypeId.name,
        assignedRoomNumber: booking.assignedRoomId ? booking.assignedRoomId.roomNumber : 'Unassigned',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: pricingSnapshot.nights,
        guestCount: booking.guestCount,
        actualCheckIn: booking.actualCheckIn,
        actualCheckOut: booking.actualCheckOut
      },
      lineItems: [
        {
          description: `Base Accommodation (${pricingSnapshot.nights} night(s) @ $${pricingSnapshot.basePricePerNight}/night)`,
          amount: baseTotal
        },
        {
          description: `Dynamic Pricing Adjustment (${pricingSnapshot.ruleApplied})`,
          amount: dynamicAdjustment
        },
        {
          description: `Subtotal Before Tax`,
          amount: pricingSnapshot.subtotal
        },
        {
          description: `Taxes & Surcharges (${pricingSnapshot.taxRatePercent}% GST)`,
          amount: pricingSnapshot.taxAmount
        }
      ],
      financialSummary: {
        grossTotal: pricingSnapshot.totalAmount,
        cancellationFee: cancellationDetails ? cancellationDetails.cancellationFee : 0,
        refundAmount: cancellationDetails ? cancellationDetails.refundAmount : 0,
        netPaidAmount,
        paymentStatus
      },
      cancellationSummary:
        booking.status === BOOKING_STATUS.CANCELLED
          ? {
              cancelledAt: cancellationDetails.cancelledAt,
              reason: cancellationDetails.reason,
              refundPercentage: `${cancellationDetails.refundPercentage}%`,
              refundAmount: `$${cancellationDetails.refundAmount}`,
              cancellationFee: `$${cancellationDetails.cancellationFee}`
            }
          : null
    };

    return invoice;
  }
}

module.exports = new InvoiceService();
