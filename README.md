# Drivio — Modern Multi-Vendor Car Rental Marketplace

![Drivio Platform](https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=80)

**Drivio** is an enterprise-grade, multi-vendor self-drive car rental marketplace. Designed with a modular monolith architecture, Drivio unites selective customers with independent car rental companies and fleet operators across India.

---

## 🌟 Key Features

### 1. Customer Experience
- **Automotive Discovery Engine:** Faceted search across Indian hubs (Delhi NCR, Gurgaon, Noida, Jaipur, Chandigarh) with date/time interval filtering, transmission, fuel, seating, and price sliders.
- **Detailed Vehicle Specifications:** High-resolution image galleries, technical specs, vendor credentials, features, and real-time blackout availability calendar.
- **7-Step Verified Booking Checkout:** Server-authorized price calculation in integer paise (base fee, 18% GST, refundable deposit, platform fee), primary driver license verification, and Razorpay test mode payment.
- **Personalized Customer Dashboard:** Booking lifecycle monitoring (`CONFIRMED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), tiered cancellation with automated refund estimation, downloadable printable invoices, wishlist, verified post-trip reviews, and support ticket system.

### 2. Multi-Tenant Vendor Portal
- **Isolated Fleet Management:** Vendors only see and mutate their own fleet. Full CRUD for cars, pricing, deposits, and multi-image galleries.
- **Fleet Availability & Maintenance:** Schedule service blockouts to prevent booking overlap.
- **Booking Dispatch Operations:** Complete state-machine lifecycle:
  - Transition `CONFIRMED` &rarr; `ACTIVE` (Vehicle handover with odometer logging).
  - Transition `ACTIVE` &rarr; `COMPLETED` (Vehicle return with return odometer and damage inspection recording).
- **Host Earnings & Payout Ledger:** Transparent 90% net host earnings (10% platform commission), available balance calculation, and bank withdrawal requests.
- **Vendor KYC Onboarding Gate:** New vendors start in `PENDING` status and cannot publish fleet until verified by platform administrators.

### 3. Platform Administration Console
- **Marketplace Overview:** Real-time analytics on platform GMV, net revenue, active vendors, listed vehicles, total bookings, cancellation rate, and fleet utilization.
- **Vendor KYC Review:** One-click approval, rejection, or suspension of vendor partners.
- **Dispute & Refund Workflow:** Verified refund processing that returns funds and transitions bookings to `REFUNDED`.
- **Fleet Moderation:** Suspend or approve individual vehicle listings.
- **Commission Rate Configuration:** Dynamically update the default platform commission rate (default 10%).
- **Support Desk:** Respond to customer and vendor support tickets.

### 4. Critical Backend Engineering
- **Concurrency-Safe Availability Engine:** Uses PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) within Prisma transactions to prevent double-booking race conditions during simultaneous reservations:
  $$\text{existingStart} < \text{requestedEnd} \quad\text{AND}\quad \text{existingEnd} > \text{requestedStart}$$
- **Integer Minor Units:** All financial values (daily rates, taxes, deposits, earnings, refunds) are computed strictly in paise (INR cents) to eliminate floating-point arithmetic errors.
- **Cryptographic Payment Verification:** HMAC-SHA256 signature verification for Razorpay payment orders and webhooks.
- **Role-Based Access Control (RBAC):** HTTP-only cookie authentication, JWT validation, and middleware authorization for `CUSTOMER`, `VENDOR`, and `ADMIN`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v7, TanStack Query, Zustand, Lucide React, Axios, Zod |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL 16, Redis 7, JWT, Cookie-Parser, Helmet, Express-Rate-Limit, Razorpay SDK, Swagger/OpenAPI |
| **DevOps & Testing** | Docker & Docker Compose, Vitest, tsx |

---

## 🚀 Quick Start Guide

### 1. Launch PostgreSQL and Redis
```bash
docker compose up -d
```

### 2. Setup Backend & Seed Database
```bash
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm test
npm run dev
```
Backend API will start on: **`http://localhost:5000`**  
Interactive Swagger API Documentation: **`http://localhost:5000/api-docs`**

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will be live on: **`http://localhost:5173`** (or `http://localhost:5175`)

---

## 🔑 Demo Credentials

*Quick tip: On the login page (`/login`), click the one-click demo buttons to instantly sign in without typing!*

| Role | Email | Password | Details |
|---|---|---|---|
| **Platform Administrator** | `admin@drivio.com` | `Admin@12345` | Global oversight, vendor KYC, refunds |
| **Approved Fleet Host** | `vendor1@royalwheels.in` | `Vendor@12345` | Royal Wheels Fleet Solutions (Delhi/Gurgaon) |
| **Approved Fleet Host 2**| `vendor2@apexmobility.in` | `Vendor@12345` | Apex Mobility Car Rentals (Noida/Jaipur) |
| **Pending Fleet Host** | `vendor3@heritagedrive.in` | `Vendor@12345` | Heritage Drive Experiences (Jaipur) |
| **Verified Customer** | `aarav@example.com` | `Customer@12345` | Aarav Sharma (Upcoming & cancelled trips) |
| **Verified Customer 2**| `priya@example.com` | `Customer@12345` | Priya Patel (Active ongoing rental) |
| **Verified Customer 3**| `rohan@example.com` | `Customer@12345` | Rohan Verma (Completed rental with review) |

---

## 🧪 Automated Test Suite

Run the Vitest test suite covering pricing calculations, availability overlap logic, authentication, and multi-tenant vendor isolation:
```bash
cd backend
npm test
```
Result: **13/13 unit & integration tests passing**.

---

## 📂 Project Structure

```
drivio/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Full normalized PostgreSQL relational schema
│   │   └── seed.ts             # Rich Indian marketplace seed data
│   ├── src/
│   │   ├── config/             # DB, Redis, Razorpay, Swagger, Env
│   │   ├── middleware/         # Auth JWT, Role RBAC, Zod Validate, RateLimit, ErrorHandler
│   │   ├── modules/
│   │   │   ├── auth/           # Registration, login, profile
│   │   │   ├── pricing/        # Centralized pricing & cancellation refund engine
│   │   │   ├── availability/   # Concurrency-safe interval overlap engine
│   │   │   ├── vehicles/       # Public search, filters, specifications
│   │   │   ├── bookings/       # Transactional reservation with row locking
│   │   │   ├── payments/       # Razorpay orders, HMAC verification, webhooks
│   │   │   ├── vendors/        # Multi-tenant fleet, handovers, returns, payouts
│   │   │   ├── admin/          # Platform metrics, vendor approvals, refunds, commission
│   │   │   ├── reviews/        # Customer verified review engine
│   │   │   ├── wishlist/       # Saved vehicles
│   │   │   ├── notifications/  # User notification feed
│   │   │   └── support/        # Ticket desk
│   │   ├── utils/              # JWT, response helpers
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server listener
│   └── tests/                  # Unit and integration tests
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, SearchBar, VehicleCard, CheckoutModal, etc.
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, ExploreCarsPage, VehicleDetailsPage, Host, Login, Register
│   │   │   ├── customer/       # CustomerDashboardPage (bookings, cancellation, invoices, profile)
│   │   │   ├── vendor/         # VendorDashboardPage (fleet CRUD, handovers, returns, payouts)
│   │   │   └── admin/          # AdminDashboardPage (oversight, approvals, refunds, commission)
│   │   ├── services/           # Axios API services
│   │   ├── store/              # Zustand authStore
│   │   ├── types/              # Full TypeScript interfaces
│   │   └── utils/              # INR currency and date formatters
│   ├── index.html
│   └── vite.config.ts
├── docs/                       # Architecture, Database, API, Setup guides
├── docker-compose.yml          # PostgreSQL 16 & Redis 7
├── DEVELOPMENT_STATUS.md       # Implementation tracker
└── README.md
```
