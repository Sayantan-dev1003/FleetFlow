/**
 * src/modules/dashboard/service.js
 * KPI aggregation for the dashboard endpoint.
 * All KPIs are computed from live DB state.
 */

const prisma = require('../../config/db');

/**
 * Get fleet KPI snapshot.
 * Supports optional filters: type, status, region (for vehicle sub-counts).
 * @param {{ type?: string, status?: string, region?: string }} filters
 */
async function getKpis(filters = {}) {
  const { type, region } = filters;

  // Base vehicle filter (for type/region sub-filtering on vehicle counts)
  const vehicleFilter = {
    ...(type ? { type: { contains: type, mode: 'insensitive' } } : {}),
    ...(region ? { region: { contains: region, mode: 'insensitive' } } : {}),
  };

  // Run all aggregation queries concurrently
  const [
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    retiredVehicles,
    totalNonRetiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalAvailableDrivers,
    completedTripsToday,
  ] = await Promise.all([
    // Vehicles actively on a trip
    prisma.vehicle.count({ where: { ...vehicleFilter, status: 'ON_TRIP' } }),
    // Vehicles available for dispatch
    prisma.vehicle.count({ where: { ...vehicleFilter, status: 'AVAILABLE' } }),
    // Vehicles in shop
    prisma.vehicle.count({ where: { ...vehicleFilter, status: 'IN_SHOP' } }),
    // Retired vehicles
    prisma.vehicle.count({ where: { ...vehicleFilter, status: 'RETIRED' } }),
    // Non-retired vehicles (denominator for utilization)
    prisma.vehicle.count({ where: { ...vehicleFilter, status: { not: 'RETIRED' } } }),
    // Active (DISPATCHED) trips
    prisma.trip.count({ where: { status: 'DISPATCHED' } }),
    // Pending (DRAFT) trips
    prisma.trip.count({ where: { status: 'DRAFT' } }),
    // Drivers currently on trip (On Duty = actively driving)
    prisma.driver.count({ where: { status: 'ON_TRIP' } }),
    // Available drivers
    prisma.driver.count({ where: { status: 'AVAILABLE' } }),
    // Trips completed today
    prisma.trip.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  // Fleet Utilization % = ON_TRIP / non-RETIRED × 100
  const fleetUtilizationPct =
    totalNonRetiredVehicles > 0
      ? parseFloat(((activeVehicles / totalNonRetiredVehicles) * 100).toFixed(2))
      : 0;

  return {
    vehicles: {
      active: activeVehicles,       // ON_TRIP
      available: availableVehicles, // AVAILABLE
      inMaintenance: vehiclesInMaintenance, // IN_SHOP
      retired: retiredVehicles,
      total: totalNonRetiredVehicles + retiredVehicles,
      nonRetired: totalNonRetiredVehicles,
    },
    trips: {
      active: activeTrips,          // DISPATCHED
      pending: pendingTrips,        // DRAFT
      completedToday: completedTripsToday,
    },
    drivers: {
      onDuty: driversOnDuty,        // ON_TRIP (actively driving)
      available: totalAvailableDrivers,
    },
    fleetUtilizationPct,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { getKpis };
