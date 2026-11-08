# Drivio Database Design Documentation

## 1. Relational Entity Overview

The schema is built on PostgreSQL using Prisma ORM.

### Core Tables & Models

1. **`User`**: Core identity table.
   - `id`: UUID Primary Key
   - `email`: String (Unique)
   - `passwordHash`: String (bcrypt hash)
   - `role`: Enum (`CUSTOMER`, `VENDOR`, `ADMIN`)
   - `firstName`, `lastName`, `phone`, `avatarUrl`, `isEmailVerified`, `isActive`
   - Timestamps: `createdAt`, `updatedAt`

2. **`CustomerProfile`**: Extended customer details.
   - `userId`: Foreign key with 1-to-1 unique constraint to `User.id` (Cascade delete)
   - `licenseNumber`, `licenseExpiry`, `address`, `city`, `state`, `postalCode`, `emergencyContact`

3. **`Vendor`**: Independent rental company profile.
   - `userId`: Foreign key to `User.id`
   - `businessName`: String
   - `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`)
   - `commissionRate`: Float (default 10.0%)
   - `rating`, `totalReviews`, `authorizedPerson`, `city`, `address`

4. **`Vehicle`**: Fleet inventory owned by a specific vendor.
   - `vendorId`: Foreign key to `Vendor.id` (Cascade delete)
   - `brand`, `model`, `year`, `registrationNumber` (Unique)
   - `category`: Enum (`SUV`, `SEDAN`, `HATCHBACK`, `LUXURY`, `ELECTRIC`)
   - `transmission`: Enum (`AUTOMATIC`, `MANUAL`)
   - `fuelType`: Enum (`PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`)
   - `dailyRate`: Integer (paise)
   - `securityDeposit`: Integer (paise)
   - `mileagePolicy`, `pickupAddress`, `city`, `state`, `isActive`, `isApproved`, `rating`, `totalTrips`

5. **`VehicleImage`**: Multi-image gallery for vehicles with primary flag and sorting order.

6. **`VehicleFeature`**: Discrete vehicle equipment (Sunroof, 360 Camera, ADAS, etc.).

7. **`VehicleMaintenance`**: Maintenance blockouts that prevent booking conflicts during service periods.

8. **`Booking`**: Central marketplace transaction.
   - `bookingCode`: Unique human-readable code (e.g., `DRV-2026-1001`)
   - `customerId`: Foreign key to `User.id`
   - `vendorId`: Foreign key to `Vendor.id`
   - `vehicleId`: Foreign key to `Vehicle.id`
   - `startDate`, `endDate`, `rentalDays`
   - `baseRate`, `baseAmount`, `taxesAmount`, `securityDeposit`, `platformFee`, `totalAmount`, `vendorEarnings` (All in paise)
   - `status`: Enum (`PENDING_PAYMENT`, `AWAITING_APPROVAL`, `CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `REJECTED`, `REFUND_PENDING`, `REFUNDED`)
   - `startOdometer`, `returnOdometer`, `damageReport`

9. **`BookingStatusHistory`**: Immutable audit trail of every status transition.

10. **`Payment`**: Razorpay transaction record with order and signature IDs.

11. **`Refund`**: Cancellation and dispute refund ledger.

12. **`Payout`**: Vendor withdrawal and settlement ledger.

13. **`Review`**: Customer review and rating linked to a completed booking.

14. **`CommissionConfig`**: Dynamic platform-wide commission rate settings.

---

## 2. Indexes and Performance Optimization

- `Vehicle`: Index on `(city, category, dailyRate)` for fast marketplace search and faceted filtering.
- `Vehicle`: Index on `(vendorId)` for instant vendor fleet queries.
- `Booking`: Compound index on `(vehicleId, startDate, endDate, status)` for microsecond availability interval checking.
- `Payment`: Indexes on `razorpayOrderId` and `idempotencyKey` for fast webhook lookup.
