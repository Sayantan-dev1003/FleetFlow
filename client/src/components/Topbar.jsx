import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiUser, FiBell } from 'react-icons/fi';

export default function Topbar() {
  const { user } = useContext(AppContext);
  const location = useLocation();

  const getHeaderInfo = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Operations Dashboard', subtitle: 'Real-time transport utilization, KPIs, and status metrics' };
      case '/fleet':
        return { title: 'Fleet Registry', subtitle: 'Manage vehicles database, license plates, and odometers' };
      case '/drivers':
        return { title: 'Drivers & Safety Roster', subtitle: 'Audit license compliance, expiry timelines, and safety indices' };
      case '/trips':
        return { title: 'Trip Dispatcher Ledger', subtitle: 'Orchestrate live dispatches, capacity checks, and complete logs' };
      case '/maintenance':
        return { title: 'Maintenance Registry', subtitle: 'Track vehicle repair statuses, service tickets, and costs' };
      case '/expenses':
        return { title: 'Fuel & Expenses Ledger', subtitle: 'Monitor fuel logs, toll purchases, and operational aggregates' };
      case '/analytics':
        return { title: 'Analytics & Reports', subtitle: 'Analyze aggregate fleet trends, ROIs, and CSV exports' };
      case '/settings':
        return { title: 'Compliance Control Panel', subtitle: 'Manage system configurations and compliance rules' };
      default:
        return { title: 'Operations Center', subtitle: 'TransitOps fleet management console' };
    }
  };

  const info = getHeaderInfo(location.pathname);

  // Get initials
  const getInitials = (n) => {
    if (!n) return 'TO';
    const parts = n.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex justify-between items-center shrink-0 select-none">
      <div className="text-left">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{info.title}</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{info.subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4">
     

        {/* Profile widget */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-800">{user?.name || 'Administrator'}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{user?.role || 'Safety Officer'}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-black text-xs text-slate-950 uppercase tracking-widest shadow-xs">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
