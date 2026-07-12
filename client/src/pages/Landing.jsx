import React, { useState } from 'react';
import landingBanner from '../assets/landing_banner.png';
import { 
  FiTruck, FiShield, FiMap, FiTrendingUp, 
  FiSettings, FiBriefcase, FiPieChart, FiArrowRight 
} from 'react-icons/fi';
import { FaReact } from 'react-icons/fa';
import { SiVite, SiTailwindcss, SiPrisma } from 'react-icons/si';
import { MdOutlineDashboardCustomize } from 'react-icons/md';

export default function Landing({ onLaunch }) {
  const [activeRoleTab, setActiveRoleTab] = useState('Dispatcher');

  const roleInfo = {
    'Fleet Manager': {
      icon: <FiBriefcase className="text-lg" />,
      scope: 'Fleet Registry & Maintenance Logs',
      desc: 'Oversees fleet vehicle lifecycle, handles registration of vehicles, and tracks active/completed maintenance logs.',
      pages: ['Fleet Registry', 'Maintenance Logs'],
      color: 'from-indigo-500 to-purple-600',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      credential: 'manager@transitops.in'
    },
    'Dispatcher': {
      icon: <FiMap className="text-lg" />,
      scope: 'Dashboard Overview & Trip Dispatcher',
      desc: 'Orchestrates live transport dispatching. Assigns available vehicles/drivers to new trips, performs load check validations, and tracks the active trips lifecycle.',
      pages: ['Operations Dashboard', 'Trip Dispatcher'],
      color: 'from-blue-500 to-sky-600',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      credential: 'Raven.k@transitops.in'
    },
    'Safety Officer': {
      icon: <FiShield className="text-lg" />,
      scope: 'Drivers roster & Compliance validation',
      desc: 'Enforces driver licenses compliance. Audits driver profiles, monitors safety scores, and checks for expired/suspended licenses.',
      pages: ['Drivers & Safety Profiles', 'Compliance Panel'],
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      credential: 'safety@transitops.in'
    },
    'Financial Analyst': {
      icon: <FiPieChart className="text-lg" />,
      scope: 'Fuel logs, Toll expenses, & ROI reports',
      desc: 'Audits fuel purchases, toll tolls, and maintenance fees. Computes fleet fuel efficiency and calculates ROI on acquisition costs.',
      pages: ['Fuel & Expenses Ledger', 'Reports & Analytics'],
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      credential: 'analyst@transitops.in'
    }
  };

  const featuresList = [
    {
      title: 'Vehicle Registry',
      icon: <FiTruck className="text-2xl" />,
      desc: 'Maintain comprehensive vehicle specifications, unique registration keys, odometer logs, and real-time statuses.',
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      hoverGlow: 'hover:shadow-indigo-500/10'
    },
    {
      title: 'Driver Safety',
      icon: <FiShield className="text-2xl" />,
      desc: 'Verify licenses categories, audit expiry timelines, and track driver safety scores. Automatically flag expired records.',
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      hoverGlow: 'hover:shadow-emerald-500/10'
    },
    {
      title: 'Trip Dispatcher',
      icon: <FiMap className="text-2xl" />,
      desc: 'Assign available assets, validate load capacity, track live transit board progress, and trigger automated releases.',
      colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      hoverGlow: 'hover:shadow-blue-500/10'
    },
    {
      title: 'Dynamic Analytics',
      icon: <FiTrendingUp className="text-2xl" />,
      desc: 'Track fuel efficiencies, aggregate operational costs, monitor vehicle ROIs, render graphs, and export CSV reports.',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      hoverGlow: 'hover:shadow-amber-500/10'
    }
  ];

  const currentRole = roleInfo[activeRoleTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden relative">
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 z-0"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 z-50 px-6 sm:px-8 py-4 flex items-center justify-between max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <MdOutlineDashboardCustomize className="text-xl" />
          </div>
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
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
          className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <span>Launch Console</span>
          <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative px-6 sm:px-8 py-16 lg:py-28 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center z-10">
        
        {/* Decorative Light Blurs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

        {/* Left Typography Block */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-black uppercase text-amber-500 tracking-widest shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Platform Version 1.0 • Stable
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Smart Transport <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 drop-shadow-sm">
              Operations Platform
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl font-medium">
            TransitOps is a centralized, role-based cockpit that digitizes vehicle registry, driver compliance, active trip dispatching, and real-time operational costs in one unified workspace.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={onLaunch}
              className="group flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all hover:-translate-y-1 shadow-xl shadow-orange-500/20 cursor-pointer"
            >
              Sign In to Console
              <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features"
              className="flex items-center justify-center px-8 py-4 border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right Preview Graphic Block */}
        <div className="lg:col-span-6 relative flex justify-center w-full">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 p-2 sm:p-4 shadow-2xl shadow-black/50 max-w-[550px] w-full backdrop-blur-sm group">
            
            {/* Glossy Overlay banner image */}
            <img 
              src={landingBanner} 
              alt="TransitOps Network Banner" 
              className="rounded-xl w-full h-auto object-cover object-center shadow-lg transition-transform duration-700 group-hover:scale-[1.02]"
            />
            
            {/* Overlay Cards */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-2xl shadow-black/40 max-w-[220px] text-left hidden md:block transform transition hover:-translate-y-1 duration-300">
              <span className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                <FiTrendingUp /> Active Utilization
              </span>
              <p className="text-3xl font-black text-white mt-2">81%</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-snug">Peak active transit fleet en-route today.</p>
            </div>

            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-slate-900/95 backdrop-blur-xl border border-slate-800 p-4 rounded-xl shadow-2xl shadow-black/40 text-left hidden md:block transform transition hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">GJ01AB452</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 inline-block">
                VAN-05 ➔ Available
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Overview Grid Section */}
      <section id="features" className="relative bg-slate-900/50 border-y border-slate-800/50 px-6 sm:px-8 py-24 w-full scroll-mt-20 z-10 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto w-full space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-500 tracking-widest">
              <FiSettings /> Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">Unified Operations Management</h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8">
            {featuresList.map((feature, idx) => (
              <div 
                key={idx} 
                className={`group bg-slate-950/50 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 shadow-lg ${feature.hoverGlow} text-left space-y-4`}
              >
                <div className={`h-14 w-14 border rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${feature.colorClass}`}>
                  {feature.icon}
                </div>
                <h4 className="text-base font-black uppercase text-slate-100 tracking-wide">{feature.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Scopes & RBAC Showcase Section */}
      <section id="roles" className="relative px-6 sm:px-8 py-24 max-w-[1200px] mx-auto w-full scroll-mt-20 text-center space-y-12 z-10">
        <div className="space-y-4">
          <span className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-500 tracking-widest">
            <FiShield /> Role-Based Access Control
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">One Login, Four Scopes</h2>
          <div className="h-1.5 w-16 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto border-b border-slate-800 pb-6">
          {Object.keys(roleInfo).map((r, i) => {
            const isSelected = activeRoleTab === r;
            return (
              <button
                key={i}
                onClick={() => setActiveRoleTab(r)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-xl uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] transform scale-105' 
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {roleInfo[r].icon}
                {r}
              </button>
            )
          })}
        </div>

        {/* Tab Detail Card */}
        <div className="bg-slate-950/80 border border-slate-800 p-8 sm:p-10 rounded-2xl max-w-4xl mx-auto text-left shadow-2xl relative overflow-hidden backdrop-blur-md group hover:border-slate-700 transition-colors">
          {/* Accent border strip based on tab selection */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r transition-all duration-500 ${currentRole.color}`}></div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="space-y-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border ${currentRole.badgeColor}`}>
                {currentRole.icon} {activeRoleTab} View Scope
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                {currentRole.scope}
              </h3>
            </div>
            
            <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800/80 text-xs font-semibold text-slate-400 shrink-0 w-full sm:w-auto text-center sm:text-left">
              Demo Email: <span className="text-amber-400 block sm:inline mt-1 sm:mt-0 font-bold">{currentRole.credential}</span>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mt-6 font-medium max-w-3xl">
            {currentRole.desc}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiMap /> Accessible Workspace Modules:
            </h4>
            <div className="flex flex-wrap gap-3">
              {currentRole.pages.map((p, idx) => (
                <span key={idx} className="bg-slate-900 border border-slate-700/50 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stack Details Footer Section */}
      <footer id="tech" className="relative bg-slate-950 border-t border-slate-900/80 px-6 sm:px-8 py-12 w-full text-center z-10">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 font-black shadow-inner">
              <MdOutlineDashboardCustomize className="text-sm" />
            </div>
            <span>TransitOps Smart Transport Cockpit © 2026</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-1.5 hover:text-[#61DAFB] transition-colors" title="React"><FaReact /> <span className="hidden sm:inline text-[10px]">React</span></div>
            <div className="flex items-center gap-1.5 hover:text-[#646CFF] transition-colors" title="Vite"><SiVite /> <span className="hidden sm:inline text-[10px]">Vite</span></div>
            <div className="flex items-center gap-1.5 hover:text-[#38B2AC] transition-colors" title="Tailwind CSS"><SiTailwindcss /> <span className="hidden sm:inline text-[10px]">Tailwind</span></div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors" title="Prisma"><SiPrisma /> <span className="hidden sm:inline text-[10px]">Prisma</span></div>
          </div>
        </div>
      </footer>

    </div>
  );
}