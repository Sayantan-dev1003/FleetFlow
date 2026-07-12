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
      <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm h-fit text-left space-y-5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
          Log Service Record
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg animate-pulse">
              ⚠️ {formError}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Vehicle</label>
            <select 
              value={selectedVehicleReg}
              onChange={(e) => setSelectedVehicleReg(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
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
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Service Type</label>
            <input 
              type="text" 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 shadow-xs" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estimated Cost (INR)</label>
              <input 
                type="number" 
                value={cost} 
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 shadow-xs" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Service Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs" 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Initial Status</label>
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
            className={`w-full font-black py-3 rounded-lg text-xs uppercase tracking-widest transition shadow hover:scale-101 cursor-pointer ${
              !selectedVehicleReg 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm'
            }`}
          >
            Save Record
          </button>
        </form>

        {/* Business Logic Visual workflow */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-[10px] text-slate-500 space-y-2.5 font-bold uppercase">
          <p className="text-[9px] text-slate-400 tracking-wider">Status Flow Transitions</p>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-200/60">
            <span className="text-emerald-600">Available</span> 
            <span className="text-slate-400 text-[9px] lowercase">create record ➔</span> 
            <span className="text-amber-600">In Shop</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-200/60">
            <span className="text-amber-600">In Shop</span> 
            <span className="text-slate-400 text-[9px] lowercase">complete service ➔</span> 
            <span className="text-emerald-600">Available</span>
          </div>
          <p className="text-rose-600 italic mt-2 pl-1 normal-case leading-relaxed font-semibold">
            Note: Vehicles logged as In Shop are hidden from the dispatcher pool.
          </p>
        </div>
      </div>

      {/* Right Column: SERVICE LOG CARDS (8-cols width) */}
      <div className="lg:col-span-8 space-y-4 text-left">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">
          Operations Service Logs
        </h3>
        
        {maintenanceLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white font-bold text-sm shadow-xs animate-pulse">
            No service logs registered.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...maintenanceLogs].reverse().map((log, idx) => {
              const vehicleObj = vehicles.find(v => v.regNo === log.vehicleRegNo);
              const vehicleDisplayName = vehicleObj ? `${vehicleObj.name} (${log.vehicleRegNo})` : log.vehicleRegNo;
              
              const isActive = log.status === 'Active';
              
              return (
                <div 
                  key={idx} 
                  className={`p-5 bg-white border border-slate-200 border-l-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[180px] relative ${
                    isActive ? 'border-l-amber-500 bg-amber-50/5' : 'border-l-emerald-500 bg-emerald-50/5'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide truncate max-w-[200px]">{vehicleDisplayName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Date: {log.date}</p>
                      </div>
                      <StatusBadge status={isActive ? 'In Shop' : 'Completed'} />
                    </div>

                    {/* Middle: Service Type */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Service Type</span>
                        <span className="text-slate-800 text-xs font-black uppercase tracking-wide">{log.serviceType}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Cost</span>
                        <span className="text-slate-900 text-xs font-black">₹{Number(log.cost).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Complete */}
                  <div className="flex justify-end pt-3 border-t border-slate-100/60">
                    {isActive ? (
                      <button 
                        onClick={() => handleCompleteService(log.id)}
                        className="px-3 py-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition shadow-xs cursor-pointer"
                      >
                        Complete Service
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1">
                        <span>✓</span> Closed & Released
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}