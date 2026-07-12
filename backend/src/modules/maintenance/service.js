/**
 * src/modules/maintenance/service.js
 * Business rules #9 and #10:
 *  9. Open maintenance → vehicle IN_SHOP (transactional)
 * 10. Close maintenance → restore vehicle to AVAILABLE, UNLESS currently RETIRED
 */

const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');

const maintenanceInclude = {
  vehicle: {
    select: { id: true, registrationNumber: true, name: true, type: true, status: true },
  },
};

/**
 * Open a maintenance log — sets vehicle → IN_SHOP.
 * Business rule #9.
 */
async function openMaintenance(data) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw ApiError.notFound('Vehicle');

  if (vehicle.status === 'RETIRED') {
    throw ApiError.conflict(`Vehicle '${vehicle.registrationNumber}' is RETIRED and cannot be sent for maintenance.`);
  }
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.conflict(
      `Vehicle '${vehicle.registrationNumber}' is currently ON_TRIP. Complete or cancel the trip before opening maintenance.`
    );
  }
  if (vehicle.status === 'IN_SHOP') {
    throw ApiError.conflict(`Vehicle '${vehicle.registrationNumber}' is already IN_SHOP.`);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Set vehicle → IN_SHOP
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'IN_SHOP' },
    });

    // Create maintenance log
    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        description: data.description ?? null,
        cost: data.cost ?? 0,
        status: 'OPEN',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
      },
      include: maintenanceInclude,
    });

    return log;
  });

  return result;
}

/**
 * List maintenance logs with filters.
 */
async function listMaintenance(query) {
  const { vehicleId, status, sortBy, sortOrder } = query;
  const { page, limit, skip } = parsePagination(query);

  const where = {
    ...(vehicleId ? { vehicleId } : {}),
    ...(status ? { status } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where,
      include: maintenanceInclude,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  return { logs, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Get single maintenance log.
 */
async function getMaintenanceById(id) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id }, include: maintenanceInclude });
  if (!log) throw ApiError.notFound('Maintenance log');
  return log;
}

/**
 * Close a maintenance log — restores vehicle → AVAILABLE, UNLESS vehicle is RETIRED.
 * Business rule #10.
 */
async function closeMaintenance(id, data) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!log) throw ApiError.notFound('Maintenance log');

  if (log.status === 'CLOSED') {
    throw ApiError.conflict('This maintenance log is already CLOSED.');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Close the maintenance log
    const updatedLog = await tx.maintenanceLog.update({
      where: { id },
      data: {
        status: 'CLOSED',
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        ...(data.cost !== undefined ? { cost: data.cost } : {}),
      },
      include: maintenanceInclude,
    });

    // Business rule #10: restore vehicle → AVAILABLE UNLESS independently set to RETIRED
    // Fetch current vehicle status (may have changed since we fetched log)
    const currentVehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });

    if (currentVehicle.status !== 'RETIRED') {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }
    // If RETIRED: do not restore — leave as RETIRED

    return updatedLog;
  });

  return result;
}

module.exports = { openMaintenance, listMaintenance, getMaintenanceById, closeMaintenance };
