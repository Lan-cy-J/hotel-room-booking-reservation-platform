require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Hotel, RoomType, Room, PricingRule, Booking } = require('../models');

// Helper to make HTTP requests against local Express test server
function makeRequest(server, options, requestBody = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, rawBody: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (requestBody) {
      req.write(JSON.stringify(requestBody));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n============================================================');
  console.log(' STARTING COMPREHENSIVE END-TO-END TEST SUITE (13 MODULES)');
  console.log('============================================================\n');

  await connectDB();

  // Clean test DB
  await Booking.deleteMany({});
  await PricingRule.deleteMany({});
  await Room.deleteMany({});
  await RoomType.deleteMany({});
  await Hotel.deleteMany({});
  await User.deleteMany({});

  const server = app.listen(0);
  const testState = {};

  try {
    // ------------------------------------------------------------------------
    console.log('\n[TEST 1] System Health Check');
    // ------------------------------------------------------------------------
    {
      const res = await makeRequest(server, { path: '/api/health', method: 'GET' });
      assert(res.status === 200, 'Health check returns 200 OK');
      assert(res.body.status === 'UP', 'Health status is UP');
      assert(Array.isArray(res.body.modules) && res.body.modules.length === 13, 'All 13 modules listed');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 2] Authentication & Registration (Module 1)');
    // ------------------------------------------------------------------------
    {
      // 2.1 Register guest
      const regRes = await makeRequest(
        server,
        { path: '/api/auth/register', method: 'POST' },
        { name: 'John Doe', email: 'john@test.com', password: 'password123', phone: '1234567890' }
      );
      assert(regRes.status === 201, 'Guest registration returns 201 Created');
      assert(regRes.body.data.user.email === 'john@test.com', 'User email matches');
      assert(regRes.body.data.token, 'JWT token returned on registration');
      testState.guest1Token = regRes.body.data.token;
      testState.guest1Id = regRes.body.data.user.id;

      // 2.2 Register duplicate email (should fail with 409)
      const dupRes = await makeRequest(
        server,
        { path: '/api/auth/register', method: 'POST' },
        { name: 'John Dup', email: 'john@test.com', password: 'password123' }
      );
      assert(dupRes.status === 409, 'Duplicate registration correctly returns 409 Conflict');

      // 2.3 Register second guest
      const reg2Res = await makeRequest(
        server,
        { path: '/api/auth/register', method: 'POST' },
        { name: 'Alice Smith', email: 'alice@test.com', password: 'password123' }
      );
      testState.guest2Token = reg2Res.body.data.token;
      testState.guest2Id = reg2Res.body.data.user.id;

      // 2.4 Login with valid credentials
      const loginRes = await makeRequest(
        server,
        { path: '/api/auth/login', method: 'POST' },
        { email: 'john@test.com', password: 'password123' }
      );
      assert(loginRes.status === 200, 'Login with correct credentials returns 200 OK');
      assert(loginRes.body.data.token, 'JWT token returned on login');

      // 2.5 Login with invalid password
      const badLogin = await makeRequest(
        server,
        { path: '/api/auth/login', method: 'POST' },
        { email: 'john@test.com', password: 'wrongpassword' }
      );
      assert(badLogin.status === 401, 'Invalid password correctly returns 401 Unauthorized');

      // 2.6 Seed Admin & Staff directly for role tests
      const adminPassHash = await User.hashPassword('admin123');
      const adminUser = await User.create({
        name: 'Super Admin',
        email: 'admin@test.com',
        passwordHash: adminPassHash,
        role: 'admin'
      });
      const adminLogin = await makeRequest(
        server,
        { path: '/api/auth/login', method: 'POST' },
        { email: 'admin@test.com', password: 'admin123' }
      );
      testState.adminToken = adminLogin.body.data.token;
      assert(testState.adminToken, 'Admin token acquired');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 3] Hotel & Property Management (Module 2)');
    // ------------------------------------------------------------------------
    {
      // 3.1 Non-admin cannot create hotel
      const unauthHotel = await makeRequest(
        server,
        {
          path: '/api/hotels',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        },
        { name: 'Rogue Hotel', city: 'Miami', address: '123 Beach Ave' }
      );
      assert(unauthHotel.status === 403, 'Guest cannot create hotel (403 Forbidden)');

      // 3.2 Admin creates Hotel 1 (New York)
      const hotel1Res = await makeRequest(
        server,
        {
          path: '/api/hotels',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        },
        {
          name: 'Grand Royal Plaza',
          city: 'New York',
          address: '500 5th Avenue',
          amenities: ['WiFi', 'Pool', 'Spa'],
          rating: 4.9
        }
      );
      assert(hotel1Res.status === 201, 'Admin creates Hotel 1 (201 Created)');
      testState.hotel1Id = hotel1Res.body.data._id;

      // 3.3 Admin creates Hotel 2 (Los Angeles)
      const hotel2Res = await makeRequest(
        server,
        {
          path: '/api/hotels',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        },
        {
          name: 'Pacific Breeze Resort',
          city: 'Los Angeles',
          address: '100 Ocean Drive',
          amenities: ['Beach Access', 'WiFi'],
          rating: 4.7
        }
      );
      testState.hotel2Id = hotel2Res.body.data._id;

      // 3.4 Public lists hotels
      const listHotels = await makeRequest(server, { path: '/api/hotels', method: 'GET' });
      assert(listHotels.status === 200, 'Public can list hotels');
      assert(listHotels.body.data.length === 2, 'Found 2 hotels');

      // 3.5 Create Staff accounts scoped to hotels
      const staffPassHash = await User.hashPassword('staff123');
      const staff1 = await User.create({
        name: 'Marcus NY',
        email: 'staff.ny@test.com',
        passwordHash: staffPassHash,
        role: 'staff',
        hotelId: testState.hotel1Id
      });
      const staff2 = await User.create({
        name: 'Elena LA',
        email: 'staff.la@test.com',
        passwordHash: staffPassHash,
        role: 'staff',
        hotelId: testState.hotel2Id
      });

      const s1Login = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, { email: 'staff.ny@test.com', password: 'staff123' });
      testState.staff1Token = s1Login.body.data.token;
      const s2Login = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, { email: 'staff.la@test.com', password: 'staff123' });
      testState.staff2Token = s2Login.body.data.token;
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 4] Room Type & Physical Room Inventory (Module 3)');
    // ------------------------------------------------------------------------
    {
      // 4.1 Admin creates RoomType (Deluxe Suite: capacity 2, basePrice $200, totalRooms 2)
      const rtRes = await makeRequest(
        server,
        {
          path: `/api/hotels/${testState.hotel1Id}/room-types`,
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        },
        {
          name: 'Deluxe King Suite',
          basePrice: 200,
          capacity: 2,
          totalRooms: 2,
          amenities: ['King Bed', 'Jacuzzi']
        }
      );
      assert(rtRes.status === 201, 'Admin creates RoomType (201 Created)');
      testState.roomType1Id = rtRes.body.data._id;

      // 4.2 Staff NY creates physical rooms for Hotel 1
      const room101 = await makeRequest(
        server,
        {
          path: '/api/rooms',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        },
        {
          hotelId: testState.hotel1Id,
          roomTypeId: testState.roomType1Id,
          roomNumber: '101',
          floor: 1,
          housekeepingStatus: 'clean'
        }
      );
      assert(room101.status === 201, 'Staff NY adds Room 101');
      testState.room101Id = room101.body.data._id;

      const room102 = await makeRequest(
        server,
        {
          path: '/api/rooms',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        },
        {
          hotelId: testState.hotel1Id,
          roomTypeId: testState.roomType1Id,
          roomNumber: '102',
          floor: 1,
          housekeepingStatus: 'dirty'
        }
      );
      assert(room102.status === 201, 'Staff NY adds Room 102 (marked dirty)');
      testState.room102Id = room102.body.data._id;

      // 4.3 Cross-hotel staff scoping check: Staff LA cannot add rooms to Hotel 1
      const rogueRoom = await makeRequest(
        server,
        {
          path: '/api/rooms',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.staff2Token}` }
        },
        {
          hotelId: testState.hotel1Id,
          roomTypeId: testState.roomType1Id,
          roomNumber: '103'
        }
      );
      assert(rogueRoom.status === 403, 'Cross-hotel staff room creation rejected (403 Forbidden)');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 5] Dynamic Pricing Rules (Module 6)');
    // ------------------------------------------------------------------------
    {
      // 5.1 Admin creates seasonal rule: 1.25x multiplier for peak season
      const ruleRes = await makeRequest(
        server,
        {
          path: '/api/pricing-rules',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        },
        {
          hotelId: testState.hotel1Id,
          name: 'Peak Season Surge',
          season: 'peak',
          startDate: '2026-10-01',
          endDate: '2026-10-31',
          multiplier: 1.25
        }
      );
      assert(ruleRes.status === 201, 'Dynamic pricing rule created (201 Created)');
      testState.pricingRuleId = ruleRes.body.data._id;
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 6] Availability Search Engine (Module 4)');
    // ------------------------------------------------------------------------
    {
      // 6.1 Search available rooms in New York for 2 nights (2026-10-10 to 2026-10-12)
      const searchRes = await makeRequest(
        server,
        {
          path: `/api/availability/search?city=New%20York&checkIn=2026-10-10&checkOut=2026-10-12&guests=2`,
          method: 'GET'
        }
      );
      assert(searchRes.status === 200, 'Search availability returns 200 OK');
      assert(searchRes.body.data.length === 1, 'Found 1 matching room type');
      assert(searchRes.body.data[0].roomType.availableRooms === 2, 'All 2 rooms currently available');
      assert(searchRes.body.data[0].pricing.appliedMultiplier === 1.25, 'Peak season 1.25x multiplier applied');
      assert(searchRes.body.data[0].pricing.totalAmount === 560, 'Pricing: (200 * 1.25 * 2 nights) + 12% tax = $560.00');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 7] Reservation Booking Workflow & Overbooking Prevention (Module 5)');
    // ------------------------------------------------------------------------
    {
      // 7.1 Guest 1 books Room 1 of 2 for 2026-10-10 to 2026-10-12
      const bk1Res = await makeRequest(
        server,
        {
          path: '/api/bookings',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        },
        {
          hotelId: testState.hotel1Id,
          roomTypeId: testState.roomType1Id,
          checkIn: '2026-10-10',
          checkOut: '2026-10-12',
          guestCount: 2
        }
      );
      assert(bk1Res.status === 201, 'Guest 1 creates reservation (201 Created)');
      assert(bk1Res.body.data.status === 'Reserved', 'Initial status is Reserved');
      assert(bk1Res.body.data.pricingSnapshot.totalAmount === 560, 'Locked pricing snapshot matches $560');
      testState.booking1Id = bk1Res.body.data._id;
      testState.booking1Number = bk1Res.body.data.bookingNumber;

      // 7.2 Guest 2 books Room 2 of 2 for overlapping dates (2026-10-11 to 2026-10-13)
      const bk2Res = await makeRequest(
        server,
        {
          path: '/api/bookings',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.guest2Token}` }
        },
        {
          hotelId: testState.hotel1Id,
          roomTypeId: testState.roomType1Id,
          checkIn: '2026-10-11',
          checkOut: '2026-10-13',
          guestCount: 2
        }
      );
      assert(bk2Res.status === 201, 'Guest 2 creates overlapping reservation for remaining 1 room');
      testState.booking2Id = bk2Res.body.data._id;

      // 7.3 Guest 1 attempts 3rd booking for overlapping dates (Total rooms = 2). MUST FAIL with 409 Conflict
      const overbookingRes = await makeRequest(
        server,
        {
          path: '/api/bookings',
          method: 'POST',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        },
        {
          hotelId: testState.hotel1Id,
          roomTypeId: testState.roomType1Id,
          checkIn: '2026-10-10',
          checkOut: '2026-10-12',
          guestCount: 2
        }
      );
      assert(overbookingRes.status === 409, 'Overbooking beyond room inventory correctly rejected (409 Conflict)');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 8] Booking Status FSM Lifecycle (Module 7)');
    // ------------------------------------------------------------------------
    {
      // 8.1 Confirm Booking 1: Reserved -> Confirmed
      const confirmRes = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking1Id}/confirm`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        }
      );
      assert(confirmRes.status === 200, 'Booking 1 transitioned: Reserved -> Confirmed');
      assert(confirmRes.body.data.status === 'Confirmed', 'Status is Confirmed');

      // 8.2 Attempt invalid transition: Confirmed -> Checked-out (Must fail)
      const invalidFsm = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking1Id}/checkout`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        }
      );
      assert(invalidFsm.status === 400, 'Invalid transition Confirmed -> Checked-out rejected (400 Bad Request)');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 9] Housekeeping & Check-in / Check-out (Modules 8 & 9)');
    // ------------------------------------------------------------------------
    {
      // 9.1 Attempt Check-in with dirty room (Room 102). MUST FAIL
      const dirtyCheckIn = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking1Id}/checkin`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        },
        { assignedRoomId: testState.room102Id }
      );
      assert(dirtyCheckIn.status === 400, 'Check-in with dirty room rejected (400 Bad Request)');

      // 9.2 Check-in with clean room (Room 101). SUCCEEDS
      const validCheckIn = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking1Id}/checkin`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        },
        { assignedRoomId: testState.room101Id }
      );
      assert(validCheckIn.status === 200, 'Check-in with clean room succeeds (Confirmed -> Checked-in)');
      assert(validCheckIn.body.data.status === 'Checked-in', 'Booking status is Checked-in');

      // 9.3 Check-out: Checked-in -> Checked-out and automatically sets Room 101 to dirty
      const checkOutRes = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking1Id}/checkout`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        }
      );
      assert(checkOutRes.status === 200, 'Check-out succeeds (Checked-in -> Checked-out)');

      // Verify Room 101 is now dirty
      const room101Check = await Room.findById(testState.room101Id);
      assert(room101Check.housekeepingStatus === 'dirty', 'Assigned Room 101 automatically marked dirty after check-out');

      // 9.4 Housekeeping staff cleans Room 101
      const cleanRoom = await makeRequest(
        server,
        {
          path: `/api/housekeeping/rooms/${testState.room101Id}/status`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.staff1Token}` }
        },
        { housekeepingStatus: 'clean' }
      );
      assert(cleanRoom.status === 200, 'Housekeeping marks room clean');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 10] Cancellation & Refund Policy Engine (Module 10)');
    // ------------------------------------------------------------------------
    {
      // 10.1 Cancel Booking 2 (>48 hours advance notice -> 100% refund)
      const cancelRes = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking2Id}/cancel`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.guest2Token}` }
        },
        { reason: 'Trip rescheduled' }
      );
      assert(cancelRes.status === 200, 'Cancellation processed successfully');
      assert(cancelRes.body.data.refundSummary.refundPercentage === 100, '100% refund applied for >=48h advance notice');
      assert(cancelRes.body.data.refundSummary.cancellationFee === 0, '$0 cancellation fee');

      // 10.2 Attempting to cancel already completed Booking 1 (Checked-out) MUST FAIL
      const badCancel = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking1Id}/cancel`,
          method: 'PUT',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        }
      );
      assert(badCancel.status === 400, 'Cancelling Checked-out booking rejected (400 Bad Request)');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 11] Guest Booking History & Ownership (Module 11)');
    // ------------------------------------------------------------------------
    {
      // 11.1 Guest 1 views personal bookings
      const myBk = await makeRequest(
        server,
        {
          path: '/api/bookings/my-bookings',
          method: 'GET',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        }
      );
      assert(myBk.status === 200, 'Guest 1 retrieves personal booking history');
      assert(myBk.body.data.length === 1, 'Guest 1 has 1 booking in history');

      // 11.2 Guest 1 attempts to view Guest 2's booking (Must fail with 403 Forbidden)
      const crossView = await makeRequest(
        server,
        {
          path: `/api/bookings/${testState.booking2Id}`,
          method: 'GET',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        }
      );
      assert(crossView.status === 403, 'Cross-guest booking access rejected (403 Forbidden)');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 12] Invoice Generation Summary (Module 12)');
    // ------------------------------------------------------------------------
    {
      const invRes = await makeRequest(
        server,
        {
          path: `/api/invoices/${testState.booking1Id}`,
          method: 'GET',
          headers: { Authorization: `Bearer ${testState.guest1Token}` }
        }
      );
      assert(invRes.status === 200, 'Invoice generated successfully');
      assert(invRes.body.data.invoiceNumber.startsWith('INV-'), 'Invoice number formatted properly');
      assert(invRes.body.data.financialSummary.grossTotal === 560, 'Invoice gross total matches $560');
      assert(Array.isArray(invRes.body.data.lineItems) && invRes.body.data.lineItems.length === 4, 'Contains complete line item breakdown');
    }

    // ------------------------------------------------------------------------
    console.log('\n[TEST 13] Admin Occupancy & Revenue Reports (Module 13)');
    // ------------------------------------------------------------------------
    {
      // 13.1 Occupancy report
      const occRes = await makeRequest(
        server,
        {
          path: `/api/reports/occupancy?startDate=2026-10-01&endDate=2026-10-31`,
          method: 'GET',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        }
      );
      assert(occRes.status === 200, 'Admin occupancy report generated');
      assert(occRes.body.data.occupancyByHotel.length === 2, 'Occupancy calculated for all active hotels');

      // 13.2 Revenue report
      const revRes = await makeRequest(
        server,
        {
          path: `/api/reports/revenue?startDate=2026-01-01&endDate=2026-12-31`,
          method: 'GET',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        }
      );
      assert(revRes.status === 200, 'Admin revenue report generated');
      assert(revRes.body.data.summary.totalBookings === 2, 'Revenue aggregated across all bookings');

      // 13.3 Executive Dashboard
      const dashRes = await makeRequest(
        server,
        {
          path: '/api/reports/dashboard',
          method: 'GET',
          headers: { Authorization: `Bearer ${testState.adminToken}` }
        }
      );
      assert(dashRes.status === 200, 'Admin dashboard metrics retrieved');
      assert(dashRes.body.data.hotelsCount === 2, 'Dashboard shows 2 hotels');
    }

    console.log('\n============================================================');
    console.log(' 🎉 ALL 13 MODULES PASSED END-TO-END VERIFICATION PERFECTLY!');
    console.log('============================================================\n');

  } finally {
    server.close();
    await disconnectDB();
  }
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
