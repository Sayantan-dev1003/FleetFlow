import React from 'react';
import StatusBadge from '../components/StatusBadge';

export default function Drivers() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Management</h3>
        <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs uppercase transition shadow-sm">+ Add Driver</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">License No</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Expiry</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Trip Compl.</th>
              <th className="px-4 py-3">Safety</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr><td className="px-4 py-3.5 font-bold text-slate-900">Alex</td><td>DL-88213</td><td>LMV</td><td>12/2028</td><td>98765xxxx</td><td>96%</td><td><StatusBadge status="Available"/></td><td><StatusBadge status="Available"/></td></tr>
            <tr className="bg-red-50/40 text-rose-900">
              <td className="px-4 py-3.5 font-bold text-slate-900">John</td><td>DL-44120</td><td>HMV</td>
              <td className="px-4 py-3.5 font-bold text-rose-600 animate-pulse">03/2025 EXPIRI</td>
              <td>98220xxxx</td><td>81%</td><td><StatusBadge status="Suspended"/></td><td><StatusBadge status="Suspended"/></td>
            </tr>
            <tr><td className="px-4 py-3.5 font-bold text-slate-900">Priya</td><td>DL-77031</td><td>LMV</td><td>08/2029</td><td>99110xxxx</td><td>99%</td><td><StatusBadge status="On Trip"/></td><td><StatusBadge status="On Trip"/></td></tr>
            <tr><td className="px-4 py-3.5 font-bold text-slate-900">Suresh</td><td>DL-90045</td><td>HMV</td><td>01/2027</td><td>97440xxxx</td><td>88%</td><td><StatusBadge status="Available"/></td><td><StatusBadge status="Off Duty"/></td></tr>
          </tbody>
        </table>
      </div>

      {/* Helper Toggle Switch Grid Mock */}
      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toggle Status Filters</span>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 text-white cursor-pointer">Available</span>
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-blue-600 text-white cursor-pointer">On Trip</span>
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-slate-500 text-white cursor-pointer">Off Duty</span>
          <span className="px-2.5 py-1 text-xs font-bold rounded bg-rose-600 text-white cursor-pointer">Suspended</span>
        </div>
        <p className="text-[11px] text-rose-700 font-medium mt-1">Rule: Expired license or Suspended status → blocked from trip assignment</p>
      </div>
    </div>
  );
}