/**
 * src/modules/drivers/service.js
 * Driver CRUD, license validation, and availability logic.
 */

const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { isLicenseValid, buildDateRangeFilter } = require('../../utils/dateHelpers');

const driverSelect = {
  id: true,
  userId: true,
  name: true,
  licenseNumber: true,
  licenseCategory: true,
  licenseExpiryDate: true,
  contactNumber: true,
  safetyScore: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, email: true } },
};

async function createDriver(data) {
  // Validate license is not already expired at creation time
  if (!isLicenseValid(data.licenseExpiryDate)) {
    throw ApiError.badRequest('Cannot create a driver with an already-expired license.');
  }

  // Automatically link to an existing driver user account if names match exactly
  let userIdToLink = data.userId ?? null;
  
  if (!userIdToLink) {
    const unlinkedUser = await prisma.user.findFirst({
      where: { 
        name: data.name, 
        role: { name: 'DRIVER' }, 
        driver: null 
      }
    });
    
    if (unlinkedUser) {
      userIdToLink = unlinkedUser.id;
    }
  }

  const driver = await prisma.driver.create({
    data: {
      name: data.name,
      licenseNumber: data.licenseNumber,
      licenseCategory: data.licenseCategory,
      licenseExpiryDate: new Date(data.licenseExpiryDate),
      contactNumber: data.contactNumber,
      safetyScore: data.safetyScore ?? 100,
      userId: userIdToLink,
    },
    select: driverSelect,
  });
  return driver;
}

async function listDrivers(query) {
  const { status, licenseExpiryFrom, licenseExpiryTo, search, sortBy, sortOrder } = query;
  const { page, limit, skip } = parsePagination(query);

  const licenseExpiryFilter = buildDateRangeFilter(licenseExpiryFrom, licenseExpiryTo);

  const where = {
    ...(status ? { status } : {}),
    ...(licenseExpiryFilter ? { licenseExpiryDate: licenseExpiryFilter } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      select: driverSelect,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.driver.count({ where }),
  ]);

  return { drivers, pagination: buildPaginationMeta(total, page, limit) };
}

async function getDriverById(id) {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      trips: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, status: true, source: true, destination: true,
          dispatchedAt: true, completedAt: true,
        },
      },
      _count: { select: { trips: true } },
    },
  });
  if (!driver) throw ApiError.notFound('Driver');
  return driver;
}

async function updateDriver(id, data) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Driver');

  // Cannot manually change status of driver that is ON_TRIP
  if (existing.status === 'ON_TRIP' && data.status) {
    throw ApiError.conflict('Cannot manually change status of a driver that is currently ON_TRIP.');
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.licenseNumber ? { licenseNumber: data.licenseNumber } : {}),
      ...(data.licenseCategory ? { licenseCategory: data.licenseCategory } : {}),
      ...(data.licenseExpiryDate ? { licenseExpiryDate: new Date(data.licenseExpiryDate) } : {}),
      ...(data.contactNumber ? { contactNumber: data.contactNumber } : {}),
      ...(data.safetyScore !== undefined ? { safetyScore: data.safetyScore } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.userId !== undefined ? { userId: data.userId } : {}),
    },
    select: driverSelect,
  });
  return driver;
}

/**
 * Soft-delete: set status to SUSPENDED.
 * Fails if driver is currently ON_TRIP.
 */
async function deleteDriver(id) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Driver');

  if (existing.status === 'ON_TRIP') {
    throw ApiError.conflict('Cannot suspend a driver that is currently ON_TRIP. Complete or cancel the active trip first.');
  }

  return prisma.driver.update({
    where: { id },
    data: { status: 'SUSPENDED' },
    select: driverSelect,
  });
}

/**
 * Get dispatch-eligible drivers.
 * Business rule #3: excludes SUSPENDED, ON_TRIP, and expired licenses.
 */
async function getAvailableDrivers(query) {
  const { search } = query;
  const { page, limit, skip } = parsePagination(query);

  const where = {
    status: 'AVAILABLE',
    licenseExpiryDate: { gte: new Date() }, // exclude expired licenses
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({ where, select: driverSelect, skip, take: limit }),
    prisma.driver.count({ where }),
  ]);

  return { drivers, pagination: buildPaginationMeta(total, page, limit) };
}

module.exports = {
  createDriver,
  listDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
};
