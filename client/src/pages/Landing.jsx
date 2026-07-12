import React, { useState } from 'react';
import landingBanner from '../assets/landing_banner.png';

export default function Landing({ onLaunch }) {
  const [activeRoleTab, setActiveRoleTab] = useState('Dispatcher');

  const roleInfo = {
    'Fleet Manager': {
      scope: 'Fleet Registry & Maintenance Logs',
      desc: 'Oversees fleet vehicle lifecycle, handles registration of vehicles, and tracks active/completed maintenance logs.',
      pages: ['Fleet Registry', 'Maintenance Logs'],
      color: 'from-indigo-500 to-purple-600',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      credential: 'manager@transitops.in'
    },
    'Dispatcher': {
      scope: 'Dashboard Overview & Trip Dispatcher',
      desc: 'Orchestrates live transport dispatching. Assigns available vehicles/drivers to new trips, performs load check validations, and tracks the active trips lifecycle.',
      pages: ['Operations Dashboard', 'Trip Dispatcher'],
      color: 'from-blue-500 to-sky-600',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      credential: 'Raven.k@transitops.in'
    },
    'Safety Officer': {
      scope: 'Drivers roster & Compliance validation',
      desc: 'Enforces driver licenses compliance. Audits driver profiles, monitors safety scores, and checks for expired/suspended licenses.',
      pages: ['Drivers & Safety Profiles', 'Compliance Panel'],
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      credential: 'safety@transitops.in'
    },
    'Financial Analyst': {
      scope: 'Fuel logs, Toll expenses, & ROI reports',
      desc: 'Audits fuel purchases, toll tolls, and maintenance fees. Computes fleet fuel efficiency and calculates ROI on acquisition costs.',
      pages: ['Fuel & Expenses Ledger', 'Reports & Analytics'],
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      credential: 'analyst@transitops.in'
    }
  };

  const currentRole = roleInfo[activeRoleTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-50 px-8 py-4 flex items-center justify-between max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-sm text-slate-950 font-black shadow-md">
            TO
          </span>
          <span className="text-lg font-black tracking-wider text-slate-100">
            TransitOps
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
          <a href="#roles" className="hover:text-amber-500 transition-colors">Role RBAC</a>
          <a href="#tech" className="hover:text-amber-500 transition-colors">Console Stack</a>
        </nav>

        <button 
          onClick={onLaunch}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md shadow-amber-500/10 cursor-pointer"
        >
          Launch Console
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative px-8 py-16 lg:py-24 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Decorative Light Blurs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

        {/* Left Typography Block */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-amber-500 tracking-widest shadow-sm">
            ⚡ Platform Version 1.0 • Stable Release
          </span>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            Smart Transport <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500">
              Operations Platform
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
            TransitOps is a centralized, role-based cockpit that digitizes vehicle registry, driver compliance, active trip dispatching, scheduled maintenance, and real-time operational costs in one unified workspace.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={onLaunch}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black px-6 py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-orange-500/10 cursor-pointer"
            >
              Sign In to Console
            </button>
            <a 
              href="#features"
              className="px-6 py-3.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-center"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right Preview Graphic Block */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40 p-3 shadow-2xl max-w-[500px] w-full">
            {/* Glossy Overlay banner image */}
            <img 
              src={landingBanner} 
              alt="TransitOps Network Banner" 
              className="rounded-xl w-full h-auto object-cover object-center shadow-lg"
            />
            
            {/* Glassmorphic overlay cards overlaying the graphic */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-xl max-w-[200px] text-left hidden sm:block">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Active Utilization</span>
              <p className="text-2xl font-black text-white mt-1">81%</p>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Peak active transit fleet en-route today.</p>
            </div>

            <div className="absolute -top-4 -right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-lg shadow-xl text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-200 uppercase tracking-wider">GJ01AB452</span>
              </div>
              <p className="text-[9px] text-slate-400 font-semibold mt-1">VAN-05 ➔ Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Grid Section */}
      <section id="features" className="bg-slate-900/30 border-y border-slate-900 px-8 py-20 w-full scroll-mt-16">
        <div className="max-w-[1600px] mx-auto w-full space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">Unified Operations Management</h2>
            <div className="h-1 w-12 bg-amber-500 mx-auto mt-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl hover:border-slate-800 transition-all text-left space-y-3">
              <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center text-lg">🚚</div>
              <h4 className="text-sm font-black uppercase text-slate-200 tracking-wide">Vehicle Registry</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Maintain comprehensive vehicle specifications, unique registration keys, odometer logs, and real-time statuses (Available, On Trip, In Shop, Retired).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl hover:border-slate-800 transition-all text-left space-y-3">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-lg">🧑‍✈️</div>
              <h4 className="text-sm font-black uppercase text-slate-200 tracking-wide">Driver Safety</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Verify licenses categories, audit expiry timelines, and track driver safety scores. Automatically flag expired driver records to block new assignments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl hover:border-slate-800 transition-all text-left space-y-3">
              <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-lg">🎯</div>
              <h4 className="text-sm font-black uppercase text-slate-200 tracking-wide">Trip Dispatcher</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Assign available assets, validate load capacity, track live transit board progress, and trigger automated driver/vehicle releases upon log completion.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl hover:border-slate-800 transition-all text-left space-y-3">
              <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center text-lg">📈</div>
              <h4 className="text-sm font-black uppercase text-slate-200 tracking-wide">Dynamic Analytics</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Track fuel efficiencies, aggregate operational costs, monitor vehicle ROIs, render dynamic column graphs, and export CSV audit reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Scopes & RBAC Showcase Section */}
      <section id="roles" className="px-8 py-20 max-w-[1200px] mx-auto w-full scroll-mt-16 text-center space-y-12">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Role-Based Access Control</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">One Login, Four Scopes</h2>
          <div className="h-1 w-12 bg-amber-500 mx-auto mt-2"></div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto border-b border-slate-900 pb-4">
          {Object.keys(roleInfo).map((r, i) => (
            <button
              key={i}
              onClick={() => setActiveRoleTab(r)}
              className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                activeRoleTab === r 
                  ? 'bg-amber-500 text-slate-950 font-black shadow' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Tab Detail Card */}
        <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl max-w-3xl mx-auto text-left shadow-2xl relative overflow-hidden">
          {/* Accent border strip based on tab selection */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentRole.color}`}></div>

          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border ${currentRole.badgeColor}`}>
                {activeRoleTab} View Scope
              </span>
              <h3 className="text-lg font-black text-white mt-2 uppercase tracking-wide">
                {currentRole.scope}
              </h3>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-semibold text-slate-400">
              Demo Email: <span className="text-amber-500 font-bold">{currentRole.credential}</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed mt-4 font-medium">
            {currentRole.desc}
          </p>

          <div className="mt-6 pt-5 border-t border-slate-900/60">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Accessible Workspace Modules:</h4>
            <div className="flex flex-wrap gap-2">
              {currentRole.pages.map((p, idx) => (
                <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-semibold px-3 py-1 rounded-md">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stack Details Footer Section */}
      <footer id="tech" className="bg-slate-950 border-t border-slate-900 px-8 py-12 w-full text-center">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-black">TO</span>
            <span>TransitOps Smart Transport Cockpit © 2026</span>
          </div>
          
          <div className="flex gap-4 text-[10px] text-slate-600">
            <span>React</span>
            <span>•</span>
            <span>Vite</span>
            <span>•</span>
            <span>Tailwind v4</span>
            <span>•</span>
            <span>Prisma ORM</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
