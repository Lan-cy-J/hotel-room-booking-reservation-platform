const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const RoomType = require('../models/RoomType');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { BOOKING_STATUS, HOUSEKEEPING_STATUS } = require('../utils/constants');
const { normalizeDate, calculateNights } = require('../utils/dateUtils');

class ReportService {
  /**
   * Occupancy Report using MongoDB Aggregation
   */
  async getOccupancyReport(query) {
    const { startDate, endDate, hotelId } = query;
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    const totalDays = calculateNights(start, end);

    const hotelFilter = { isActive: true };
    if (hotelId) {
      hotelFilter._id = new mongoose.Types.ObjectId(hotelId);
    }

    const hotels = await Hotel.find(hotelFilter);
    const report = [];

    for (const hotel of hotels) {
      // 1. Calculate total room capacity for this hotel
      const roomTypes = await RoomType.find({ hotelId: hotel._id, isActive: true });
      const totalPhysicalRooms = roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0);
      const totalAvailableRoomNights = totalPhysicalRooms * totalDays;

      // 2. Aggregate overlapping occupied nights (excluding cancelled bookings)
      const bookingMatch = {
        hotelId: hotel._id,
        status: { $in: [BOOKING_STATUS.RESERVED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CHECKED_OUT] },
        checkIn: { $lt: end },
        checkOut: { $gt: start }
      };

      const overlappingBookings = await Booking.find(bookingMatch);

      let totalOccupiedNights = 0;
      overlappingBookings.forEach((b) => {
        // Calculate overlapping nights within [start, end] window
        const effectiveCheckIn = new Date(Math.max(b.checkIn.getTime(), start.getTime()));
        const effectiveCheckOut = new Date(Math.min(b.checkOut.getTime(), end.getTime()));
        const nights = calculateNights(effectiveCheckIn, effectiveCheckOut);
        totalOccupiedNights += nights;
      });

      const occupancyRate =
        totalAvailableRoomNights > 0
          ? Number(((totalOccupiedNights / totalAvailableRoomNights) * 100).toFixed(2))
          : 0;

      report.push({
        hotelId: hotel._id,
        hotelName: hotel.name,
        city: hotel.city,
        totalRooms: totalPhysicalRooms,
        periodDays: totalDays,
        totalAvailableRoomNights,
        totalOccupiedNights,
        occupancyRatePercent: Math.min(100, occupancyRate)
      });
    }

    return {
      period: { startDate: start, endDate: end, totalDays },
      hotelsCount: report.length,
      occupancyByHotel: report
    };
  }

  /**
   * Revenue Report with MongoDB Aggregation
   */
  async getRevenueReport(query) {
    const { startDate, endDate, hotelId } = query;
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    const matchStage = {
      createdAt: { $gte: start, $lte: end }
    };

    if (hotelId) {
      matchStage.hotelId = new mongoose.Types.ObjectId(hotelId);
    }

    // Pipeline to group revenue by hotel
    const revenueAggregation = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$hotelId',
          totalBookings: { $sum: 1 },
          completedOrActiveBookings: {
            $sum: {
              $cond: [{ $ne: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0]
            }
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ['$status', BOOKING_STATUS.CANCELLED] }, 1, 0]
            }
          },
          grossRevenue: { $sum: '$pricingSnapshot.totalAmount' },
          totalTaxCollected: {
            $sum: {
              $cond: [
                { $ne: ['$status', BOOKING_STATUS.CANCELLED] },
                '$pricingSnapshot.taxAmount',
                0
              ]
            }
          },
          totalRefunds: { $sum: '$cancellationDetails.refundAmount' },
          totalCancellationFees: { $sum: '$cancellationDetails.cancellationFee' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          hotelId: '$_id',
          hotelName: '$hotel.name',
          city: '$hotel.city',
          totalBookings: 1,
          completedOrActiveBookings: 1,
          cancelledBookings: 1,
          grossRevenue: { $round: ['$grossRevenue', 2] },
          totalTaxCollected: { $round: ['$totalTaxCollected', 2] },
          totalRefunds: { $round: ['$totalRefunds', 2] },
          totalCancellationFees: { $round: ['$totalCancellationFees', 2] },
          netRevenue: {
            $round: [
              {
                $subtract: ['$grossRevenue', '$totalRefunds']
              },
              2
            ]
          }
        }
      },
      { $sort: { netRevenue: -1 } }
    ]);

    // Overall portfolio totals
    const grandTotals = revenueAggregation.reduce(
      (acc, curr) => {
        acc.totalBookings += curr.totalBookings;
        acc.grossRevenue += curr.grossRevenue;
        acc.totalRefunds += curr.totalRefunds;
        acc.netRevenue += curr.netRevenue;
        return acc;
      },
      { totalBookings: 0, grossRevenue: 0, totalRefunds: 0, netRevenue: 0 }
    );

    grandTotals.grossRevenue = Number(grandTotals.grossRevenue.toFixed(2));
    grandTotals.totalRefunds = Number(grandTotals.totalRefunds.toFixed(2));
    grandTotals.netRevenue = Number(grandTotals.netRevenue.toFixed(2));

    return {
      period: { startDate: start, endDate: end },
      summary: grandTotals,
      breakdownByHotel: revenueAggregation
    };
  }

  /**
   * System-wide Dashboard Summary
   */
  async getDashboardSummary() {
    const totalHotels = await Hotel.countDocuments({ isActive: true });
    const totalRoomTypes = await RoomType.countDocuments({ isActive: true });
    const totalRooms = await Room.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const activeCheckedIn = await Booking.countDocuments({ status: BOOKING_STATUS.CHECKED_IN });
    const pendingHousekeeping = await Room.countDocuments({
      housekeepingStatus: { $in: [HOUSEKEEPING_STATUS.DIRTY, HOUSEKEEPING_STATUS.CLEANING] }
    });

    const revenueData = await Booking.aggregate([
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$pricingSnapshot.totalAmount' },
          refunds: { $sum: '$cancellationDetails.refundAmount' }
        }
      }
    ]);

    const gross = revenueData.length > 0 ? revenueData[0].grossRevenue : 0;
    const refunds = revenueData.length > 0 ? revenueData[0].refunds : 0;
    const netRevenue = Number((gross - refunds).toFixed(2));

    return {
      hotelsCount: totalHotels,
      roomTypesCount: totalRoomTypes,
      totalPhysicalRooms: totalRooms,
      totalBookings,
      activeCheckedInGuests: activeCheckedIn,
      roomsRequiringCleaning: pendingHousekeeping,
      totalNetRevenue: netRevenue
    };
  }
}

module.exports = new ReportService();
