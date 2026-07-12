/**
 * src/modules/maintenance/schema.js
 */

const { z } = require('zod');

const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('vehicleId must be a valid UUID'),
  type: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  cost: z.number().min(0).optional().default(0),
  startDate: z.coerce.date().optional(),
});

const closeMaintenanceSchema = z.object({
  endDate: z.coerce.date().optional(),
  cost: z.number().min(0).optional(), // Allow updating cost on close
  notes: z.string().max(500).optional(),
});

const maintenanceQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['startDate', 'endDate', 'cost', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = { createMaintenanceSchema, closeMaintenanceSchema, maintenanceQuerySchema };
