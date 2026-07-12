/**
 * src/modules/reports/service.js
 * Analytics and report generation:
 * - Fuel efficiency (km/ltr) per vehicle
 * - Fleet utilization
 * - Operational cost per vehicle and fleet-wide
 * - ROI per vehicle
 * - CSV export
 *
 * Performance: All per-vehicle aggregations use a single GROUP BY query per table
 * instead of N individual queries (one per vehicle). This scales correctly for
 * large fleets (100+ vehicles) without N+1 query explosion.
 */

const prisma = require('../../config/db');
const { calcFuelEfficiency, calcFleetUtilization, calcROI, calcOperationalCost } = require('../../utils/calculations');

// ── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Build a Prisma date range filter object for a given field.
 * Returns undefined if no dates provided (so spread is a no-op).
 */
function makeDateFilter(field, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return {};
  return {
    [field]: {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    },
  };
}

/**
 * Convert a Prisma groupBy result array into a map keyed by vehicleId.
 * @template T
 * @param {T[]} rows
 * @param {string} key - field name to use as map key
 * @returns {Map<string, T>}
 */
function toMap(rows, key = 'vehicleId') {
  return new Map(rows.map((r) => [r[key], r]));
}

// ── Reports ───────────────────────────────────────────────────────────────────

/**
 * Fuel efficiency report: per-vehicle totalDistance / totalFuel.
 * Uses a single groupBy query per table instead of N per-vehicle queries.
 */
async function getFuelEfficiencyReport(query = {}) {
  const { vehicleId, dateFrom, dateTo } = query;

  const vehicleFilter = vehicleId ? { id: vehicleId } : {};

  // Fetch all relevant vehicles in one query
  const vehicles = await prisma.vehicle.findMany({
    where: vehicleFilter,
    select: { id: true, registrationNumber: true, name: true, type: true, region: true },
  });

  if (vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  // Single groupBy query: aggregate completed trip distances per vehicle
  const tripRows = await prisma.trip.groupBy({
    by: ['vehicleId'],
    where: {
      vehicleId: { in: vehicleIds },
      status: 'COMPLETED',
      actualDistanceKm: { not: null },
      ...makeDateFilter('completedAt', dateFrom, dateTo),
    },
    _sum: { actualDistanceKm: true, fuelConsumedLtr: true },
    _count: { id: true },
  });

  // Single groupBy query: aggregate fuel logs per vehicle
  const fuelRows = await prisma.fuelLog.groupBy({
    by: ['vehicleId'],
    where: {
      vehicleId: { in: vehicleIds },
      ...makeDateFilter('date', dateFrom, dateTo),
    },
    _sum: { liters: true, cost: true },
    _count: { id: true },
  });

  const tripMap = toMap(tripRows);
  const fuelMap = toMap(fuelRows);

  const results = vehicles.map((vehicle) => {
    const tripAgg = tripMap.get(vehicle.id);
    const fuelAgg = fuelMap.get(vehicle.id);

    const totalDistanceKm = Number(tripAgg?._sum.actualDistanceKm ?? 0);
    const totalFuelFromTrips = Number(tripAgg?._sum.fuelConsumedLtr ?? 0);
    const totalFuelFromLogs = Number(fuelAgg?._sum.liters ?? 0);
    const totalFuelLtr = totalFuelFromTrips + totalFuelFromLogs;
    const totalFuelCost = Number(fuelAgg?._sum.cost ?? 0);
    const efficiency = calcFuelEfficiency(totalDistanceKm, totalFuelLtr);

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      region: vehicle.region,
      totalDistanceKm,
      totalFuelLtr,
      totalFuelCost,
      fuelEfficiencyKmPerLtr: efficiency,
      tripCount: tripAgg?._count.id ?? 0,
      fuelLogCount: fuelAgg?._count.id ?? 0,
    };
  });

  // Sort by efficiency descending (null last)
  results.sort((a, b) => (b.fuelEfficiencyKmPerLtr ?? -1) - (a.fuelEfficiencyKmPerLtr ?? -1));
  return results;
}

/**
 * Fleet utilization report.
 * Overall utilization based on current vehicle statuses.
 */
async function getFleetUtilizationReport() {
  const [onTripCount, nonRetiredCount, vehicleBreakdown] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'ON_TRIP' } }),
    prisma.vehicle.count({ where: { status: { not: 'RETIRED' } } }),
    prisma.vehicle.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  const utilizationPct = calcFleetUtilization(onTripCount, nonRetiredCount);
  const statusBreakdown = {};
  for (const row of vehicleBreakdown) {
    statusBreakdown[row.status] = row._count.id;
  }

  return {
    fleetUtilizationPct: utilizationPct,
    activeVehicles: onTripCount,
    totalNonRetiredVehicles: nonRetiredCount,
    statusBreakdown,
  };
}

/**
 * Operational cost report: per vehicle + fleet-wide total.
 * Uses a single groupBy per table (3 total queries) regardless of fleet size.
 */
async function getOperationalCostReport(query = {}) {
  const { vehicleId, dateFrom, dateTo } = query;

  const vehicleFilter = vehicleId ? { id: vehicleId } : {};

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleFilter,
    select: { id: true, registrationNumber: true, name: true, type: true, region: true, acquisitionCost: true },
  });

  if (vehicles.length === 0) return { vehicles: [], fleetSummary: { totalFuelCost: 0, totalMaintenanceCost: 0, totalOtherExpenses: 0, grandTotal: 0 } };

  const vehicleIds = vehicles.map((v) => v.id);

  // 3 groupBy queries — one per cost table (regardless of fleet size)
  const [fuelRows, maintRows, expRows] = await Promise.all([
    prisma.fuelLog.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds }, ...makeDateFilter('date', dateFrom, dateTo) },
      _sum: { cost: true },
    }),
    prisma.maintenanceLog.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds }, ...makeDateFilter('startDate', dateFrom, dateTo) },
      _sum: { cost: true },
    }),
    prisma.expense.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds }, ...makeDateFilter('date', dateFrom, dateTo) },
      _sum: { amount: true },
    }),
  ]);

  const fuelMap = toMap(fuelRows);
  const maintMap = toMap(maintRows);
  const expMap = toMap(expRows);

  let fleetTotalFuel = 0;
  let fleetTotalMaintenance = 0;
  let fleetTotalExpenses = 0;

  const vehicleResults = vehicles.map((vehicle) => {
    const fuelCost = Number(fuelMap.get(vehicle.id)?._sum.cost ?? 0);
    const maintenanceCost = Number(maintMap.get(vehicle.id)?._sum.cost ?? 0);
    const expenseCost = Number(expMap.get(vehicle.id)?._sum.amount ?? 0);
    const total = calcOperationalCost(fuelCost, maintenanceCost, expenseCost);

    fleetTotalFuel += fuelCost;
    fleetTotalMaintenance += maintenanceCost;
    fleetTotalExpenses += expenseCost;

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      region: vehicle.region,
      acquisitionCost: Number(vehicle.acquisitionCost),
      fuelCost,
      maintenanceCost,
      otherExpenses: expenseCost,
      totalOperationalCost: total,
    };
  });

  return {
    vehicles: vehicleResults,
    fleetSummary: {
      totalFuelCost: parseFloat(fleetTotalFuel.toFixed(2)),
      totalMaintenanceCost: parseFloat(fleetTotalMaintenance.toFixed(2)),
      totalOtherExpenses: parseFloat(fleetTotalExpenses.toFixed(2)),
      grandTotal: parseFloat((fleetTotalFuel + fleetTotalMaintenance + fleetTotalExpenses).toFixed(2)),
    },
  };
}

/**
 * ROI report: (Revenue - (Maintenance + Fuel)) / AcquisitionCost × 100 per vehicle.
 * Uses a single groupBy per table (3 total queries) regardless of fleet size.
 */
async function getRoiReport(query = {}) {
  const { vehicleId } = query;

  const vehicleFilter = vehicleId ? { id: vehicleId } : {};

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleFilter,
    select: { id: true, registrationNumber: true, name: true, type: true, acquisitionCost: true },
  });

  if (vehicles.length === 0) return [];

  const vehicleIds = vehicles.map((v) => v.id);

  // 3 groupBy queries total — not N×3
  const [revenueRows, fuelRows, maintRows] = await Promise.all([
    prisma.trip.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds }, status: 'COMPLETED' },
      _sum: { revenue: true },
      _count: { id: true },
    }),
    prisma.fuelLog.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds } },
      _sum: { cost: true },
    }),
    prisma.maintenanceLog.groupBy({
      by: ['vehicleId'],
      where: { vehicleId: { in: vehicleIds } },
      _sum: { cost: true },
    }),
  ]);

  const revenueMap = toMap(revenueRows);
  const fuelMap = toMap(fuelRows);
  const maintMap = toMap(maintRows);

  const results = vehicles.map((vehicle) => {
    const revenue = Number(revenueMap.get(vehicle.id)?._sum.revenue ?? 0);
    const fuelCost = Number(fuelMap.get(vehicle.id)?._sum.cost ?? 0);
    const maintenanceCost = Number(maintMap.get(vehicle.id)?._sum.cost ?? 0);
    const acquisitionCost = Number(vehicle.acquisitionCost);
    const roi = calcROI(revenue, maintenanceCost, fuelCost, acquisitionCost);

    return {
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      acquisitionCost,
      totalRevenue: revenue,
      totalFuelCost: fuelCost,
      totalMaintenanceCost: maintenanceCost,
      netProfit: parseFloat((revenue - fuelCost - maintenanceCost).toFixed(2)),
      roiPct: roi,
      completedTripCount: revenueMap.get(vehicle.id)?._count.id ?? 0,
    };
  });

  // Sort by ROI descending
  results.sort((a, b) => (b.roiPct ?? -Infinity) - (a.roiPct ?? -Infinity));
  return results;
}

/**
 * Get report data by type for CSV export.
 * @param {'fuel-efficiency'|'fleet-utilization'|'operational-cost'|'roi'} type
 * @param {object} query
 */
async function getReportData(type, query) {
  switch (type) {
    case 'fuel-efficiency':
      return getFuelEfficiencyReport(query);
    case 'fleet-utilization': {
      const data = await getFleetUtilizationReport();
      // Flatten for CSV
      return [
        {
          fleetUtilizationPct: data.fleetUtilizationPct,
          activeVehicles: data.activeVehicles,
          totalNonRetiredVehicles: data.totalNonRetiredVehicles,
          ...data.statusBreakdown,
        },
      ];
    }
    case 'operational-cost': {
      const data = await getOperationalCostReport(query);
      return data.vehicles;
    }
    case 'roi':
      return getRoiReport(query);
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

module.exports = {
  getFuelEfficiencyReport,
  getFleetUtilizationReport,
  getOperationalCostReport,
  getRoiReport,
  getReportData,
};
