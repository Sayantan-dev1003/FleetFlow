import React, { useContext, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { AppContext } from '../context/AppContext';

export default function Dashboard() {
  const { vehicles, drivers, trips } = useContext(AppContext);

  // States for filter dropdowns
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Gather unique options from data for filters
  const vehicleTypes = ['All', ...new Set(vehicles.map(v => v.type))];
  const vehicleStatuses = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
  const vehicleRegions = ['All', ...new Set(vehicles.map(v => v.region).filter(Boolean))];

  // Filter vehicles based on selections
  const filteredVehicles = vehicles.filter(v => {
    const matchType = selectedType === 'All' || v.type === selectedType;
    const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
    const matchRegion = selectedRegion === 'All' || v.region === selectedRegion;
    return matchType && matchStatus && matchRegion;
  });

  // KPI Calculations based on filtered vehicles
  const activeVehiclesCount = filteredVehicles.filter(v => v.status !== 'Retired').length;
  const availableVehiclesCount = filteredVehicles.filter(v => v.status === 'Available').length;
  const inShopCount = filteredVehicles.filter(v => v.status === 'In Shop').length;
  const onTripVehiclesCount = filteredVehicles.filter(v => v.status === 'On Trip').length;

  // Filter trips based on the vehicle filters (so dashboard is fully consistent)
  const filteredTrips = trips.filter(t => {
    if (!t.vehicleRegNo) return selectedType === 'All' && selectedStatus === 'All' && selectedRegion === 'All';
    const v = vehicles.find(veh => veh.regNo === t.vehicleRegNo);
    if (!v) return false;
    const matchType = selectedType === 'All' || v.type === selectedType;
    const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
    const matchRegion = selectedRegion === 'All' || v.region === selectedRegion;
    return matchType && matchStatus && matchRegion;
  });

  const activeTripsCount = filteredTrips.filter(t => t.status === 'Dispatched').length;
  const pendingTripsCount = filteredTrips.filter(t => t.status === 'Draft').length;

  // Drivers calculation (filtered if needed, but general state shows drivers on duty)
  // Drivers are "on duty" if they are Available or On Trip
  const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;

  // Fleet utilization percentage
  const fleetUtilization = activeVehiclesCount > 0 
    ? Math.round((onTripVehiclesCount / activeVehiclesCount) * 100) 
    : 0;

  const kpis = [
    { title: "Active Vehicles", value: activeVehiclesCount, color: "border-blue-500" },
    { title: "Available Vehicles", value: availableVehiclesCount, color: "border-emerald-500" },
    { title: "Vehicles In Maint.", value: inShopCount, color: "border-amber-500" },
    { title: "Active Trips", value: activeTripsCount, color: "border-indigo-500" },
    { title: "Pending Trips", value: pendingTripsCount, color: "border-purple-500" },
    { title: "Drivers On Duty", value: driversOnDuty, color: "border-sky-500" },
    { title: "Fleet Utilization", value: `${fleetUtilization}%`, color: "border-teal-500" },
  ];

  // Recent trips table list
  const recentTrips = [...filteredTrips]
    .reverse() // show newest first
    .slice(0, 5);

  // Status Distribution Calculation
  const totalVehiclesCount = filteredVehicles.length;
  const getStatusPct = (statusName) => {
    if (totalVehiclesCount === 0) return 0;
    const count = filteredVehicles.filter(v => v.status === statusName).length;
    return Math.round((count / totalVehiclesCount) * 100);
  };

  const statuses = [
    { name: 'Available', pct: getStatusPct('Available'), bg: 'bg-emerald-500' },
    { name: 'On Trip', pct: getStatusPct('On Trip'), bg: 'bg-blue-500' },
    { name: 'In Shop', pct: getStatusPct('In Shop'), bg: 'bg-amber-500' },
    { name: 'Retired', pct: getStatusPct('Retired'), bg: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-6 text-xs font-bold text-slate-500 uppercase tracking-wider shadow-sm">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-slate-400">Vehicle Type</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer focus:ring-1 focus:ring-amber-500"
          >
            {vehicleTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-slate-400">Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer focus:ring-1 focus:ring-amber-500"
          >
            {vehicleStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-slate-400">Region</label>
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="border border-slate-200 rounded px-3 py-1.5 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer focus:ring-1 focus:ring-amber-500"
          >
            {vehicleRegions.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
        </div>
        
        {/* Reset Filters Option */}
        {(selectedType !== 'All' || selectedStatus !== 'All' || selectedRegion !== 'All') && (
          <button 
            onClick={() => { setSelectedType('All'); setSelectedStatus('All'); setSelectedRegion('All'); }}
            className="self-end px-4 py-2 border border-dashed border-rose-300 text-rose-600 rounded bg-rose-50/50 hover:bg-rose-50 transition cursor-pointer text-[10px] uppercase font-bold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 7 KPI Box Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`bg-white p-4 rounded-xl border-l-4 border border-slate-200 shadow-sm ${kpi.color} hover:shadow-md transition-all`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{kpi.title}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Trips Ledger */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Recent Trips Ledger</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Showing last {recentTrips.length} matches</span>
          </div>
          {recentTrips.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs border-2 border-dashed border-slate-100 rounded-lg">
              No recent trips matching current filter settings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-black uppercase">
                    <th className="py-2.5">Trip</th>
                    <th className="py-2.5">Vehicle</th>
                    <th className="py-2.5">Driver</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">ETA/Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {recentTrips.map((t, idx) => {
                    const vehicleName = vehicles.find(v => v.regNo === t.vehicleRegNo)?.name || "—";
                    const driverName = drivers.find(d => d.licenseNo === t.driverLicenseNo)?.name || "—";
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-950">{t.id}</td>
                        <td className="py-3">{t.vehicleRegNo ? `${vehicleName} (${t.vehicleRegNo})` : "—"}</td>
                        <td className="py-3">{driverName}</td>
                        <td className="py-3">
                          <StatusBadge status={t.status}/>
                        </td>
                        <td className="py-3 text-slate-500 font-medium">
                          {t.status === 'Dispatched' ? `${Math.round(t.plannedDistance * 1.2)} min (En Route)` : 
                           t.status === 'Completed' ? `Finished (Cons. ${t.fuelConsumed}L)` : 
                           t.status === 'Draft' ? 'Awaiting Dispatch' : 'Cancelled'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vehicle Status Distributions */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">Vehicle Status Distribution</h3>
            <div className="space-y-4 text-xs font-bold text-slate-600">
              {statuses.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-slate-950 font-black">{s.pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/40">
                    <div 
                      className={`${s.bg} h-2.5 rounded-full transition-all duration-500`} 
                      style={{ width: `${s.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold text-center italic">
            Total accounted fleet size: {totalVehiclesCount} vehicles
          </div>
        </div>
      </div>
    </div>
  );
}