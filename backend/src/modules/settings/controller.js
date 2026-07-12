const settingsService = require('./service');

async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSettings, updateSettings };
