import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Topbar() {
  const { user } = useContext(AppContext);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Fleet Manager': return { bg: 'bg-indigo-100 border-indigo-300 text-indigo-700', badge: 'bg-indigo-700' };
      case 'Driver': return { bg: 'bg-blue-100 border-blue-300 text-blue-700', badge: 'bg-blue-700' };
      case 'Safety Officer': return { bg: 'bg-emerald-100 border-emerald-300 text-emerald-700', badge: 'bg-emerald-700' };
      case 'Financial Analyst': return { bg: 'bg-amber-100 border-amber-300 text-amber-700', badge: 'bg-amber-700' };
      default: return { bg: 'bg-slate-100 border-slate-300 text-slate-700', badge: 'bg-slate-700' };
    }
  };

  const name = user?.name || "Guest";
  const role = user?.role || "Visitor";
  const colors = getRoleColor(role);
  const initials = getInitials(name);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 w-full shrink-0 shadow-sm">
      {/* Target Global Context Field Mockup */}
      <div className="w-72">
       
      </div>

      {/* User Status Profile Metadata Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-600 tracking-tight">{name}</span>
        <div className={`h-8 px-2 border rounded flex items-center justify-center text-[10px] font-bold tracking-wider gap-1.5 ${colors.bg}`}>
          {role} 
          <span className={`font-black text-white px-1 py-0.5 rounded-sm ${colors.badge}`}>
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}