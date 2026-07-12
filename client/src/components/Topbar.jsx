import React from 'react';

export default function Topbar({ userSession = "Raven K." }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 w-full shrink-0">
      {/* Target Global Context Field Mockup */}
      <div className="w-72">
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full px-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-amber-500" 
        />
      </div>

      {/* User Status Profile Metadata Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-600 tracking-tight">{userSession}</span>
        <div className="h-8 w-16 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-[10px] font-bold text-blue-700 tracking-wider">
          Dispatcher <span className="ml-1 font-black bg-blue-700 text-white px-1 py-0.5 rounded-sm">RK</span>
        </div>
      </div>
    </header>
  );
}