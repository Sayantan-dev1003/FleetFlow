import React, { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
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
    setIsModalOpen(true);
  };

  // Validate duplicate registration numbers in real-time
  const isDuplicateReg = !isEditMode && vehicles.some(
    v => v.regNo.trim().toUpperCase() === regNo.trim().toUpperCase()
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!regNo.trim() || !name.trim()) {
      toast.error('Registration Number and Name/Model are required fields.');
      return;
    }

    if (isEditMode) {
      updateVehicle(regNo, { name, type, capacity, odometer, acqCost, status, region });
      toast.success('Vehicle updated successfully');
      setIsModalOpen(false);
    } else {
      const res = addVehicle({ regNo, name, type, capacity, odometer, acqCost, status, region });
      if (res.success) {
        toast.success('Vehicle added successfully');
        setIsModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to add vehicle');
      }
    }
  };

  const handleDelete = (reg) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${reg}?`)) {
      deleteVehicle(reg);
      toast.success('Vehicle deleted successfully');
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
    <div className="space-y-6 animate-fadeIn">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Filter Type</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer shadow-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            >
              {uniqueTypes.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Filter Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none text-slate-700 font-semibold cursor-pointer shadow-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            >
              {uniqueStatuses.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Search Fleet</label>
            <input 
              type="text" 
              placeholder="Search registration or model..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-normal normal-case w-64 focus:ring-1 focus:ring-amber-500 bg-slate-50 shadow-xs" 
            />
          </div>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="self-end bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-5 py-2.5 rounded-lg font-black text-xs tracking-wider uppercase transition shadow hover:scale-102 cursor-pointer"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Fleet Cards Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white py-16 text-center text-slate-400 font-bold text-sm border-2 border-dashed border-slate-200 rounded-xl shadow-xs">
          No vehicles registered matching current search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((v, idx) => {
            // Odometer baseline calculation for simple indicator progress bar (max baseline 200k km)
            const odometerPct = Math.min((v.odometer / 200000) * 100, 100);
            
            return (
              <div 
                key={idx} 
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Visual Accent Glow on Hover */}
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div>
                  {/* Top Row: Name and Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide truncate max-w-[160px]">{v.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{v.type}</p>
                    </div>
                    <StatusBadge status={v.status}/>
                  </div>

                  {/* Middle License Plate and Cost */}
                  <div className="flex items-center justify-between mt-4">
                    {/* License Plate Widget */}
                    <div className="px-2.5 py-1 border border-slate-300 bg-amber-100/60 text-slate-800 text-[10px] font-black uppercase rounded tracking-wider shadow-xs select-none">
                      🇮🇳 {v.regNo}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Acquisition Cost</p>
                      <p className="text-xs font-black text-slate-700">₹{Number(v.acqCost).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Odometer Tracker progress bar */}
                  <div className="mt-5 space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-black uppercase tracking-wider">
                      <span>Odometer Log</span>
                      <span className="text-slate-600">{Number(v.odometer).toLocaleString()} km</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${odometerPct}%` }}></div>
                    </div>
                  </div>

                  {/* Details grid list */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                    <div>
                      <span className="text-slate-400">Depot Region:</span> {v.region || 'Gujarat'}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Max Payload:</span> {v.capacity >= 1000 ? `${v.capacity / 1000} Ton` : `${v.capacity} kg`}
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100/60">
                  <button 
                    onClick={() => handleOpenEdit(v)}
                    className="px-3 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition shadow-xs cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(v.regNo)}
                    className="px-3 py-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition shadow-xs cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100/80 p-3 rounded-lg flex items-center gap-2">
        <span>💡</span>
        <span>Registration keys are database unique. "In Shop" and "Retired" vehicles are automatically filtered from the Dispatch ledger.</span>
      </div>

      {/* Create / Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-md shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              {isEditMode ? 'Edit Vehicle Profile' : 'Register New Vehicle'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Reg Number</label>
                  <input 
                    type="text" 
                    placeholder="GJ01AB123"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    disabled={isEditMode}
                    className={`w-full mt-1.5 px-3 py-2 text-xs border rounded-lg outline-none font-semibold ${isEditMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                  {isDuplicateReg && (
                    <span className="text-[9px] text-rose-600 font-bold block mt-1">❌ Already exists!</span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Model / Name</label>
                  <input 
                    type="text" 
                    placeholder="Tata Prima"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                    <option value="Heavy Trailer">Heavy Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Max Load (kg)</label>
                  <input 
                    type="number" 
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Odometer (km)</label>
                  <input 
                    type="number" 
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Acq. Cost (INR)</label>
                  <input 
                    type="number" 
                    value={acqCost}
                    onChange={(e) => setAcqCost(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Region</label>
                  <input 
                    type="text" 
                    placeholder="Gujarat"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer"
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