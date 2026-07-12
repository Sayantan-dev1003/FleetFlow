import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';

export default function Maintenance() {
  // Input fields state binding
  const [vehicle, setVehicle] = useState('VAN-05');
  const [serviceType, setServiceType] = useState('Oil Change');
  const [cost, setCost] = useState(2500);
  const [date, setDate] = useState('07/07/2026');
  const [status, setStatus] = useState('Active');

  // Hardcoded mock data aligning exactly with Mockup 5[cite: 1]
  const initialLogs = [
    { vehicle: "VAN-05", service: "Oil Change", cost: "2,500", status: "In Shop" },
    { vehicle: "TRUCK-11", service: "Engine Repair", cost: "18,000", status: "Completed" },
    { vehicle: "MINI-03", service: "Tyre Replace", cost: "6,200", status: "In Shop" }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    // Tumhara dost yahan backend API integrate karega:
    // POST /api/maintenance -> triggers vehicle status update to 'In Shop'[cite: 1]
    alert(`Logging maintenance for ${vehicle}. Vehicle status will switch to 'In Shop'[cite: 1]`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      
      {/* Left Column: LOG SERVICE RECORD FORM (4-cols width)[cite: 1] */}
      <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
          Log Service Record
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vehicle</label>
            <input 
              type="text" 
              value={vehicle} 
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Service Type</label>
            <input 
              type="text" 
              value={serviceType} 
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cost</label>
            <input 
              type="number" 
              value={cost} 
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date</label>
            <input 
              type="text" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
            <input 
              type="text" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold text-slate-500" 
              disabled
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide transition shadow-sm"
          >
            Save
          </button>
        </form>

        {/* Business Logic Visualization matching Excalidraw footer diagram[cite: 1] */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 space-y-2.5 font-medium">
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
            <span className="text-emerald-600 font-bold">Available</span> 
            <span className="text-slate-400 text-[10px]">creating active record ➔</span> 
            <span className="text-amber-600 font-bold">In Shop</span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
            <span className="text-amber-600 font-bold">In Shop</span> 
            <span className="text-slate-400 text-[10px]">closing record (not retired) ➔</span> 
            <span className="text-emerald-600 font-bold">Available</span>
          </div>
          <p className="text-rose-600 text-[10px] font-bold italic mt-2 pl-1">
            Note: In Shop vehicles are removed from the dispatch pool.[cite: 1]
          </p>
        </div>
      </div>

      {/* Right Column: SERVICE LOG TABLE VIEW (8-cols width)[cite: 1] */}
      <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
          Service Log
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {initialLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{log.vehicle}</td>
                  <td className="px-4 py-3.5 text-slate-700">{log.service}</td>
                  <td className="px-4 py-3.5 text-slate-900 font-semibold">{log.cost}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}