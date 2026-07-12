import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Login({ onBack }) {
  const { login, registerUser, accountLocked } = useContext(AppContext);
  
  // Tab selector: 'login' or 'register'
  const [activeTab, setActiveTab] = useState('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('Dispatcher');
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('FLEET_MANAGER');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Password Validation Check Helpers (Zod Aligned)
  const isMinLength = registerPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(registerPassword);
  const hasNumber = /[0-9]/.test(registerPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(registerPassword);
  const isPasswordValid = isMinLength && hasUppercase && hasNumber && hasSpecial;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const res = await login(loginEmail, loginPassword, loginRole);
    if (!res.success) {
      setLoginError(res.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (registerName.trim().length < 2) {
      setRegisterError('Full Name must be at least 2 characters.');
      return;
    }

    if (!registerEmail.includes('@')) {
      setRegisterError('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setRegisterError('Please satisfy all password complexity rules.');
      return;
    }

    const res = await registerUser(
      registerName.trim(),
      registerEmail.trim(),
      registerPassword,
      registerRole
    );

    if (res.success) {
      setRegisterSuccess('Account registered successfully! Redirecting you into console session...');
      // Form reset
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } else {
      setRegisterError(res.error);
    }
  };

  const handleQuickLogin = (selectedRole, selectedEmail) => {
    setActiveTab('login');
    setLoginRole(selectedRole);
    setLoginEmail(selectedEmail);
    setLoginPassword('password123');
    setLoginError('');
    
    // Auto submit to make it even faster
    setTimeout(async () => {
      const res = await login(selectedEmail, 'password123', selectedRole);
      if (!res.success) {
        setLoginError(res.error);
      }
    }, 50);
  };

 
  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden select-none animate-fadeIn">
      
      {/* Left Column Section: Dark Mode Banner (5/12 width) */}
      <div className="w-5/12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Abstract light blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="relative">
          {/* Logo */}
          <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl mb-4 flex items-center justify-center font-black text-slate-950 text-sm tracking-tighter shadow-md">
            TO
          </div>
          <h1 className="text-3xl font-black tracking-wide text-white uppercase">TransitOps</h1>
          <p className="text-amber-500 text-xs font-bold mt-1 uppercase tracking-wider">
            Smart Transport Operations Platform
          </p>
        </div>
        
        {/* Role Access Scope Guidelines */}
        <div className="my-auto space-y-4 relative">
          <p className="text-sm font-black text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2">
            Workspace Access Matrix:
          </p>
          <ul className="space-y-4 text-xs font-semibold text-slate-400">
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/40"></span> 
              <span>Fleet Manager ➔ <span className="text-slate-300">Vehicles & Maintenance Log</span></span>
            </li>
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-md shadow-blue-500/40"></span> 
              <span>Dispatcher ➔ <span className="text-slate-300">Dashboard & Trip Dispatcher</span></span>
            </li>
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40"></span> 
              <span>Safety Officer ➔ <span className="text-slate-300">Drivers & Expiry Auditing</span></span>
            </li>
            <li className="flex items-center gap-3 hover:translate-x-1 transition-transform">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-md shadow-amber-500/40"></span> 
              <span>Financial Analyst ➔ <span className="text-slate-300">Fuel, Tolls, & Reports</span></span>
            </li>
          </ul>
        </div>

        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest relative">
          TRANSITOPS © 2026 • SECURED CREDENTIAL CONSOLE
        </p>
      </div>

      {/* Right Column Section: Forms and Toggles Panel (7/12 width) */}
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

        {/* Global Error Banner */}
        {((activeTab === 'login' && loginError) || (activeTab === 'register' && registerError)) && (
          <div className="absolute top-8 right-8 border-2 border-dashed border-rose-300 bg-rose-50/90 text-rose-700 p-4 rounded-xl max-w-xs text-[11px] font-semibold animate-pulse z-10">
            <p className="font-bold flex items-center gap-1 text-xs text-rose-800 uppercase tracking-wider">
              ❌ Authentication Alert
            </p>
            <p className="mt-1 leading-relaxed font-semibold">
              {activeTab === 'login' ? loginError : registerError}
            </p>
          </div>
        )}

        {/* Global Success Banner */}
        {activeTab === 'register' && registerSuccess && (
          <div className="absolute top-8 right-8 border-2 border-dashed border-emerald-300 bg-emerald-50/90 text-emerald-700 p-4 rounded-xl max-w-xs text-[11px] font-semibold z-10">
            <p className="font-bold flex items-center gap-1 text-xs text-emerald-800 uppercase tracking-wider">
              ✓ Registration Success
            </p>
            <p className="mt-1 leading-relaxed font-semibold">{registerSuccess}</p>
          </div>
        )}

        <div className="max-w-md w-full mx-auto py-8">
          
          {/* Header */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {activeTab === 'login' ? 'Console Cockpit Sign In' : 'Register Console Account'}
          </h2>
          <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
            {activeTab === 'login' ? 'Enter credentials to load session' : 'Submit profile for database insertion'}
          </p>

          {/* Form Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-6">
            <button
              onClick={() => { setActiveTab('login'); setRegisterError(''); setRegisterSuccess(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setLoginError(''); }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeTab === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Register
            </button>
          </div>

          {/* Tab 1: Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
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
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  disabled={accountLocked}
                  placeholder="••••••••"
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all bg-slate-50 shadow-inner" 
                />
              </div>

              {/* <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Console Landing Role (RBAC Scope)
                </label>
                <select 
                  value={loginRole} 
                  onChange={(e) => setLoginRole(e.target.value)} 
                  disabled={accountLocked}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all cursor-pointer shadow-sm"
                >
                  <option>Fleet Manager</option>
                  <option>Dispatcher</option>
                  <option>Safety Officer</option>
                  <option>Financial Analyst</option>
                </select>
              </div> */}

              <div className="flex justify-between items-center text-xs font-bold mt-2">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="rounded text-amber-500 focus:ring-amber-500 border-slate-300 h-3.5 w-3.5" defaultChecked /> 
                  Keep me signed in
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert("Use the quick login cards below to test roles!"); }} className="text-blue-600 hover:underline tracking-tight">
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
          )}

          {/* Tab 2: Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Alice Cooper"
                    value={registerName} 
                    onChange={(e) => setRegisterName(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 bg-slate-50 focus:ring-1 focus:ring-amber-500" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Select Role
                  </label>
                  <select 
                    value={registerRole} 
                    onChange={(e) => setRegisterRole(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 bg-slate-50 rounded-lg outline-none font-semibold text-slate-700 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="FLEET_MANAGER">Fleet Manager</option>
                    <option value="DRIVER">Driver (Available/On Trip)</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="FINANCIAL_ANALYST">Financial Analyst</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="alice@fleetflow.com"
                  value={registerEmail} 
                  onChange={(e) => setRegisterEmail(e.target.value)} 
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 bg-slate-50 focus:ring-1 focus:ring-amber-500" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Create Password
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={registerPassword} 
                  onChange={(e) => setRegisterPassword(e.target.value)} 
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none font-semibold text-slate-700 bg-slate-50 focus:ring-1 focus:ring-amber-500" 
                />
              </div>

              {/* Password Complexity checklist */}
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-1.5 text-[10px] font-bold text-slate-400">
                <p className="uppercase text-[9px] text-slate-500 tracking-wider mb-1">Complexity Requirements Checklist:</p>
                <div className="flex items-center gap-2">
                  <span className={isMinLength ? 'text-emerald-500' : 'text-slate-300'}>{isMinLength ? '✓' : '○'}</span>
                  <span className={isMinLength ? 'text-slate-600 font-semibold' : ''}>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={hasUppercase ? 'text-emerald-500' : 'text-slate-300'}>{hasUppercase ? '✓' : '○'}</span>
                  <span className={hasUppercase ? 'text-slate-600 font-semibold' : ''}>Contains 1 uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={hasNumber ? 'text-emerald-500' : 'text-slate-300'}>{hasNumber ? '✓' : '○'}</span>
                  <span className={hasNumber ? 'text-slate-600 font-semibold' : ''}>Contains 1 numeric digit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={hasSpecial ? 'text-emerald-500' : 'text-slate-300'}>{hasSpecial ? '✓' : '○'}</span>
                  <span className={hasSpecial ? 'text-slate-600 font-semibold' : ''}>Contains 1 special character (e.g., !, @, #)</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!isPasswordValid}
                className={`w-full font-black py-3 rounded-lg transition-all shadow hover:shadow-md mt-2 text-xs uppercase tracking-widest cursor-pointer ${
                  !isPasswordValid 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:scale-[1.01] text-slate-950'
                }`}
              >
                Register Profile
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}