import React, { useContext, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { AppContext } from '../context/AppContext';

export default function Trips() {
  const { 
    trips, 
    createTrip, 
    dispatchTrip, 
    completeTrip, 
    cancelTrip, 
    vehicles, 
    drivers 
  } = useContext(AppContext);

  // Today's date string for license validation
  const todayStr = new Date().toISOString().split('T')[0];

  // New Trip form state
  const [source, setSource] = useState('Gandhinagar Depot');
  const [destination, setDestination] = useState('Ahmedabad Hub');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [selectedDriverLicense, setSelectedDriverLicense] = useState('');
  const [cargoWeight, setCargoWeight] = useState(450);
  const [plannedDistance, setPlannedDistance] = useState(38);
  const [revenue, setRevenue] = useState(15000);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Complete Trip modal state
  const [activeCompletingTrip, setActiveCompletingTrip] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState(0);
  const [fuelConsumed, setFuelConsumed] = useState(0);
  const [tollCost, setTollCost] = useState(120);
  const [otherCost, setOtherCost] = useState(0);
  const [completeError, setCompleteError] = useState('');

  // Filter lists for the dropdown selectors
  // Rules:
  // - Retired or In Shop vehicles must never appear in the dispatch selection.
  // - A vehicle already marked On Trip cannot be assigned.
  // E.g. Only "Available" status vehicles are allowed.
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  // Rules:
  // - Drivers with expired licenses or Suspended status cannot be assigned.
  // - A driver already marked On Trip cannot be assigned.
  // E.g. Only "Available" status drivers with non-expired licenses.
  const availableDrivers = drivers.filter(d => 
    d.status === 'Available' && d.expiry >= todayStr
  );

  // Selected vehicle properties for inline weight checks
  const selectedVehicleObj = vehicles.find(v => v.regNo === selectedVehicleReg);
  const vehicleMaxCapacity = selectedVehicleObj ? selectedVehicleObj.capacity : 0;
  const isWeightExceeded = selectedVehicleObj && cargoWeight > vehicleMaxCapacity;

  // Auto pre-fill default selection when selectors become populated
  React.useEffect(() => {
    if (availableVehicles.length > 0 && !selectedVehicleReg) {
      setSelectedVehicleReg(availableVehicles[0].regNo);
    }
  }, [availableVehicles, selectedVehicleReg]);

  React.useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriverLicense) {
      setSelectedDriverLicense(availableDrivers[0].licenseNo);
    }
  }, [availableDrivers, selectedDriverLicense]);

  // Handle auto-calculating mock revenue based on planned distance
  const handleDistanceChange = (val) => {
    setPlannedDistance(val);
    setRevenue(val * 120); // standard rate 120 INR/km
  };

  const handleCreateDraft = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!selectedVehicleReg || !selectedDriverLicense) {
      setFormError('Please select a valid Available vehicle and driver.');
      return;
    }

    const res = createTrip({
      source,
      destination,
      vehicleRegNo: selectedVehicleReg,
      driverLicenseNo: selectedDriverLicense,
      cargoWeight,
      plannedDistance,
      revenue
    });

    if (res.success) {
      setFormSuccess(`Draft Trip ${res.trip.id} created successfully! Dispatch it below.`);
      // Reset form options
      setSource('Gandhinagar Depot');
      setDestination('Ahmedabad Hub');
      setCargoWeight(450);
      setPlannedDistance(38);
      setRevenue(15000);
    }
  };

  const handleDispatchDirect = (tripId) => {
    setFormError('');
    setFormSuccess('');
    const res = dispatchTrip(tripId);
    if (!res.success) {
      alert(`Dispatch Error: ${res.error}`);
    }
  };

  const handleOpenCompleteModal = (trip) => {
    const v = vehicles.find(veh => veh.regNo === trip.vehicleRegNo);
    setActiveCompletingTrip(trip);
    setFinalOdometer(v ? v.odometer + trip.plannedDistance : 0);
    setFuelConsumed(Math.round(trip.plannedDistance / 8)); // ~8km per liter estimate
    setTollCost(120);
    setOtherCost(0);
    setCompleteError('');
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    setCompleteError('');

    const res = completeTrip(
      activeCompletingTrip.id,
      Number(finalOdometer),
      Number(fuelConsumed),
      Number(tollCost),
      Number(otherCost)
    );

    if (res.success) {
      setActiveCompletingTrip(null);
    } else {
      setCompleteError(res.error);
    }
  };

  const handleCancelTrip = (tripId) => {
    if (window.confirm(`Are you sure you want to cancel Trip ${tripId}?`)) {
      cancelTrip(tripId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      
      {/* Left Form Section (5 Columns) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit space-y-6">
        
        {/* Trip Lifecycle Visual Tracker */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Trip Lifecycle Statuses
          </p>
          <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400">
            <span className="text-purple-600 flex flex-col items-center gap-1">
              <span>🟣</span> <span>Draft</span>
            </span>
            <span className="w-full border-t border-dashed border-slate-200 mx-2 mb-3"></span>
            <span className="text-indigo-600 flex flex-col items-center gap-1">
              <span>🔵</span> <span>Dispatched</span>
            </span>
            <span className="w-full border-t border-dashed border-slate-200 mx-2 mb-3"></span>
            <span className="text-emerald-600 flex flex-col items-center gap-1">
              <span>🟢</span> <span>Completed</span>
            </span>
            <span className="w-full border-t border-dashed border-slate-200 mx-2 mb-3"></span>
            <span className="text-rose-600 flex flex-col items-center gap-1">
              <span>🔴</span> <span>Cancelled</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleCreateDraft} className="space-y-4 text-left">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            Create Trip Order
          </h3>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg">
              ⚠️ {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg">
              ✓ {formSuccess}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Source Depot</label>
              <input 
                type="text" 
                value={source} 
                onChange={(e) => setSource(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold text-slate-700" 
              />
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Destination Hub</label>
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold text-slate-700" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Vehicle (Available Only)</label>
              <select 
                value={selectedVehicleReg}
                onChange={(e) => setSelectedVehicleReg(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500"
              >
                {availableVehicles.length === 0 ? (
                  <option value="">No Available Vehicles</option>
                ) : (
                  availableVehicles.map((v, i) => (
                    <option key={i} value={v.regNo}>{v.name} ({v.regNo}) - cap: {v.capacity}kg</option>
                  ))
                )}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Driver (Available Only)</label>
              <select 
                value={selectedDriverLicense}
                onChange={(e) => setSelectedDriverLicense(e.target.value)}
                className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500"
              >
                {availableDrivers.length === 0 ? (
                  <option value="">No Available Drivers</option>
                ) : (
                  availableDrivers.map((d, i) => (
                    <option key={i} value={d.licenseNo}>{d.name} ({d.category})</option>
                  ))
                )}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Weight (KG)</label>
              <input 
                type="number" 
                value={cargoWeight} 
                onChange={(e) => setCargoWeight(Number(e.target.value))} 
                className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
              />
            </div>
            
            <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Distance (KM)</label>
              <input 
                type="number" 
                value={plannedDistance} 
                onChange={(e) => handleDistanceChange(Number(e.target.value))} 
                className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
              />
            </div>

            <div className="col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Revenue (₹)</label>
              <input 
                type="number" 
                value={revenue} 
                onChange={(e) => setRevenue(Number(e.target.value))} 
                className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
              />
            </div>
          </div>

          {/* Validation Error Alert Box */}
          {isWeightExceeded && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[10px] space-y-0.5">
              <p className="font-bold">Vehicle Capacity: {vehicleMaxCapacity} kg</p>
              <p className="font-bold">Cargo Weight: {cargoWeight} kg</p>
              <p className="font-black text-rose-600 mt-1">
                ❌ Capacity exceeded by {cargoWeight - vehicleMaxCapacity} kg — dispatch blocked!
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button 
              type="submit"
              disabled={isWeightExceeded || !selectedVehicleReg || !selectedDriverLicense} 
              className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer ${
                isWeightExceeded || !selectedVehicleReg || !selectedDriverLicense
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-600'
              }`}
            >
              Create Draft
            </button>
          </div>
        </form>
      </div>

      {/* Right Live Board Section (7 Columns) */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">
          Active Live Operations Board
        </h3>
        
        {trips.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white font-semibold text-xs">
            No trips registered in the log system.
          </div>
        ) : (
          <div className="space-y-3">
            {[...trips].reverse().map((t, idx) => {
              const v = vehicles.find(veh => veh.regNo === t.vehicleRegNo);
              const d = drivers.find(drv => drv.licenseNo === t.driverLicenseNo);
              
              return (
                <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between gap-4 text-left">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-950">{t.id}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 mt-2">
                        {t.source} ➔ {t.destination}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        Cargo: {t.cargoWeight} kg • Distance: {t.plannedDistance} km • Revenue: ₹{t.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-500 block tracking-wider uppercase">
                        {v ? `${v.name} (${t.vehicleRegNo})` : 'Vehicle Unassigned'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                        Driver: {d ? d.name : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Actions depending on trip status */}
                  {(t.status === 'Draft' || t.status === 'Dispatched') && (
                    <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                      {t.status === 'Draft' && (
                        <>
                          <button 
                            onClick={() => handleDispatchDirect(t.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Dispatch Trip
                          </button>
                          <button 
                            onClick={() => handleCancelTrip(t.id)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Cancel Draft
                          </button>
                        </>
                      )}
                      {t.status === 'Dispatched' && (
                        <>
                          <button 
                            onClick={() => handleOpenCompleteModal(t)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Complete Trip
                          </button>
                          <button 
                            onClick={() => handleCancelTrip(t.id)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Cancel Trip
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-slate-400 font-bold italic pl-1 pt-2">
          On Complete: odometer updates ➔ fuel log logged ➔ operational expense created ➔ Vehicle & Driver return to Available.
        </p>
      </div>

      {/* Complete Trip Pop-up Modal Form */}
      {activeCompletingTrip && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm shadow-2xl text-left">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
              Complete Trip {activeCompletingTrip.id}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">
              Enter final logistics data to release vehicle & driver.
            </p>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              {completeError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg">
                  ⚠️ {completeError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Final Odometer (km)</label>
                <input 
                  type="number" 
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[9px] text-slate-400 block mt-1 font-semibold">
                  Start odometer: {vehicles.find(ve => ve.regNo === activeCompletingTrip.vehicleRegNo)?.odometer} km
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fuel Consumed (Liters)</label>
                <input 
                  type="number" 
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Toll Fee (₹)</label>
                  <input 
                    type="number" 
                    value={tollCost}
                    onChange={(e) => setTollCost(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Misc Expense (₹)</label>
                  <input 
                    type="number" 
                    value={otherCost}
                    onChange={(e) => setOtherCost(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  type="button"
                  onClick={() => setActiveCompletingTrip(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-sm cursor-pointer"
                >
                  Log Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}