# Drivio Architecture Documentation

## 1. System Overview

Drivio is a modern multi-vendor car rental marketplace designed as a modular monolith. It provides separate, purpose-built dashboards and permissions for three core personas:

1. **Customers:** Search, filter, compare, book self-drive rental cars, pay online, track trip lifecycles, and request refunds.
2. **Rental Vendors:** Independent rental companies who onboard their business, manage isolated vehicle fleets, set daily pricing and security deposits, track incoming requests, record vehicle handovers/returns, and view earnings.
3. **Platform Administrators:** Global oversight of marketplace volume, vendor approvals/suspensions, dispute resolution, refund processing, listing moderation, and commission configuration.

---

## 2. Architectural Principles

- **Modular Monolith:** Co-located domain modules (`auth`, `vehicles`, `bookings`, `pricing`, `availability`, `payments`, `vendors`, `admin`, `reviews`, `support`) sharing a strongly-typed schema without distributed network hops.
- **Strict Multi-Tenant Isolation:** Vendors can only query and mutate vehicles, bookings, and earnings tied to their specific `vendorId`.
- **Server-Side Financial Authority:** Pricing is never trusted from client submissions. All calculations happen server-side in integer minor units (paise / INR cents) to prevent floating-point inaccuracies.
- **Concurrency-Safe Availability Engine:** Eliminates double-booking race conditions during simultaneous reservation attempts.

---

## 3. Concurrency-Safe Booking Availability Engine

### Interval Overlap Condition
Two bookings for the same vehicle conflict if and only if:
```sql
existingStart < requestedEnd AND existingEnd > requestedStart
```

### Concurrency Control & Row-Level Locking
When a customer initiates booking creation:
1. An explicit serializable/read-committed transaction is opened via Prisma `$transaction`.
2. A raw PostgreSQL row lock is acquired on the specific vehicle:
   ```sql
   SELECT id, "vendorId", "dailyRate", "securityDeposit", "isActive", "isApproved"
   FROM "Vehicle"
   WHERE id = $1
   FOR UPDATE;
   ```
3. Under this lock, active bookings (status `CONFIRMED` or `ACTIVE`) and temporary payment holds (`PENDING_PAYMENT` created within a 15-minute TTL window), as well as scheduled `VehicleMaintenance` intervals, are verified.
4. If no overlap exists, the booking and Razorpay order are created atomically, holding inventory while the payment session completes.

---

## 4. Pricing Engine

All monetary calculations use integer paise:
- **Base Rental Fee:** `baseRate * rentalDays` (minimum 1 day; fractional hours rounded up by ceiling policy).
- **Applicable Taxes:** 18% GST on base rental fee: `Math.round(baseAmount * 0.18)`.
- **Refundable Security Deposit:** Set per vehicle (e.g., ₹5,000 to ₹25,000). Held safely and refunded on return.
- **Platform Booking Fee:** Flat service fee (₹500 / 50000 paise).
- **Vendor Commission:** Configurable (default 10%): `baseAmount - (baseAmount * commissionRate / 100)`.
- **Historical Snapshotting:** All calculated figures are immutably persisted on the `Booking` record so that future commission or rate changes never alter historical booking invoices.

### Cancellation & Refund Policy
- **> 48 hours prior to pickup:** 100% refund of base rental + taxes + security deposit.
- **24 to 48 hours prior:** 75% refund of base rental + taxes + 100% security deposit.
- **< 24 hours prior:** 50% refund of base rental + taxes + 100% security deposit.
- **After pickup time:** 0% base rental refund; 100% security deposit returned upon condition check.

---

## 5. Payment Gateway Architecture

- **Test Mode Integration:** Razorpay SDK handles order creation (`razorpay.orders.create`) and verification.
- **Cryptographic Signature Verification:** Verifies payment authenticity server-side using HMAC-SHA256:
  ```ts
  crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex') === signature
  ```
- **Webhook Idempotency:** Webhook processor tracks unique order and payment IDs to ensure transitions are strictly applied once.
- **Zero Cardholder Storage:** No credit card numbers or sensitive CVVs touch Drivio servers.
