import React from 'react';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const kpis = [
    { title: "Active Vehicles", value: "53", color: "border-blue-500" },
    { title: "Available Vehicles", value: "42", color: "border-emerald-500" },
    { title: "Vehicles In Maintenance", value: "05", color: "border-amber-500" },
    { title: "Active Trips", value: "18", color: "border-indigo-500" },
    { title: "Pending Trips", value: "09", color: "border-purple-500" },
    { title: "Drivers On Duty", value: "26", color: "border-sky-500" },
    { title: "Fleet Utilization", value: "81%", color: "border-teal-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex flex-col gap-1">
          <label>Vehicle Type</label>
          <select className="border rounded px-3 py-1.5 bg-slate-50 outline-none"><option>All</option></select>
        </div>
        <div className="flex flex-col gap-1">
          <label>Status</label>
          <select className="border rounded px-3 py-1.5 bg-slate-50 outline-none"><option>All</option></select>
        </div>
        <div className="flex flex-col gap-1">
          <label>Region</label>
          <select className="border rounded px-3 py-1.5 bg-slate-50 outline-none"><option>All</option></select>
        </div>
      </div>

      {/* 7 KPI Box Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`bg-white p-4 rounded-xl border-l-4 border shadow-sm ${kpi.color}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Bottom Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Trips Ledger */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Trips</h3>
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                <th className="py-2">Trip</th>
                <th className="py-2">Vehicle</th>
                <th className="py-2">Driver</th>
                <th className="py-2">Status</th>
                <th className="py-2">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              <tr><td className="py-3">TR001</td><td>VAN-05</td><td>Alex</td><td><StatusBadge status="On Trip"/></td><td>45 min</td></tr>
              <tr><td className="py-3">TR002</td><td>TRK-12</td><td>John</td><td><StatusBadge status="Completed"/></td><td>—</td></tr>
              <tr><td className="py-3">TR003</td><td>MINI-08</td><td>Priya</td><td><StatusBadge status="Dispatched"/></td><td>1h 10m</td></tr>
              <tr><td className="py-3">TR004</td><td>—</td><td>—</td><td><StatusBadge status="Draft"/></td><td>Awaiting vehicle</td></tr>
            </tbody>
          </table>
        </div>

        {/* Vehicle Status Distributions */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Vehicle Status</h3>
          <div className="space-y-4 text-xs font-bold text-slate-600">
            <div>
              <div className="flex justify-between mb-1"><span>Available</span><span>60%</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-emerald-500 h-2 rounded-full w-[60%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>On Trip</span><span>30%</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-blue-500 h-2 rounded-full w-[30%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>In Shop</span><span>7%</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-amber-500 h-2 rounded-full w-[7%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span>Retired</span><span>3%</span></div>
              <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-rose-500 h-2 rounded-full w-[3%]"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}