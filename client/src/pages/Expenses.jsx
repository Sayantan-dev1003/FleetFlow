import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Expenses() {
  const { 
    fuelLogs, 
    expenses, 
    addFuelLogManual, 
    addExpenseManual, 
    vehicles, 
    trips 
  } = useContext(AppContext);

  // Forms Visibility toggles
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Fuel Form state
  const [fuelVehicle, setFuelVehicle] = useState('');
  const [fuelLiters, setFuelLiters] = useState(30);
  const [fuelCost, setFuelCost] = useState(2850);
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);

  // Expense Form state
  const [expTrip, setExpTrip] = useState('N/A');
  const [expVehicle, setExpVehicle] = useState('');
  const [expToll, setExpToll] = useState(0);
  const [expOther, setExpOther] = useState(0);
  const [expMaint, setExpMaint] = useState(0);

  // Pre-fill selectors
  React.useEffect(() => {
    if (vehicles.length > 0) {
      if (!fuelVehicle) setFuelVehicle(vehicles[0].regNo);
      if (!expVehicle) setExpVehicle(vehicles[0].regNo);
    }
  }, [vehicles]);

  const handleLogFuel = (e) => {
    e.preventDefault();
    if (!fuelVehicle) return;

    addFuelLogManual({
      vehicleRegNo: fuelVehicle,
      date: fuelDate,
      liters: Number(fuelLiters),
      cost: Number(fuelCost)
    });

    setShowFuelForm(false);
    alert('Fuel log registered successfully!');
  };

  const handleLogExpense = (e) => {
    e.preventDefault();
    if (!expVehicle) return;

    addExpenseManual({
      tripId: expTrip,
      vehicleRegNo: expVehicle,
      toll: Number(expToll),
      other: Number(expOther),
      maintenance: Number(expMaint)
    });

    setShowExpenseForm(false);
    alert('Operational expense registered successfully!');
  };

  // Compute overall calculations dynamically
  const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + Number(curr.cost), 0);
  const totalExpensesCost = expenses.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
  const totalOperationalCost = totalFuelCost + totalExpensesCost;

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Top Flex Logs Header Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Fuel Logs Registry</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFuelForm(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition cursor-pointer"
            >
              + Log Fuel
            </button>
            <button 
              onClick={() => setShowExpenseForm(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition cursor-pointer"
            >
              + Log Toll / Expense
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Vehicle</th>
                <th className="px-4 py-2.5">Log Date</th>
                <th className="px-4 py-2.5">Fuel Volume</th>
                <th className="px-4 py-2.5">Fuel Cost (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {fuelLogs.map((log, idx) => {
                const v = vehicles.find(veh => veh.regNo === log.vehicleRegNo);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-950">
                      {v ? `${v.name} (${log.vehicleRegNo})` : log.vehicleRegNo}
                    </td>
                    <td className="px-4 py-2.5 font-normal text-slate-500">{log.date}</td>
                    <td className="px-4 py-2.5">{log.liters} L</td>
                    <td className="px-4 py-2.5">₹{Number(log.cost).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Other Operational Cost Matrix Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
          Other Operational Expenses (Tolls, Maintenance, & Misc)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Trip Link</th>
                <th className="px-4 py-2.5">Vehicle</th>
                <th className="px-4 py-2.5">Toll Charges</th>
                <th className="px-4 py-2.5">Maint Cost</th>
                <th className="px-4 py-2.5">Other Cost</th>
                <th className="px-4 py-2.5">Total Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {expenses.map((exp, idx) => {
                const v = vehicles.find(veh => veh.regNo === exp.vehicleRegNo);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-950">{exp.tripId || 'N/A'}</td>
                    <td className="px-4 py-2.5">
                      {v ? `${v.name} (${exp.vehicleRegNo})` : exp.vehicleRegNo}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-medium">₹{Number(exp.toll || 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-medium">₹{Number(exp.maintenance || 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-medium">₹{Number(exp.other || 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-950">₹{Number(exp.total || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic Computed Calculation Aggregate Footer Bar */}
        <div className="flex justify-between items-center border-t-2 border-slate-900 pt-3 mt-4 text-xs font-black uppercase">
          <span className="text-slate-500">Total Operational Cost (Fuel + Expenses + Maint) =</span>
          <span className="text-base font-black text-amber-600 tracking-wider">
            ₹{totalOperationalCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Manual Fuel Log Modal Dialog */}
      {showFuelForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Log Fuel Purchase
            </h3>
            
            <form onSubmit={handleLogFuel} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Vehicle</label>
                <select 
                  value={fuelVehicle}
                  onChange={(e) => setFuelVehicle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500"
                >
                  {vehicles.map((v, i) => (
                    <option key={i} value={v.regNo}>{v.name} ({v.regNo})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Volume (Liters)</label>
                  <input 
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Total Cost (₹)</label>
                  <input 
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Purchase Date</label>
                <input 
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  type="button"
                  onClick={() => setShowFuelForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-sm cursor-pointer"
                >
                  Save Fuel Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Operational Expense Modal Dialog */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Log Operations Expense
            </h3>
            
            <form onSubmit={handleLogExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Trip ID / Link</label>
                  <input 
                    type="text"
                    value={expTrip}
                    onChange={(e) => setExpTrip(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Select Vehicle</label>
                  <select 
                    value={expVehicle}
                    onChange={(e) => setExpVehicle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500"
                  >
                    {vehicles.map((v, i) => (
                      <option key={i} value={v.regNo}>{v.name} ({v.regNo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Toll Fee (₹)</label>
                  <input 
                    type="number"
                    value={expToll}
                    onChange={(e) => setExpToll(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Other Fee (₹)</label>
                  <input 
                    type="number"
                    value={expOther}
                    onChange={(e) => setExpOther(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Maint Fee (₹)</label>
                  <input 
                    type="number"
                    value={expMaint}
                    onChange={(e) => setExpMaint(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-600 shadow-sm cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}