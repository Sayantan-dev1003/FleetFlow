/**
 * src/modules/dashboard/controller.js
 */

const dashboardService = require('./service');

const getKpis = async (req, res, next) => {
  try {
    const { type, status, region } = req.query;
    const kpis = await dashboardService.getKpis({ type, status, region });
    res.status(200).json({ success: true, data: kpis });
  } catch (err) { next(err); }
};

module.exports = { getKpis };
