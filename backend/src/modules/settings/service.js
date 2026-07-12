const prisma = require('../../config/db');

async function getSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        depotName: "Central Depot",
        currency: "INR",
        distanceUnit: "km"
      }
    });
  }
  return settings;
}

async function updateSettings(data) {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data });
  } else {
    settings = await prisma.settings.update({
      where: { id: settings.id },
      data
    });
  }
  return settings;
}

module.exports = { getSettings, updateSettings };
