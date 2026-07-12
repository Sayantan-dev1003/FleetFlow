import React from 'react';

export default function Analytics() {
  // Mockup 7 ke upper analytical elements
  const metrics = [
    { label: "Fuel Efficiency", val: "8.4 km/l", col: "border-blue-500" },
    { label: "Fleet Utilization", val: "81%", col: "border-emerald-500" },
    { label: "Operational Cost", val: "34,070", col: "border-amber-500" },
    { label: "Vehicle ROI", val: "14.2%", col: "border-green-500" },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Upper Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className={`bg-white p-5 rounded-xl border-l-4 border border-slate-200 shadow-sm ${m.col}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{m.val}</p>
          </div>
        ))}
      </div>
      
      {/* Formula Footnote from Mockup */}
      <p className="text-[10px] text-slate-400 font-medium italic -mt-4 pl-1">
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </p>

      {/* Charts Layout Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Left Column: Simulated Monthly Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Monthly Revenue</h3>
          
          <div className="flex items-end justify-between h-48 pt-4 px-4 border-b border-l border-slate-100">
            {/* Simulated columns via simple height percentages */}
            <div className="w-10 bg-blue-500/90 rounded-t h-[40%] transition-all hover:bg-blue-600"></div>
            <div className="w-10 bg-blue-500/90 rounded-t h-[55%] transition-all hover:bg-blue-600"></div>
            <div className="w-10 bg-blue-500/90 rounded-t h-[48%] transition-all hover:bg-blue-600"></div>
            <div className="w-10 bg-blue-500/90 rounded-t h-[75%] transition-all hover:bg-blue-600"></div>
            <div className="w-10 bg-blue-500/90 rounded-t h-[62%] transition-all hover:bg-blue-600"></div>
            <div className="w-10 bg-blue-500/90 rounded-t h-[88%] transition-all hover:bg-blue-600"></div>
            <div className="w-10 bg-blue-500/90 rounded-t h-[80%] transition-all hover:bg-blue-600"></div>
          </div>
          
          {/* Chart timeline labels */}
          <div className="flex justify-between px-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
          </div>
        </div>

        {/* Right Column: Top Costliest Vehicles Horizontal Bars */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Top Costliest Vehicles</h3>
          
          <div className="space-y-5 text-xs font-bold text-slate-600">
            {/* Truck Metrics Row */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-800">TRUCK-11</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full">
                <div className="bg-red-500 h-2.5 rounded-full transition-all" style={{ width: '90%' }}></div>
              </div>
            </div>

            {/* Mini Truck Metrics Row */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-800">MINI-03</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full">
                <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: '65%' }}></div>
              </div>
            </div>

            {/* Van Metrics Row */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-800">VAN-05</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}