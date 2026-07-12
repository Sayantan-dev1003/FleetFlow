import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Login() {
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
    { role: 'Fleet Manager', email: 'manager@transitops.in', color: 'border-l-indigo-500 bg-indigo-50/20' },
    { role: 'Dispatcher', email: 'Raven.k@transitops.in', color: 'border-l-blue-500 bg-blue-50/20' },
    { role: 'Safety Officer', email: 'safety@transitops.in', color: 'border-l-emerald-500 bg-emerald-50/20' },
    { role: 'Financial Analyst', email: 'analyst@transitops.in', color: 'border-l-amber-500 bg-amber-50/20' }
  ];

  return (
    <div className="flex h-screen w-screen bg-white font-sans overflow-hidden select-none">
      
      {/* Left Column Section: Dark Mode Banner (5/12 width) */}
      <div className="w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between">
        <div>
          {/* Logo element placeholder matching Excalidraw grid wireframe */}
          <div className="h-12 w-12 bg-amber-500 rounded-lg mb-4 flex items-center justify-center font-black text-slate-900 text-sm tracking-tighter shadow-md">
            TO
          </div>
          <h1 className="text-3xl font-black tracking-wide text-amber-500">TransitOps</h1>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
            Smart Transport Operations Platform
          </p>
        </div>
        
        {/* Role overview specification checklist parameters */}
        <div className="my-auto space-y-4">
          <p className="text-base font-bold text-slate-200 uppercase tracking-wide">
            One login, four roles:
          </p>
          <ul className="space-y-3.5 text-xs font-semibold text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm"></span> 
              <span>Fleet Manager ➔ <span className="text-slate-300">Fleet & Maintenance</span></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm"></span> 
              <span>Dispatcher ➔ <span className="text-slate-300">Dashboard & Trips</span></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm"></span> 
              <span>Safety Officer ➔ <span className="text-slate-300">Drivers & Compliance</span></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm"></span> 
              <span>Financial Analyst ➔ <span className="text-slate-300">Expenses & Analytics</span></span>
            </li>
          </ul>
        </div>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          TRANSITOPS © 2026 • RBAC ENABLED
        </p>
      </div>

      {/* Right Column Section: Ingestion Authorization Form Panel (7/12 width) */}
      <div className="w-7/12 flex flex-col justify-center px-16 relative bg-white overflow-y-auto">
        
        {/* Conditional Dashed Boundary Container Tracking Server Error States */}
        {error && (
          <div className="absolute top-8 right-8 border-2 border-dashed border-rose-400 bg-rose-50/60 text-rose-700 p-4 rounded-lg max-w-xs text-[11px] font-semibold animate-pulse z-10">
            <p className="font-bold flex items-center gap-1 text-xs text-rose-800 uppercase tracking-wider">
              ❌ Error state
            </p>
            <p className="mt-1 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="max-w-md w-full mx-auto py-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={accountLocked}
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50" 
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
                disabled={accountLocked}
                placeholder="••••••••"
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Role (RBAC)
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                disabled={accountLocked}
                className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
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
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Use the quick login cards below to test roles!"); }} className="text-blue-600 hover:underline tracking-tight">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={accountLocked}
              className={`w-full text-slate-950 font-bold py-2.5 rounded-lg transition-all shadow-sm mt-3 text-xs uppercase tracking-wider ${
                accountLocked 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {accountLocked ? 'Account Locked' : 'Sign In'}
            </button>
          </form>

          {/* Quick Helper Panel */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">
              ⚡ Quick Login Assistant (Select to login instantly)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {rolesList.map((x, idx) => (
                <div 
                  key={idx}
                  onClick={() => !accountLocked && handleQuickLogin(x.role, x.email)}
                  className={`border-l-4 border p-2.5 rounded-lg cursor-pointer hover:shadow-sm transition-all text-left ${x.color} ${accountLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <p className="text-[10px] font-bold text-slate-800">{x.role}</p>
                  <p className="text-[9px] font-medium text-slate-500 truncate">{x.email}</p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Password: password123</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}