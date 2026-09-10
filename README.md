# AuraStays — Hotel Room Booking & Reservation Platform

> P03 — 5th Semester CIA-3 Full-Stack Project
> Domain: Hospitality & Tourism
> Application: Multi-property Hotel Booking & Reservation Platform

---

## Table of Contents

* [Project Overview](#project-overview)
* [Key Features](#key-features)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Application Roles](#application-roles)
* [Project Structure](#project-structure)
* [Core Modules](#core-modules)
* [Database Design](#database-design)
* [Core Business Logic](#core-business-logic)
* [Frontend](#frontend)
* [API Documentation](#api-documentation)
* [Authentication & Authorization](#authentication--authorization)
* [Setup & Installation](#setup--installation)
* [Running the Application](#running-the-application)
* [Demo Accounts](#demo-accounts)
* [Seed Data](#seed-data)
* [Testing](#testing)
* [Postman Collection](#postman-collection)
* [API Response Format](#api-response-format)
* [Security](#security)
* [Viva / Technical Highlights](#viva--technical-highlights)
* [Future Enhancements](#future-enhancements)
* [Project Status](#project-status)

---

## Project Overview

AuraStays is a full-stack hotel room booking and reservation platform designed to manage multiple hotel properties from a single system.

The platform supports the complete hotel reservation lifecycle:

```text
Guest Registration
       |
       v
Hotel & Room Discovery
       |
       v
Availability Search
       |
       v
Dynamic Price Calculation
       |
       v
Reservation
       |
       v
Confirmation
       |
       v
Check-in
       |
       v
Stay
       |
       v
Check-out
       |
       v
Invoice / Booking History
```

The system is designed around three primary user roles:

* Guest — searches hotels, checks availability, creates reservations, views bookings, cancels reservations, and accesses invoices.
* Staff — manages physical rooms, housekeeping status, check-ins, and check-outs for their assigned hotel.
* Admin — manages properties, room types, pricing rules, and platform-wide analytics.

The backend follows a layered architecture separating routes, middleware, controllers, services, models, and database operations.

```text
Routes
  |
  v
Middleware
  |
  v
Controllers
  |
  v
Services
  |
  v
Models
  |
  v
MongoDB
```

The frontend communicates with the REST API through a centralized API client and provides separate interfaces for guests, hotel staff, and administrators.

---

## Key Features

### Guest Features

* Guest registration and login
* JWT-based authentication
* Hotel discovery
* City-based hotel search
* Room type browsing
* Room availability checking
* Guest-capacity filtering
* Dynamic pricing preview
* Reservation creation
* Automatic booking number generation
* Booking confirmation
* Booking history
* Booking cancellation
* Refund calculation
* Itemized invoice generation
* Protected access to personal bookings

### Staff Features

* Hotel-scoped authentication
* Front-desk dashboard
* View active reservations
* Assign physical rooms during check-in
* Cleanliness verification before check-in
* Guest check-in
* Guest check-out
* Automatic room status update after checkout
* Housekeeping dashboard
* Room housekeeping status management
* Prevention of cross-hotel inventory access

### Admin Features

* Executive dashboard
* Platform-wide KPI overview
* Hotel/property management
* Room type management
* Physical room inventory visibility
* Dynamic pricing rule management
* Occupancy reports
* Revenue reports
* MongoDB aggregation-based analytics
* Global access across hotel properties

---

## Technology Stack

### Frontend

| Technology      | Purpose                     |
| --------------- | --------------------------- |
| React 18        | UI framework                |
| Vite            | Frontend build tool         |
| React Router    | Client-side routing         |
| Lucide React    | UI icons                    |
| Canvas Confetti | Booking success interaction |
| CSS             | Custom responsive UI        |

### Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Runtime                   |
| Express.js | REST API framework        |
| Mongoose   | MongoDB ODM               |
| MongoDB    | Database                  |
| JWT        | Authentication            |
| Bcrypt.js  | Password hashing          |
| Joi        | Request validation        |
| Helmet     | HTTP security headers     |
| CORS       | Cross-origin support      |
| Morgan     | HTTP request logging      |
| Dotenv     | Environment configuration |

### Testing and Development

| Tool                  | Purpose                    |
| --------------------- | -------------------------- |
| Node.js Test Runner   | End-to-end testing         |
| MongoDB Memory Server | In-memory database testing |
| Nodemon               | Development server         |
| Postman               | API testing                |

---

## System Architecture

```text
                    +-------------------------+
                    |      React Frontend     |
                    |       Vite + React      |
                    +------------+------------+
                                 |
                            HTTP / JSON
                                 |
                                 v
                    +-------------------------+
                    |      Express Router     |
                    +------------+------------+
                                 |
                                 v
                    +-------------------------+
                    |     Middleware Layer    |
                    |                         |
                    | JWT Authentication      |
                    | Role Authorization      |
                    | Hotel Scoping           |
                    | Joi Validation          |
                    | Error Handling          |
                    +------------+------------+
                                 |
                                 v
                    +-------------------------+
                    |    Controllers Layer    |
                    |                         |
                    | HTTP Request / Response |
                    +------------+------------+
                                 |
                                 v
                    +-------------------------+
                    |      Service Layer      |
                    |                         |
                    | Availability            |
                    | Booking / FSM           |
                    | Pricing                 |
                    | Cancellation / Refunds  |
                    | Housekeeping            |
                    | Invoices                |
                    | Reports                 |
                    +------------+------------+
                                 |
                                 v
                    +-------------------------+
                    |    Mongoose Models      |
                    | Validation + Indexes     |
                    +------------+------------+
                                 |
                                 v
                    +-------------------------+
                    |        MongoDB           |
                    +-------------------------+
```

---

## Application Roles

| Feature               | Guest | Staff | Admin |
| --------------------- | :---: | :---: | :---: |
| View hotels           |  Yes  |  Yes  |  Yes  |
| Search availability   |  Yes  |  Yes  |  Yes  |
| Create bookings       |  Yes  |   No  |  Yes  |
| View own bookings     |  Yes  |   No  |  Yes  |
| View all bookings     |   No  |  Yes  |  Yes  |
| Cancel bookings       |  Yes  |   No  |  Yes  |
| Generate invoices     |  Yes  |  Yes  |  Yes  |
| Manage physical rooms |   No  |  Yes  |  Yes  |
| Manage housekeeping   |   No  |  Yes  |  Yes  |
| Check-in guests       |   No  |  Yes  |  Yes  |
| Check-out guests      |   No  |  Yes  |  Yes  |
| Manage hotels         |   No  |   No  |  Yes  |
| Manage room types     |   No  |   No  |  Yes  |
| Manage pricing rules  |   No  |   No  |  Yes  |
| Occupancy reports     |   No  |   No  |  Yes  |
| Revenue reports       |   No  |   No  |  Yes  |
| Executive dashboard   |   No  |   No  |  Yes  |

### Staff Hotel Scoping

Each staff member is associated with a specific hotel.

For example:

```text
NY Staff
   |
   v
Grand Palace Manhattan
   |
   v
Can manage only NY rooms, bookings, and housekeeping
```

A staff member attempting to manipulate another hotel's inventory receives:

```text
403 Forbidden
```

---

## Project Structure

```text
hotel-room-booking-reservation-platform/
|
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── app.js
├── server.js
|
├── config/
│   └── db.js
|
├── models/
│   ├── User.js
│   ├── Hotel.js
│   ├── RoomType.js
│   ├── Room.js
│   ├── PricingRule.js
│   ├── Booking.js
│   └── index.js
|
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   └── error.middleware.js
|
├── validators/
│   ├── auth.validator.js
│   ├── hotel.validator.js
│   ├── roomType.validator.js
│   ├── room.validator.js
│   ├── availability.validator.js
│   ├── pricingRule.validator.js
│   ├── booking.validator.js
│   └── report.validator.js
|
├── services/
│   ├── auth.service.js
│   ├── hotel.service.js
│   ├── roomType.service.js
│   ├── room.service.js
│   ├── availability.service.js
│   ├── pricing.service.js
│   ├── booking.service.js
│   ├── housekeeping.service.js
│   ├── cancellation.service.js
│   ├── invoice.service.js
│   └── report.service.js
|
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
|
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
│   └── index.js
|
├── utils/
│   ├── apiResponse.js
│   ├── apiError.js
│   ├── constants.js
│   ├── dateUtils.js
│   └── bookingNumberGenerator.js
|
├── seed/
│   └── seeder.js
|
├── test/
│   └── e2e.test.js
|
├── postman/
│   └── Hotel_Reservation_Platform.postman_collection.json
|
└── client/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    |
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        |
        ├── api/
        │   └── client.js
        |
        ├── context/
        │   └── AuthContext.jsx
        |
        ├── components/
        │   ├── Navbar.jsx
        │   ├── BookingModal.jsx
        │   ├── InvoiceModal.jsx
        │   ├── StatusBadge.jsx
        │   └── Toast.jsx
        |
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── MyBookingsPage.jsx
            ├── StaffDashboardPage.jsx
            └── AdminDashboardPage.jsx
```

---

## Core Modules

The backend implements the following hotel reservation modules.

| #  | Module                              | Implementation                                     |
| -- | ----------------------------------- | -------------------------------------------------- |
| 1  | Guest Registration & Authentication | JWT, Bcrypt, validation, role-based access         |
| 2  | Hotel & Property Management         | Hotel CRUD, city filtering, amenities, ratings     |
| 3  | Room Type & Inventory               | Room types, capacity, pricing, physical rooms      |
| 4  | Availability Search Engine          | Date-overlap based inventory calculation           |
| 5  | Reservation Booking Workflow        | Availability validation and overbooking prevention |
| 6  | Dynamic Pricing Rules               | Seasonal and weekend multipliers                   |
| 7  | Booking Status Management           | Finite State Machine                               |
| 8  | Check-in / Check-out                | Room assignment and stay lifecycle                 |
| 9  | Housekeeping Tracking               | Clean, dirty, cleaning, maintenance states         |
| 10 | Cancellation & Refund Policy        | Time-based refund calculation                      |
| 11 | Guest Booking History               | Guest-scoped booking access                        |
| 12 | Invoice Generation                  | Itemized charges, tax and refund details           |
| 13 | Admin Reports                       | Occupancy, revenue and KPI aggregation             |

---

## Database Design

MongoDB is used as the primary database.

### Users

Collection:

```text
users
```

Fields:

```text
name
email
passwordHash
role
hotelId
phone
```

Roles:

```text
guest
staff
admin
```

The email field has a unique index.

Passwords are stored as Bcrypt hashes and are never stored in plain text.

---

### Hotels

Collection:

```text
hotels
```

Fields:

```text
name
city
address
amenities
rating
contactEmail
contactPhone
isActive
```

Indexes include:

```text
city
{ city: 1, isActive: 1 }
```

---

### Room Types

Collection:

```text
roomtypes
```

Fields:

```text
hotelId
name
description
basePrice
capacity
totalRooms
amenities
isActive
```

Compound uniqueness:

```text
{ hotelId: 1, name: 1 }
```

---

### Physical Rooms

Collection:

```text
rooms
```

Each document represents an individual physical hotel room.

Fields:

```text
hotelId
roomTypeId
roomNumber
floor
housekeepingStatus
lastCleanedAt
```

Housekeeping states:

```text
clean
dirty
cleaning
maintenance
```

Room numbers are unique within a hotel.

---

### Pricing Rules

Collection:

```text
pricingrules
```

Fields:

```text
hotelId
roomTypeId
name
season
startDate
endDate
multiplier
isActive
```

Pricing rules can apply to:

* An entire hotel
* A specific room type
* A defined date range

---

### Bookings

Collection:

```text
bookings
```

Fields:

```text
bookingNumber
guestId
hotelId
roomTypeId
assignedRoomId
checkIn
checkOut
guestCount
status
pricingSnapshot
statusHistory
cancellationDetails
actualCheckIn
actualCheckOut
```

The booking collection contains an availability-focused compound index:

```text
{
  hotelId: 1,
  roomTypeId: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1
}
```

---

## Core Business Logic

### Availability Calculation

Two reservations overlap when:

```text
existing.checkIn < requested.checkOut
AND
existing.checkOut > requested.checkIn
```

Only bookings with the following statuses consume inventory:

```text
Reserved
Confirmed
Checked-in
```

Therefore:

```text
Available Rooms
=
Total Rooms
-
Number of Overlapping Active Bookings
```

Example:

```text
Room Type Inventory = 5

Active overlapping bookings = 3

Available Rooms = 5 - 3 = 2
```

---

## Dynamic Pricing

The system calculates pricing using the applicable pricing multiplier.

```text
Base Total
=
Base Price Per Night × Number of Nights
```

```text
Subtotal
=
Base Total × Applied Multiplier
```

```text
GST
=
Subtotal × Tax Rate
```

```text
Final Total
=
Subtotal + GST
```

The default tax rate is:

```text
12%
```

### Example

```text
Base price = $200/night
Stay = 2 nights
Multiplier = 1.25x
GST = 12%
```

Calculation:

```text
Base Total = 200 × 2
           = $400

Subtotal = 400 × 1.25
         = $500

GST = 500 × 0.12
    = $60

Final Total = $560
```

---

## Pricing Snapshot

When a booking is created, its calculated price is stored inside:

```text
pricingSnapshot
```

Example:

```json
{
  "nights": 2,
  "basePricePerNight": 200,
  "appliedMultiplier": 1.25,
  "subtotal": 500,
  "taxRatePercent": 12,
  "taxAmount": 60,
  "totalAmount": 560
}
```

This prevents future pricing-rule changes from modifying existing reservations.

The price at the time of booking remains fixed for that reservation.

---

## Booking Finite State Machine

The booking lifecycle follows a strict Finite State Machine.

```text
                    +---------------+
                    |    Reserved   |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    |   Confirmed   |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    |  Checked-in   |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Checked-out   |
                    +---------------+

Reserved -----------------> Cancelled
Confirmed -----------------> Cancelled
```

Invalid transitions are rejected.

For example:

```text
Confirmed -> Checked-out
```

is invalid because the guest must be checked in first.

The API returns:

```text
400 Bad Request
```

for invalid state transitions.

---

## Housekeeping Workflow

Every physical room maintains a housekeeping state.

```text
Clean
  |
  v
Assigned / Checked-in
  |
  v
Checked-out
  |
  v
Dirty
  |
  v
Cleaning
  |
  v
Clean
```

A room marked as:

```text
dirty
cleaning
maintenance
```

cannot be used for guest check-in.

This ensures that front-desk operations respect the physical condition of hotel rooms.

---

## Cancellation & Refund Policy

The platform uses a three-tier cancellation policy.

| Time Before Check-in | Refund |  Fee |
| -------------------- | -----: | ---: |
| 48 hours or more     |   100% |   0% |
| 24–48 hours          |    50% |  50% |
| Less than 24 hours   |     0% | 100% |

Bookings that have already reached:

```text
Checked-in
Checked-out
```

cannot be cancelled.

Refund information is stored in the booking's cancellation details and reflected in the invoice.

---

## Frontend

AuraStays includes a React-based frontend built with Vite.

### Guest Interface

The guest-facing interface provides:

* Hotel search
* Room availability
* Pricing information
* Booking modal
* Booking confirmation
* Booking history
* Cancellation
* Invoice viewing
* Authentication

### Staff Dashboard

The staff portal provides two primary workspaces.

#### Front Desk

* Active reservations
* Guest check-in
* Room assignment
* Guest check-out
* Automatic dirty-room marking

#### Housekeeping Board

* View room status
* Update room cleanliness
* Manage cleaning workflow
* Identify rooms under maintenance

### Admin Dashboard

The admin portal provides:

#### Overview KPIs

* Net revenue
* Platform-level statistics
* Property performance

#### Occupancy Report

* Select reporting date range
* Calculate occupancy
* View aggregated results

#### Revenue Aggregation

* Gross revenue
* Refund deductions
* Net revenue
* Tax-related metrics

#### Pricing Rules

* View pricing rules
* Create new rules
* Manage seasonal multipliers

---

## Frontend Route Protection

React Router protects role-specific routes.

```text
/                  -> Public
/login             -> Public
/register          -> Public
/my-bookings       -> Guest

/staff/*           -> Staff + Admin

/admin/*           -> Admin only
```

Unauthorized users are redirected to:

```text
/login
```

---

## API Documentation

All API endpoints are prefixed with:

```text
/api
```

Base URL during local development:

```text
http://localhost:5000/api
```

---

### Health Check

```http
GET /api/health
```

Returns system status and confirms that the platform modules are available.

---

### Authentication

#### Register

```http
POST /api/auth/register
```

#### Login

```http
POST /api/auth/login
```

#### Profile

```http
GET /api/auth/profile
```

---

### Hotels

```http
GET    /api/hotels
GET    /api/hotels/:id
POST   /api/hotels
PUT    /api/hotels/:id
DELETE /api/hotels/:id
```

Hotel listing supports optional city filtering:

```text
/api/hotels?city=New%20York
```

---

### Room Types

```http
GET    /api/hotels/:hotelId/room-types
POST   /api/hotels/:hotelId/room-types
GET    /api/room-types/:id
PUT    /api/room-types/:id
DELETE /api/room-types/:id
```

---

### Physical Rooms

```http
GET  /api/rooms
POST /api/rooms
PUT  /api/rooms/:id
```

---

### Availability

#### Search

```http
GET /api/availability/search
```

Example:

```text
/api/availability/search?city=New%20York&checkIn=2026-10-10&checkOut=2026-10-12&guests=2
```

#### Check Specific Room Type

```http
GET /api/availability/check
```

---

### Dynamic Pricing Rules

```http
GET    /api/pricing-rules
POST   /api/pricing-rules
PUT    /api/pricing-rules/:id
DELETE /api/pricing-rules/:id
```

---

### Bookings

#### Create Reservation

```http
POST /api/bookings
```

#### Guest Booking History

```http
GET /api/bookings/my-bookings
```

#### All Bookings

```http
GET /api/bookings
```

#### Single Booking

```http
GET /api/bookings/:id
```

#### Confirm

```http
PUT /api/bookings/:id/confirm
```

#### Check-in

```http
PUT /api/bookings/:id/checkin
```

#### Check-out

```http
PUT /api/bookings/:id/checkout
```

#### Cancel

```http
PUT /api/bookings/:id/cancel
```

---

### Housekeeping

```http
GET /api/housekeeping/rooms
PUT /api/housekeeping/rooms/:id/status
```

---

### Invoices

```http
GET /api/invoices/:bookingId
```

Returns an itemized invoice containing applicable room charges, pricing multiplier, tax, total amount, and refund information when applicable.

---

### Reports

#### Dashboard

```http
GET /api/reports/dashboard
```

#### Occupancy

```http
GET /api/reports/occupancy?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

#### Revenue

```http
GET /api/reports/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

Reports use MongoDB aggregation pipelines for database-side calculations.

---

## Authentication & Authorization

The platform uses JWT authentication.

After login, the API returns a token:

```text
Bearer <JWT>
```

The frontend stores the token and automatically injects it into API requests.

Example:

```http
Authorization: Bearer eyJhbGciOi...
```

Authorization is enforced using middleware.

```text
authenticateJWT
       |
       v
authorizeRoles
       |
       v
scopeHotelStaff
       |
       v
Controller
```

---

## Security

The backend includes several security measures:

* JWT authentication
* Bcrypt password hashing
* Role-based authorization
* Hotel-level staff authorization
* Joi input validation
* Helmet security headers
* CORS configuration
* Centralized error handling
* Unique email constraints
* Protected guest booking access
* Protected administrative endpoints
* Server-side business-rule validation

Passwords are never returned as plain text.

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hotel_booking_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
TAX_RATE_PERCENT=12
```

### Environment Variable Reference

| Variable           | Purpose                   | Example                                      |
| ------------------ | ------------------------- | -------------------------------------------- |
| `PORT`             | Backend server port       | `5000`                                       |
| `NODE_ENV`         | Runtime environment       | `development`                                |
| `MONGO_URI`        | MongoDB connection string | `mongodb://127.0.0.1:27017/hotel_booking_db` |
| `JWT_SECRET`       | JWT signing secret        | `your_secret_key`                            |
| `JWT_EXPIRES_IN`   | Token lifetime            | `7d`                                         |
| `TAX_RATE_PERCENT` | GST/tax percentage        | `12`                                         |

Never commit a production `.env` file or real JWT secrets to Git.

---

## Setup & Installation

### Prerequisites

Install:

* Node.js 18+
* npm 9+
* MongoDB local installation or MongoDB Atlas

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hotel-room-booking-reservation-platform
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` from `.env.example`.

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the MongoDB URI and JWT secret if required.

### 4. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

---

## Running the Application

The project consists of two development servers.

### Backend

From the project root:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

API:

```text
http://localhost:5000/api
```

### Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The Vite development server proxies `/api` requests to:

```text
http://localhost:5000
```

---

## Demo Accounts

| Role  | Email                     | Password   | Scope                       |
| ----- | ------------------------- | ---------- | --------------------------- |
| Admin | `admin@hotelchain.com`    | `admin123` | All hotels                  |
| Staff | `staff.ny@hotelchain.com` | `staff123` | Grand Palace Manhattan      |
| Staff | `staff.la@hotelchain.com` | `staff123` | Pacific Sunset Ocean Resort |
| Guest | `john.doe@example.com`    | `guest123` | Personal bookings           |
| Guest | `alice.smith@example.com` | `guest123` | Personal bookings           |

These credentials are intended for local demonstration and testing only.

---

## Seed Data

The project includes realistic demonstration data.

Run:

```bash
npm run seed
```

The seeder creates:

* 2 hotels
* Admin account
* 2 staff accounts
* 2 guest accounts
* 4 room types
* Physical rooms
* Dynamic pricing rules
* Sample bookings demonstrating multiple lifecycle states

The server also automatically seeds the database when it starts and detects an empty database.

### Destroy Seed Data

```bash
npm run seed:destroy
```

Use this carefully because the command removes the seeded application data.

---

## Testing

The project contains an end-to-end test suite covering the major hotel reservation workflows.

Run:

```bash
npm test
```

The test suite covers scenarios including:

```text
Health check
Guest registration
Duplicate email rejection
Login authentication
Invalid password rejection
Role-based authorization
Hotel creation
Hotel listing
Staff hotel scoping
Room type creation
Physical room creation
Cross-hotel access prevention
Dynamic pricing
Availability calculation
Reservation creation
Overbooking prevention
Booking FSM transitions
Invalid FSM transitions
Dirty-room check-in prevention
Clean-room check-in
Check-out workflow
Housekeeping updates
Cancellation/refund logic
Guest booking isolation
Invoice generation
Occupancy reporting
Revenue reporting
```

The test suite uses MongoDB Memory Server where applicable, allowing tests to run without depending on a persistent production database.

---

## Postman Collection

A ready-to-import Postman collection is included at:

```text
postman/Hotel_Reservation_Platform.postman_collection.json
```

Import this file into Postman to test the REST API manually.

Recommended testing order:

```text
1. Health Check
       |
       v
2. Register / Login
       |
       v
3. Hotel APIs
       |
       v
4. Room Type APIs
       |
       v
5. Room APIs
       |
       v
6. Availability
       |
       v
7. Pricing Rules
       |
       v
8. Create Booking
       |
       v
9. Confirm Booking
       |
       v
10. Check-in
       |
       v
11. Check-out
       |
       v
12. Invoice
       |
       v
13. Reports
```

---

## API Response Format

The backend uses standardized API response helpers.

Successful responses follow a consistent structure similar to:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Common HTTP status codes include:

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| `200`  | Successful request                              |
| `201`  | Resource created                                |
| `400`  | Invalid request or business rule violation      |
| `401`  | Authentication required or invalid credentials  |
| `403`  | Insufficient permissions                        |
| `404`  | Resource not found                              |
| `409`  | Conflict, such as overbooking or duplicate data |
| `500`  | Internal server error                           |

---

## Overbooking Prevention

The booking engine verifies inventory before creating a reservation.

For example:

```text
Total rooms = 2

Booking A
    |
    +----------------+

Booking B
    |
    +----------------+

Available rooms = 0
```

A third overlapping reservation is rejected with:

```text
409 Conflict
```

This prevents reservations from exceeding available room inventory.

---

## MongoDB Aggregation

Administrative reports are calculated using MongoDB aggregation pipelines instead of loading all booking records into application memory.

Typical aggregation stages include:

```text
$match
   |
   v
$group
   |
   v
$lookup
   |
   v
$project
```

This allows the database engine to calculate:

* Occupancy
* Booking counts
* Gross revenue
* Refund deductions
* Net revenue
* Tax-related metrics

directly against stored data.

---

## Separation of Responsibilities

The application separates business logic from HTTP handling.

### Routes

Define API endpoints.

```text
/routes
```

### Middleware

Handles:

* Authentication
* Authorization
* Hotel scoping
* Validation
* Error handling

```text
/middleware
```

### Controllers

Handle the request-response lifecycle:

```text
Request -> Service -> Response
```

```text
/controllers
```

### Services

Contain business rules such as:

* Availability
* Pricing
* Booking lifecycle
* Cancellation
* Housekeeping
* Reports

```text
/services
```

### Models

Define MongoDB schemas, validation, relationships, and indexes.

```text
/models
```

This structure improves maintainability, testability, and separation of concerns.

---

## Viva / Technical Highlights

### How does the system prevent overbooking?

The availability engine checks overlapping active bookings using:

```text
existing.checkIn < requested.checkOut
AND
existing.checkOut > requested.checkIn
```

The number of overlapping active bookings is compared with the room type inventory before a reservation is created.

If no inventory remains, the request is rejected with `409 Conflict`.

---

### Why is pricing stored as a snapshot?

Dynamic pricing rules can change over time.

If a guest books a room at:

```text
1.25x
```

and an administrator later changes the rule to:

```text
1.50x
```

the existing reservation must retain its original price.

Therefore, calculated pricing information is stored in `pricingSnapshot`.

---

### How is the booking lifecycle controlled?

A Finite State Machine defines legal booking transitions:

```text
Reserved
   |
   v
Confirmed
   |
   v
Checked-in
   |
   v
Checked-out
```

Cancellation is allowed only from appropriate pre-stay states.

Invalid transitions are rejected by the service layer.

---

### How is staff access restricted?

Each staff account is associated with a specific:

```text
hotelId
```

The authorization middleware verifies that the requested resource belongs to the staff member's assigned hotel.

Therefore:

```text
NY Staff -> NY Hotel    = Allowed
NY Staff -> LA Hotel    = Forbidden
```

---

### Why use MongoDB aggregation for reports?

Aggregation allows calculations to happen inside MongoDB rather than transferring large datasets into Node.js.

This is more efficient for:

* Filtering
* Grouping
* Joining
* Revenue calculation
* Occupancy calculation

---

### Why use a service layer?

The service layer keeps business logic independent from HTTP-specific code.

For example:

```text
Controller
   |
   v
booking.service.js
   |
   +--> availability.service.js
   |
   +--> pricing.service.js
   |
   v
MongoDB
```

This improves:

* Maintainability
* Reusability
* Testing
* Separation of concerns

---

## Future Enhancements

Possible extensions include:

* Online payment gateway integration
* Email booking confirmations
* SMS notifications
* Password reset
* Guest reviews and ratings
* Hotel image uploads
* Advanced room search filters
* Coupon and promotional codes
* Loyalty and rewards system
* Multi-currency support
* Multi-language support
* Calendar-based booking UI
* Real-time notifications
* WebSocket-based front-desk updates
* Advanced revenue management
* Docker deployment
* Cloud hosting
* CI/CD pipeline
* Production monitoring and logging

---

## Project Status

| Component                |  Status  |
| ------------------------ | :------: |
| Backend API              | Complete |
| MongoDB Database         | Complete |
| JWT Authentication       | Complete |
| Role-Based Authorization | Complete |
| Hotel Management         | Complete |
| Room Inventory           | Complete |
| Availability Engine      | Complete |
| Dynamic Pricing          | Complete |
| Booking FSM              | Complete |
| Check-in / Check-out     | Complete |
| Housekeeping             | Complete |
| Cancellation / Refunds   | Complete |
| Invoice Generation       | Complete |
| Admin Analytics          | Complete |
| React Frontend           | Complete |
| Guest Portal             | Complete |
| Staff Dashboard          | Complete |
| Admin Dashboard          | Complete |
| Postman Collection       | Complete |
| E2E Test Suite           | Complete |

---

## Academic Project

**Project:** P03 — Hotel Room Booking & Reservation Platform
**Course:** 5th Semester CIA-3
**Domain:** Hospitality & Tourism
**Architecture:** Layered Architecture with Service Layer
**Database:** MongoDB
**Frontend:** React + Vite
**Backend:** Node.js + Express.js

---

## Summary

AuraStays is a full-stack hotel room booking and reservation platform that combines a React frontend with a structured Express.js and MongoDB backend.

The project demonstrates:

```text
REST APIs
JWT Authentication
Role-Based Access Control
Database Design
MongoDB Indexing
MongoDB Aggregation Pipelines
Service-Layer Architecture
Finite State Machines
Dynamic Pricing
Inventory Management
Overbooking Prevention
Housekeeping Workflows
Refund Calculation
Invoice Generation
Automated E2E Testing
```

The platform covers the complete hotel reservation lifecycle, from room discovery and availability checking through reservation, check-in, stay management, checkout, cancellation, invoicing, and administrative reporting.
