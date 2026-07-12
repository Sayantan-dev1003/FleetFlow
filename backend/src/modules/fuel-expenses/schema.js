/**
 * src/modules/fuel-expenses/schema.js
 */

const { z } = require('zod');

const createFuelLogSchema = z.object({
  vehicleId: z.string().uuid('vehicleId must be a valid UUID'),
  tripId: z.string().uuid('tripId must be a valid UUID').optional().nullable(),
  liters: z.number().positive('liters must be positive'),
  cost: z.number().positive('cost must be positive'),
  date: z.coerce.date().optional(),
});

const createExpenseSchema = z.object({
  vehicleId: z.string().uuid('vehicleId must be a valid UUID').optional().nullable(),
  type: z.enum(['TOLL', 'MAINTENANCE', 'OTHER'], {
    errorMap: () => ({ message: 'type must be one of: TOLL, MAINTENANCE, OTHER' }),
  }),
  amount: z.number().positive('amount must be positive'),
  date: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
});

const fuelLogQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  tripId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['date', 'liters', 'cost', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const expenseQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  type: z.enum(['TOLL', 'MAINTENANCE', 'OTHER']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['date', 'amount', 'type', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  createFuelLogSchema,
  createExpenseSchema,
  fuelLogQuerySchema,
  expenseQuerySchema,
};
