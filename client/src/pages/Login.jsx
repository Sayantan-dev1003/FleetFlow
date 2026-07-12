import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('Raven.k@transitops.in');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [error, setError] = useState('Invalid credentials. Account locked after 5 failed attempts.');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hackathon execution wrapper hook triggers authentication status state
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden select-none">
      
      {/* Left Column Section: Dark Mode Banner (5/12 width) */}
      <div className="w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between">
        <div>
          {/* Logo element placeholder matching Excalidraw grid wireframe */}
          <div className="h-12 w-12 bg-amber-500 rounded-lg mb-4 flex items-center justify-center font-black text-slate-900 text-sm tracking-tighter">
            TO
          </div>
          <h1 className="text-3xl font-black tracking-wide">TransitOps</h1>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
            Smart Transport Operations Platform
          </p>
        </div>
        
        {/* Role overview specification checklist parameters */}
        <div className="my-auto space-y-4">
          <p className="text-base font-bold text-slate-200 uppercase tracking-wide">
            One login, four roles:
          </p>
          <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm"></span> 
              Fleet Manager
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm"></span> 
              Dispatcher
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm"></span> 
              Safety Officer
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm"></span> 
              Financial Analyst
            </li>
          </ul>
        </div>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          TRANSITOPS © 2026 • RBAC ENABLED
        </p>
      </div>

      {/* Right Column Section: Ingestion Authorization Form Panel (7/12 width) */}
      <div className="w-7/12 flex flex-col justify-center px-24 relative bg-white">
        
        {/* Conditional Dashed Boundary Container Tracking Server Error States */}
        {error && (
          <div className="absolute top-12 right-12 border-2 border-dashed border-rose-400 bg-rose-50/60 text-rose-700 p-4 rounded-lg max-w-xs text-[11px] font-semibold animate-pulse">
            <p className="font-bold flex items-center gap-1 text-xs text-rose-800 uppercase tracking-wider">
              ❌ Error state
            </p>
            <p className="mt-1 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="max-w-md w-full">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Role (RBAC)
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
              >
                <option>Fleet Manager</option>
                <option>Dispatcher</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
              </select>
            </div>

            <div className="flex justify-between items-center text-xs font-bold mt-2">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500 border-slate-300 h-3.5 w-3.5" defaultChecked /> 
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:underline tracking-tight">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-lg hover:bg-amber-600 transition-all shadow-sm mt-3 text-xs uppercase tracking-wider"
            >
              Sign In
            </button>
          </form>

          {/* Scoped functional access routing log details footprint */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-medium space-y-1.5">
            <p className="uppercase text-slate-500 font-bold tracking-wider mb-1">
              Access is scoped by role after login:
            </p>
            <p>• Fleet Manager ➔ Fleet, Maintenance</p>
            <p>• Dispatcher ➔ Dashboard, Trips</p>
            <p>• Safety Officer ➔ Drivers, Compliance</p>
            <p>• Financial Analyst ➔ Fuel & Expenses, Analytics</p>
          </div>
        </div>
      </div>

    </div>
  );
}