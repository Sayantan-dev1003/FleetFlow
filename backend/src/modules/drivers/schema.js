/**
 * src/modules/drivers/schema.js
 */

const { z } = require('zod');

const createDriverSchema = z.object({
  name: z.string().min(2).max(100),
  licenseNumber: z.string().min(5).max(30),
  licenseCategory: z.string().min(1).max(20),
  licenseExpiryDate: z.coerce.date({ required_error: 'licenseExpiryDate is required' }),
  contactNumber: z.string().min(7).max(20),
  safetyScore: z.number().int().min(0).max(100).optional().default(100),
  userId: z.string().uuid('Invalid userId UUID').optional().nullable(),
});

const updateDriverSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  licenseNumber: z.string().min(5).max(30).optional(),
  licenseCategory: z.string().min(1).max(20).optional(),
  licenseExpiryDate: z.coerce.date().optional(),
  contactNumber: z.string().min(7).max(20).optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
  status: z.enum(['AVAILABLE', 'OFF_DUTY', 'SUSPENDED'], {
    errorMap: () => ({
      message: "Status must be one of: AVAILABLE, OFF_DUTY, SUSPENDED. ON_TRIP is system-managed.",
    }),
  }).optional(),
  userId: z.string().uuid().optional().nullable(),
});

const driverQuerySchema = z.object({
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
  licenseExpiryFrom: z.string().optional(),
  licenseExpiryTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['name', 'safetyScore', 'licenseExpiryDate', 'status', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = { createDriverSchema, updateDriverSchema, driverQuerySchema };
