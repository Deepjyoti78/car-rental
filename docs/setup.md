# Drivio Local Development & Setup Guide

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v22.20 tested)
- **Docker & Docker Compose**: For PostgreSQL 16 and Redis 7
- **npm**: v9.0.0 or higher

---

## 2. Infrastructure Setup

1. Start PostgreSQL (mapped to port 5433) and Redis (mapped to port 6381):
   ```bash
   docker compose up -d
   ```
2. Verify containers are running healthy:
   ```bash
   docker ps --filter "name=drivio"
   ```

---

## 3. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push Prisma schema to the local database:
   ```bash
   npx prisma db push
   ```
4. Seed the database with sample vendors, customers, fleet, bookings, and reviews:
   ```bash
   npx tsx prisma/seed.ts
   ```
5. Run automated unit & integration tests:
   ```bash
   npm test
   ```
6. Start the development API server:
   ```bash
   npm run dev
   ```
   API will be accessible at: `http://localhost:5000`  
   Swagger API Documentation: `http://localhost:5000/api-docs`

---

## 4. Frontend Setup

1. Navigate to frontend directory in another terminal:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Frontend will be accessible at: `http://localhost:5173` (or `http://localhost:5175`)

---

## 5. Demo Credentials

| Role | Email | Password | Description |
|---|---|---|---|
| **Platform Administrator** | `admin@drivio.com` | `Admin@12345` | Global oversight, approvals, refunds |
| **Approved Vendor** | `vendor1@royalwheels.in` | `Vendor@12345` | Royal Wheels Fleet Solutions (Delhi/Gurgaon) |
| **Approved Vendor 2** | `vendor2@apexmobility.in` | `Vendor@12345` | Apex Mobility Car Rentals (Noida/Jaipur) |
| **Pending Vendor** | `vendor3@heritagedrive.in` | `Vendor@12345` | Heritage Drive Experiences (Jaipur) |
| **Customer** | `aarav@example.com` | `Customer@12345` | Customer with active & confirmed trips |
| **Customer 2** | `priya@example.com` | `Customer@12345` | Customer with ongoing rental |
| **Customer 3** | `rohan@example.com` | `Customer@12345` | Customer with past rental & review |

*Tip: Use the one-click quick-fill buttons on the login page (`/login`) to easily test each role.*
