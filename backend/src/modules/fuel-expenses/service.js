/**
 * src/modules/fuel-expenses/service.js
 * Fuel logs, expense logs, and operational cost aggregation.
 */

const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { buildDateRangeFilter } = require('../../utils/dateHelpers');

const fuelLogInclude = {
  vehicle: { select: { id: true, registrationNumber: true, name: true } },
  trip: { select: { id: true, source: true, destination: true, status: true } },
};

const expenseInclude = {
  vehicle: { select: { id: true, registrationNumber: true, name: true } },
};

// ── Fuel Logs ─────────────────────────────────────────────────────────────────

async function createFuelLog(data) {
  // Validate vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw ApiError.notFound('Vehicle');

  // Guard: cannot log fuel for a RETIRED vehicle (it is no longer in service)
  if (vehicle.status === 'RETIRED') {
    throw ApiError.conflict(
      `Vehicle '${vehicle.registrationNumber}' is RETIRED. Fuel logs cannot be created for retired vehicles.`
    );
  }

  // If tripId provided, validate it belongs to this vehicle
  if (data.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
    if (!trip) throw ApiError.notFound('Trip');
    if (trip.vehicleId !== data.vehicleId) {
      throw ApiError.badRequest('The provided tripId does not belong to the specified vehicleId.');
    }
  }

  const log = await prisma.fuelLog.create({
    data: {
      vehicleId: data.vehicleId,
      tripId: data.tripId ?? null,
      liters: data.liters,
      cost: data.cost,
      date: data.date ? new Date(data.date) : new Date(),
    },
    include: fuelLogInclude,
  });
  return log;
}

async function listFuelLogs(query) {
  const { vehicleId, tripId, dateFrom, dateTo, sortBy, sortOrder } = query;
  const { page, limit, skip } = parsePagination(query);
  const dateFilter = buildDateRangeFilter(dateFrom, dateTo);

  const where = {
    ...(vehicleId ? { vehicleId } : {}),
    ...(tripId ? { tripId } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.fuelLog.findMany({
      where,
      include: fuelLogInclude,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.fuelLog.count({ where }),
  ]);

  return { logs, pagination: buildPaginationMeta(total, page, limit) };
}

// ── Expenses ──────────────────────────────────────────────────────────────────

async function createExpense(data) {
  if (data.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw ApiError.notFound('Vehicle');
  }

  const expense = await prisma.expense.create({
    data: {
      vehicleId: data.vehicleId ?? null,
      type: data.type,
      amount: data.amount,
      date: data.date ? new Date(data.date) : new Date(),
      description: data.description ?? null,
    },
    include: expenseInclude,
  });
  return expense;
}

async function listExpenses(query) {
  const { vehicleId, type, dateFrom, dateTo, sortBy, sortOrder } = query;
  const { page, limit, skip } = parsePagination(query);
  const dateFilter = buildDateRangeFilter(dateFrom, dateTo);

  const where = {
    ...(vehicleId ? { vehicleId } : {}),
    ...(type ? { type } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: expenseInclude,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return { expenses, pagination: buildPaginationMeta(total, page, limit) };
}

// ── Operational Cost Aggregation ──────────────────────────────────────────────

/**
 * GET /api/vehicles/:id/operational-cost
 * Sum(fuel cost) + Sum(maintenance cost) + Sum(other expenses) for a vehicle.
 */
async function getOperationalCost(vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, registrationNumber: true, name: true, acquisitionCost: true },
  });
  if (!vehicle) throw ApiError.notFound('Vehicle');

  const [fuelAgg, maintenanceAgg, expenseAgg] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true, liters: true },
      _count: true,
    }),
    prisma.maintenanceLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const fuelCost = Number(fuelAgg._sum.cost ?? 0);
  const maintenanceCost = Number(maintenanceAgg._sum.cost ?? 0);
  const otherExpenses = Number(expenseAgg._sum.amount ?? 0);
  const totalOperationalCost = fuelCost + maintenanceCost + otherExpenses;

  return {
    vehicle,
    breakdown: {
      fuelCost,
      fuelLiters: Number(fuelAgg._sum.liters ?? 0),
      fuelLogCount: fuelAgg._count,
      maintenanceCost,
      maintenanceLogCount: maintenanceAgg._count,
      otherExpenses,
      expenseCount: expenseAgg._count,
    },
    totalOperationalCost,
  };
}

module.exports = {
  createFuelLog,
  listFuelLogs,
  createExpense,
  listExpenses,
  getOperationalCost,
};
