# FleetFlow — Smart Transport Operations Platform 🚛

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-5.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-cyan)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black)

## 📖 Introduction

In the modern logistics landscape, managing a transport fleet relies heavily on fragmented spreadsheets, disconnected dispatch systems, and delayed financial reporting. 

**The Problem:** Fleet managers and dispatchers struggle with manual tracking of vehicle availability, driver eligibility (e.g., expired licenses), and overlapping schedules. Double-booking vehicles or drivers, dispatching overloaded trucks, and losing track of operational costs (fuel + maintenance) are common issues that severely impact a company's bottom line and safety compliance.

**The Solution:** **FleetFlow** is a robust, centralized full-stack platform designed to manage the complete lifecycle of transport operations. It seamlessly handles vehicles, drivers, trip dispatching, maintenance logs, fuel, and expense tracking. By enforcing strict business rules atomically at the database level and pushing live state updates via WebSockets, FleetFlow provides a unified, error-free, real-time operational dashboard for logistics teams.

---

## 📑 Table of Contents
1. [Key Modules & Features](#-key-modules--features)
2. [Detailed Tech Stack](#-detailed-tech-stack)
3. [Mandatory Business Rules](#-mandatory-business-rules)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [Real-Time Events (WebSockets)](#-real-time-events-websockets)
6. [API Design](#-api-design)
7. [Getting Started Guide](#-getting-started-guide)
8. [Project Structure](#-project-structure)
9. [Demo Credentials](#-demo-credentials)
10. [Conclusion](#-conclusion)

---

## 📦 Key Modules & Features

- **Authentication & Security:** Secure JWT-based authentication with bcrypt password hashing and a strict 5-attempt account lockout policy to prevent brute-force attacks.
- **Vehicle Registry:** Complete CRUD operations for the fleet with smart availability checks, preventing dispatch of vehicles in maintenance or already on trips.
- **Driver Management:** Tracks driver profiles, safety scores, and license expirations to ensure only eligible drivers are assigned to trips.
- **Trips Lifecycle (Core):** Manages the full state machine of a trip: *Draft → Dispatched → Completed / Cancelled*. Integrates cargo weight vs. capacity validation and automatic odometer updates.
- **Maintenance Logging:** Tracking repair logs that automatically pull vehicles out of the dispatch pool (`IN_SHOP`) until the service is closed.
- **Fuel & Expense Tracking:** Records fuel consumption tied to specific trips and logs ad-hoc expenses (Tolls, Maintenance, Other) to compute accurate operational costs.
- **Live Dashboard & Analytics:** Push-based updates via WebSockets power real-time dashboards (using Recharts) displaying fleet utilization %, active trips, fuel efficiency, and Return on Investment (ROI) per vehicle.

---

## 🛠 Detailed Tech Stack

### Frontend (Client)
- **Framework:** React 18 (Vite)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (Dark theme design system)
- **State Management:** TanStack Query (React Query) + React Context API
- **Real-Time Engine:** `socket.io-client`
- **Data Visualization:** Recharts
- **Forms & Validation:** React Hook Form + Zod resolvers
- **HTTP Client:** Axios (with automated auth interceptors)
- **Icons:** `lucide-react`

### Backend (Server)
- **Runtime:** Node.js (LTS v18+)
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **ORM:** Prisma
- **Authentication:** JWT (`jsonwebtoken`) + `bcrypt`
- **Data Validation:** Zod
- **Real-Time Server:** Socket.io
- **Export Utility:** CSV Streaming (`csv-stringify`)
- **Containerization:** Docker + Docker Compose

---

## 🛡 Mandatory Business Rules

FleetFlow guarantees data integrity by strictly enforcing the following 10 business rules at the transaction level via Prisma:

1. **Unique Identification:** The vehicle registration number and driver license number must be perfectly unique.
2. **Vehicle Availability:** Retired or In Shop vehicles must never appear in the dispatch selection pool.
3. **Driver Eligibility:** Drivers with expired licenses or Suspended status cannot be assigned to trips.
4. **Anti-Double-Booking:** A driver or vehicle already marked *On Trip* cannot be assigned to another trip.
5. **Capacity Guards:** Cargo Weight must not exceed the vehicle's maximum load capacity.
6. **Dispatch Automation:** Dispatching a trip automatically changes both the vehicle and driver status to *On Trip*.
7. **Completion Automation:** Completing a trip automatically changes both the vehicle and driver status back to *Available*, and updates the vehicle's odometer.
8. **Cancellation Reversion:** Cancelling a dispatched trip cleanly restores the vehicle and driver to *Available*.
9. **Maintenance Locks:** Creating an active maintenance record automatically changes vehicle status to *In Shop*, removing it from the dispatch pool.
10. **Maintenance Unlocks:** Closing maintenance restores the vehicle to *Available* (unless it was manually retired).

---

## 🔐 Role-Based Access Control (RBAC)

The system maps capabilities across four distinct roles, strictly enforced by the backend API and reflected in the frontend UI rendering.

| Module | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| **Vehicles** | Full Access | Read-only | Read-only | Read-only |
| **Drivers** | Read-only | Read-only (self) | Full Access | Read-only |
| **Trips** | Full Access | Full Access | Read-only | Read-only |
| **Maintenance** | Full Access | — | Read-only | Read-only |
| **Fuel & Exp.** | Full Access | Add fuel (own trips) | — | Full Access |
| **Reports** | Full Access | — | Partial View | Full Access |
| **Settings** | Configuration | View Only | View Only | View Only |

---

## ⚡ Real-Time Events (WebSockets)

FleetFlow uses Socket.io to push real-time updates through the `/ops` namespace, invalidating frontend caches instantly.

| Event | Payload | Trigger Condition |
|---|---|---|
| `vehicle:statusChanged` | `{ vehicleId, status }` | Dispatch, Complete, Maintenance, Retire |
| `driver:statusChanged` | `{ driverId, status }` | Dispatch, Complete, Suspend |
| `trip:dispatched` | Trip Object | Trip dispatched |
| `trip:completed` | Trip Object | Trip finished |
| `trip:cancelled` | Trip Object | Trip cancelled |
| `dashboard:kpiUpdate` | KPI Object | Emitted after any of the above state changes |

---

## 📡 API Design

The REST API utilizes standard HTTP verbs and JSON payloads. 

### Auth & Settings
- `POST /api/auth/login` — Authenticates user and returns JWT token.
- `GET /api/settings` — Fetches global organizational settings.
- `PUT /api/settings` — Updates organizational settings (Fleet Manager).

### Vehicles & Drivers
- `GET /api/vehicles` — Fetches fleet inventory (with pagination/filters).
- `GET /api/vehicles/available` — Returns vehicles eligible for dispatch.
- `POST /api/vehicles` — Registers a new vehicle.
- `PUT /api/drivers/:id` — Updates driver profile or safety score.
- `GET /api/drivers/available` — Returns eligible drivers for dispatch.

### Trips & Operations
- `POST /api/trips` — Creates a new trip in `DRAFT` state.
- `POST /api/trips/:id/dispatch` — Executes atomic dispatch.
- `POST /api/trips/:id/complete` — Finalizes trip and records fuel/odometer.
- `POST /api/trips/:id/cancel` — Cancels draft or active trip safely.

### Financials & Analytics
- `POST /api/maintenance` — Opens a maintenance log.
- `POST /api/fuel-logs` — Logs fuel consumption.
- `POST /api/expenses` — Records operational tolls or repairs.
- `GET /api/dashboard/kpis` — Fetches real-time metric aggregates.

---

## 🚀 Getting Started Guide

Follow these detailed step-by-step instructions to get FleetFlow running on your local machine.

### Prerequisites
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/) (Must be running for the backend database)

### Step 1: Clone the Repository
Open your terminal and clone the repository to your local machine:
```bash
git clone https://github.com/Sayantan-dev1003/FleetFlow
cd FleetFlow
```

### Step 2: Boot up the Backend (API + Database)
We use Docker Compose to instantly spin up a PostgreSQL database and the Node.js API server together.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create the environment configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Note: The default `.env` is pre-configured to work perfectly inside the Docker network. No edits are required.)*
3. Build and start the containers in detached mode:
   ```bash
   docker-compose up --build -d
   ```
   *(Wait 1-2 minutes for the initial build. The startup script will automatically apply Prisma schema migrations and seed the database with demo users, vehicles, and trips.)*
4. Verify the backend is running by navigating to `http://localhost:4000/health` in your browser.

### Step 3: Run the Frontend (React Client)
The frontend runs natively using Vite's ultra-fast development server.

1. Open a **new** terminal window and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create the environment configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Verify it contains `VITE_API_BASE_URL="http://localhost:4000/api"` and `VITE_SOCKET_URL="http://localhost:4000"`)*
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. **Success!** Open your browser and navigate to `http://localhost:5173`. You will see the FleetFlow login screen.

### Step 4: Explore the Database via Prisma Studio (Optional)
If you want to view the raw tables and data behind the scenes:
1. Open a new terminal in the `backend/` directory.
2. Edit your `.env` file to set `DB_HOST="localhost"` (since you are connecting from your Windows host, not inside Docker).
3. Run the Prisma Studio command:
   ```bash
   npx prisma studio
   ```
4. Open `http://localhost:5555` to view your data visually.

---

## 📂 Project Structure

```text
FleetFlow/
├── backend/                      ← Express Server & Database
│   ├── prisma/                   
│   │   ├── schema.prisma         ← Database schema definition
│   │   └── seed.js               ← Initial database seeding script
│   ├── src/
│   │   ├── config/               ← Environment, DB client, Socket config
│   │   ├── middlewares/          ← Auth, RBAC, Validation, Error Handling
│   │   ├── modules/              ← Domain-driven feature modules
│   │   │   ├── auth/             ← Registration, Login logic
│   │   │   ├── dashboard/        ← KPI aggregations
│   │   │   ├── drivers/          ← Driver management
│   │   │   ├── fuel-expenses/    ← Financial logging
│   │   │   ├── maintenance/      ← Repair workflows
│   │   │   ├── reports/          ← CSV export and ROI calculations
│   │   │   ├── settings/         ← Organizational configurations
│   │   │   ├── trips/            ← Core dispatch logic & rules
│   │   │   └── vehicles/         ← Fleet registry
│   │   ├── sockets/              ← WebSocket event emitters
│   │   ├── utils/                ← Custom error classes, formatters
│   │   ├── app.js                ← Express App Setup
│   │   └── index.js              ← HTTP Server entry point
│   ├── docker-compose.yml        ← Docker configuration for API + Postgres
│   └── Dockerfile                ← Docker build instructions
│
└── client/                       ← React Frontend
    ├── src/
    │   ├── api/                  ← Axios client & API fetcher functions
    │   ├── components/           ← Reusable UI components
    │   │   ├── layout/           ← Sidebar, Topbar
    │   │   └── ui/               ← Status Badges, Spinners
    │   ├── context/              ← AppContext (TanStack Query + Socket abstractions)
    │   ├── pages/                ← Full-screen route views 
    │   │   ├── Analytics.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Drivers.jsx
    │   │   ├── Fleet.jsx
    │   │   ├── FuelExpenses.jsx
    │   │   ├── Login.jsx
    │   │   ├── Maintenance.jsx
    │   │   ├── Settings.jsx
    │   │   └── Trips.jsx
    │   ├── App.jsx               ← React Router definitions
    │   └── main.jsx              ← React DOM entry point
    ├── tailwind.config.js        ← Tailwind theme and token definitions
    └── vite.config.js            ← Vite bundler configuration
```

---

## 🔑 Demo Credentials

After completing the setup, use any of the following credentials to log in and test the RBAC features:

| Role | Email | Password |
|---|---|---|
| **Fleet Manager** | `manager@transitops.in` | `password123` |
| **Driver** | `Raven.k@transitops.in` | `password123` |
| **Safety Officer** | `safety@transitops.in` | `password123` |
| **Financial Analyst** | `analyst@transitops.in` | `password123` |

*(Note: You can also click the Quick Login Assistant cards directly on the `/login` page to switch roles instantly without typing!)*

---

## 🏁 Conclusion

FleetFlow is engineered to demonstrate production-ready capabilities across the modern web stack. By uniting strict data-layer validations, robust transaction safety, scalable backend architecture, and a highly responsive, real-time frontend UI, this platform serves as a powerful foundation for solving complex logistical challenges. 

Whether tracking expenses down to the toll receipt or ensuring safety compliance before a truck leaves the yard, FleetFlow delivers a unified command center for transport operations.
