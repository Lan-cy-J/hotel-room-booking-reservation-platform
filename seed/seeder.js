require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  Hotel,
  RoomType,
  Room,
  PricingRule,
  Booking
} = require('../models');
const {
  USER_ROLES,
  BOOKING_STATUS,
  HOUSEKEEPING_STATUS,
  PRICING_SEASONS
} = require('../utils/constants');
const { generateBookingNumber } = require('../utils/bookingNumberGenerator');
const { normalizeDate } = require('../utils/dateUtils');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Purging existing collections...');
    await Booking.deleteMany({});
    await PricingRule.deleteMany({});
    await Room.deleteMany({});
    await RoomType.deleteMany({});
    await Hotel.deleteMany({});
    await User.deleteMany({});

    console.log('[Seeder] Creating Hotels...');
    const hotelNY = await Hotel.create({
      name: 'Grand Palace Manhattan',
      city: 'New York',
      address: '750 5th Avenue, New York, NY 10019',
      amenities: ['High-Speed WiFi', 'Rooftop Pool', 'Luxury Spa', 'Fitness Center', 'Valet Parking', '24/7 Room Service'],
      rating: 4.9,
      contactEmail: 'manhattan@grandpalace.com',
      contactPhone: '+1 (212) 555-0199',
      isActive: true
    });

    const hotelLA = await Hotel.create({
      name: 'Pacific Sunset Ocean Resort',
      city: 'Los Angeles',
      address: '120 Ocean View Blvd, Santa Monica, CA 90401',
      amenities: ['Private Beach Access', 'Infinity Pool', 'Seafood Restaurant', 'High-Speed WiFi', 'Spa & Wellness'],
      rating: 4.8,
      contactEmail: 'santamonica@pacificsunset.com',
      contactPhone: '+1 (310) 555-0144',
      isActive: true
    });

    console.log('[Seeder] Creating Users (Admin, Hotel Staff, Guests)...');
    const adminPassHash = await User.hashPassword('admin123');
    const staffPassHash = await User.hashPassword('staff123');
    const guestPassHash = await User.hashPassword('guest123');

    const admin = await User.create({
      name: 'Victoria Stone (Global Admin)',
      email: 'admin@hotelchain.com',
      passwordHash: adminPassHash,
      role: USER_ROLES.ADMIN,
      phone: '+1 (800) 555-9000'
    });

    const staffNY = await User.create({
      name: 'Marcus Vance (NY Frontdesk)',
      email: 'staff.ny@hotelchain.com',
      passwordHash: staffPassHash,
      role: USER_ROLES.STAFF,
      hotelId: hotelNY._id,
      phone: '+1 (212) 555-0101'
    });

    const staffLA = await User.create({
      name: 'Elena Rostova (LA Operations)',
      email: 'staff.la@hotelchain.com',
      passwordHash: staffPassHash,
      role: USER_ROLES.STAFF,
      hotelId: hotelLA._id,
      phone: '+1 (310) 555-0102'
    });

    const guest1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: guestPassHash,
      role: USER_ROLES.GUEST,
      phone: '+1 (415) 555-2345'
    });

    const guest2 = await User.create({
      name: 'Alice Smith',
      email: 'alice.smith@example.com',
      passwordHash: guestPassHash,
      role: USER_ROLES.GUEST,
      phone: '+1 (650) 555-6789'
    });

    console.log('[Seeder] Creating Room Types...');
    // Hotel NY Room Types
    const nyDeluxe = await RoomType.create({
      hotelId: hotelNY._id,
      name: 'Deluxe King Suite',
      description: 'Spacious king-size suite with skyline view and marble bathroom',
      basePrice: 200,
      capacity: 2,
      totalRooms: 6,
      amenities: ['King Bed', 'City View', 'Mini Bar', 'Smart TV', 'Bathtub']
    });

    const nyExecutive = await RoomType.create({
      hotelId: hotelNY._id,
      name: 'Executive Family Suite',
      description: 'Luxurious suite with 2 queen beds, lounge area, and espresso bar',
      basePrice: 350,
      capacity: 4,
      totalRooms: 4,
      amenities: ['2 Queen Beds', 'Lounge Area', 'Espresso Machine', 'Panoramic View']
    });

    // Hotel LA Room Types
    const laOcean = await RoomType.create({
      hotelId: hotelLA._id,
      name: 'Oceanfront King Balcony',
      description: 'Direct Pacific oceanfront suite with private balcony',
      basePrice: 250,
      capacity: 2,
      totalRooms: 5,
      amenities: ['Private Balcony', 'Ocean View', 'King Bed', 'Jacuzzi']
    });

    const laVilla = await RoomType.create({
      hotelId: hotelLA._id,
      name: 'Beachfront Villa',
      description: 'Exclusive 2-bedroom villa with direct sand access and private patio',
      basePrice: 500,
      capacity: 5,
      totalRooms: 3,
      amenities: ['2 Bedrooms', 'Direct Beach Access', 'Private Patio', 'Kitchenette']
    });

    console.log('[Seeder] Creating Physical Rooms with Housekeeping states...');
    // Create physical rooms for NY Deluxe (6 rooms)
    const nyRooms = [];
    for (let i = 1; i <= 6; i++) {
      const room = await Room.create({
        hotelId: hotelNY._id,
        roomTypeId: nyDeluxe._id,
        roomNumber: `10${i}`,
        floor: 1,
        housekeepingStatus: i === 6 ? HOUSEKEEPING_STATUS.DIRTY : (i === 5 ? HOUSEKEEPING_STATUS.MAINTENANCE : HOUSEKEEPING_STATUS.CLEAN),
        lastCleanedAt: new Date()
      });
      nyRooms.push(room);
    }

    // Create physical rooms for NY Executive (4 rooms)
    for (let i = 1; i <= 4; i++) {
      await Room.create({
        hotelId: hotelNY._id,
        roomTypeId: nyExecutive._id,
        roomNumber: `20${i}`,
        floor: 2,
        housekeepingStatus: HOUSEKEEPING_STATUS.CLEAN,
        lastCleanedAt: new Date()
      });
    }

    // Create physical rooms for LA Ocean (5 rooms)
    const laRooms = [];
    for (let i = 1; i <= 5; i++) {
      const room = await Room.create({
        hotelId: hotelLA._id,
        roomTypeId: laOcean._id,
        roomNumber: `30${i}`,
        floor: 3,
        housekeepingStatus: i === 5 ? HOUSEKEEPING_STATUS.CLEANING : HOUSEKEEPING_STATUS.CLEAN,
        lastCleanedAt: new Date()
      });
      laRooms.push(room);
    }

    // Create physical rooms for LA Villa (3 rooms)
    for (let i = 1; i <= 3; i++) {
      await Room.create({
        hotelId: hotelLA._id,
        roomTypeId: laVilla._id,
        roomNumber: `VILLA-0${i}`,
        floor: 1,
        housekeepingStatus: HOUSEKEEPING_STATUS.CLEAN,
        lastCleanedAt: new Date()
      });
    }

    console.log('[Seeder] Creating Dynamic Pricing Rules...');
    await PricingRule.create({
      hotelId: hotelNY._id,
      roomTypeId: null, // All rooms in NY
      name: 'Autumn Festive Surge',
      season: PRICING_SEASONS.PEAK,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-10-31'),
      multiplier: 1.25, // +25%
      isActive: true
    });

    await PricingRule.create({
      hotelId: hotelLA._id,
      roomTypeId: laOcean._id,
      name: 'Summer Beachfront Weekend Premium',
      season: PRICING_SEASONS.WEEKEND,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-09-30'),
      multiplier: 1.30, // +30%
      isActive: true
    });

    console.log('[Seeder] Creating Seed Bookings (Demonstrating Full Lifecycle)...');
    const now = new Date();

    // 1. Reserved Booking
    const bkReserved = await Booking.create({
      bookingNumber: generateBookingNumber(),
      guestId: guest1._id,
      hotelId: hotelNY._id,
      roomTypeId: nyDeluxe._id,
      checkIn: normalizeDate(new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)), // +10 days
      checkOut: normalizeDate(new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000)), // +13 days (3 nights)
      guestCount: 2,
      status: BOOKING_STATUS.RESERVED,
      pricingSnapshot: {
        nights: 3,
        basePricePerNight: 200,
        appliedMultiplier: 1.25,
        ruleApplied: 'Autumn Festive Surge (PEAK Multiplier: 1.25x)',
        subtotal: 750, // 200 * 1.25 * 3
        taxRatePercent: 12,
        taxAmount: 90,
        totalAmount: 840
      },
      statusHistory: [
        { fromStatus: null, toStatus: BOOKING_STATUS.RESERVED, changedAt: new Date(), changedBy: guest1._id, note: 'Initial reservation' }
      ]
    });

    // 2. Confirmed Booking
    const bkConfirmed = await Booking.create({
      bookingNumber: generateBookingNumber(),
      guestId: guest2._id,
      hotelId: hotelLA._id,
      roomTypeId: laOcean._id,
      checkIn: normalizeDate(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)), // +5 days
      checkOut: normalizeDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)), // +7 days (2 nights)
      guestCount: 2,
      status: BOOKING_STATUS.CONFIRMED,
      pricingSnapshot: {
        nights: 2,
        basePricePerNight: 250,
        appliedMultiplier: 1.30,
        ruleApplied: 'Summer Beachfront Weekend Premium (WEEKEND Multiplier: 1.3x)',
        subtotal: 650,
        taxRatePercent: 12,
        taxAmount: 78,
        totalAmount: 728
      },
      statusHistory: [
        { fromStatus: null, toStatus: BOOKING_STATUS.RESERVED, changedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), changedBy: guest2._id, note: 'Created' },
        { fromStatus: BOOKING_STATUS.RESERVED, toStatus: BOOKING_STATUS.CONFIRMED, changedAt: new Date(), changedBy: guest2._id, note: 'Confirmed with deposit' }
      ]
    });

    // 3. Checked-in Booking (Room 101 assigned)
    const bkCheckedIn = await Booking.create({
      bookingNumber: generateBookingNumber(),
      guestId: guest1._id,
      hotelId: hotelNY._id,
      roomTypeId: nyDeluxe._id,
      assignedRoomId: nyRooms[0]._id, // Room 101
      checkIn: normalizeDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), // Yesterday
      checkOut: normalizeDate(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)), // +2 days
      guestCount: 2,
      status: BOOKING_STATUS.CHECKED_IN,
      actualCheckIn: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      pricingSnapshot: {
        nights: 3,
        basePricePerNight: 200,
        appliedMultiplier: 1.25,
        ruleApplied: 'Autumn Festive Surge (PEAK Multiplier: 1.25x)',
        subtotal: 750,
        taxRatePercent: 12,
        taxAmount: 90,
        totalAmount: 840
      },
      statusHistory: [
        { fromStatus: null, toStatus: BOOKING_STATUS.RESERVED, changedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), changedBy: guest1._id },
        { fromStatus: BOOKING_STATUS.RESERVED, toStatus: BOOKING_STATUS.CONFIRMED, changedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), changedBy: guest1._id },
        { fromStatus: BOOKING_STATUS.CONFIRMED, toStatus: BOOKING_STATUS.CHECKED_IN, changedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000), changedBy: staffNY._id, note: 'Keycard handed over' }
      ]
    });

    // 4. Checked-out Booking (Past completed stay)
    const bkCheckedOut = await Booking.create({
      bookingNumber: generateBookingNumber(),
      guestId: guest2._id,
      hotelId: hotelNY._id,
      roomTypeId: nyDeluxe._id,
      assignedRoomId: nyRooms[1]._id,
      checkIn: normalizeDate(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)),
      checkOut: normalizeDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
      guestCount: 1,
      status: BOOKING_STATUS.CHECKED_OUT,
      actualCheckIn: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      actualCheckOut: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      pricingSnapshot: {
        nights: 3,
        basePricePerNight: 200,
        appliedMultiplier: 1.0,
        ruleApplied: 'Standard Base Rate',
        subtotal: 600,
        taxRatePercent: 12,
        taxAmount: 72,
        totalAmount: 672
      },
      statusHistory: [
        { fromStatus: BOOKING_STATUS.CHECKED_IN, toStatus: BOOKING_STATUS.CHECKED_OUT, changedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), changedBy: staffNY._id }
      ]
    });

    // 5. Cancelled Booking with Full 100% Refund
    const bkCancelled100 = await Booking.create({
      bookingNumber: generateBookingNumber(),
      guestId: guest1._id,
      hotelId: hotelLA._id,
      roomTypeId: laVilla._id,
      checkIn: normalizeDate(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)),
      checkOut: normalizeDate(new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000)),
      guestCount: 4,
      status: BOOKING_STATUS.CANCELLED,
      pricingSnapshot: {
        nights: 3,
        basePricePerNight: 500,
        appliedMultiplier: 1.0,
        ruleApplied: 'Standard Base Rate',
        subtotal: 1500,
        taxRatePercent: 12,
        taxAmount: 180,
        totalAmount: 1680
      },
      cancellationDetails: {
        cancelledAt: new Date(),
        cancelledBy: guest1._id,
        reason: 'Change of vacation plans',
        refundPercentage: 100,
        refundAmount: 1680,
        cancellationFee: 0
      },
      statusHistory: [
        { fromStatus: BOOKING_STATUS.CONFIRMED, toStatus: BOOKING_STATUS.CANCELLED, changedAt: new Date(), changedBy: guest1._id, note: 'Cancelled >48h advance - 100% refund' }
      ]
    });

    console.log('\n==========================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==========================================================');
    console.log('Test Accounts:');
    console.log(' 1. Admin:   admin@hotelchain.com      / admin123');
    console.log(' 2. Staff:   staff.ny@hotelchain.com   / staff123 (Hotel: Grand Palace Manhattan)');
    console.log(' 3. Staff:   staff.la@hotelchain.com   / staff123 (Hotel: Pacific Sunset LA)');
    console.log(' 4. Guest:   john.doe@example.com      / guest123');
    console.log(' 5. Guest:   alice.smith@example.com   / guest123');
    console.log('==========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error populating database:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Destroying all collections...');
    await Booking.deleteMany({});
    await PricingRule.deleteMany({});
    await Room.deleteMany({});
    await RoomType.deleteMany({});
    await Hotel.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Data destroyed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
