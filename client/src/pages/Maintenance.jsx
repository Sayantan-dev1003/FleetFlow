import React, { useState, useContext } from 'react';
import StatusBadge from '../components/StatusBadge';
import { AppContext } from '../context/AppContext';

export default function Maintenance() {
  const { 
    maintenanceLogs, 
    addMaintenanceLog, 
    completeMaintenanceLog, 
    vehicles 
  } = useContext(AppContext);

  // Input fields state binding
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [serviceType, setServiceType] = useState('Oil Change');
  const [cost, setCost] = useState(2500);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  // Dropdown list: only show active vehicles that are not Retired
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  // Pre-fill default vehicle selection
  React.useEffect(() => {
    if (activeVehicles.length > 0 && !selectedVehicleReg) {
      setSelectedVehicleReg(activeVehicles[0].regNo);
    }
  }, [activeVehicles, selectedVehicleReg]);

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicleReg) {
      setFormError('Please select a valid active vehicle.');
      return;
    }

    const res = addMaintenanceLog({
      vehicleRegNo: selectedVehicleReg,
      serviceType,
      cost,
      date
    });

    if (res.success) {
      // reset form
      setServiceType('Oil Change');
      setCost(2500);
      setDate(new Date().toISOString().split('T')[0]);
      alert(`Service log added! Vehicle status changed to 'In Shop'.`);
    } else {
      setFormError(res.error);
    }
  };

  const handleCompleteService = (logId) => {
    const res = completeMaintenanceLog(logId);
    if (!res.success) {
      alert(`Error completing service: ${res.error}`);
    } else {
      alert('Maintenance completed! Vehicle has been restored to Available status.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      
      {/* Left Column: LOG SERVICE RECORD FORM (4-cols width) */}
      <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit text-left space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
          Log Service Record
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg">
              ⚠️ {formError}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Select Vehicle</label>
            <select 
              value={selectedVehicleReg}
              onChange={(e) => setSelectedVehicleReg(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500"
            >
              {activeVehicles.length === 0 ? (
                <option value="">No Active Vehicles Available</option>
              ) : (
                activeVehicles.map((v, i) => (
                  <option key={i} value={v.regNo}>{v.name} ({v.regNo}) [Current: {v.status}]</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Service Type</label>
            <input 
              type="text" 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Estimated Cost (INR)</label>
            <input 
              type="number" 
              value={cost} 
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Service Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Status</label>
            <input 
              type="text" 
              value="Active (In Shop)" 
              className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-100 border-slate-200 rounded-lg outline-none font-semibold text-slate-500" 
              disabled
            />
          </div>

          <button 
            type="submit" 
            disabled={!selectedVehicleReg}
            className={`w-full font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide transition shadow-sm cursor-pointer ${
              !selectedVehicleReg 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            Save Record
          </button>
        </form>

        {/* Business Logic Visualization matching Excalidraw footer diagram */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-500 space-y-2.5 font-semibold uppercase">
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
            <span className="text-emerald-600 font-bold">Available</span> 
            <span className="text-slate-400 text-[9px] lowercase">create service record ➔</span> 
            <span className="text-amber-600 font-bold">In Shop</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
            <span className="text-amber-600 font-bold">In Shop</span> 
            <span className="text-slate-400 text-[9px] lowercase">complete service ➔</span> 
            <span className="text-emerald-600 font-bold">Available</span>
          </div>
          <p className="text-rose-600 font-bold italic mt-2 pl-1 normal-case leading-relaxed">
            Note: Vehicles logged as In Shop are hidden from the dispatcher pool.
          </p>
        </div>
      </div>

      {/* Right Column: SERVICE LOG TABLE VIEW (8-cols width) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
          Operations Service Logs
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Cost (INR)</th>
                <th className="px-4 py-3">Service Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {[...maintenanceLogs].reverse().map((log, idx) => {
                const vehicleObj = vehicles.find(v => v.regNo === log.vehicleRegNo);
                const vehicleDisplayName = vehicleObj ? `${vehicleObj.name} (${log.vehicleRegNo})` : log.vehicleRegNo;
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-950">{vehicleDisplayName}</td>
                    <td className="px-4 py-3.5 text-slate-700">{log.serviceType}</td>
                    <td className="px-4 py-3.5 font-bold">₹{Number(log.cost).toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-slate-500 font-normal">{log.date}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={log.status === 'Active' ? 'In Shop' : 'Completed'} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {log.status === 'Active' ? (
                        <button 
                          onClick={() => handleCompleteService(log.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition shadow-sm cursor-pointer"
                        >
                          Complete Service
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No actions pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}