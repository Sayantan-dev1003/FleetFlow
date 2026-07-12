/**
 * src/modules/trips/schema.js
 */

const { z } = require('zod');

const createTripSchema = z.object({
  source: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  vehicleId: z.string().uuid('vehicleId must be a valid UUID'),
  driverId: z.string().uuid('driverId must be a valid UUID'),
  cargoWeightKg: z.number().positive('cargoWeightKg must be positive'),
  plannedDistanceKm: z.number().positive('plannedDistanceKm must be positive'),
  revenue: z.number().min(0).optional().default(0),
  notes: z.string().max(500).optional(),
});

const completeTripSchema = z.object({
  endOdometerKm: z.number().positive('endOdometerKm must be positive'),
  fuelConsumedLtr: z.number().positive('fuelConsumedLtr must be positive'),
  revenue: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

const cancelTripSchema = z.object({
  reason: z.string().max(500).optional(),
});

const tripQuerySchema = z.object({
  status: z.enum(['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']).optional(),
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'dispatchedAt', 'completedAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = { createTripSchema, completeTripSchema, cancelTripSchema, tripQuerySchema };
