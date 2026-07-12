import React, { useContext, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { AppContext } from '../context/AppContext';

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useContext(AppContext);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState('');

  // Individual fields
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [category, setCategory] = useState('LMV');
  const [expiry, setExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [tripsCompleted, setTripsCompleted] = useState(0);
  const [safetyScore, setSafetyScore] = useState(100);
  const [status, setStatus] = useState('Available');

  // Today's date string for license validation
  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setName('');
    setLicenseNo('');
    setCategory('LMV');
    setExpiry(new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]); // 1 year from now default
    setContact('');
    setTripsCompleted(0);
    setSafetyScore(100);
    setStatus('Available');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setIsEditMode(true);
    setName(d.name);
    setLicenseNo(d.licenseNo);
    setCategory(d.category);
    setExpiry(d.expiry);
    setContact(d.contact);
    setTripsCompleted(d.tripsCompleted);
    setSafetyScore(d.safetyScore);
    setStatus(d.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const isDuplicateLicense = !isEditMode && drivers.some(
    d => d.licenseNo.trim().toUpperCase() === licenseNo.trim().toUpperCase()
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !licenseNo.trim() || !expiry.trim()) {
      setFormError('Name, License Number, and Expiry Date are required.');
      return;
    }

    if (isEditMode) {
      updateDriver(licenseNo, { name, category, expiry, contact, tripsCompleted, safetyScore, status });
      setIsModalOpen(false);
    } else {
      const res = addDriver({ name, licenseNo, category, expiry, contact, tripsCompleted, safetyScore, status });
      if (res.success) {
        setIsModalOpen(false);
      } else {
        setFormError(res.error);
      }
    }
  };

  const handleDelete = (license) => {
    if (window.confirm(`Are you sure you want to delete driver with license ${license}?`)) {
      deleteDriver(license);
    }
  };

  const handleFilterToggle = (statusVal) => {
    if (selectedStatusFilter === statusVal) {
      setSelectedStatusFilter('All'); // toggle off
    } else {
      setSelectedStatusFilter(statusVal);
    }
  };

  // Filter drivers list
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'All' || d.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to extract initials for driver avatar
  const getInitials = (n) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  // Helper function to choose random avatar background colors based on name hashes
  const getAvatarBg = (n) => {
    const code = n.charCodeAt(0) % 4;
    if (code === 0) return 'bg-indigo-500 text-indigo-50';
    if (code === 1) return 'bg-purple-500 text-purple-50';
    if (code === 2) return 'bg-emerald-500 text-emerald-50';
    return 'bg-amber-500 text-amber-950';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controller Ribbon */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Search Driver Roster</label>
            <input 
              type="text" 
              placeholder="Search name or license number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-normal text-xs normal-case w-64 focus:ring-1 focus:ring-amber-500 bg-slate-50 shadow-xs" 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Roster Filters</label>
            <div className="flex gap-2">
              {['Available', 'On Trip', 'Off Duty', 'Suspended'].map((statusOption) => (
                <span 
                  key={statusOption}
                  onClick={() => handleFilterToggle(statusOption)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none ${
                    selectedStatusFilter === statusOption 
                      ? 'bg-slate-900 text-white border-slate-950 scale-102 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {statusOption}
                </span>
              ))}
              {selectedStatusFilter !== 'All' && (
                <span 
                  onClick={() => setSelectedStatusFilter('All')}
                  className="px-2 py-1.5 text-[10px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer self-center"
                >
                  Reset
                </span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="self-end bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 px-5 py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition shadow hover:scale-102 cursor-pointer"
        >
          + Add Driver
        </button>
      </div>

      {/* Roster Cards Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white py-16 text-center text-slate-400 font-bold text-sm border-2 border-dashed border-slate-200 rounded-xl shadow-xs animate-pulse">
          No driver profiles found matching search constraints.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((d, idx) => {
            const isExpired = d.expiry < todayStr;
            const daysLeft = Math.ceil((new Date(d.expiry) - new Date()) / (24*60*60*1000));
            const isClosingExpiry = !isExpired && daysLeft <= 30;

            return (
              <div 
                key={idx} 
                className={`bg-white p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between relative shadow-sm hover:shadow-md hover:scale-[1.01] group ${
                  isExpired ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
                }`}
              >
                {/* Accent bar indicating license validation statuses */}
                <div className={`absolute top-0 left-0 w-2.5 h-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  isExpired ? 'bg-rose-500' : isClosingExpiry ? 'bg-amber-500' : 'bg-gradient-to-b from-amber-400 to-orange-500'
                }`}></div>

                <div>
                  {/* Top Avatar Row */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      {/* Round Avatar Widget with initials */}
                      <div className={`h-11 w-11 rounded-full flex items-center justify-center font-black text-xs shadow-inner uppercase tracking-wider relative shrink-0 ${getAvatarBg(d.name)}`}>
                        {getInitials(d.name)}
                        {/* Status Indicator Dot positioned on bottom-right of avatar */}
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white animate-pulse ${
                          d.status === 'Available' ? 'bg-emerald-500' :
                          d.status === 'On Trip' ? 'bg-sky-500' :
                          d.status === 'Off Duty' ? 'bg-slate-400' : 'bg-rose-500'
                        }`}></span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm truncate max-w-[150px]">{d.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Category: {d.category}</p>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  {/* License Info and Contact details */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100/60 text-[10px] font-bold text-slate-500">
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px] tracking-wider">License Key</span>
                      <span className="text-slate-700 tracking-wider">{d.licenseNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px] tracking-wider">Contact Number</span>
                      <span className="text-slate-700">{d.contact || 'None'}</span>
                    </div>
                  </div>

                  {/* Expiry Auditing Warning Ribbon */}
                  <div className="mt-4">
                    <span className="text-slate-400 block uppercase text-[9px] tracking-wider font-bold">License Expiry</span>
                    {isExpired ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-100 text-rose-700 font-black text-[9px] uppercase tracking-wide border border-rose-200 mt-1 animate-pulse">
                        ⚠️ EXPIRED LICENSES (BLOCKED DISPATCH)
                      </span>
                    ) : isClosingExpiry ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 text-amber-700 font-black text-[9px] uppercase tracking-wide border border-amber-200 mt-1">
                        ⚠️ Expiry within {daysLeft} days
                      </span>
                    ) : (
                      <span className="text-xs font-black text-slate-700 mt-0.5 block">{d.expiry}</span>
                    )}
                  </div>

                  {/* Safety score details and trips logged metrics */}
                  <div className="mt-4 pt-4 border-t border-slate-100/60 grid grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-slate-400 block uppercase text-[9px] tracking-wider font-bold">Safety Index</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50' : 
                          d.safetyScore >= 80 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                        }`}>
                          {d.safetyScore}%
                        </span>
                        {/* Mini progress bar */}
                        <div className="flex-1 bg-slate-100 rounded-full h-1 overflow-hidden">
                          <div className={`h-full rounded-full ${
                            d.safetyScore >= 90 ? 'bg-emerald-500' : 
                            d.safetyScore >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} style={{ width: `${d.safetyScore}%` }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-slate-400 block uppercase text-[9px] tracking-wider font-bold">Total Dispatches</span>
                      <span className="text-xs font-black text-slate-700 mt-1 block">{d.tripsCompleted} completed</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100/60">
                  <button 
                    onClick={() => handleOpenEdit(d)}
                    className="px-3 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition shadow-xs cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => handleDelete(d.licenseNo)}
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

      {/* Helper Warning */}
      <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-2">
        <span>⚠️</span>
        <span>Driver license compliance validation is active. Drivers with expired licenses are dynamically flagged in red and blocked from new trip dispatches.</span>
      </div>

      {/* Create / Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-md shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              {isEditMode ? 'Edit Driver Profile' : 'Register New Driver'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 rounded-lg">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Driver Name</label>
                  <input 
                    type="text" 
                    placeholder="Rajesh Kumar"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">License Number</label>
                  <input 
                    type="text" 
                    placeholder="MH-01-2024-0012"
                    value={licenseNo} 
                    onChange={(e) => setLicenseNo(e.target.value)} 
                    disabled={isEditMode}
                    className={`w-full mt-1.5 px-3 py-2 text-xs border rounded-lg outline-none font-semibold ${isEditMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                  {isDuplicateLicense && (
                    <span className="text-[9px] text-rose-600 font-bold block mt-1">❌ License number exists!</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">License Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="LMV">LMV (Light Motor)</option>
                    <option value="HMV">HMV (Heavy Motor)</option>
                    <option value="TRANS">TRANS (Transport Heavy)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">License Expiry Date</label>
                  <input 
                    type="date" 
                    value={expiry} 
                    onChange={(e) => setExpiry(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contact Number</label>
                  <input 
                    type="text" 
                    placeholder="9876543210"
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Safety Index Score (%)</label>
                  <input 
                    type="number" 
                    value={safetyScore} 
                    onChange={(e) => setSafetyScore(Number(e.target.value))} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Trips Completed</label>
                  <input 
                    type="number" 
                    value={tripsCompleted} 
                    onChange={(e) => setTripsCompleted(Number(e.target.value))} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="w-full mt-1.5 px-3 py-2 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
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
                  disabled={isDuplicateLicense}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-950 transition cursor-pointer ${isDuplicateLicense ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-amber-500 hover:bg-amber-600 shadow-sm'}`}
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