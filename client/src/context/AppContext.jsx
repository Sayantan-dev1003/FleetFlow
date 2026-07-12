import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const MOCK_USERS = [
  { email: 'manager@transitops.in', name: 'Nirmal J.', role: 'Fleet Manager', password: 'password123' },
  { email: 'Raven.k@transitops.in', name: 'Raven K.', role: 'Dispatcher', password: 'password123' },
  { email: 'safety@transitops.in', name: 'Suresh S.', role: 'Safety Officer', password: 'password123' },
  { email: 'analyst@transitops.in', name: 'Priya P.', role: 'Financial Analyst', password: 'password123' }
];

const INITIAL_VEHICLES = [
  { regNo: 'GJ01AB452', name: 'VAN-05', type: 'Van', capacity: 500, odometer: 74000, acqCost: 620000, status: 'Available', region: 'Gujarat' },
  { regNo: 'GJ01AB998', name: 'TRUCK-11', type: 'Truck', capacity: 5000, odometer: 182000, acqCost: 2450000, status: 'On Trip', region: 'Maharashtra' },
  { regNo: 'GJ01AB112', name: 'MINI-03', type: 'Mini', capacity: 1000, odometer: 66000, acqCost: 410000, status: 'In Shop', region: 'Gujarat' },
  { regNo: 'GJ01AB008', name: 'VAN-09', type: 'Van', capacity: 750, odometer: 241900, acqCost: 590000, status: 'Retired', region: 'Rajasthan' }
];

const INITIAL_DRIVERS = [
  { name: 'Alex', licenseNo: 'DL-88213', category: 'LMV', expiry: '2028-12-31', contact: '9876543210', tripsCompleted: 12, safetyScore: 96, status: 'Available' },
  { name: 'John', licenseNo: 'DL-44120', category: 'HMV', expiry: '2025-03-31', contact: '9822012345', tripsCompleted: 42, safetyScore: 81, status: 'Suspended' },
  { name: 'Priya', licenseNo: 'DL-77031', category: 'LMV', expiry: '2029-08-15', contact: '9911078901', tripsCompleted: 24, safetyScore: 99, status: 'On Trip' },
  { name: 'Suresh', licenseNo: 'DL-90045', category: 'HMV', expiry: '2027-01-20', contact: '9744067890', tripsCompleted: 18, safetyScore: 88, status: 'Off Duty' }
];

const INITIAL_TRIPS = [
  { id: 'TR001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleRegNo: 'GJ01AB998', driverLicenseNo: 'DL-77031', cargoWeight: 4500, plannedDistance: 38, status: 'Dispatched', revenue: 15000, startOdometer: 181962 },
  { id: 'TR002', source: 'Ahmedabad Hub', destination: 'Baroda Depot', vehicleRegNo: 'GJ01AB452', driverLicenseNo: 'DL-88213', cargoWeight: 450, plannedDistance: 120, status: 'Completed', revenue: 45000, startOdometer: 73880, endOdometer: 74000, fuelConsumed: 14 },
  { id: 'TR004', source: 'Vatva Industrial Area', destination: 'Sanand Warehouse', vehicleRegNo: '', driverLicenseNo: '', cargoWeight: 0, plannedDistance: 0, status: 'Draft', revenue: 0, startOdometer: 0 },
  { id: 'TR006', source: 'Mansa', destination: 'Kalol Depot', vehicleRegNo: '', driverLicenseNo: '', cargoWeight: 0, plannedDistance: 0, status: 'Cancelled', revenue: 0, startOdometer: 0 }
];

const INITIAL_MAINTENANCE = [
  { id: 'Maint-1', vehicleRegNo: 'GJ01AB452', serviceType: 'Oil Change', cost: 2500, date: '2026-07-07', status: 'Completed' },
  { id: 'Maint-2', vehicleRegNo: 'GJ01AB998', serviceType: 'Engine Repair', cost: 18000, date: '2026-07-06', status: 'Completed' },
  { id: 'Maint-3', vehicleRegNo: 'GJ01AB112', serviceType: 'Tyre Replace', cost: 6200, date: '2026-07-06', status: 'Active' }
];

const INITIAL_FUEL = [
  { id: 'Fuel-1', vehicleRegNo: 'GJ01AB452', date: '2026-07-05', liters: 42, cost: 3150 },
  { id: 'Fuel-2', vehicleRegNo: 'GJ01AB998', date: '2026-07-06', liters: 110, cost: 8400 },
  { id: 'Fuel-3', vehicleRegNo: 'GJ01AB112', date: '2026-07-06', liters: 28, cost: 2050 }
];

const INITIAL_EXPENSES = [
  { id: 'Exp-1', tripId: 'TR002', vehicleRegNo: 'GJ01AB452', toll: 120, other: 0, maintenance: 0, total: 120 },
  { id: 'Exp-2', tripId: 'Maint-2', vehicleRegNo: 'GJ01AB998', toll: 340, other: 150, maintenance: 18000, total: 18490 }
];

export function AppProvider({ children }) {
  // Load state from local storage if exists, otherwise use defaults
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fleet_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('fleet_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('fleet_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('fleet_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    const saved = localStorage.getItem('fleet_maint');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [fuelLogs, setFuelLogs] = useState(() => {
    const saved = localStorage.getItem('fleet_fuel');
    return saved ? JSON.parse(saved) : INITIAL_FUEL;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('fleet_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('fleet_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('fleet_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('fleet_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('fleet_maint', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem('fleet_fuel', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('fleet_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fleet_user', JSON.stringify(user));
      // Set default landing page based on role
      if (user.role === 'Fleet Manager') setActivePage('fleet');
      else if (user.role === 'Dispatcher') setActivePage('dashboard');
      else if (user.role === 'Safety Officer') setActivePage('drivers');
      else if (user.role === 'Financial Analyst') setActivePage('expenses');
    } else {
      localStorage.removeItem('fleet_user');
    }
  }, [user]);

  // Auth Operations
  const login = (email, password, role) => {
    if (accountLocked) {
      return { success: false, error: 'Account locked due to 5 failed attempts.' };
    }

    const matchedUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (matchedUser && password === 'password123') {
      setUser(matchedUser);
      setLoginAttempts(0);
      return { success: true };
    } else {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setAccountLocked(true);
        return { success: false, error: 'Invalid credentials. Account locked after 5 failed attempts.' };
      }
      return { success: false, error: `Invalid credentials. Attempts: ${nextAttempts}/5` };
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Vehicles CRUD
  const addVehicle = (vehicle) => {
    const isDuplicate = vehicles.some(
      v => v.regNo.trim().toUpperCase() === vehicle.regNo.trim().toUpperCase()
    );
    if (isDuplicate) {
      return { success: false, error: `Vehicle with registration number ${vehicle.regNo} already exists!` };
    }
    const newVehicle = {
      ...vehicle,
      regNo: vehicle.regNo.trim().toUpperCase(),
      capacity: Number(vehicle.capacity),
      odometer: Number(vehicle.odometer),
      acqCost: Number(vehicle.acqCost),
      status: vehicle.status || 'Available'
    };
    setVehicles([...vehicles, newVehicle]);
    return { success: true };
  };

  const updateVehicle = (regNo, updatedFields) => {
    setVehicles(prev => prev.map(v => {
      if (v.regNo.toUpperCase() === regNo.toUpperCase()) {
        return {
          ...v,
          ...updatedFields,
          capacity: updatedFields.capacity !== undefined ? Number(updatedFields.capacity) : v.capacity,
          odometer: updatedFields.odometer !== undefined ? Number(updatedFields.odometer) : v.odometer,
          acqCost: updatedFields.acqCost !== undefined ? Number(updatedFields.acqCost) : v.acqCost
        };
      }
      return v;
    }));
    return { success: true };
  };

  const deleteVehicle = (regNo) => {
    setVehicles(prev => prev.filter(v => v.regNo.toUpperCase() !== regNo.toUpperCase()));
    return { success: true };
  };

  // Drivers CRUD
  const addDriver = (driver) => {
    const isDuplicate = drivers.some(
      d => d.licenseNo.trim().toUpperCase() === driver.licenseNo.trim().toUpperCase()
    );
    if (isDuplicate) {
      return { success: false, error: `Driver with license number ${driver.licenseNo} already exists!` };
    }
    const newDriver = {
      ...driver,
      licenseNo: driver.licenseNo.trim().toUpperCase(),
      safetyScore: Number(driver.safetyScore || 100),
      tripsCompleted: Number(driver.tripsCompleted || 0),
      status: driver.status || 'Available'
    };
    setDrivers([...drivers, newDriver]);
    return { success: true };
  };

  const updateDriver = (licenseNo, updatedFields) => {
    setDrivers(prev => prev.map(d => {
      if (d.licenseNo.toUpperCase() === licenseNo.toUpperCase()) {
        return {
          ...d,
          ...updatedFields,
          safetyScore: updatedFields.safetyScore !== undefined ? Number(updatedFields.safetyScore) : d.safetyScore,
          tripsCompleted: updatedFields.tripsCompleted !== undefined ? Number(updatedFields.tripsCompleted) : d.tripsCompleted
        };
      }
      return d;
    }));
    return { success: true };
  };

  const deleteDriver = (licenseNo) => {
    setDrivers(prev => prev.filter(d => d.licenseNo.toUpperCase() !== licenseNo.toUpperCase()));
    return { success: true };
  };

  // Trips Workflow
  const createTrip = (tripData) => {
    const nextId = `TR${String(trips.length + 1).padStart(3, '0')}`;
    const newTrip = {
      id: nextId,
      source: tripData.source || 'Depot',
      destination: tripData.destination || 'Hub',
      vehicleRegNo: tripData.vehicleRegNo || '',
      driverLicenseNo: tripData.driverLicenseNo || '',
      cargoWeight: Number(tripData.cargoWeight || 0),
      plannedDistance: Number(tripData.plannedDistance || 0),
      revenue: Number(tripData.revenue || 0),
      status: 'Draft',
      startOdometer: 0
    };
    setTrips([...trips, newTrip]);
    return { success: true, trip: newTrip };
  };

  const dispatchTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const vehicle = vehicles.find(v => v.regNo === trip.vehicleRegNo);
    const driver = drivers.find(d => d.licenseNo === trip.driverLicenseNo);

    if (!vehicle) return { success: false, error: 'Please select a valid vehicle before dispatching.' };
    if (!driver) return { success: false, error: 'Please select a valid driver before dispatching.' };

    // Validations
    if (vehicle.status !== 'Available') {
      return { success: false, error: `Vehicle is currently in status '${vehicle.status}' (must be Available).` };
    }
    if (driver.status !== 'Available') {
      return { success: false, error: `Driver is currently in status '${driver.status}' (must be Available).` };
    }

    // License expiry validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (driver.expiry < todayStr) {
      return { success: false, error: `Cannot dispatch: Driver's license is expired (${driver.expiry}).` };
    }

    // Capacity check
    if (trip.cargoWeight > vehicle.capacity) {
      return { success: false, error: `Cannot dispatch: Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).` };
    }

    // Update statuses
    updateVehicle(vehicle.regNo, { status: 'On Trip' });
    updateDriver(driver.licenseNo, { status: 'On Trip' });

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'Dispatched',
          startOdometer: vehicle.odometer
        };
      }
      return t;
    }));

    return { success: true };
  };

  const completeTrip = (tripId, finalOdometer, fuelConsumed, tollCost = 0, otherCost = 0) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const vehicle = vehicles.find(v => v.regNo === trip.vehicleRegNo);
    if (!vehicle) return { success: false, error: 'Linked vehicle not found' };

    if (finalOdometer < trip.startOdometer) {
      return { success: false, error: `Odometer reading (${finalOdometer} km) cannot be less than start odometer (${trip.startOdometer} km).` };
    }

    // Update statuses back to Available
    updateVehicle(trip.vehicleRegNo, { status: 'Available', odometer: finalOdometer });
    
    if (trip.driverLicenseNo) {
      const driver = drivers.find(d => d.licenseNo === trip.driverLicenseNo);
      const newTripsCount = (driver?.tripsCompleted || 0) + 1;
      updateDriver(trip.driverLicenseNo, { status: 'Available', tripsCompleted: newTripsCount });
    }

    // Update trip details
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'Completed',
          endOdometer: finalOdometer,
          fuelConsumed: fuelConsumed
        };
      }
      return t;
    }));

    // Add fuel log
    const fuelId = `Fuel-${fuelLogs.length + 1}`;
    const fuelCostCalculated = fuelConsumed * 95; // Rs 95 per liter estimate
    const newFuelLog = {
      id: fuelId,
      vehicleRegNo: trip.vehicleRegNo,
      date: new Date().toISOString().split('T')[0],
      liters: fuelConsumed,
      cost: fuelCostCalculated
    };
    setFuelLogs(prev => [...prev, newFuelLog]);

    // Add expense record
    const expId = `Exp-${expenses.length + 1}`;
    const totalExp = Number(tollCost) + Number(otherCost);
    const newExpense = {
      id: expId,
      tripId: tripId,
      vehicleRegNo: trip.vehicleRegNo,
      toll: Number(tollCost),
      other: Number(otherCost),
      maintenance: 0,
      total: totalExp
    };
    setExpenses(prev => [...prev, newExpense]);

    return { success: true };
  };

  const cancelTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    if (trip.status === 'Dispatched') {
      if (trip.vehicleRegNo) updateVehicle(trip.vehicleRegNo, { status: 'Available' });
      if (trip.driverLicenseNo) updateDriver(trip.driverLicenseNo, { status: 'Available' });
    }

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'Cancelled'
        };
      }
      return t;
    }));

    return { success: true };
  };

  // Maintenance Operations
  const addMaintenanceLog = (logData) => {
    const targetVehicle = vehicles.find(v => v.regNo === logData.vehicleRegNo);
    if (!targetVehicle) return { success: false, error: 'Vehicle not found' };

    const nextId = `Maint-${maintenanceLogs.length + 1}`;
    const newLog = {
      id: nextId,
      vehicleRegNo: logData.vehicleRegNo,
      serviceType: logData.serviceType || 'General Checkup',
      cost: Number(logData.cost || 0),
      date: logData.date || new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    updateVehicle(logData.vehicleRegNo, { status: 'In Shop' });
    setMaintenanceLogs([...maintenanceLogs, newLog]);

    return { success: true };
  };

  const completeMaintenanceLog = (logId) => {
    const log = maintenanceLogs.find(m => m.id === logId);
    if (!log) return { success: false, error: 'Log not found' };

    // Set maintenance log status to Completed
    setMaintenanceLogs(prev => prev.map(m => {
      if (m.id === logId) return { ...m, status: 'Completed' };
      return m;
    }));

    // Reset vehicle status to Available, unless vehicle is Retired
    const vehicle = vehicles.find(v => v.regNo === log.vehicleRegNo);
    if (vehicle && vehicle.status !== 'Retired') {
      updateVehicle(log.vehicleRegNo, { status: 'Available' });
    }

    // Add cost as a maintenance expense log
    const expId = `Exp-${expenses.length + 1}`;
    const newExpense = {
      id: expId,
      tripId: logId, // linked to maintenance log id
      vehicleRegNo: log.vehicleRegNo,
      toll: 0,
      other: 0,
      maintenance: Number(log.cost),
      total: Number(log.cost)
    };
    setExpenses(prev => [...prev, newExpense]);

    return { success: true };
  };

  // Fuel Logs & Expenses Manual Logging
  const addFuelLogManual = (data) => {
    const nextId = `Fuel-${fuelLogs.length + 1}`;
    const newLog = {
      id: nextId,
      vehicleRegNo: data.vehicleRegNo,
      date: data.date || new Date().toISOString().split('T')[0],
      liters: Number(data.liters),
      cost: Number(data.cost)
    };
    setFuelLogs([...fuelLogs, newLog]);
    return { success: true };
  };

  const addExpenseManual = (data) => {
    const nextId = `Exp-${expenses.length + 1}`;
    const toll = Number(data.toll || 0);
    const other = Number(data.other || 0);
    const maint = Number(data.maintenance || 0);
    const newExp = {
      id: nextId,
      tripId: data.tripId || 'N/A',
      vehicleRegNo: data.vehicleRegNo,
      toll,
      other,
      maintenance: maint,
      total: toll + other + maint
    };
    setExpenses([...expenses, newExp]);
    return { success: true };
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      vehicles,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      drivers,
      addDriver,
      updateDriver,
      deleteDriver,
      trips,
      createTrip,
      dispatchTrip,
      completeTrip,
      cancelTrip,
      maintenanceLogs,
      addMaintenanceLog,
      completeMaintenanceLog,
      fuelLogs,
      addFuelLogManual,
      expenses,
      addExpenseManual,
      activePage,
      setActivePage,
      accountLocked
    }}>
      {children}
    </AppContext.Provider>
  );
}
