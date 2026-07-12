import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
    { label: "Fuel Efficiency", val: `${fuelEfficiency} km/l`, col: "border-blue-500 bg-gradient-to-br from-blue-50/50 to-white text-blue-900", desc: "Completed distance / Fuel liters" },
    { label: "Fleet Utilization", val: `${fleetUtilization}%`, col: "border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white text-emerald-900", desc: "On-trip active vehicles ratio" },
    { label: "Operational Cost", val: `₹${totalOperationalCost.toLocaleString()}`, col: "border-amber-500 bg-gradient-to-br from-amber-50/50 to-white text-amber-900", desc: "Fuel + Maint + Tolls + Misc" },
    { label: "Vehicle ROI", val: `${vehicleRoi}%`, col: "border-teal-500 bg-gradient-to-br from-teal-50/50 to-white text-teal-900", desc: "(Revenue - Ops Cost) / Acq Cost" },
  ];

  // Dynamic Chart 1: Monthly Revenue
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

  // Dynamic Chart 2: Costliest Vehicles horizontal bar chart
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
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Export Action Strip */}
      <div className="flex justify-end border-b border-slate-200/60 pb-4">
        <button 
          onClick={handleExportCSV}
          className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-5 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition shadow hover:scale-102 cursor-pointer"
        >
          🗎 Export Fleet Report (CSV)
        </button>
      </div>

      {/* 4 Upper Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className={`p-5 rounded-xl border-l-4 border border-slate-200/60 shadow-sm ${m.col} hover:scale-[1.03] hover:shadow-md transition-all duration-300`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{m.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{m.val}</p>
            <p className="text-[9px] text-slate-400 mt-2 font-semibold">{m.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Formula Footnote from Mockup */}
      <p className="text-[10px] text-slate-400 font-bold italic -mt-4 pl-1">
        Formula ROI Calculation Model: ROI = (Revenue - (Maintenance + Fuel + Operational Expenses)) / Acquisition Cost
      </p>

      {/* Charts Layout Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* Left Column: Simulated Monthly Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">Monthly Generated Revenue (INR)</h3>
            <div className="h-64 w-full mt-4 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="text-[9px] text-slate-400 font-bold italic mt-4 text-center">
            * July revenue aggregates active and completed trips dynamically.
          </div>
        </div>

        {/* Right Column: Top Costliest Vehicles Horizontal Bars */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">Top Costliest Operational Vehicles</h3>
            
            {vehicleCostList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs border border-dashed border-slate-100 rounded-lg">
                No cost metrics registered.
              </div>
            ) : (
              <div className="h-64 w-full -ml-8 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vehicleCostList.slice(0, 5)} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Operational Cost']} />
                    <Bar dataKey="totalCost" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-400 font-bold italic mt-6 border-t border-slate-100 pt-3 text-center">
            Expenses represent combined fuel receipts, tolls, and maintenance logs.
          </div>
        </div>

      </div>
    </div>
  );
}