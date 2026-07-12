/**
 * prisma/seed.js
 * Seeds: 4 roles, 1 demo user per role, 5 sample vehicles, 4 drivers
 */

const { PrismaClient, RoleName, VehicleStatus, DriverStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ── 1. Seed Roles ──────────────────────────────────────────────────────────
  console.log('📦 Seeding roles...');
  const roleData = [
    { name: RoleName.FLEET_MANAGER },
    { name: RoleName.DRIVER },
    { name: RoleName.SAFETY_OFFICER },
    { name: RoleName.FINANCIAL_ANALYST },
  ];

  const roles = {};
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roles[r.name] = role;
    console.log(`  ✓ Role: ${role.name} (${role.id})`);
  }

  // ── 2. Seed Demo Users (1 per role) ───────────────────────────────────────
  console.log('\n👤 Seeding demo users...');
  const usersData = [
    {
      name: 'Alice Manager',
      email: 'manager@fleetflow.com',
      password: 'Manager@123',
      roleName: RoleName.FLEET_MANAGER,
    },
    {
      name: 'Bob Driver',
      email: 'driver@fleetflow.com',
      password: 'Driver@123',
      roleName: RoleName.DRIVER,
    },
    {
      name: 'Carol Safety',
      email: 'safety@fleetflow.com',
      password: 'Safety@123',
      roleName: RoleName.SAFETY_OFFICER,
    },
    {
      name: 'David Finance',
      email: 'finance@fleetflow.com',
      password: 'Finance@123',
      roleName: RoleName.FINANCIAL_ANALYST,
    },
  ];

  const users = {};
  for (const u of usersData) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        roleId: roles[u.roleName].id,
      },
    });
    users[u.roleName] = user;
    console.log(`  ✓ User: ${user.name} <${user.email}> [${u.roleName}] — password: ${u.password}`);
  }

  // ── 3. Seed Sample Vehicles ────────────────────────────────────────────────
  console.log('\n🚛 Seeding sample vehicles...');
  const vehiclesData = [
    {
      registrationNumber: 'MH-01-AB-1234',
      name: 'Tata Prima 4028.S',
      type: 'Heavy Truck',
      maxLoadCapacityKg: 28000,
      odometerKm: 45200,
      acquisitionCost: 3500000,
      status: VehicleStatus.AVAILABLE,
      region: 'West',
    },
    {
      registrationNumber: 'DL-03-CD-5678',
      name: 'Ashok Leyland BOSS',
      type: 'Medium Truck',
      maxLoadCapacityKg: 16000,
      odometerKm: 78300,
      acquisitionCost: 2200000,
      status: VehicleStatus.AVAILABLE,
      region: 'North',
    },
    {
      registrationNumber: 'KA-05-EF-9012',
      name: 'Eicher Pro 6031',
      type: 'Light Truck',
      maxLoadCapacityKg: 11000,
      odometerKm: 31500,
      acquisitionCost: 1800000,
      status: VehicleStatus.AVAILABLE,
      region: 'South',
    },
    {
      registrationNumber: 'GJ-07-GH-3456',
      name: 'Mahindra Furio 17',
      type: 'Medium Truck',
      maxLoadCapacityKg: 17000,
      odometerKm: 62100,
      acquisitionCost: 2400000,
      status: VehicleStatus.IN_SHOP,
      region: 'West',
    },
    {
      registrationNumber: 'TN-09-IJ-7890',
      name: 'BharatBenz 2823R',
      type: 'Heavy Truck',
      maxLoadCapacityKg: 25000,
      odometerKm: 95600,
      acquisitionCost: 3200000,
      status: VehicleStatus.AVAILABLE,
      region: 'South',
    },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: {},
      create: v,
    });
    vehicles.push(vehicle);
    console.log(`  ✓ Vehicle: ${vehicle.name} [${vehicle.registrationNumber}] — ${vehicle.status}`);
  }

  // ── 4. Seed Sample Drivers ─────────────────────────────────────────────────
  console.log('\n🧑‍✈️ Seeding sample drivers...');
  const driversData = [
    {
      name: 'Rajesh Kumar',
      licenseNumber: 'MH0120240012345',
      licenseCategory: 'HMV',
      licenseExpiryDate: new Date('2027-06-30'),
      contactNumber: '+91-9876543210',
      safetyScore: 95,
      status: DriverStatus.AVAILABLE,
    },
    {
      name: 'Sunita Sharma',
      licenseNumber: 'DL0320230054321',
      licenseCategory: 'HMV',
      licenseExpiryDate: new Date('2026-12-15'),
      contactNumber: '+91-9123456789',
      safetyScore: 88,
      status: DriverStatus.AVAILABLE,
    },
    {
      name: 'Mohammed Hussain',
      licenseNumber: 'KA0520220098765',
      licenseCategory: 'LMV-HMV',
      // Note: Past expiry date is intentional for demo purposes to show that
      // SUSPENDED drivers are already blocked before the date check.
      licenseExpiryDate: new Date('2025-03-20'),
      contactNumber: '+91-9234567890',
      safetyScore: 72,
      status: DriverStatus.SUSPENDED,
    },
    {
      name: 'Priya Patel',
      licenseNumber: 'GJ0720240011111',
      licenseCategory: 'LMV',
      licenseExpiryDate: new Date('2028-09-10'),
      contactNumber: '+91-9345678901',
      safetyScore: 99,
      status: DriverStatus.AVAILABLE,
    },
  ];

  // Link the demo driver user to the first driver record
  for (let i = 0; i < driversData.length; i++) {
    const d = driversData[i];
    const userId = i === 0 ? users[RoleName.DRIVER].id : undefined;

    const driver = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: {
        ...d,
        ...(userId ? { userId } : {}),
      },
    });
    console.log(`  ✓ Driver: ${driver.name} [${driver.licenseNumber}] — ${driver.status}`);
  }

  // ── 5. Seed Maintenance Log for IN_SHOP vehicle ───────────────────────────
  console.log('\n🔧 Seeding sample maintenance log...');
  const inShopVehicle = vehicles.find((v) => v.status === VehicleStatus.IN_SHOP);
  if (inShopVehicle) {
    await prisma.maintenanceLog.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        vehicleId: inShopVehicle.id,
        type: 'Scheduled Overhaul',
        description: 'Engine overhaul and brake pad replacement',
        cost: 85000,
        status: 'OPEN',
        startDate: new Date(),
      },
    });
    console.log(`  ✓ Maintenance log for ${inShopVehicle.name}`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Demo Credentials:');
  console.log('  Fleet Manager : manager@fleetflow.com / Manager@123');
  console.log('  Driver        : driver@fleetflow.com  / Driver@123');
  console.log('  Safety Officer: safety@fleetflow.com  / Safety@123');
  console.log('  Financial     : finance@fleetflow.com / Finance@123');
  console.log('═══════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
