/**
 * src/cron/licenseExpiryCron.js
 * Bonus: node-cron job that runs daily and sends email alerts
 * for driver licenses expiring within the next 30 days.
 *
 * Requires SMTP env vars to be set in .env.
 * If SMTP vars are missing, the cron runs silently without sending emails.
 */

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const prisma = require('../config/db');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config/env');
const { daysFromNow } = require('../utils/dateHelpers');

const EXPIRY_WARNING_DAYS = 30;

// ── Nodemailer transport ──────────────────────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

// ── Core job logic ────────────────────────────────────────────────────────────

async function checkLicenseExpiries() {
  const warningDate = daysFromNow(EXPIRY_WARNING_DAYS);
  const now = new Date();

  // Find drivers whose license expires within the next 30 days (or has already expired)
  const expiringDrivers = await prisma.driver.findMany({
    where: {
      licenseExpiryDate: { lte: warningDate },
      status: { not: 'SUSPENDED' },
    },
    include: { user: { select: { email: true, name: true } } },
  });

  if (expiringDrivers.length === 0) {
    console.log('[LicenseCron] No expiring licenses found.');
    return;
  }

  console.log(`[LicenseCron] Found ${expiringDrivers.length} expiring license(s).`);

  const transport = getTransporter();

  // Find all Safety Officers to notify
  const safetyOfficers = await prisma.user.findMany({
    where: { role: { name: 'SAFETY_OFFICER' } },
    select: { email: true, name: true },
  });

  const recipientEmails = safetyOfficers.map((u) => u.email);

  if (transport && recipientEmails.length > 0) {
    const driverList = expiringDrivers
      .map(
        (d) =>
          `• ${d.name} [${d.licenseNumber}] — expires: ${d.licenseExpiryDate.toISOString().split('T')[0]}`
      )
      .join('\n');

    try {
      await transport.sendMail({
        from: SMTP_FROM,
        to: recipientEmails.join(', '),
        subject: `[FleetFlow] ⚠️ ${expiringDrivers.length} Driver License(s) Expiring Soon or Expired`,
        text: `FleetFlow License Expiry Alert\n\nThe following driver licenses will expire within ${EXPIRY_WARNING_DAYS} days (or have already expired):\n\n${driverList}\n\nPlease take action to renew these licenses.\n\n— FleetFlow System`,
        html: `
          <h2>⚠️ FleetFlow License Expiry Alert</h2>
          <p>The following driver licenses will expire within <strong>${EXPIRY_WARNING_DAYS} days</strong> (or have already expired):</p>
          <ul>
            ${expiringDrivers
              .map(
                (d) =>
                  `<li><strong>${d.name}</strong> [${d.licenseNumber}] — expires: <strong>${d.licenseExpiryDate.toISOString().split('T')[0]}</strong></li>`
              )
              .join('')}
          </ul>
          <p>Please take action to renew these licenses.</p>
          <p><em>— FleetFlow System</em></p>
        `,
      });

      console.log(`[LicenseCron] Alert email sent to: ${recipientEmails.join(', ')}`);
    } catch (emailErr) {
      console.error('[LicenseCron] Failed to send email:', emailErr.message);
      // Fall through: log to console anyway
      for (const d of expiringDrivers) {
        console.warn(
          `  ⚠️  Driver: ${d.name} [${d.licenseNumber}] expires: ${d.licenseExpiryDate.toISOString().split('T')[0]}`
        );
      }
    }
  } else {
    // No email transport — just log to console
    console.warn('[LicenseCron] SMTP not configured. Logging expiring licenses to console:');
    for (const d of expiringDrivers) {
      console.warn(
        `  ⚠️  Driver: ${d.name} [${d.licenseNumber}] expires: ${d.licenseExpiryDate.toISOString().split('T')[0]}`
      );
    }
  }
}

// ── Schedule: daily at 8:00 AM ────────────────────────────────────────────────
cron.schedule('0 8 * * *', async () => {
  console.log(`[LicenseCron] Running license expiry check — ${new Date().toISOString()}`);
  try {
    await checkLicenseExpiries();
  } catch (err) {
    console.error('[LicenseCron] Error during license expiry check:', err);
  }
});

console.log('[LicenseCron] License expiry cron scheduled — runs daily at 08:00');

module.exports = { checkLicenseExpiries };
