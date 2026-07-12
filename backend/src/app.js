/**
 * src/app.js
 * Express application setup — middleware, routes, error handling.
 * Does NOT start the server; that's done in index.js.
 */

require('./config/env'); // Load + validate env vars first

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const { errorHandler } = require('./middlewares/errorHandler');

const { authenticate } = require('./middlewares/authenticate');
const { authorize } = require('./middlewares/authorize');

// Module routers
const authRoutes = require('./modules/auth/routes');
const vehicleRoutes = require('./modules/vehicles/routes');
const driverRoutes = require('./modules/drivers/routes');
const tripRoutes = require('./modules/trips/routes');
const maintenanceRoutes = require('./modules/maintenance/routes');
const fuelExpenseRoutes = require('./modules/fuel-expenses/routes');
const dashboardRoutes = require('./modules/dashboard/routes');
const reportsRoutes = require('./modules/reports/routes');
const settingsRoutes = require('./modules/settings/routes');

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Static files (uploaded documents) ────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      service: 'FleetFlow API',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Fuel logs and expenses share a router (routes prefixed with /fuel-logs and /expenses)
app.use('/api', fuelExpenseRoutes);


app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    },
  });
});

// ── Centralized Error Handler (must be last) ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
