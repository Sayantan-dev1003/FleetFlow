import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Login({ onBack }) {
  const { login, accountLocked } = useContext(AppContext);
  const [email, setEmail] = useState('Raven.k@transitops.in');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Dispatcher');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password, role);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleQuickLogin = (selectedRole, selectedEmail) => {
    setRole(selectedRole);
    setEmail(selectedEmail);
    setPassword('password123');
    setError('');
    
    // Auto submit to make it even faster
    setTimeout(() => {
      const res = login(selectedEmail, 'password123', selectedRole);
      if (!res.success) {
        setError(res.error);
      }
    }, 50);
  };

  const rolesList = [
    { role: 'Fleet Manager', email: 'manager@transitops.in', color: 'border-l-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20' },
    { role: 'Dispatcher', email: 'Raven.k@transitops.in', color: 'border-l-blue-500 bg-blue-50/40 dark:bg-blue-950/20' },
    { role: 'Safety Officer', email: 'safety@transitops.in', color: 'border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' },
    { role: 'Financial Analyst', email: 'analyst@transitops.in', color: 'border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20' }
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden select-none animate-fadeIn">
      
      {/* Left Column Section: Dark Mode Banner (5/12 width) */}
      <div className="w-5/12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="relative">
          {/* Logo element placeholder matching Excalidraw grid wireframe */}
          <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl mb-4 flex items-center justify-center font-black text-slate-950 text-sm tracking-tighter shadow-md">
            TO
          </div>
          <h1 className="text-3xl font-black tracking-wide text-white uppercase">TransitOps</h1>
          <p className="text-amber-500 text-xs font-bold mt-1 uppercase tracking-wider">
            Smart Transport Operations Platform
          </p>
        </div>
        
        {/* Role overview specification checklist parameters */}
        <div className="my-auto space-y-4 relative">
          <p className="text-sm font-black text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2">
            One login, four roles:
          </p>
          <ul className="space-y-4 text-xs font-semibold text-slate-400">
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></span> 
              <span>Fleet Manager ➔ <span className="text-slate-300">Fleet Assets & Maintenance</span></span>
            </li>
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></span> 
              <span>Dispatcher ➔ <span className="text-slate-300">Dashboard & Trip Board</span></span>
            </li>
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span> 
              <span>Safety Officer ➔ <span className="text-slate-300">Drivers & License Audits</span></span>
            </li>
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50"></span> 
              <span>Financial Analyst ➔ <span className="text-slate-300">Expenses & Fleet ROI</span></span>
            </li>
          </ul>
        </div>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest relative">
          TRANSITOPS © 2026 • SECURED CREDENTIAL CONSOLE
        </p>
      </div>

      {/* Right Column Section: Ingestion Authorization Form Panel (7/12 width) */}
      <div className="w-7/12 flex flex-col justify-center px-16 relative bg-white overflow-y-auto">
        
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-8 left-8 flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>← Back to Home</span>
          </button>
        )}

        {/* Conditional Dashed Boundary Container Tracking Server Error States */}
        {error && (
          <div className="absolute top-8 right-8 border-2 border-dashed border-rose-300 bg-rose-50/80 text-rose-700 p-4 rounded-xl max-w-xs text-[11px] font-semibold animate-pulse z-10">
            <p className="font-bold flex items-center gap-1 text-xs text-rose-800 uppercase tracking-wider">
              ❌ Authorization Error
            </p>
            <p className="mt-1 leading-relaxed font-semibold">{error}</p>
          </div>
        )}

        <div className="max-w-md w-full mx-auto py-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Sign in to Cockpit
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
            Enter your credentials to manage operations
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={accountLocked}
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50 shadow-inner" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Security Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={accountLocked}
                placeholder="••••••••"
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50 shadow-inner" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Select Console Role (RBAC)
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                disabled={accountLocked}
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer shadow-sm"
              >
                <option>Fleet Manager</option>
                <option>Dispatcher</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
              </select>
            </div>

            <div className="flex justify-between items-center text-xs font-bold mt-2">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500 border-slate-300 h-3.5 w-3.5" defaultChecked /> 
                Keep me signed in
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Click one of the helper cards below to bypass login credentials!"); }} className="text-blue-600 hover:underline tracking-tight">
                Help logging in?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={accountLocked}
              className={`w-full text-slate-950 font-black py-3 rounded-lg transition-all shadow hover:shadow-md mt-3 text-xs uppercase tracking-widest cursor-pointer ${
                accountLocked 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:scale-[1.01]'
              }`}
            >
              {accountLocked ? 'Console Temporarily Locked' : 'Launch Session'}
            </button>
          </form>

          {/* Quick Helper Panel */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">
              ⚡ Sandbox Credentials (Click to log in instantly)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {rolesList.map((x, idx) => (
                <div 
                  key={idx}
                  onClick={() => !accountLocked && handleQuickLogin(x.role, x.email)}
                  className={`border border-slate-200/60 p-2.5 rounded-lg cursor-pointer hover:border-slate-400 hover:shadow-sm transition-all text-left ${x.color} ${accountLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{x.role}</p>
                  <p className="text-[9px] font-semibold text-slate-400 truncate mt-0.5">{x.email}</p>
                  <p className="text-[8px] text-slate-400 mt-1 font-bold">BYPASS KEY: password123</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}