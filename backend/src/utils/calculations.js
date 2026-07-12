/**
 * src/utils/calculations.js
 * Business metric calculations for reports and dashboard KPIs.
 */

/**
 * Fleet Utilization %
 * = (vehicles with status ON_TRIP) / (vehicles with status != RETIRED) × 100
 * @param {number} onTripCount
 * @param {number} nonRetiredCount
 * @returns {number} percentage rounded to 2 decimal places
 */
function calcFleetUtilization(onTripCount, nonRetiredCount) {
  if (nonRetiredCount === 0) return 0;
  return parseFloat(((onTripCount / nonRetiredCount) * 100).toFixed(2));
}

/**
 * Fuel efficiency for a vehicle (km per litre).
 * @param {number} totalDistanceKm
 * @param {number} totalFuelLtr
 * @returns {number | null}
 */
function calcFuelEfficiency(totalDistanceKm, totalFuelLtr) {
  if (!totalFuelLtr || totalFuelLtr === 0) return null;
  return parseFloat((totalDistanceKm / totalFuelLtr).toFixed(3));
}

/**
 * Return on Investment per vehicle.
 * ROI = (Revenue - (Maintenance cost + Fuel cost)) / AcquisitionCost × 100
 * @param {number} revenue
 * @param {number} maintenanceCost
 * @param {number} fuelCost
 * @param {number} acquisitionCost
 * @returns {number | null} ROI percentage
 */
function calcROI(revenue, maintenanceCost, fuelCost, acquisitionCost) {
  if (!acquisitionCost || acquisitionCost === 0) return null;
  const netProfit = revenue - (maintenanceCost + fuelCost);
  return parseFloat(((netProfit / acquisitionCost) * 100).toFixed(2));
}

/**
 * Operational cost = fuel cost + maintenance cost (+ misc expenses).
 * @param {number} fuelCost
 * @param {number} maintenanceCost
 * @param {number} [expenseCost]
 * @returns {number}
 */
function calcOperationalCost(fuelCost, maintenanceCost, expenseCost = 0) {
  return parseFloat((Number(fuelCost) + Number(maintenanceCost) + Number(expenseCost)).toFixed(2));
}

module.exports = {
  calcFleetUtilization,
  calcFuelEfficiency,
  calcROI,
  calcOperationalCost,
};
