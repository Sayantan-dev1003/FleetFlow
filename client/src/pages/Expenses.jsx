import React from 'react';
import StatusBadge from '../components/StatusBadge';

export default function Expenses() {
  return (
    <div className="space-y-6">
      {/* Top Flex Logs Header Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuel Logs</h3>
          <div className="flex gap-2">
            <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition">+ Log Fuel</button>
            <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs uppercase transition">+ Add Expense</button>
          </div>
        </div>
        
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
            <tr><th className="px-4 py-2">Vehicle</th><th className="px-4 py-2">Date</th><th className="px-4 py-2">Liters</th><th className="px-4 py-2">Fuel Cost</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr><td className="px-4 py-2.5 font-bold text-slate-900">VAN-05</td><td>05 Jul 2026</td><td>42 L</td><td>3,150</td></tr>
            <tr><td className="px-4 py-2.5 font-bold text-slate-900">TRUCK-11</td><td>06 Jul 2026</td><td>110 L</td><td>8,400</td></tr>
            <tr><td className="px-4 py-2.5 font-bold text-slate-900">MINI-08</td><td>06 Jul 2026</td><td>28 L</td><td>2,050</td></tr>
          </tbody>
        </table>
      </div>

      {/* Bottom Other Operational Cost Matrix Block */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Other Expenses (Toll / Misc)</h3>
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
            <tr>
              <th className="px-4 py-2">Trip</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">Toll</th>
              <th className="px-4 py-2">Other</th>
              <th className="px-4 py-2">Maint. (Linked)</th>
              <th className="px-4 py-2">Total Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr><td className="px-4 py-2.5 font-bold text-slate-900">TR001</td><td>VAN-05</td><td>120</td><td>0</td><td>0</td><td><StatusBadge status="Available"/></td></tr>
            <tr><td className="px-4 py-2.5 font-bold text-slate-900">TR002</td><td>TRK-12</td><td>340</td><td>150</td><td>18,000</td><td><StatusBadge status="Completed"/></td></tr>
          </tbody>
        </table>

        {/* Dynamic Computed Calculation Aggregate Footer Bar */}
        <div className="flex justify-between items-center border-t-2 border-slate-900 pt-3 mt-4 text-xs font-bold uppercase">
          <span className="text-slate-500">Total Operational Cost (Auto) = Fuel + Maint</span>
          <span className="text-sm font-black text-amber-600 tracking-wider">34,070</span>
        </div>
      </div>
    </div>
  );
}