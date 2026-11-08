# Drivio REST API Reference

Swagger interactive documentation is available locally at:
`http://localhost:5000/api-docs`

Base API URL: `http://localhost:5000/api/v1`

---

## 1. Authentication Endpoints

- `POST /api/v1/auth/register`: Register new Customer or Vendor
- `POST /api/v1/auth/login`: Authenticate and receive JWT + HttpOnly session cookie
- `POST /api/v1/auth/logout`: Invalidate cookie session
- `GET /api/v1/auth/me`: Get current user profile and role details
- `PATCH /api/v1/auth/profile`: Update driver details (license, phone, address)

---

## 2. Marketplace & Vehicle Endpoints

- `GET /api/v1/vehicles`: Search fleet with filters (`city`, `startDate`, `endDate`, `category`, `transmission`, `fuelType`, `seatingCapacity`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`)
- `GET /api/v1/vehicles/featured`: Top-rated curated vehicles
- `GET /api/v1/vehicles/cities`: Unique operational hubs with vehicle counts
- `GET /api/v1/vehicles/brands`: Unique brands in marketplace
- `GET /api/v1/vehicles/:id`: Comprehensive details, gallery, features, host profile, reviews, and booked calendar ranges

---

## 3. Booking & Payment Endpoints

- `POST /api/v1/bookings/calculate-price`: Verified server-side price calculator (Base, GST 18%, security deposit, platform fee)
- `POST /api/v1/bookings`: Concurrency-safe booking creation with row locking and Razorpay test order creation
- `GET /api/v1/bookings/my-bookings`: Customer's booking history
- `GET /api/v1/bookings/:id`: Specific booking details and invoice breakdown
- `POST /api/v1/bookings/:id/cancel`: Cancel booking and calculate refund
- `POST /api/v1/payments/verify`: Cryptographic signature verification and confirmation
- `POST /api/v1/payments/webhook`: Webhook handler with HMAC signature verification

---

## 4. Vendor Portal Endpoints (`requireRole: VENDOR`)

- `GET /api/v1/vendors/dashboard`: Vendor KPI stats, earnings, and recent bookings
- `GET /api/v1/vendors/vehicles`: Vendor fleet inventory
- `POST /api/v1/vendors/vehicles`: Add vehicle (requires `APPROVED` status)
- `PATCH /api/v1/vendors/vehicles/:id`: Update vehicle details
- `POST /api/v1/vendors/vehicles/:id/toggle-status`: Activate/deactivate vehicle
- `POST /api/v1/vendors/maintenance`: Schedule maintenance blockout
- `GET /api/v1/vendors/bookings`: Incoming and active fleet bookings
- `PATCH /api/v1/vendors/bookings/:id/status`: Transition lifecycle (Handover `ACTIVE` with start odometer, Return `COMPLETED` with end odometer and inspection)
- `GET /api/v1/vendors/earnings`: Financial breakdown and payout ledger
- `POST /api/v1/vendors/payouts`: Request bank payout

---

## 5. Platform Admin Endpoints (`requireRole: ADMIN`)

- `GET /api/v1/admin/stats`: Global marketplace volume, GMV, revenue, cancellation rate
- `GET /api/v1/admin/vendors`: List vendors with approval status filter
- `PATCH /api/v1/admin/vendors/:id/status`: Approve, reject, or suspend vendor
- `POST /api/v1/admin/commission`: Update global platform commission rate
- `GET /api/v1/admin/bookings`: Global booking oversight
- `GET /api/v1/admin/refunds`: Pending refund claims
- `POST /api/v1/admin/refunds/:id/process`: Disburse verified refund
- `GET /api/v1/admin/vehicles`: Full fleet moderation
- `PATCH /api/v1/admin/vehicles/:id/moderate`: Approve or suspend listing
- `GET /api/v1/admin/support`: Support tickets desk
- `POST /api/v1/admin/support/:id/reply`: Respond and update ticket status
