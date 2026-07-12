import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Sidebar({ activePage, setActivePage, userRole }) {
  const { logout } = useContext(AppContext);

  // Filter sidebar options based on role access rules
  const getAllowedItems = () => {
    switch (userRole) {
      case 'Fleet Manager':
        return [
          { id: 'fleet', label: 'Fleet Registry' },
          { id: 'maintenance', label: 'Maintenance Log' }
        ];
      case 'Dispatcher':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'trips', label: 'Trip Dispatcher' }
        ];
      case 'Safety Officer':
        return [
          { id: 'drivers', label: 'Drivers & Safety' },
          { id: 'settings', label: 'Compliance Panel' }
        ];
      case 'Financial Analyst':
        return [
          { id: 'expenses', label: 'Fuel & Expenses' },
          { id: 'analytics', label: 'Reports & Analytics' }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getAllowedItems();

  return (
    <aside className="w-64 bg-slate-100 text-slate-800 flex flex-col justify-between border-r border-slate-200 h-screen select-none shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-black tracking-tight text-slate-900 border-b border-slate-200 pb-4 flex items-center gap-2">
          <span className="h-7 w-7 rounded bg-amber-500 flex items-center justify-center text-xs text-slate-950 font-black shadow-sm">TO</span>
          TransitOps
        </h1>
        <nav className="mt-6 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${
                activePage === item.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2.5 text-[11px] text-slate-400 font-medium">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-400">Active Role Scope</p>
          <p className="text-slate-700 font-black uppercase tracking-wide text-xs">{userRole || 'Dispatcher'}</p>
        </div>
        <button 
          onClick={logout}
          className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold py-1.5 rounded transition text-[10px] uppercase tracking-wider shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}