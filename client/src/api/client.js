const API_BASE = 'http://localhost:4000/api';

function getHeaders() {
  const user = JSON.parse(localStorage.getItem('fleet_user') || 'null');
  const headers = { 'Content-Type': 'application/json' };
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
}

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || 'API Request Failed');
  }
  return data?.data || data;
}

// --- Mappers: Backend -> Frontend UI ---

export function mapVehicleToUI(v) {
  return {
    id: v.id, // Keep the real UUID for reference
    regNo: v.registrationNumber,
    name: v.name,
    type: v.type,
    capacity: Number(v.maxLoadCapacityKg),
    odometer: Number(v.odometerKm),
    acqCost: Number(v.acquisitionCost),
    status: v.status === 'AVAILABLE' ? 'Available' : 
            v.status === 'ON_TRIP' ? 'On Trip' : 
            v.status === 'IN_SHOP' ? 'In Shop' : 'Retired',
    region: v.region
  };
}

export function mapDriverToUI(d) {
  return {
    id: d.id,
    name: d.name,
    licenseNo: d.licenseNumber,
    category: d.licenseCategory,
    expiry: d.licenseExpiryDate ? d.licenseExpiryDate.split('T')[0] : '',
    contact: d.contactNumber,
    tripsCompleted: d._count?.trips || 0,
    safetyScore: d.safetyScore,
    status: d.status === 'AVAILABLE' ? 'Available' : 
            d.status === 'ON_TRIP' ? 'On Trip' : 
            d.status === 'OFF_DUTY' ? 'Off Duty' : 'Suspended'
  };
}

export function mapTripToUI(t, vehicles, drivers) {
  const v = vehicles.find(veh => veh.id === t.vehicleId) || {};
  const d = drivers.find(drv => drv.id === t.driverId) || {};
  
  return {
    id: t.id,
    realId: t.id, // For backend operations
    source: t.source,
    destination: t.destination,
    vehicleRegNo: v.regNo || '',
    driverLicenseNo: d.licenseNo || '',
    cargoWeight: Number(t.cargoWeightKg),
    plannedDistance: Number(t.plannedDistanceKm),
    status: t.status === 'DRAFT' ? 'Draft' : 
            t.status === 'DISPATCHED' ? 'Dispatched' : 
            t.status === 'COMPLETED' ? 'Completed' : 'Cancelled',
    revenue: Number(t.revenue || 0),
    startOdometer: Number(t.startOdometerKm || 0),
    endOdometer: Number(t.endOdometerKm || 0),
    fuelConsumed: Number(t.fuelConsumedLtr || 0)
  };
}

export function mapMaintenanceToUI(m, vehicles) {
  const v = vehicles.find(veh => veh.id === m.vehicleId) || {};
  return {
    id: m.id,
    realId: m.id,
    vehicleRegNo: v.regNo || '',
    serviceType: m.type,
    cost: Number(m.cost),
    date: m.startDate ? m.startDate.split('T')[0] : '',
    status: m.status === 'OPEN' ? 'Active' : 'Completed'
  };
}

export function mapFuelLogToUI(f, vehicles) {
  const v = vehicles.find(veh => veh.id === f.vehicleId) || {};
  return {
    id: f.id,
    vehicleRegNo: v.regNo || '',
    date: f.date ? f.date.split('T')[0] : '',
    liters: Number(f.liters),
    cost: Number(f.cost)
  };
}

export function mapExpenseToUI(e, vehicles) {
  const v = vehicles.find(veh => veh.id === e.vehicleId) || {};
  return {
    id: e.id,
    tripId: e.tripId || 'N/A',
    vehicleRegNo: v.regNo || '',
    toll: e.type === 'TOLL' ? Number(e.amount) : 0,
    other: e.type === 'OTHER' ? Number(e.amount) : 0,
    maintenance: e.type === 'MAINTENANCE' ? Number(e.amount) : 0,
    total: Number(e.amount)
  };
}
