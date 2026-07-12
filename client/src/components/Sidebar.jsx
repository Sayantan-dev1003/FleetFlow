import React from 'react';

export default function Sidebar({ activePage, setActivePage, userRole }) {
  // Sidebar items mapped from references
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'fleet', label: 'Fleet' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'trips', label: 'Trips' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'expenses', label: 'Fuel & Expenses' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <aside className="w-64 bg-slate-100 text-slate-800 flex flex-col justify-between border-r border-slate-200 h-screen select-none">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 border-b border-slate-200 pb-4">
          TransitOps
        </h1>
        <nav className="mt-6 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center text-left px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activePage === item.id
                  ? 'bg-amber-100/80 text-amber-900 border-l-4 border-amber-500 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col gap-1 text-[11px] text-slate-400 font-medium">
        <p>Active Session Access Scoped</p>
        <p className="text-slate-600 font-bold uppercase tracking-wider">{userRole || 'Dispatcher'}</p>
      </div>
    </aside>
  );
}