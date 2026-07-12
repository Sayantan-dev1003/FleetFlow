/**
 * src/modules/reports/controller.js
 */

const reportsService = require('./service');
const { streamCSV } = require('../../utils/csvExport');
const ApiError = require('../../utils/ApiError');

const VALID_REPORT_TYPES = ['fuel-efficiency', 'fleet-utilization', 'operational-cost', 'roi'];

const getFuelEfficiency = async (req, res, next) => {
  try {
    const data = await reportsService.getFuelEfficiencyReport(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getFleetUtilization = async (req, res, next) => {
  try {
    const data = await reportsService.getFleetUtilizationReport();
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getOperationalCost = async (req, res, next) => {
  try {
    const data = await reportsService.getOperationalCostReport(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getRoi = async (req, res, next) => {
  try {
    const data = await reportsService.getRoiReport(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

/**
 * GET /api/reports/export?type=<type>&format=csv
 * Streams a CSV file for the requested report type.
 */
const exportReport = async (req, res, next) => {
  try {
    const { type, format } = req.query;

    if (!type || !VALID_REPORT_TYPES.includes(type)) {
      throw ApiError.badRequest(
        `Invalid report type. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`
      );
    }

    if (format && format !== 'csv') {
      throw ApiError.badRequest('Only format=csv is currently supported.');
    }

    const data = await reportsService.getReportData(type, req.query);

    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'No data available for this report.' });
    }

    // Stream as CSV
    const filename = `fleetflow-${type}-${new Date().toISOString().split('T')[0]}`;
    streamCSV(res, data, filename);
  } catch (err) { next(err); }
};

module.exports = { getFuelEfficiency, getFleetUtilization, getOperationalCost, getRoi, exportReport };
