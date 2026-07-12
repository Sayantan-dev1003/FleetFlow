# FleetFlow — Smart Transport Operations Platform 🚛

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)

**FleetFlow** is a robust, centralized API backend designed to manage the full lifecycle of transport operations. Built for production, it seamlessly handles vehicles, drivers, trip dispatching, maintenance logs, fuel and expense tracking, and comprehensive analytics. 

The platform guarantees data integrity through Prisma transactions, preventing race conditions like double-booking, and pushes live state updates via Socket.io for a real-time operational dashboard.

---

## 📑 Table of Contents
- [Tech Stack](#-tech-stack)
- [Key Modules & Features](#-key-modules--features)
- [Strict Business Rules Enforcement](#-strict-business-rules-enforcement)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Real-Time Events (WebSockets)](#-real-time-events-websockets)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Demo Credentials](#-demo-credentials)

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| **Runtime** | Node.js (LTS v18+) |
| **Framework** | Express.js |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma |
| **Authentication** | JWT (`jsonwebtoken`) + `bcrypt` |
| **Validation** | Zod |
| **Real-time** | Socket.io |
| **Email/Cron** | Nodemailer + `node-cron` |
| **CSV Export** | `csv-stringify` |
| **Containerization** | Docker + Docker Compose |

---

## 📦 Key Modules & Features

### 1. Auth & RBAC
- Secure JWT-based authentication.
- Granular Role-Based Access Control protecting every endpoint via custom middleware.
- Passwords hashed securely using bcrypt (12 salt rounds).

### 2. Vehicles
- Complete CRUD operations.
- Advanced querying (filtering by region, type, status, pagination, searching).
- Smart availability checks (excludes vehicles in maintenance, on active trips, or retired).

### 3. Drivers
- Complete CRUD operations with safety score tracking.
- License expiration validations.
- **Background Cron Job**: Automatically emails Safety Officers when licenses are expiring within 30 days.

### 4. Trips Lifecycle (Core)
- **Draft → Dispatched → Completed / Cancelled** state machine.
- Atomic state transitions across Trip, Vehicle, and Driver records using Prisma `$transaction`.
- Cargo weight vs. vehicle capacity validations.
- Odometer updates upon trip completion.

### 5. Maintenance
- Opens maintenance logs, automatically transitioning vehicle status to `IN_SHOP`.
- Closes logs and restores vehicle availability (unless permanently retired).

### 6. Fuel & Expenses
- Tracks fuel consumption tied to specific vehicles and trips.
- Logs ad-hoc expenses (Tolls, Maintenance, Other).
- Aggregates live operational cost per vehicle.

### 7. Dashboard & KPIs
- Live aggregations for active/available vehicles, pending/active trips, fleet utilization %, and drivers on duty.
- Push-based updates via WebSockets so frontend dashboards never need to poll.

### 8. Reports & Analytics
- Calculates **Fuel Efficiency** (km/L).
- Calculates **Fleet Utilization** (%).
- Calculates **Operational Costs** (Fuel + Maintenance + Expenses).
- Calculates **Return on Investment (ROI)** per vehicle based on trip revenue.
- Streaming CSV exports for all reports.

---

## 🛡 Strict Business Rules Enforcement

FleetFlow guarantees data integrity by strictly enforcing the following rules at the database and transaction level:

1. **Unique Registration / Licenses:** Enforced at the DB level via Prisma `@unique`.
2. **Availability Guards:** Retired or In-Shop vehicles are strictly blocked from dispatch.
3. **License Validation:** Expired or suspended drivers cannot be assigned to trips (validated at both creation and dispatch time).
4. **Anti-Double-Booking:** Race condition prevention using conditional Prisma updates (`WHERE status = 'AVAILABLE'`) inside `$transaction` blocks.
5. **Capacity Guards:** Cargo weight must be ≤ vehicle max load capacity.
6. **Atomic Dispatch / Completion:** Flipping statuses for Trip, Vehicle, and Driver happen atomically in a single transaction.
7. **Maintenance Locks:** Opening a maintenance log immediately pulls the vehicle out of the dispatch pool (`IN_SHOP`).

---

## 🔐 Role-Based Access Control (RBAC)

The system supports four distinct roles:

| Module | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| **Vehicles** | Full | Read-only | Read-only | Read-only |
| **Drivers** | Read-only | Read-only (self) | Full | Read-only |
| **Trips** | Full | Full (manage assigned) | — | Read-only |
| **Maintenance** | Full | — | Read-only | Read-only |
| **Fuel & Exp.** | Full | Add fuel (own trips) | — | Full |
| **Reports** | Full | — | Partial | Full |

---

## ⚡ Real-Time Events (WebSockets)

Connect to the `/ops` Socket.io namespace to receive live push updates.

| Event | Payload | Trigger |
|---|---|---|
| `vehicle:statusChanged` | `{ vehicleId, status }` | Dispatch, Complete, Maintenance, Retire |
| `driver:statusChanged` | `{ driverId, status }` | Dispatch, Complete, Suspend |
| `trip:created` | Trip Object | New draft trip created |
| `trip:dispatched` | Trip Object | Trip dispatched |
| `trip:completed` | Trip Object | Trip finished |
| `trip:cancelled` | Trip Object | Trip cancelled |
| `dashboard:kpiUpdate` | KPI Object | Emitted after any of the above state changes |

---

## 🚀 Getting Started

### 🐳 Run with Docker (Recommended)

1. Clone the repository.
2. Navigate to the backend directory and set up your environment:
   ```bash
   cd backend
   cp .env.example .env
   ```
   *(Update `JWT_SECRET` and SMTP details in `.env` if desired).*
3. Boot up the database and API containers:
   ```bash
   docker-compose up --build
   ```
   The container startup script automatically handles database migrations and seeds the database with demo data. The API will be available at `http://localhost:4000`.

### 💻 Local Development Setup

1. Ensure Node.js (v18+) and PostgreSQL are installed locally.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Configure your `.env` file with your local PostgreSQL `DATABASE_URL`.
4. Run migrations and seed the database:
   ```bash
   npm run migrate:dev
   npm run seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
FleetFlow/
├── .gitignore                    ← root (covers entire repo)
├── README.md                     ← root
└── backend/
    ├── .env.example
    ├── .dockerignore
    ├── Dockerfile                ← multi-stage, non-root user
    ├── docker-compose.yml        ← API + Postgres with health check
    ├── entrypoint.sh             ← migrate → seed → start
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma         ← full schema with all models/enums/indexes
    │   └── seed.js               ← 4 roles + 4 demo users + 5 vehicles + 4 drivers
    └── src/
        ├── config/
        │   ├── env.js            ← fail-fast env validation
        │   ├── db.js             ← Prisma singleton
        │   └── socket.js         ← Socket.io /ops namespace
        ├── middlewares/
        │   ├── authenticate.js   ← JWT verification
        │   ├── authorize.js      ← RBAC factory
        │   ├── validate.js       ← Zod field-level validation
        │   └── errorHandler.js   ← centralized Prisma + ApiError handler
        ├── utils/
        │   ├── ApiError.js       ← custom error class with factory helpers
        │   ├── pagination.js     ← page/limit/skip + meta builder
        │   ├── dateHelpers.js    ← license validity, date range filters
        │   ├── calculations.js   ← ROI, fleet utilization, fuel efficiency
        │   └── csvExport.js      ← csv-stringify streaming
        ├── sockets/
        │   └── events.js         ← emitVehicleStatus, emitDriverStatus, emitTripEvent, emitKpiUpdate
        ├── cron/
        │   └── licenseExpiryCron.js  ← daily email alert for expiring licenses
        ├── modules/
        │   ├── auth/             ← register, login, me
        │   ├── vehicles/         ← CRUD + /available
        │   ├── drivers/          ← CRUD + /available + license check
        │   ├── trips/            ← create/dispatch/complete/cancel (all §7 rules)
        │   ├── maintenance/      ← open/close (rules #9, #10)
        │   ├── fuel-expenses/    ← fuel logs + expenses + operational cost
        │   ├── dashboard/        ← live KPI aggregation
        │   └── reports/          ← fuel-efficiency, utilization, cost, ROI, CSV export
        ├── app.js                ← Express setup, all routes mounted
        └── index.js              ← HTTP server, Socket.io, graceful shutdown

```

---

## 🔑 Demo Credentials

After running the database seed (`npm run seed` or starting the Docker container), the following users are available to test RBAC logic:

| Role | Email | Password |
|---|---|---|
| **Fleet Manager** | `manager@fleetflow.com` | `Manager@123` |
| **Driver** | `driver@fleetflow.com` | `Driver@123` |
| **Safety Officer** | `safety@fleetflow.com` | `Safety@123` |
| **Financial Analyst** | `finance@fleetflow.com` | `Finance@123` |
