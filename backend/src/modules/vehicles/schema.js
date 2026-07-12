/**
 * src/modules/vehicles/schema.js
 * Zod validation schemas for vehicle endpoints.
 */

const { z } = require('zod');

const vehicleStatuses = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

const createVehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9\-]+$/i, 'Registration number can only contain letters, numbers, and hyphens'),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  maxLoadCapacityKg: z.number().positive('Max load capacity must be positive'),
  odometerKm: z.number().min(0).optional().default(0),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
  region: z.string().max(100).optional(),
});

const updateVehicleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  maxLoadCapacityKg: z.number().positive().optional(),
  acquisitionCost: z.number().positive().optional(),
  region: z.string().max(100).optional().nullable(),
  // Status can be updated manually ONLY to AVAILABLE or RETIRED
  // ON_TRIP and IN_SHOP are system-managed (business rule #2)
  status: z
    .enum(['AVAILABLE', 'RETIRED'], {
      errorMap: () => ({
        message: "Status can only be manually set to 'AVAILABLE' or 'RETIRED'. 'ON_TRIP' and 'IN_SHOP' are system-managed.",
      }),
    })
    .optional(),
});

const vehicleQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(vehicleStatuses).optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['name', 'type', 'status', 'odometerKm', 'acquisitionCost', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = { createVehicleSchema, updateVehicleSchema, vehicleQuerySchema };
