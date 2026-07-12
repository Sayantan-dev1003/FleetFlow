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

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm">
      {/* Top Flex Logs Header Block */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Driver Management</h3>
          <input 
            type="text" 
            placeholder="Search driver or license..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-normal text-xs normal-case w-56 focus:ring-1 focus:ring-amber-500 bg-slate-50" 
          />
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition shadow-sm cursor-pointer"
        >
          + Add Driver
        </button>
      </div>

      {/* Main Roster List */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Driver Name</th>
              <th className="px-4 py-3">License No</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Expiry Date</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Trips Compl.</th>
              <th className="px-4 py-3">Safety Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-lg">
                  No drivers found.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((d, idx) => {
                const isExpired = d.expiry < todayStr;
                return (
                  <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isExpired ? 'bg-rose-50/40 text-rose-950' : ''}`}>
                    <td className="px-4 py-3.5 font-bold text-slate-950">{d.name}</td>
                    <td className="px-4 py-3.5 tracking-wider">{d.licenseNo}</td>
                    <td className="px-4 py-3.5">{d.category}</td>
                    <td className={`px-4 py-3.5 ${isExpired ? 'text-rose-600 font-black animate-pulse' : ''}`}>
                      {d.expiry} {isExpired && ' (EXPIRED)'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-normal">{d.contact}</td>
                    <td className="px-4 py-3.5">{d.tripsCompleted}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-1.5 py-0.5 rounded font-black ${d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50' : d.safetyScore >= 80 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'}`}>
                        {d.safetyScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={d.status}/>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(d)}
                        className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition shadow-sm cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(d.licenseNo)}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition shadow-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Helper Toggle Switch Grid Mock */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Quick Filters (Click to Toggle Status Filters)
        </span>
        <div className="flex flex-wrap gap-2.5">
          <span 
            onClick={() => handleFilterToggle('Available')}
            className={`px-3 py-1 text-xs font-bold rounded shadow-sm border transition-all cursor-pointer ${
              selectedStatusFilter === 'Available' 
                ? 'bg-emerald-600 text-white border-emerald-700 scale-105' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-emerald-700'
            }`}
          >
            Available
          </span>
          <span 
            onClick={() => handleFilterToggle('On Trip')}
            className={`px-3 py-1 text-xs font-bold rounded shadow-sm border transition-all cursor-pointer ${
              selectedStatusFilter === 'On Trip' 
                ? 'bg-blue-600 text-white border-blue-700 scale-105' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-blue-700'
            }`}
          >
            On Trip
          </span>
          <span 
            onClick={() => handleFilterToggle('Off Duty')}
            className={`px-3 py-1 text-xs font-bold rounded shadow-sm border transition-all cursor-pointer ${
              selectedStatusFilter === 'Off Duty' 
                ? 'bg-slate-600 text-white border-slate-700 scale-105' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            Off Duty
          </span>
          <span 
            onClick={() => handleFilterToggle('Suspended')}
            className={`px-3 py-1 text-xs font-bold rounded shadow-sm border transition-all cursor-pointer ${
              selectedStatusFilter === 'Suspended' 
                ? 'bg-rose-600 text-white border-rose-700 scale-105' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-rose-700'
            }`}
          >
            Suspended
          </span>
          {selectedStatusFilter !== 'All' && (
            <span 
              onClick={() => setSelectedStatusFilter('All')}
              className="px-3 py-1 text-xs font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 cursor-pointer transition-all"
            >
              Clear Filter [x]
            </span>
          )}
        </div>
        <p className="text-[11px] text-rose-700 font-semibold bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
          Rule: Expired license or Suspended status ➔ blocked from trip assignment. A driver already marked "On Trip" cannot be assigned to another trip.
        </p>
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl border border-slate-200 w-full max-w-md shadow-2xl text-left">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              {isEditMode ? 'Edit Driver Profile' : 'Register New Driver'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 rounded-lg">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Driver Name</label>
                  <input 
                    type="text" 
                    placeholder="Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">License Number</label>
                  <input 
                    type="text" 
                    placeholder="DL-88213"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    disabled={isEditMode}
                    className={`w-full mt-1.5 px-3 py-1.5 text-xs border rounded-lg outline-none font-semibold ${isEditMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                  {isDuplicateLicense && (
                    <span className="text-[9px] text-rose-600 font-bold block mt-1">❌ Already exists!</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="LMV">LMV (Light Vehicle)</option>
                    <option value="HMV">HMV (Heavy Vehicle)</option>
                    <option value="Two Wheeler">Two Wheeler</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input 
                    type="date" 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                  {expiry && expiry < todayStr && (
                    <span className="text-[9px] text-rose-600 font-bold block mt-1">⚠️ This license is expired!</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Number</label>
                  <input 
                    type="text" 
                    placeholder="98765xxxxx"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Safety Score (%)</label>
                  <input 
                    type="number" 
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(Number(e.target.value))}
                    max="100"
                    min="0"
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Trips Completed</label>
                  <input 
                    type="number" 
                    value={tripsCompleted}
                    onChange={(e) => setTripsCompleted(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border bg-slate-50 border-slate-200 rounded-lg outline-none font-semibold focus:ring-1 focus:ring-amber-500"
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