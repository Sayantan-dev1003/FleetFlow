/**
 * src/modules/vehicles/service.js
 * Vehicle CRUD, availability check, and status guard logic.
 */

const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

// Fields excluded from responses to keep payload clean
const vehicleSelect = {
  id: true,
  registrationNumber: true,
  name: true,
  type: true,
  maxLoadCapacityKg: true,
  odometerKm: true,
  acquisitionCost: true,
  status: true,
  region: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Create a new vehicle.
 */
async function createVehicle(data) {
  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber: data.registrationNumber.toUpperCase(),
      name: data.name,
      type: data.type,
      maxLoadCapacityKg: data.maxLoadCapacityKg,
      odometerKm: data.odometerKm ?? 0,
      acquisitionCost: data.acquisitionCost,
      region: data.region ?? null,
      status: 'AVAILABLE',
    },
    select: vehicleSelect,
  });
  return vehicle;
}

/**
 * List vehicles with filters, search, sorting, and pagination.
 */
async function listVehicles(query) {
  const { type, status, region, search, sortBy, sortOrder } = query;
  const { page, limit, skip } = parsePagination(query);

  const where = {
    ...(type ? { type: { contains: type, mode: 'insensitive' } } : {}),
    ...(status ? { status } : {}),
    ...(region ? { region: { contains: region, mode: 'insensitive' } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { registrationNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      select: vehicleSelect,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Get a single vehicle with latest trip and maintenance summary.
 */
async function getVehicleById(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      trips: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true, status: true, source: true, destination: true,
          dispatchedAt: true, completedAt: true,
        },
      },
      maintenanceLogs: {
        where: { status: 'OPEN' },
        take: 1,
        select: { id: true, type: true, startDate: true, cost: true },
      },
      _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } },
    },
  });

  if (!vehicle) throw ApiError.notFound('Vehicle');
  return vehicle;
}

/**
 * Update a vehicle.
 * Business rule: cannot manually set status to ON_TRIP or IN_SHOP (enforced at schema level).
 */
async function updateVehicle(id, data) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Vehicle');

  // Extra safety net: block setting RETIRED → active states if there are active trips
  if (existing.status === 'ON_TRIP' && data.status) {
    throw ApiError.conflict('Cannot manually change status of a vehicle that is currently ON_TRIP.');
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.maxLoadCapacityKg !== undefined ? { maxLoadCapacityKg: data.maxLoadCapacityKg } : {}),
      ...(data.acquisitionCost !== undefined ? { acquisitionCost: data.acquisitionCost } : {}),
      ...(data.region !== undefined ? { region: data.region } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
    select: vehicleSelect,
  });
  return vehicle;
}

/**
 * Soft-delete a vehicle by retiring it.
 * Fails if vehicle is ON_TRIP (business rule: can't retire an active vehicle).
 */
async function deleteVehicle(id) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Vehicle');

  if (existing.status === 'ON_TRIP') {
    throw ApiError.conflict('Cannot retire a vehicle that is currently ON_TRIP. Complete or cancel the trip first.');
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: { status: 'RETIRED' },
    select: vehicleSelect,
  });
  return vehicle;
}

/**
 * Get dispatch-eligible vehicles: status = AVAILABLE only.
 * Business rule #2: excludes IN_SHOP, RETIRED, ON_TRIP.
 */
async function getAvailableVehicles(query) {
  const { type, region, search } = query;
  const { page, limit, skip } = parsePagination(query);

  const where = {
    status: 'AVAILABLE',
    ...(type ? { type: { contains: type, mode: 'insensitive' } } : {}),
    ...(region ? { region: { contains: region, mode: 'insensitive' } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { registrationNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({ where, select: vehicleSelect, skip, take: limit }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles, pagination: buildPaginationMeta(total, page, limit) };
}

module.exports = {
  createVehicle,
  listVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
};
