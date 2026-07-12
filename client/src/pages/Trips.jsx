import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';

export default function Trips() {
  const [cargoWeight, setCargoWeight] = useState(700);
  const maxCapacity = 500; // Mock vehicle capacity rule validation[cite: 1]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left Form Section (5 Columns)[cite: 1] */}
      <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        {/* Trip Lifecycle Visual Tracker[cite: 1] */}
        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
            Trip Lifecycle
          </p>
          <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400">
            <span className="text-emerald-600 flex flex-col items-center gap-1">
              <span>🟢</span> <span>Draft</span>
            </span>
            <span className="w-full border-t border-dashed border-slate-200 mx-2 mb-4"></span>
            <span className="text-blue-600 flex flex-col items-center gap-1">
              <span>🔵</span> <span>Dispatched</span>
            </span>
            <span className="w-full border-t border-dashed border-slate-200 mx-2 mb-4"></span>
            <span className="flex flex-col items-center gap-1">
              <span>⚪</span> <span>Completed</span>
            </span>
            <span className="w-full border-t border-dashed border-slate-200 mx-2 mb-4"></span>
            <span className="flex flex-col items-center gap-1">
              <span>⚪</span> <span>Cancelled</span>
            </span>
          </div>
        </div>

        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
          Create Trip[cite: 1]
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Source</label>
            <input type="text" defaultValue="Gandhinagar Depot" className="w-full mt-1 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold text-slate-700" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destination</label>
            <input type="text" defaultValue="Ahmedabad Hub" className="w-full mt-1 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold text-slate-700" />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vehicle (Available Only)[cite: 1]</label>
            <select className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500">
              <option>VAN-05 - 500 kg capacity</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Driver (Available Only)[cite: 1]</label>
            <select className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500">
              <option>Alex</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cargo Weight (KG)[cite: 1]</label>
            <input 
              type="number" 
              value={cargoWeight} 
              onChange={(e) => setCargoWeight(Number(e.target.value))} 
              className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500" 
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Planned Distance (KM)[cite: 1]</label>
            <input type="number" defaultValue={38} className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700" />
          </div>

          {/* Validation Error Alert Box[cite: 1] */}
          {cargoWeight > maxCapacity && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] space-y-1">
              <p className="font-semibold">Vehicle Capacity: {maxCapacity} kg[cite: 1]</p>
              <p className="font-semibold">Cargo Weight: {cargoWeight} kg[cite: 1]</p>
              <p className="font-bold text-rose-600 mt-1">
                ❌ Capacity exceeded by {cargoWeight - maxCapacity} kg — dispatch blocked[cite: 1]
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button 
              disabled={cargoWeight > maxCapacity} 
              className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition shadow-sm ${
                cargoWeight > maxCapacity 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-600'
              }`}
            >
              Dispatch[cite: 1]
            </button>
            <button type="button" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide border border-slate-200 transition">
              Cancel[cite: 1]
            </button>
          </div>
        </div>
      </div>

      {/* Right Live Board Section (7 Columns)[cite: 1] */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">
          Live Board[cite: 1]
        </h3>
        
        {/* Card 1: Dispatched[cite: 1] */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-xs font-black text-slate-900">TR001</span>[cite: 1]
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Gandhinagar Depot ➔ Ahmedabad Hub[cite: 1]
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 block tracking-wider">VAN-05 / ALEX</span>[cite: 1]
              <span className="text-[11px] font-bold text-slate-500 block mt-1">45 min</span>[cite: 1]
            </div>
          </div>
          <div className="w-fit">
            <StatusBadge status="Dispatched" />[cite: 1]
          </div>
        </div>

        {/* Card 2: Draft[cite: 1] */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-xs font-black text-slate-900">TR004</span>[cite: 1]
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Vatva Industrial Area ➔ Sanand Warehouse[cite: 1]
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 block tracking-wider">TRUCK-04 / SURESH</span>[cite: 1]
              <span className="text-[11px] font-bold text-slate-500 block mt-1">Awaiting driver</span>[cite: 1]
            </div>
          </div>
          <div className="w-fit">
            <StatusBadge status="Draft" />[cite: 1]
          </div>
        </div>

        {/* Card 3: Cancelled[cite: 1] */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between gap-4 hover:border-slate-300 transition-all bg-slate-50/40">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-xs font-black text-slate-900">TR006</span>[cite: 1]
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Mansa ➔ Kalol Depot[cite: 1]
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 block tracking-wider">Unassigned</span>[cite: 1]
              <span className="text-[11px] font-medium text-rose-500 block mt-1 italic">Vehicle went to shop</span>[cite: 1]
            </div>
          </div>
          <div className="w-fit">
            <StatusBadge status="Cancelled" />[cite: 1]
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-semibold italic pl-1 pt-2">
          On Complete: odometer ➔ fuel log ➔ expenses ➔ Vehicle & Driver Available[cite: 1]
        </p>
      </div>
    </div>
  );
}