import React, { useContext, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { AppContext } from '../context/AppContext';

export default function Fleet() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useContext(AppContext);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState('');

  // Individual field states
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState(500);
  const [odometer, setOdometer] = useState(0);
  const [acqCost, setAcqCost] = useState(0);
  const [status, setStatus] = useState('Available');
  const [region, setRegion] = useState('Gujarat');

  // Open modal for add
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setRegNo('');
    setName('');
    setType('Van');
    setCapacity(500);
    setOdometer(0);
    setAcqCost(0);
    setStatus('Available');
    setRegion('Gujarat');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (v) => {
    setIsEditMode(true);
    setRegNo(v.regNo);
    setName(v.name);
    setType(v.type);
    setCapacity(v.capacity);
    setOdometer(v.odometer);
    setAcqCost(v.acqCost);
    setStatus(v.status);
    setRegion(v.region || 'Gujarat');
    setFormError('');
    setIsModalOpen(true);
  };

  // Validate duplicate registration numbers in real-time
  const isDuplicateReg = !isEditMode && vehicles.some(
    v => v.regNo.trim().toUpperCase() === regNo.trim().toUpperCase()
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!regNo.trim() || !name.trim()) {
      setFormError('Registration Number and Name/Model are required fields.');
      return;
    }

    if (isEditMode) {
      updateVehicle(regNo, { name, type, capacity, odometer, acqCost, status, region });
      setIsModalOpen(false);
    } else {
      const res = addVehicle({ regNo, name, type, capacity, odometer, acqCost, status, region });
      if (res.success) {
        setIsModalOpen(false);
      } else {
        setFormError(res.error);
      }
    }
  };

  const handleDelete = (reg) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${reg}?`)) {
      deleteVehicle(reg);
    }
  };

  // Get filter lists dynamically
  const uniqueTypes = ['All', ...new Set(vehicles.map(v => v.type))];
  const uniqueStatuses = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.regNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm relative">
      {/* Top Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-slate-400">Type</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded px-3 py-1.5 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer"
            >
              {uniqueTypes.map((t, idx) => <option key={idx} value={t}>Type: {t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-slate-400">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded px-3 py-1.5 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer"
            >
              {uniqueStatuses.map((s, idx) => <option key={idx} value={s}>Status: {s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-slate-400">Search</label>
            <input 
              type="text" 
              placeholder="Search reg. no or model..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded px-3 py-1.5 outline-none font-normal normal-case w-56 focus:ring-1 focus:ring-amber-500 bg-slate-50" 
            />
          </div>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="self-end bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs tracking-wide uppercase transition shadow-sm cursor-pointer"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Reg. No. (Unique)</th>
              <th className="px-4 py-3">Name/Model</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Max Load</th>
              <th className="px-4 py-3">Odometer</th>
              <th className="px-4 py-3">Acq. Cost (INR)</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-lg">
                  No vehicles found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-950 font-bold tracking-wider">{v.regNo}</td>
                  <td className="px-4 py-3.5">{v.name}</td>
                  <td className="px-4 py-3.5">{v.type}</td>
                  <td className="px-4 py-3.5">{v.capacity >= 1000 ? `${v.capacity / 1000} Ton` : `${v.capacity} kg`}</td>
                  <td className="px-4 py-3.5">{Number(v.odometer).toLocaleString()} km</td>
                  <td className="px-4 py-3.5">₹{Number(v.acqCost).toLocaleString()}</td>
                  <td className="px-4 py-3.5">{v.region || 'Gujarat'}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={v.status}/>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(v)}
                      className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition shadow-sm cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(v.regNo)}
                      className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition shadow-sm cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rule Notification Footnote */}
      <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
        Rule: Registration No. must be unique • Retired/In Shop vehicles are automatically hidden from Trip Dispatcher selections.
      </div>

      {/* Create / Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-md shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              {isEditMode ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 rounded-lg">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Reg Number</label>
                  <input 
                    type="text" 
                    placeholder="GJ01AB123"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    disabled={isEditMode}
                    className={`w-full mt-1 px-3 py-1.5 text-xs border rounded-lg outline-none font-semibold ${isEditMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                  {isDuplicateReg && (
                    <span className="text-[9px] text-rose-600 font-bold block mt-1">❌ Already exists!</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Model / Name</label>
                  <input 
                    type="text" 
                    placeholder="VAN-05"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                    <option value="Heavy Trailer">Heavy Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Max Load Capacity (kg)</label>
                  <input 
                    type="number" 
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Odometer (km)</label>
                  <input 
                    type="number" 
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Acquisition Cost (INR)</label>
                  <input 
                    type="number" 
                    value={acqCost}
                    onChange={(e) => setAcqCost(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Region</label>
                  <input 
                    type="text" 
                    placeholder="Gujarat"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isDuplicateReg}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-950 transition cursor-pointer ${isDuplicateReg ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-amber-500 hover:bg-amber-600 shadow-sm'}`}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}