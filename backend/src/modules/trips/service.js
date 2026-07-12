/**
 * src/modules/trips/service.js
 *
 * CORE of the business logic — implements ALL Section 7 mandatory rules:
 *  1. Unique registration (DB-level)
 *  2. Retired/In-shop vehicles never dispatch-eligible (re-validated at dispatch)
 *  3. Expired/Suspended driver cannot be assigned (checked at create AND dispatch)
 *  4. No double-booking (Prisma $transaction with conditional updates)
 *  5. Cargo ≤ capacity (at DRAFT creation AND at dispatch)
 *  6. Dispatch → 4-way status flip in one transaction
 *  7. Complete → 4-way flip + odometer update
 *  8. Cancel dispatched trip → restore vehicle + driver
 *  9-10. Maintenance rules handled in maintenance service
 */

const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { isLicenseValid, buildDateRangeFilter } = require('../../utils/dateHelpers');

const tripInclude = {
  vehicle: {
    select: {
      id: true, registrationNumber: true, name: true, type: true,
      maxLoadCapacityKg: true, status: true, region: true,
    },
  },
  driver: {
    select: {
      id: true, name: true, licenseNumber: true, licenseCategory: true,
      safetyScore: true, status: true,
    },
  },
  createdBy: { select: { id: true, name: true, email: true } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate that a driver is eligible for assignment.
 * Business rules #3.
 * @param {object} driver
 */
function assertDriverEligible(driver) {
  if (driver.status === 'SUSPENDED') {
    throw ApiError.conflict(`Driver '${driver.name}' is SUSPENDED and cannot be assigned to a trip.`);
  }
  if (!isLicenseValid(driver.licenseExpiryDate)) {
    throw ApiError.conflict(
      `Driver '${driver.name}' has an expired license (expired: ${driver.licenseExpiryDate.toISOString().split('T')[0]}).`
    );
  }
}

/**
 * Validate that a vehicle is eligible for assignment.
 * Business rule #2.
 * @param {object} vehicle
 */
function assertVehicleEligible(vehicle) {
  if (vehicle.status === 'RETIRED') {
    throw ApiError.conflict(`Vehicle '${vehicle.registrationNumber}' is RETIRED and cannot be dispatched.`);
  }
  if (vehicle.status === 'IN_SHOP') {
    throw ApiError.conflict(`Vehicle '${vehicle.registrationNumber}' is IN_SHOP (under maintenance) and cannot be dispatched.`);
  }
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.conflict(`Vehicle '${vehicle.registrationNumber}' is already ON_TRIP. Double-booking is not allowed.`);
  }
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Create a trip in DRAFT status.
 * Validates: cargo ≤ capacity, driver eligibility, vehicle eligibility.
 * Does NOT lock vehicle/driver — locking happens at dispatch.
 */
async function createTrip(data, createdById) {
  // Fetch vehicle and driver concurrently
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: data.vehicleId } }),
    prisma.driver.findUnique({ where: { id: data.driverId } }),
  ]);

  if (!vehicle) throw ApiError.notFound('Vehicle');
  if (!driver) throw ApiError.notFound('Driver');

  // Business rule #5: cargo ≤ max load capacity (at DRAFT time)
  if (Number(data.cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
    throw ApiError.conflict(
      `Cargo weight (${data.cargoWeightKg} kg) exceeds vehicle max load capacity (${vehicle.maxLoadCapacityKg} kg).`
    );
  }

  // Business rule #2 & #3: pre-validate eligibility at draft time too
  assertVehicleEligible(vehicle);
  assertDriverEligible(driver);

  const trip = await prisma.trip.create({
    data: {
      source: data.source,
      destination: data.destination,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeightKg: data.cargoWeightKg,
      plannedDistanceKm: data.plannedDistanceKm,
      revenue: data.revenue ?? 0,
      notes: data.notes ?? null,
      status: 'DRAFT',
      createdById,
    },
    include: tripInclude,
  });

  return trip;
}

/**
 * List trips with filters (drivers only see their own by default).
 */
async function listTrips(query, requestingUser) {
  const { status, vehicleId, driverId, dateFrom, dateTo, sortBy, sortOrder, search } = query;
  const { page, limit, skip } = parsePagination(query);

  // Driver role: filter to own trips only
  let driverFilter = driverId ? { driverId } : {};
  if (requestingUser.role === 'DRIVER') {
    // Find the driver record linked to this user
    const driverRecord = await prisma.driver.findUnique({
      where: { userId: requestingUser.userId },
    });
    if (driverRecord) {
      driverFilter = { driverId: driverRecord.id };
    }
  }

  const dateFilter = buildDateRangeFilter(dateFrom, dateTo);

  const where = {
    ...(status ? { status } : {}),
    ...(vehicleId ? { vehicleId } : {}),
    ...driverFilter,
    ...(dateFilter ? { createdAt: dateFilter } : {}),
    ...(search
      ? {
          OR: [
            { source: { contains: search, mode: 'insensitive' } },
            { destination: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      include: tripInclude,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips, pagination: buildPaginationMeta(total, page, limit) };
}

/**
 * Get a single trip by ID.
 */
async function getTripById(id) {
  const trip = await prisma.trip.findUnique({ where: { id }, include: tripInclude });
  if (!trip) throw ApiError.notFound('Trip');
  return trip;
}

/**
 * Dispatch a trip: DRAFT → DISPATCHED.
 * Business rules #2, #3, #4, #5, #6.
 *
 * FIX: Vehicle capacity and odometer are read BEFORE the transaction via a clean
 * snapshot. This avoids reading a stale ON_TRIP vehicle inside the transaction
 * after the status has already been flipped — making the code clearer and the
 * data unambiguously fresh.
 *
 * ALL writes happen inside a single Prisma $transaction.
 */
async function dispatchTrip(tripId) {
  // Step 1: Read trip outside transaction — for validation messages
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw ApiError.notFound('Trip');

  // Terminal state check
  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
    throw ApiError.conflict(`Cannot dispatch a trip with status '${trip.status}'. Status is terminal.`);
  }
  if (trip.status === 'DISPATCHED') {
    throw ApiError.conflict('Trip is already DISPATCHED.');
  }

  // Step 2: Read vehicle snapshot BEFORE the transaction begins.
  // This gives us clean, unambiguous values for capacity check and odometer capture
  // without having to re-read a partially-modified record inside the transaction.
  const vehicleSnapshot = await prisma.vehicle.findUnique({
    where: { id: trip.vehicleId },
    select: { id: true, registrationNumber: true, maxLoadCapacityKg: true, odometerKm: true, status: true },
  });
  if (!vehicleSnapshot) throw ApiError.notFound('Vehicle');

  // Step 3: Pre-validate cargo capacity using the clean snapshot
  if (Number(trip.cargoWeightKg) > Number(vehicleSnapshot.maxLoadCapacityKg)) {
    throw ApiError.conflict(
      `Cargo weight (${trip.cargoWeightKg} kg) exceeds vehicle capacity (${vehicleSnapshot.maxLoadCapacityKg} kg).`
    );
  }

  // Capture immutable odometer reading — used inside the transaction without a stale re-read
  const startOdometerKm = vehicleSnapshot.odometerKm;

  // Step 4: Run all status flips in a single transaction with conditional updates
  // to prevent race conditions (double-booking protection — business rule #4)
  const result = await prisma.$transaction(async (tx) => {
    // Atomic vehicle lock: updateMany WHERE status='AVAILABLE' — returns count=0 if already taken
    const vehicleUpdate = await tx.vehicle.updateMany({
      where: { id: trip.vehicleId, status: 'AVAILABLE' },
      data: { status: 'ON_TRIP' },
    });

    if (vehicleUpdate.count === 0) {
      // Vehicle is no longer AVAILABLE — fetch minimal fields for a clear error
      const v = await tx.vehicle.findUnique({
        where: { id: trip.vehicleId },
        select: { registrationNumber: true, status: true },
      });
      if (v.status === 'RETIRED') throw ApiError.conflict(`Vehicle ${v.registrationNumber} is RETIRED.`);
      if (v.status === 'IN_SHOP') throw ApiError.conflict(`Vehicle ${v.registrationNumber} is IN_SHOP (under maintenance).`);
      if (v.status === 'ON_TRIP') throw ApiError.conflict(`Vehicle ${v.registrationNumber} is already ON_TRIP (double-booking prevented).`);
      throw ApiError.conflict(`Vehicle is not available for dispatch (status: ${v.status}).`);
    }

    // Re-read and validate driver eligibility inside transaction (state may have changed since DRAFT)
    const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
    if (!driver) throw ApiError.notFound('Driver');
    assertDriverEligible(driver);

    // Atomic driver lock: updateMany WHERE status='AVAILABLE'
    const driverUpdate = await tx.driver.updateMany({
      where: { id: trip.driverId, status: 'AVAILABLE' },
      data: { status: 'ON_TRIP' },
    });

    if (driverUpdate.count === 0) {
      throw ApiError.conflict(`Driver '${driver.name}' is not AVAILABLE (status: ${driver.status}). Double-booking prevented.`);
    }

    // All 4 writes complete: Trip + Vehicle + Driver + odometer captured
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
        startOdometerKm, // captured cleanly before the transaction — no stale read
      },
      include: tripInclude,
    });

    return updatedTrip;
  });

  return result;
}

/**
 * Complete a trip: DISPATCHED → COMPLETED.
 * Business rules #7.
 * Updates vehicle odometer, restores vehicle + driver → AVAILABLE.
 */
async function completeTrip(tripId, { endOdometerKm, fuelConsumedLtr, revenue, notes }) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw ApiError.notFound('Trip');

  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
    throw ApiError.conflict(`Trip is already ${trip.status}. Cannot complete.`);
  }
  if (trip.status === 'DRAFT') {
    throw ApiError.conflict('Trip must be DISPATCHED before it can be completed. Call /dispatch first.');
  }

  // Validate odometer reading
  if (trip.startOdometerKm && Number(endOdometerKm) < Number(trip.startOdometerKm)) {
    throw ApiError.badRequest(
      `End odometer (${endOdometerKm}) cannot be less than start odometer (${trip.startOdometerKm}).`
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const actualDistanceKm = trip.startOdometerKm
      ? Number(endOdometerKm) - Number(trip.startOdometerKm)
      : null;

    // Update trip — DISPATCHED → COMPLETED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        endOdometerKm,
        fuelConsumedLtr,
        actualDistanceKm,
        ...(revenue !== undefined ? { revenue } : {}),
        ...(notes ? { notes } : {}),
      },
      include: tripInclude,
    });

    // Restore vehicle → AVAILABLE + update odometer
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'AVAILABLE', odometerKm: endOdometerKm },
    });

    // Restore driver → AVAILABLE
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' },
    });

    return updatedTrip;
  });

  return result;
}

/**
 * Cancel a trip: DRAFT/DISPATCHED → CANCELLED.
 * Business rule #8:
 *  - If DISPATCHED: restore vehicle + driver → AVAILABLE.
 *  - If DRAFT: no-op on vehicle/driver state.
 */
async function cancelTrip(tripId, reason) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw ApiError.notFound('Trip');

  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
    throw ApiError.conflict(`Trip is already ${trip.status}. Cannot cancel.`);
  }

  const wasDispatched = trip.status === 'DISPATCHED';

  const result = await prisma.$transaction(async (tx) => {
    // Update trip → CANCELLED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        ...(reason ? { notes: reason } : {}),
      },
      include: tripInclude,
    });

    // Only restore vehicle/driver if trip was DISPATCHED (they were locked)
    if (wasDispatched) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' },
      });
    }

    return updatedTrip;
  });

  return result;
}

module.exports = { createTrip, listTrips, getTripById, dispatchTrip, completeTrip, cancelTrip };
