import React from 'react';
import StatusBadge from '../components/StatusBadge';

export default function Fleet() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
      {/* Top Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <select className="border rounded px-3 py-1.5 bg-slate-50 outline-none"><option>Type: All</option></select>
          <select className="border rounded px-3 py-1.5 bg-slate-50 outline-none"><option>Status: All</option></select>
          <input type="text" placeholder="Search reg. no..." className="border rounded px-3 py-1.5 outline-none font-normal normal-case w-48 focus:ring-1 focus:ring-amber-500" />
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs tracking-wide uppercase transition shadow-sm">
          + Add Vehicle
        </button>
      </div>

      {/* Main Grid View */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Reg. No. (Unique)</th>
              <th className="px-4 py-3">Name/Model</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Odometer</th>
              <th className="px-4 py-3">Acq. Cost</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr><td className="px-4 py-3.5 text-slate-900 font-bold">GJ01AB452</td><td>VAN-05</td><td>Van</td><td>500 kg</td><td>74,000</td><td>6,20,000</td><td><StatusBadge status="Available"/></td></tr>
            <tr><td className="px-4 py-3.5 text-slate-900 font-bold">GJ01AB998</td><td>TRUCK-11</td><td>Truck</td><td>5 Ton</td><td>182,000</td><td>24,50,000</td><td><StatusBadge status="On Trip"/></td></tr>
            <tr><td className="px-4 py-3.5 text-slate-900 font-bold">GJ01AB112</td><td>MINI-03</td><td>Mini</td><td>1 Ton</td><td>66,000</td><td>4,10,000</td><td><StatusBadge status="In Shop"/></td></tr>
            <tr><td className="px-4 py-3.5 text-slate-900 font-bold">GJ01AB008</td><td>VAN-09</td><td>Van</td><td>750 kg</td><td>241,900</td><td>5,90,000</td><td><StatusBadge status="Retired"/></td></tr>
          </tbody>
        </table>
      </div>

      {/* Rule Notification Footnote */}
      <div className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg mt-4">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>
    </div>
  );
}