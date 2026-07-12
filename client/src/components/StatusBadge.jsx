import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    // Assets & Personnel Scopes[cite: 1]
    "Available": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    "On Trip": "bg-sky-50 text-sky-700 border-sky-200/60",
    "In Shop": "bg-amber-50 text-amber-700 border-amber-200/60",
    "Retired": "bg-rose-50 text-rose-700 border-rose-200/60",
    "Suspended": "bg-orange-50 text-orange-700 border-orange-200/60",
    "Off Duty": "bg-slate-50 text-slate-600 border-slate-200",
    
    // Lifecycle Pipeline[cite: 1]
    "Draft": "bg-purple-50 text-purple-700 border-purple-200/60",
    "Dispatched": "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    "Cancelled": "bg-rose-50 text-rose-700 border-rose-200/60",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md border shadow-sm ${styles[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
        status === 'Available' || status === 'Completed' ? 'bg-emerald-500' :
        status === 'On Trip' || status === 'Dispatched' ? 'bg-indigo-500' :
        status === 'In Shop' ? 'bg-amber-500' : 'bg-rose-500'
      }`}></span>
      {status}
    </span>
  );
}