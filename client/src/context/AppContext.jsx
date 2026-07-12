import React, { createContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { 
  apiFetch, 
  mapVehicleToUI, 
  mapDriverToUI, 
  mapTripToUI, 
  mapMaintenanceToUI, 
  mapFuelLogToUI, 
  mapExpenseToUI 
} from '../api/client';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fleet_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [accountLocked, setAccountLocked] = useState(false);

  // Helper to map DB roles to UI roles
  const mapRoleToUI = (dbRole) => {
    switch (dbRole) {
      case 'FLEET_MANAGER': return 'Fleet Manager';
      case 'DRIVER': return 'Driver';
      case 'SAFETY_OFFICER': return 'Safety Officer';
      case 'FINANCIAL_ANALYST': return 'Financial Analyst';
      default: return 'Driver';
    }
  };

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('fleet_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fleet_user');
      queryClient.clear();
    }
  }, [user, queryClient]);

  // Socket.io integration
  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:4000/ops', {
      transports: ['websocket'],
    });

    socket.on('vehicle:statusChanged', () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    });
    socket.on('driver:statusChanged', () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    });
    socket.on('trip:dispatched', () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    });
    socket.on('trip:completed', () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    });
    socket.on('trip:cancelled', () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    });

    return () => socket.disconnect();
  }, [user, queryClient]);

  // --- Auth Operations ---
  const login = async (email, password, _uiRole) => {
    if (accountLocked) return { success: false, error: 'Account locked due to 5 failed attempts.' };
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || data.error || 'Invalid credentials');
      
      const uiRole = mapRoleToUI(data.data.user.role.name);
      setUser({
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: uiRole,
        token: data.data.token
      });
      setLoginAttempts(0);
      return { success: true };
    } catch (err) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      if (nextAttempts >= 5) setAccountLocked(true);
      return { success: false, error: err.message };
    }
  };

  const logout = () => setUser(null);

  const registerUser = async (name, email, password, roleName) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, roleName })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Registration failed');
      }

      // Automatically log the user in after registration
      const uiRole = mapRoleToUI(data.data.user.role.name);
      setUser({
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: uiRole,
        token: data.data.token
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // --- Queries ---
  const { data: rawVehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => apiFetch('/vehicles'), enabled: !!user });
  const { data: rawDrivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => apiFetch('/drivers'), enabled: !!user });
  const { data: rawMaintenance = [] } = useQuery({ queryKey: ['maintenance'], queryFn: () => apiFetch('/maintenance'), enabled: !!user });
  const { data: rawFuel = [] } = useQuery({ queryKey: ['fuel-logs'], queryFn: () => apiFetch('/fuel-logs'), enabled: !!user });
  const { data: rawExpenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => apiFetch('/expenses'), enabled: !!user });
  const { data: rawSettings = null } = useQuery({ queryKey: ['settings'], queryFn: () => apiFetch('/settings'), enabled: !!user });
  const settings = rawSettings?.data || { depotName: "Gandhinagar Depot GJ14", currency: "INR (₹)", distanceUnit: "Kilometers (km)" };

  const vehicles = Array.isArray(rawVehicles) ? rawVehicles.map(mapVehicleToUI) : (rawVehicles?.vehicles || []).map(mapVehicleToUI);
  const drivers = Array.isArray(rawDrivers) ? rawDrivers.map(mapDriverToUI) : (rawDrivers?.drivers || []).map(mapDriverToUI);

  const { data: rawTrips = [] } = useQuery({ 
    queryKey: ['trips'], 
    queryFn: () => apiFetch('/trips'), 
    enabled: !!user && vehicles.length > 0 && drivers.length > 0 
  });

  const maintenanceLogs = Array.isArray(rawMaintenance) ? rawMaintenance.map(m => mapMaintenanceToUI(m, vehicles)) : (rawMaintenance?.logs || []).map(m => mapMaintenanceToUI(m, vehicles));
  const fuelLogs = Array.isArray(rawFuel) ? rawFuel.map(f => mapFuelLogToUI(f, vehicles)) : (rawFuel?.logs || []).map(f => mapFuelLogToUI(f, vehicles));
  const expenses = Array.isArray(rawExpenses) ? rawExpenses.map(e => mapExpenseToUI(e, vehicles)) : (rawExpenses?.expenses || []).map(e => mapExpenseToUI(e, vehicles));
  const trips = Array.isArray(rawTrips) ? rawTrips.map(t => mapTripToUI(t, vehicles, drivers)) : (rawTrips?.trips || []).map(t => mapTripToUI(t, vehicles, drivers));

  const getVehicleId = (regNo) => vehicles.find(v => v.regNo === regNo)?.id;
  const getDriverId = (licenseNo) => drivers.find(d => d.licenseNo === licenseNo)?.id;

  // --- Mutations ---
  const addVehicleMut = useMutation({ mutationFn: (vehicle) => apiFetch('/vehicles', { method: 'POST', body: JSON.stringify({ registrationNumber: vehicle.regNo, name: vehicle.name, type: vehicle.type, maxLoadCapacityKg: Number(vehicle.capacity), acquisitionCost: Number(vehicle.acqCost), odometerKm: Number(vehicle.odometer || 0), region: vehicle.region || 'Unknown' }) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }) });
  const addVehicle = async (v) => { try { await addVehicleMut.mutateAsync(v); return { success: true }; } catch(e) { return { success: false, error: e.message }; } };

  const updateVehicleMut = useMutation({ mutationFn: ({ id, payload, method }) => apiFetch(`/vehicles/${id}`, { method, body: payload ? JSON.stringify(payload) : undefined }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }) });
  const updateVehicle = async (regNo, updatedFields) => {
    const id = getVehicleId(regNo);
    if (!id) return { success: false, error: 'Vehicle not found' };
    try {
      if (updatedFields.status === 'Retired') await updateVehicleMut.mutateAsync({ id, method: 'DELETE' });
      else await updateVehicleMut.mutateAsync({ id, payload: {}, method: 'PUT' });
      return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
  };

  const deleteVehicleMut = useMutation({ mutationFn: (id) => apiFetch(`/vehicles/${id}`, { method: 'DELETE' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }) });
  const deleteVehicle = async (regNo) => {
    const id = getVehicleId(regNo);
    if (!id) return { success: true };
    try { await deleteVehicleMut.mutateAsync(id); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const addDriverMut = useMutation({ mutationFn: (driver) => apiFetch('/drivers', { method: 'POST', body: JSON.stringify({ name: driver.name, licenseNumber: driver.licenseNo, licenseCategory: driver.category || 'LMV', licenseExpiryDate: new Date(driver.expiry).toISOString(), contactNumber: driver.contact || 'N/A', safetyScore: Number(driver.safetyScore || 100) }) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }) });
  const addDriver = async (d) => { try { await addDriverMut.mutateAsync(d); return { success: true }; } catch(e) { return { success: false, error: e.message }; } };

  const updateDriverMut = useMutation({ mutationFn: ({ id, payload }) => apiFetch(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }) });
  const updateDriver = async (licenseNo, updatedFields) => {
    const id = getDriverId(licenseNo);
    if (!id) return { success: false, error: 'Driver not found' };
    try {
      const payload = {};
      if (updatedFields.status === 'Off Duty') payload.status = 'OFF_DUTY';
      else if (updatedFields.status === 'Available') payload.status = 'AVAILABLE';
      else if (updatedFields.status === 'Suspended') payload.status = 'SUSPENDED';
      if (updatedFields.safetyScore !== undefined) payload.safetyScore = Number(updatedFields.safetyScore);
      await updateDriverMut.mutateAsync({ id, payload });
      return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
  };

  const deleteDriverMut = useMutation({ mutationFn: (id) => apiFetch(`/drivers/${id}`, { method: 'DELETE' }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }) });
  const deleteDriver = async (licenseNo) => {
    const id = getDriverId(licenseNo);
    if (!id) return { success: true };
    try { await deleteDriverMut.mutateAsync(id); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const createTripMut = useMutation({ mutationFn: (payload) => apiFetch('/trips', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }) });
  const createTrip = async (tripData) => {
    const vId = getVehicleId(tripData.vehicleRegNo);
    const dId = getDriverId(tripData.driverLicenseNo);
    try {
      await createTripMut.mutateAsync({ source: tripData.source, destination: tripData.destination, vehicleId: vId, driverId: dId, cargoWeightKg: Number(tripData.cargoWeight || 0), plannedDistanceKm: Number(tripData.plannedDistance || 0) });
      return { success: true };
    } catch(e) { return { success: false, error: e.message }; }
  };

  const dispatchTripMut = useMutation({ mutationFn: (id) => apiFetch(`/trips/${id}/dispatch`, { method: 'POST' }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); queryClient.invalidateQueries({ queryKey: ['vehicles'] }); queryClient.invalidateQueries({ queryKey: ['drivers'] }); } });
  const dispatchTrip = async (tripId) => {
    const t = trips.find(tr => tr.id === tripId);
    if (!t) return { success: false, error: 'Trip not found' };
    try { await dispatchTripMut.mutateAsync(t.realId); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const completeTrip = async (tripId, finalOdometer, fuelConsumed, tollCost = 0, otherCost = 0) => {
    const t = trips.find(tr => tr.id === tripId);
    if (!t) return { success: false, error: 'Trip not found' };
    try {
      await apiFetch(`/trips/${t.realId}/complete`, { method: 'POST', body: JSON.stringify({ endOdometerKm: Number(finalOdometer), fuelConsumedLtr: Number(fuelConsumed) }) });
      const vId = getVehicleId(t.vehicleRegNo);
      if (Number(fuelConsumed) > 0) await apiFetch('/fuel-logs', { method: 'POST', body: JSON.stringify({ vehicleId: vId, tripId: t.realId, liters: Number(fuelConsumed), cost: Number(fuelConsumed) * 95 }) });
      if (Number(tollCost) > 0) await apiFetch('/expenses', { method: 'POST', body: JSON.stringify({ vehicleId: vId, tripId: t.realId, type: 'TOLL', amount: Number(tollCost) }) });
      if (Number(otherCost) > 0) await apiFetch('/expenses', { method: 'POST', body: JSON.stringify({ vehicleId: vId, tripId: t.realId, type: 'OTHER', amount: Number(otherCost) }) });
      
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const cancelTripMut = useMutation({ mutationFn: (id) => apiFetch(`/trips/${id}/cancel`, { method: 'POST' }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); queryClient.invalidateQueries({ queryKey: ['vehicles'] }); queryClient.invalidateQueries({ queryKey: ['drivers'] }); } });
  const cancelTrip = async (tripId) => {
    const t = trips.find(tr => tr.id === tripId);
    if (!t) return { success: false, error: 'Trip not found' };
    try { await cancelTripMut.mutateAsync(t.realId); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const addMaintenanceMut = useMutation({ mutationFn: (payload) => apiFetch('/maintenance', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); queryClient.invalidateQueries({ queryKey: ['vehicles'] }); } });
  const addMaintenanceLog = async (logData) => {
    const vId = getVehicleId(logData.vehicleRegNo);
    try { await addMaintenanceMut.mutateAsync({ vehicleId: vId, type: logData.serviceType, cost: Number(logData.cost) }); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const closeMaintenanceMut = useMutation({ mutationFn: (id) => apiFetch(`/maintenance/${id}/close`, { method: 'POST' }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); queryClient.invalidateQueries({ queryKey: ['vehicles'] }); } });
  const completeMaintenanceLog = async (logId) => {
    const m = maintenanceLogs.find(ml => ml.id === logId);
    if (!m) return { success: false, error: 'Log not found' };
    try { await closeMaintenanceMut.mutateAsync(m.realId); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const addFuelLogMut = useMutation({ mutationFn: (payload) => apiFetch('/fuel-logs', { method: 'POST', body: JSON.stringify(payload) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fuel-logs'] }) });
  const addFuelLogManual = async (data) => {
    const vId = getVehicleId(data.vehicleRegNo);
    try { await addFuelLogMut.mutateAsync({ vehicleId: vId, liters: Number(data.liters), cost: Number(data.cost) }); return { success: true }; } catch(e) { return { success: false, error: e.message }; }
  };

  const addExpenseManual = async (data) => {
    const vId = getVehicleId(data.vehicleRegNo);
    const tId = trips.find(t => t.id === data.tripId)?.realId;
    try {
      if (Number(data.toll) > 0) await apiFetch('/expenses', { method: 'POST', body: JSON.stringify({ vehicleId: vId, tripId: tId, type: 'TOLL', amount: Number(data.toll) }) });
      if (Number(data.other) > 0) await apiFetch('/expenses', { method: 'POST', body: JSON.stringify({ vehicleId: vId, tripId: tId, type: 'OTHER', amount: Number(data.other) }) });
      if (Number(data.maintenance) > 0) await apiFetch('/expenses', { method: 'POST', body: JSON.stringify({ vehicleId: vId, tripId: tId, type: 'MAINTENANCE', amount: Number(data.maintenance) }) });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
  };

  const updateSettingsMut = useMutation({
    mutationFn: (payload) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  const updateSettings = async (payload) => {
    try {
      await updateSettingsMut.mutateAsync(payload);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, registerUser,
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      drivers, addDriver, updateDriver, deleteDriver,
      trips, createTrip, dispatchTrip, completeTrip, cancelTrip,
      maintenanceLogs, addMaintenanceLog, completeMaintenanceLog,
      fuelLogs, addFuelLogManual,
      expenses, addExpenseManual,
      settings, updateSettings,
      accountLocked
    }}>
      {children}
    </AppContext.Provider>
  );
}
