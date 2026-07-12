import React from 'react';

export default function Settings() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* General Settings Area Form Parameters */}
      <div className="lg:col-span-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">General</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Depot Name</label>
            <input type="text" defaultValue="Gandhinagar Depot GJ14" className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 rounded-lg outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Currency</label>
            <input type="text" defaultValue="INR (Rs)" className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 rounded-lg outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Distance Unit</label>
            <input type="text" defaultValue="Kilometers" className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 rounded-lg outline-none" />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs mt-2 transition">Save changes</button>
      </div>

      {/* Role-Based Access Controls Matrix Mapping */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Role-Based Access (RBAC)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left text-slate-500">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase">
              <tr>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Fleet</th>
                <th className="px-3 py-2">Drivers</th>
                <th className="px-3 py-2">Trips</th>
                <th className="px-3 py-2">Fuel/Exp.</th>
                <th className="px-3 py-2">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-center">
              <tr><td className="px-3 py-2.5 text-left font-bold text-slate-900">Fleet Manager</td><td>✓</td><td>✓</td><td>—</td><td>—</td><td>✓</td></tr>
              <tr><td className="px-3 py-2.5 text-left font-bold text-slate-900">Driver</td><td>View</td><td>—</td><td>✓</td><td>—</td><td>—</td></tr>
              <tr><td className="px-3 py-2.5 text-left font-bold text-slate-900">Safety Officer</td><td>—</td><td>✓</td><td>View</td><td>—</td><td>—</td></tr>
              <tr><td className="px-3 py-2.5 text-left font-bold text-slate-900">Financial Analyst</td><td>View</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}