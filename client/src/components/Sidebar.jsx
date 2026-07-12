import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  FiTruck, FiTool, FiMap, FiGrid, 
  FiUsers, FiShield, FiDollarSign, 
  FiPieChart, FiLogOut 
} from 'react-icons/fi';
import { MdOutlineDashboardCustomize } from 'react-icons/md';

export default function Sidebar({ userRole }) {
  const { logout } = useContext(AppContext);
  const navigate = useNavigate(); // 1. Initialize the navigate hook

  // 2. Create a handler to clear session AND change the route
  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to the landing/login page
  };

  // Filter sidebar options based on role access rules, now with icons
  const getAllowedItems = () => {
    switch (userRole) {
      case 'Fleet Manager':
        return [
          { id: 'fleet', label: 'Fleet Registry', icon: <FiTruck className="text-lg" /> },
          { id: 'maintenance', label: 'Maintenance Log', icon: <FiTool className="text-lg" /> },
          { id: 'trips', label: 'Trip Dispatcher', icon: <FiMap className="text-lg" /> }
        ];
      case 'Driver':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <FiGrid className="text-lg" /> },
          { id: 'trips', label: 'Trip Dispatcher', icon: <FiMap className="text-lg" /> }
        ];
      case 'Safety Officer':
        return [
          { id: 'drivers', label: 'Drivers & Safety', icon: <FiUsers className="text-lg" /> },
          { id: 'settings', label: 'Compliance Panel', icon: <FiShield className="text-lg" /> }
        ];
      case 'Financial Analyst':
        return [
          { id: 'expenses', label: 'Fuel & Expenses', icon: <FiDollarSign className="text-lg" /> },
          { id: 'analytics', label: 'Reports & Analytics', icon: <FiPieChart className="text-lg" /> }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getAllowedItems();

  return (
    <aside className="w-64 bg-[#0a0f1c] text-slate-100 flex flex-col justify-between border-r border-white/5 h-screen select-none shrink-0 relative z-20">
      <div className="p-6">
        {/* Branding Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <MdOutlineDashboardCustomize className="text-lg" />
          </div>
          <span className="text-lg font-black tracking-wide text-white">
            Transit<span className="text-amber-500">Ops</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-5 border-t border-white/10 bg-[#0f172a]/50 backdrop-blur-md flex flex-col gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Active Role Scope</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <p className="text-white font-black uppercase tracking-wide text-xs">{userRole || 'Driver'}</p>
          </div>
        </div>
        
        {/* 3. Updated onClick handler */}
        <button 
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 hover:text-rose-400 font-bold py-2.5 rounded-xl transition-all text-[10px] uppercase tracking-widest"
        >
          <FiLogOut className="text-sm group-hover:-translate-x-1 transition-transform" />
          Sign Out Session
        </button>
      </div>
    </aside>
  );
}