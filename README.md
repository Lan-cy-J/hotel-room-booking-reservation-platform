# P03 — Hotel Room Booking & Reservation Platform

> **5th Semester CIA-3 Backend Project**  
> **Domain:** Hospitality & Tourism  
> **Stack:** Node.js, Express.js, MongoDB (Mongoose), JWT, Joi, Bcrypt

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Team Details](#team-details)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Mandatory 13 Modules Breakdown](#mandatory-13-modules-breakdown)
6. [Database Schema & Indexes](#database-schema--indexes)
7. [Core Business Logic & Algorithms](#core-business-logic--algorithms)
8. [Role-Based Access & Scoping Matrix](#role-based-access--scoping-matrix)
9. [Complete API Route Catalog](#complete-api-route-catalog)
10. [Setup & Installation Guide](#setup--installation-guide)
11. [Postman Testing & Seed Data](#postman-testing--seed-data)
12. [Viva Questions & Defense Guide](#viva-questions--defense-guide)

---

## 🏨 Project Overview

The **Hotel Room Booking & Reservation Platform (P03)** is a backend system designed for multi-property hotel chains. It delivers end-to-end functionality for:
- **Guests**: Real-time room availability discovery, dynamic pricing estimation, atomic reservations, booking lifecycle management, self-service cancellations, and itemized invoice generation.
- **Hotel Staff**: Physical room inventory management, front-desk check-in/check-out with cleanliness verification, and housekeeping state tracking.
- **Administrators**: Hotel property provisioning, room type configuration, seasonal dynamic pricing rules, and real-time MongoDB aggregation reports for occupancy and revenue.

---

## 👥 Team Details

| Roll Number | Student Name | Role / Contributions |
|---|---|---|
| *[Your Roll No]* | *[Your Name]* | Core Architecture, Availability Engine & FSM |
| *[Partner Roll No]* | *[Partner Name]* | Dynamic Pricing, Reports & Postman Suite |

---

## 🏛️ System Architecture

The application implements a layered **MVC architecture with an isolated Service Layer** for pure business logic:

```
                          ┌────────────────────────┐
                          │   Client / Postman     │
                          └───────────┬────────────┘
                                      │ HTTP / JSON
                                      ▼
                          ┌────────────────────────┐
                          │     Express Router     │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   Middleware Layer     │
                          │ - authenticateJWT      │
                          │ - authorizeRoles       │
                          │ - scopeHotelStaff      │
                          │ - validateRequest(Joi) │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   Controllers Layer    │
                          │ (HTTP extraction & res)│
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │     Service Layer      │
                          │ (Availability, Pricing,│
                          │  FSM, Refunds, Reports)│
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │     Mongoose Models    │
                          │ (Validation & Indexes) │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   MongoDB Database     │
                          └────────────────────────┘
```

---

## 📁 Folder Structure

```
c:\5BTCSDS\L&T\Hotel Room Booking & Reservation Platform\
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js                        # Server listener & graceful shutdown
├── app.js                           # Express application & global middleware
├── config/
│   └── db.js                        # MongoDB connection with In-Memory fallback
├── models/
│   ├── User.js                      # User schema with bcrypt hooks
│   ├── Hotel.js                     # Hotel property schema
│   ├── RoomType.js                  # Room types with capacity & base price
│   ├── Room.js                      # Physical rooms with housekeeping states
│   ├── PricingRule.js               # Seasonal dynamic multipliers
│   ├── Booking.js                   # Bookings with locked pricing snapshots
│   └── index.js                     # Model barrel export
├── middleware/
│   ├── auth.middleware.js           # JWT authentication
│   ├── role.middleware.js           # Role checks & Staff hotel scoping
│   ├── validate.middleware.js       # Joi request validation
│   └── error.middleware.js          # Centralized error handler
├── validators/
│   ├── auth.validator.js
│   ├── hotel.validator.js
│   ├── roomType.validator.js
│   ├── room.validator.js
│   ├── pricingRule.validator.js
│   ├── booking.validator.js
│   └── report.validator.js
├── services/
│   ├── auth.service.js
│   ├── hotel.service.js
│   ├── roomType.service.js
│   ├── room.service.js
│   ├── availability.service.js      # Date-overlap formula engine
│   ├── pricing.service.js           # Dynamic multiplier & tax calculator
│   ├── booking.service.js           # FSM lifecycle & race-condition check
│   ├── housekeeping.service.js      # Cleanliness workflow
│   ├── cancellation.service.js      # 3-tier refund policy engine
│   ├── invoice.service.js           # Itemized breakdown generator
│   └── report.service.js            # MongoDB aggregation pipelines
├── controllers/
│   ├── auth.controller.js
│   ├── hotel.controller.js
│   ├── roomType.controller.js
│   ├── room.controller.js
│   ├── availability.controller.js
│   ├── pricingRule.controller.js
│   ├── booking.controller.js
│   ├── housekeeping.controller.js
│   ├── invoice.controller.js
│   └── report.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── hotel.routes.js
│   ├── roomType.routes.js
│   ├── room.routes.js
│   ├── availability.routes.js
│   ├── pricingRule.routes.js
│   ├── booking.routes.js
│   ├── housekeeping.routes.js
│   ├── invoice.routes.js
│   ├── report.routes.js
│   └── index.js                     # Router aggregator
├── utils/
│   ├── apiResponse.js               # Standard JSON response envelope
│   ├── apiError.js                  # Custom HTTP error class
│   ├── constants.js                 # System enums & FSM transition rules
│   ├── dateUtils.js                 # UTC normalization & date math
│   └── bookingNumberGenerator.js    # BK-YYYYMMDD-XXXX generator
├── seed/
│   └── seeder.js                    # Database demo seeder
├── test/
│   └── e2e.test.js                  # Automated 13-module test suite
└── postman/
    └── Hotel_Reservation_Platform.postman_collection.json
```

---

## 📦 Mandatory 13 Modules Breakdown

| # | Mandatory Module | Implemented Features |
|---|---|---|
| **1** | **Guest Registration & Auth** | Bcrypt hashing, JWT generation, unique email validation, role guards. |
| **2** | **Hotel & Property Management** | CRUD for hotel properties, city-based queries, amenities & ratings. |
| **3** | **Room Type & Inventory** | Room types with capacity, total room counts, and physical room tracking. |
| **4** | **Availability Search Engine** | Real-time calculation based on non-overlapping active bookings. |
| **5** | **Reservation Booking Workflow** | Atomic reservation creation, inventory locking, and overbooking prevention. |
| **6** | **Dynamic Pricing Rules** | Seasonal/weekend multipliers applied and permanently snapshotted. |
| **7** | **Booking Status Management** | Strict Finite State Machine: `Reserved` → `Confirmed` → `Checked-in` → `Checked-out` → `Cancelled`. |
| **8** | **Check-in / Check-out** | Cleanliness check on check-in; timestamping and setting room dirty on checkout. |
| **9** | **Housekeeping Status Tracking** | Cleanliness states (`clean`, `dirty`, `cleaning`, `maintenance`) gatekeeping check-ins. |
| **10** | **Cancellation & Refund Policy** | 3-tier refund policy ($\ge 48$h: 100%, 24–48h: 50%, $<24$h: 0%). |
| **11** | **Guest Booking History** | Guest-scoped personal booking retrieval; cross-user access forbidden. |
| **12** | **Invoice Generation Summary** | Itemized breakdown: room charge, dynamic multiplier, 12% GST, refund details. |
| **13** | **Admin Occupancy Reports** | MongoDB aggregation pipelines for occupancy percentage and net revenue. |

---

## 🗄️ Database Schema & Indexes

### Collections & Critical Fields

1. **`users`**: `name`, `email` (unique index), `passwordHash` (`select: false`), `role` (`guest|staff|admin`), `hotelId` (for staff).
2. **`hotels`**: `name`, `city` (index), `address`, `amenities`, `rating`, `isActive`. Compound index: `{ city: 1, isActive: 1 }`.
3. **`roomtypes`**: `hotelId` (index), `name`, `basePrice`, `capacity`, `totalRooms`, `amenities`. Compound index: `{ hotelId: 1, name: 1 }` (unique).
4. **`rooms`**: `hotelId` (index), `roomTypeId` (index), `roomNumber`, `housekeepingStatus` (`clean|dirty|cleaning|maintenance`), `lastCleanedAt`. Compound index: `{ hotelId: 1, roomNumber: 1 }` (unique).
5. **`pricingrules`**: `hotelId` (index), `roomTypeId`, `name`, `season`, `startDate`, `endDate`, `multiplier`, `isActive`. Compound index: `{ hotelId: 1, isActive: 1, startDate: 1, endDate: 1 }`.
6. **`bookings`**: `bookingNumber` (unique), `guestId` (index), `hotelId` (index), `roomTypeId` (index), `assignedRoomId`, `checkIn`, `checkOut`, `status`, `pricingSnapshot`, `cancellationDetails`. Compound availability index: `{ hotelId: 1, roomTypeId: 1, status: 1, checkIn: 1, checkOut: 1 }`.

---

## 🧠 Core Business Logic & Algorithms

### 1. Date Overlap Availability Formula
Two date ranges $[A_{in}, A_{out}]$ and $[B_{in}, B_{out}]$ overlap if and only if:
$$\text{existing.checkIn} < \text{requested.checkOut} \quad \text{AND} \quad \text{existing.checkOut} > \text{requested.checkIn}$$
Active booking statuses that hold inventory: `['Reserved', 'Confirmed', 'Checked-in']`.  
Available inventory: $\text{RoomType.totalRooms} - \text{Count}(\text{Overlapping Active Bookings})$.

### 2. Dynamic Pricing Snapshot
$$\text{Base Total} = \text{basePricePerNight} \times \text{nights}$$
$$\text{Subtotal} = \text{Base Total} \times \text{appliedMultiplier}$$
$$\text{Tax (12\% GST)} = \text{Subtotal} \times 0.12$$
$$\text{Total Amount} = \text{Subtotal} + \text{Tax}$$
*Once a booking is created, the pricing is locked in `pricingSnapshot` inside MongoDB and never recalculated if future pricing rules change.*

### 3. Finite State Machine (FSM) Lifecycle
```
[Reserved] ────────► [Confirmed] ────────► [Checked-in] ────────► [Checked-out]
    │                     │
    ▼                     ▼
[Cancelled]          [Cancelled]
```
- Invalid transitions (e.g., `Confirmed` → `Checked-out` or `Checked-out` → `Cancelled`) return `400 Bad Request`.

### 4. Cancellation & Refund Policy
- **$\ge 48$ hours prior to check-in**: 100% refund, 0% fee.
- **24 to 48 hours prior to check-in**: 50% refund, 50% fee.
- **$< 24$ hours prior to check-in**: 0% refund, 100% fee.
- **After check-in / check-out**: Non-cancellable.

---

## 🛡️ Role-Based Access & Scoping Matrix

| Role | Search & View Hotels | Book Rooms & View History | Manage Inventory & Housekeeping | Check-in / Check-out | Manage Properties & Rules | View Analytics Reports |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Guest** | ✅ | ✅ (Own Only) | ❌ | ❌ | ❌ | ❌ |
| **Staff** | ✅ | ❌ | ✅ (Assigned Hotel) | ✅ (Assigned Hotel) | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ (All Hotels) | ✅ (All Hotels) | ✅ | ✅ |

---

## 🌐 Complete API Route Catalog

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register Guest / Staff
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/profile` — Get authenticated user details

### 2. Hotels (`/api/hotels`)
- `GET /api/hotels` — Public hotel search (optional `?city=...`)
- `GET /api/hotels/:id` — Public hotel details
- `POST /api/hotels` — Admin create hotel
- `PUT /api/hotels/:id` — Admin update hotel
- `DELETE /api/hotels/:id` — Admin deactivate hotel

### 3. Room Types (`/api/hotels/:hotelId/room-types` & `/api/room-types`)
- `GET /api/hotels/:hotelId/room-types` — Public list of room types for a hotel
- `POST /api/hotels/:hotelId/room-types` — Admin create room type
- `PUT /api/room-types/:id` — Admin update room type
- `DELETE /api/room-types/:id` — Admin deactivate room type

### 4. Physical Rooms (`/api/rooms`)
- `GET /api/rooms` — Staff / Admin list physical rooms
- `POST /api/rooms` — Staff / Admin add physical room
- `PUT /api/rooms/:id` — Staff / Admin update room details

### 5. Availability Engine (`/api/availability`)
- `GET /api/availability/search?city=...&checkIn=...&checkOut=...&guests=...` — Search availability
- `GET /api/availability/check?roomTypeId=...&checkIn=...&checkOut=...` — Real-time remaining count

### 6. Dynamic Pricing Rules (`/api/pricing-rules`)
- `GET /api/pricing-rules` — Admin list pricing rules
- `POST /api/pricing-rules` — Admin create multiplier rule
- `PUT /api/pricing-rules/:id` — Admin update rule
- `DELETE /api/pricing-rules/:id` — Admin deactivate rule

### 7. Bookings & Lifecycle (`/api/bookings`)
- `POST /api/bookings` — Create reservation
- `GET /api/bookings/my-bookings` — Guest personal booking history
- `GET /api/bookings` — Staff / Admin list all bookings
- `GET /api/bookings/:id` — View single booking details
- `PUT /api/bookings/:id/confirm` — Transition to `Confirmed`
- `PUT /api/bookings/:id/checkin` — Check-in (assigns clean room, `Checked-in`)
- `PUT /api/bookings/:id/checkout` — Check-out (sets room to dirty, `Checked-out`)
- `PUT /api/bookings/:id/cancel` — Cancel reservation with refund calculation

### 8. Housekeeping (`/api/housekeeping`)
- `GET /api/housekeeping/rooms` — Staff / Admin view room statuses
- `PUT /api/housekeeping/rooms/:id/status` — Update status (`clean`, `dirty`, `cleaning`, `maintenance`)

### 9. Invoices (`/api/invoices`)
- `GET /api/invoices/:bookingId` — Get itemized invoice breakdown

### 10. Reports (`/api/reports`)
- `GET /api/reports/occupancy?startDate=...&endDate=...` — Aggregated occupancy rate report
- `GET /api/reports/revenue?startDate=...&endDate=...` — Gross/net revenue aggregation report
- `GET /api/reports/dashboard` — Executive KPI dashboard

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (Local daemon or cloud Atlas URI). *Note: The app includes an embedded In-Memory MongoDB fallback for instant demonstration if local MongoDB daemon is not running.*

### Installation Steps
```bash
# 1. Clone or navigate to the project directory
cd "Hotel Room Booking & Reservation Platform"

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env (already configured for local development)

# 4. Seed the database with realistic demo data
npm run seed

# 5. Run the automated End-to-End Test Suite (Tests all 13 modules)
npm test

# 6. Start the development server
npm run dev
# Server runs on: http://localhost:5000/api
```

---

## 📮 Postman Testing & Seed Data

A ready-to-import Postman Collection is located at:  
`postman/Hotel_Reservation_Platform.postman_collection.json`

### Pre-configured Seed Accounts:
| Role | Email | Password | Assigned Scope |
|---|---|---|---|
| **Admin** | `admin@hotelchain.com` | `admin123` | Global Management |
| **Staff (NY)** | `staff.ny@hotelchain.com` | `staff123` | Grand Palace Manhattan |
| **Staff (LA)** | `staff.la@hotelchain.com` | `staff123` | Pacific Sunset LA |
| **Guest 1** | `john.doe@example.com` | `guest123` | Personal Bookings |
| **Guest 2** | `alice.smith@example.com` | `guest123` | Personal Bookings |

---

## 🎓 Viva Questions & Defense Guide

**Q1: How do you prevent double-booking when two guests book the same room simultaneously?**  
> **Ans:** We calculate overlapping active bookings in real-time (`checkIn < req.checkOut && checkOut > req.checkIn`) against the room type's `totalRooms`. The check and booking creation occur within an atomic database operation, rejecting requests with `409 Conflict` if available rooms $\le 0$.

**Q2: Why do you snapshot pricing on the booking document?**  
> **Ans:** If seasonal or weekend dynamic pricing rules change in the future, past or confirmed bookings must not change their historical charged price. Storing an immutable `pricingSnapshot` subdocument guarantees financial consistency and auditable invoices.

**Q3: How is staff scoping enforced across hotel branches?**  
> **Ans:** Through custom `scopeHotelStaff` middleware. When a staff user logs in, their JWT contains their assigned `hotelId`. Any attempt by staff from Hotel A to create rooms, check-in guests, or update housekeeping for Hotel B is rejected with `403 Forbidden`.

**Q4: How does MongoDB Aggregation optimize reporting queries?**  
> **Ans:** Instead of pulling thousands of booking documents into Node.js memory, we execute `$match`, `$group`, `$lookup`, and `$project` pipeline stages directly inside the database engine to compute occupancy percentages, tax collected, refunds, and net revenue in milliseconds.
