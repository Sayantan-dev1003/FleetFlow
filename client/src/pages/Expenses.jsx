import React, { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { AppContext } from '../context/AppContext';

export default function Expenses() {
  const { 
    fuelLogs, 
    expenses, 
    addFuelLogManual, 
    addExpenseManual, 
    vehicles 
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
  }, [vehicles, fuelVehicle, expVehicle]);

  const handleLogFuel = (e) => {
    e.preventDefault();
    if (!fuelVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    addFuelLogManual({
      vehicleRegNo: fuelVehicle,
      date: fuelDate,
      liters: Number(fuelLiters),
      cost: Number(fuelCost)
    });

    setShowFuelForm(false);
    toast.success('Fuel log registered successfully!');
  };

  const handleLogExpense = (e) => {
    e.preventDefault();
    if (!expVehicle) {
      toast.error('Please select a vehicle');
      return;
    }

    addExpenseManual({
      tripId: expTrip,
      vehicleRegNo: expVehicle,
      toll: Number(expToll),
      other: Number(expOther),
      maintenance: Number(expMaint)
    });

    setShowExpenseForm(false);
    toast.success('Operational expense registered successfully!');
  };

  // Compute calculations
  const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + Number(curr.cost), 0);
  const totalExpensesCost = expenses.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
  const totalOperationalCost = totalFuelCost + totalExpensesCost;

  return (
    <div className="space-y-6 text-left relative animate-fadeIn">
      
      {/* Top 3 KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI: Fuel */}
        <div className="p-5 rounded-xl border border-slate-200/80 shadow-sm bg-gradient-to-br from-amber-50/40 to-white border-l-4 border-l-amber-500 flex flex-col justify-between h-[110px] hover:scale-[1.02] transition-transform">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aggregate Fuel purchases</span>
          <div>
            <span className="text-2xl font-black text-slate-900">₹{totalFuelCost.toLocaleString()}</span>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Logged fuel count: {fuelLogs.length} receipts</p>
          </div>
        </div>

        {/* KPI: Tolls & Misc */}
        <div className="p-5 rounded-xl border border-slate-200/80 shadow-sm bg-gradient-to-br from-blue-50/40 to-white border-l-4 border-l-blue-500 flex flex-col justify-between h-[110px] hover:scale-[1.02] transition-transform">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tolls & operational fees</span>
          <div>
            <span className="text-2xl font-black text-slate-900">₹{totalExpensesCost.toLocaleString()}</span>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">Maintenance & toll ledgers: {expenses.length} logs</p>
          </div>
        </div>

        {/* KPI: Total Aggregate */}
        <div className="p-5 rounded-xl border border-slate-900 shadow-sm bg-gradient-to-br from-slate-900 to-slate-950 text-white border-l-4 border-l-orange-500 flex flex-col justify-between h-[110px] hover:scale-[1.02] transition-transform">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total fleet operational cost</span>
          <div>
            <span className="text-2xl font-black text-amber-400">₹{totalOperationalCost.toLocaleString()}</span>
            <p className="text-[9px] text-slate-500 font-semibold mt-1">Sum of fuel logs, tolls, and maintenance fees</p>
          </div>
        </div>

      </div>

      {/* Control Actions Section */}
      <div className="flex gap-3 justify-end">
        <button 
          onClick={() => setShowFuelForm(true)}
          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition cursor-pointer shadow hover:scale-102"
        >
          + Log Fuel
        </button>
        <button 
          onClick={() => setShowExpenseForm(true)}
          className="bg-slate-900 hover:bg-slate-950 text-slate-100 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition cursor-pointer shadow border border-slate-800 hover:scale-102"
        >
          + Log Toll / Expense
        </button>
      </div>

      {/* Two Columns List Tables Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Fuel Logs Registry (6 Columns) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
            Fuel Ledger Logs
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Vehicle</th>
                  <th className="px-3 py-2.5">Purchase Date</th>
                  <th className="px-3 py-2.5">Volume</th>
                  <th className="px-3 py-2.5">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 font-bold">No fuel logs registered.</td>
                  </tr>
                ) : (
                  [...fuelLogs].reverse().map((log, idx) => {
                    const v = vehicles.find(veh => veh.regNo === log.vehicleRegNo);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-bold text-slate-950">
                          {v ? `${v.name} (${log.vehicleRegNo})` : log.vehicleRegNo}
                        </td>
                        <td className="px-3 py-2.5 font-normal text-slate-500">{log.date}</td>
                        <td className="px-3 py-2.5">{log.liters} L</td>
                        <td className="px-3 py-2.5">₹{Number(log.cost).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Other Operational Expenses (6 Columns) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
            Other Expenses (Tolls & Misc)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Trip Link</th>
                  <th className="px-3 py-2.5">Vehicle</th>
                  <th className="px-3 py-2.5">Breakdown (Toll/Maint/Other)</th>
                  <th className="px-3 py-2.5">Total Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 font-bold">No expenses registered.</td>
                  </tr>
                ) : (
                  [...expenses].reverse().map((exp, idx) => {
                    const v = vehicles.find(veh => veh.regNo === exp.vehicleRegNo);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-bold text-slate-950">{exp.tripId || 'N/A'}</td>
                        <td className="px-3 py-2.5">
                          {v ? `${v.name} (${exp.vehicleRegNo})` : exp.vehicleRegNo}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 font-medium">
                          ₹{Number(exp.toll || 0)} / ₹{Number(exp.maintenance || 0)} / ₹{Number(exp.other || 0)}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-950">₹{Number(exp.total || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Manual Fuel Log Modal Dialog */}
      {showFuelForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 text-left">
              Log Fuel Purchase
            </h3>
            
            <form onSubmit={handleLogFuel} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Vehicle</label>
                <select 
                  value={fuelVehicle}
                  onChange={(e) => setFuelVehicle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
                >
                  {vehicles.map((v, i) => (
                    <option key={i} value={v.regNo}>{v.name} ({v.regNo})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Volume (Liters)</label>
                  <input 
                    type="number"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Cost (₹)</label>
                  <input 
                    type="number"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Purchase Date</label>
                <input 
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 text-left">
              Log Operations Expense
            </h3>
            
            <form onSubmit={handleLogExpense} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Trip ID / Link</label>
                  <input 
                    type="text"
                    value={expTrip}
                    onChange={(e) => setExpTrip(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Vehicle</label>
                  <select 
                    value={expVehicle}
                    onChange={(e) => setExpVehicle(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-xs"
                  >
                    {vehicles.map((v, i) => (
                      <option key={i} value={v.regNo}>{v.name} ({v.regNo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Toll (₹)</label>
                  <input 
                    type="number"
                    value={expToll}
                    onChange={(e) => setExpToll(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Other (₹)</label>
                  <input 
                    type="number"
                    value={expOther}
                    onChange={(e) => setExpOther(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Maint (₹)</label>
                  <input 
                    type="number"
                    value={expMaint}
                    onChange={(e) => setExpMaint(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 shadow-xs"
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