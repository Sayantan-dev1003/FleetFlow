import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Analytics() {
  const { vehicles, trips, fuelLogs, maintenanceLogs, expenses } = useContext(AppContext);

  // Compute completed trips metrics
  const completedTrips = trips.filter(t => t.status === 'Completed');
  
  // 1. Fuel Efficiency = Total completed distance / Total liters logged
  const totalCompletedDistance = completedTrips.reduce((acc, curr) => acc + Number(curr.plannedDistance || 0), 0);
  const totalFuelLiters = fuelLogs.reduce((acc, curr) => acc + Number(curr.liters || 0), 0);
  const fuelEfficiency = totalFuelLiters > 0 
    ? (totalCompletedDistance / totalFuelLiters).toFixed(1) 
    : "0.0";

  // 2. Fleet Utilization = On Trip vehicles / Active vehicles
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');
  const onTripVehicles = activeVehicles.filter(v => v.status === 'On Trip');
  const fleetUtilization = activeVehicles.length > 0 
    ? Math.round((onTripVehicles.length / activeVehicles.length) * 100) 
    : 0;

  // 3. Operational Cost = Fuel cost sum + Expenses cost sum + Maintenance logs sum
  const totalFuelCost = fuelLogs.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const totalMaintCost = maintenanceLogs.reduce((acc, curr) => acc + Number(curr.cost || 0), 0);
  const totalExpensesCost = expenses.reduce((acc, curr) => acc + Number(curr.toll || 0) + Number(curr.other || 0), 0);
  const totalOperationalCost = totalFuelCost + totalMaintCost + totalExpensesCost;

  // 4. Vehicle ROI = (Revenue - (Maintenance + Fuel + Expenses)) / Acquisition Cost
  const totalRevenue = trips
    .filter(t => t.status === 'Completed' || t.status === 'Dispatched')
    .reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
  const totalAcquisitionCost = vehicles.reduce((acc, curr) => acc + Number(curr.acqCost || 0), 0);
  const vehicleRoi = totalAcquisitionCost > 0 
    ? ((totalRevenue - totalOperationalCost) / totalAcquisitionCost * 100).toFixed(1)
    : "0.0";

  const metrics = [
    { label: "Fuel Efficiency", val: `${fuelEfficiency} km/l`, col: "border-blue-500", desc: "Completed distance / Fuel liters" },
    { label: "Fleet Utilization", val: `${fleetUtilization}%`, col: "border-emerald-500", desc: "On-trip active vehicles ratio" },
    { label: "Operational Cost", val: `₹${totalOperationalCost.toLocaleString()}`, col: "border-amber-500", desc: "Fuel + Maint + Tolls + Misc" },
    { label: "Vehicle ROI", val: `${vehicleRoi}%`, col: "border-green-500", desc: "(Revenue - Ops Cost) / Acq Cost" },
  ];

  // Dynamic Chart 1: Monthly Revenue
  // We can group trip revenues by month. 
  // Let's assume some historical values for Jan-Jun, and calculate July from real-time trips.
  const julyTripRevenue = trips
    .filter(t => t.status === 'Completed' || t.status === 'Dispatched')
    .reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 58000 },
    { month: 'Mar', revenue: 52000 },
    { month: 'Apr', revenue: 78000 },
    { month: 'May', revenue: 65000 },
    { month: 'Jun', revenue: 84000 },
    { month: 'Jul', revenue: julyTripRevenue }
  ];

  const maxRevenue = Math.max(...monthlyRevenueData.map(d => d.revenue), 1);

  // Dynamic Chart 2: Costliest Vehicles horizontal bar chart
  // Group costs by vehicle regNo
  const vehicleCostList = vehicles.map(v => {
    const vFuel = fuelLogs.filter(f => f.vehicleRegNo === v.regNo).reduce((acc, c) => acc + Number(c.cost || 0), 0);
    const vMaint = maintenanceLogs.filter(m => m.vehicleRegNo === v.regNo).reduce((acc, c) => acc + Number(c.cost || 0), 0);
    const vExp = expenses.filter(e => e.vehicleRegNo === v.regNo).reduce((acc, c) => acc + Number(c.toll || 0) + Number(c.other || 0), 0);
    return {
      regNo: v.regNo,
      name: v.name,
      totalCost: vFuel + vMaint + vExp
    };
  }).sort((a, b) => b.totalCost - a.totalCost);

  const maxVehicleCost = vehicleCostList.length > 0 ? vehicleCostList[0].totalCost : 1;

  // Export CSV function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Section 1: Fleet Inventory Report
    csvContent += "=== FLEET INVENTORY REPORT ===\n";
    csvContent += "Registration Number,Name/Model,Type,Capacity (kg),Odometer (km),Acquisition Cost (INR),Status,Region\n";
    vehicles.forEach(v => {
      csvContent += `${v.regNo},${v.name},${v.type},${v.capacity},${v.odometer},${v.acqCost},${v.status},${v.region || 'N/A'}\n`;
    });

    csvContent += "\n";

    // Section 2: Operational Cost Report
    csvContent += "=== VEHICLE OPERATIONAL COST REPORT ===\n";
    csvContent += "Vehicle Reg No,Model,Total Operational Cost (INR)\n";
    vehicleCostList.forEach(vc => {
      csvContent += `${vc.regNo},${vc.name},${vc.totalCost}\n`;
    });

    csvContent += "\n";

    // Section 3: Summary Metrics
    csvContent += "=== ANALYTICAL PERFORMANCE SUMMARY ===\n";
    csvContent += `Metric,Value\n`;
    csvContent += `Fuel Efficiency,${fuelEfficiency} km/l\n`;
    csvContent += `Fleet Utilization,${fleetUtilization}%\n`;
    csvContent += `Total Operational Cost,₹${totalOperationalCost}\n`;
    csvContent += `Total Fleet Revenue,₹${totalRevenue}\n`;
    csvContent += `Aggregate Return on Investment (ROI),${vehicleRoi}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header Block with CSV Export Button */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">Reports & Analytics Dashboard</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time dynamic fleet performance metrics</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer"
        >
          🗎 Export Fleet Report (CSV)
        </button>
      </div>

      {/* 4 Upper Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className={`bg-white p-5 rounded-xl border-l-4 border border-slate-200 shadow-sm ${m.col} hover:shadow-md transition-all`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{m.val}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-medium">{m.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Formula Footnote from Mockup */}
      <p className="text-[10px] text-slate-400 font-semibold italic -mt-4 pl-1">
        Formula ROI Calculation Model: ROI = (Revenue - (Maintenance + Fuel + Operational Expenses)) / Acquisition Cost
      </p>

      {/* Charts Layout Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Left Column: Simulated Monthly Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">Monthly Generated Revenue (INR)</h3>
            
            <div className="flex items-end justify-between h-56 pt-4 px-4 border-b border-l border-slate-100">
              {monthlyRevenueData.map((d, i) => {
                const heightPct = Math.max(Math.round((d.revenue / maxRevenue) * 100), 5); // min 5% for visibility
                return (
                  <div key={i} className="flex flex-col items-center group relative w-12">
                    {/* Hover Tooltip tooltip */}
                    <span className="absolute -top-8 bg-slate-900 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition duration-150 z-10">
                      ₹{d.revenue.toLocaleString()}
                    </span>
                    <div 
                      className="w-10 bg-indigo-600 rounded-t transition-all duration-700 hover:bg-indigo-700 shadow-sm"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            {/* Chart timeline labels */}
            <div className="flex justify-between px-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {monthlyRevenueData.map((d, i) => <span key={i} className="w-12 text-center">{d.month}</span>)}
            </div>
          </div>
          
          <div className="text-[9px] text-slate-400 font-medium italic mt-4 text-center">
            * July revenue aggregates active and completed trips dynamically.
          </div>
        </div>

        {/* Right Column: Top Costliest Vehicles Horizontal Bars */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">Top Costliest Operational Vehicles</h3>
            
            {vehicleCostList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-100 rounded-lg">
                No cost metrics registered.
              </div>
            ) : (
              <div className="space-y-5 text-xs font-bold text-slate-600">
                {vehicleCostList.slice(0, 5).map((vc, idx) => {
                  const widthPct = maxVehicleCost > 0 ? Math.round((vc.totalCost / maxVehicleCost) * 100) : 0;
                  const colors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500', 'bg-slate-500'];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-1.5 font-bold">
                        <span className="text-slate-800">{vc.name} ({vc.regNo})</span>
                        <span className="text-slate-950 font-black">₹{vc.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/40">
                        <div 
                          className={`${barColor} h-3 rounded-full transition-all duration-700 shadow-sm`} 
                          style={{ width: `${widthPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-400 font-medium italic mt-6 border-t border-slate-100 pt-3 text-center">
            Expenses represent combined fuel receipts, tolls, and maintenance logs.
          </div>
        </div>

      </div>
    </div>
  );
}