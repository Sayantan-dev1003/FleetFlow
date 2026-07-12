import React, { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { AppContext } from '../context/AppContext';
import { 
  FiSearch, FiFilter, FiPlus, FiGrid, FiList, 
  FiEdit2, FiTrash2, FiAlertTriangle, FiCheckCircle,
  FiPhone, FiShield, FiMap, FiClock
} from 'react-icons/fi';

export default function Drivers() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useContext(AppContext);

  // UI & View States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
    setIsModalOpen(true);
  };

  const isDuplicateLicense = !isEditMode && licenseNo.trim() !== '' && drivers.some(
    d => d.licenseNo.trim().toUpperCase() === licenseNo.trim().toUpperCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !licenseNo.trim() || !expiry.trim()) {
      toast.error('Name, License Number, and Expiry Date are required.');
      return;
    }

    if (isEditMode) {
      const res = await updateDriver(licenseNo, { name, category, expiry, contact, tripsCompleted, safetyScore, status });
      if (res.success) {
        toast.success('Driver updated successfully');
        setIsModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to update driver');
      }
    } else {
      const res = await addDriver({ name, licenseNo, category, expiry, contact, tripsCompleted, safetyScore, status });
      if (res.success) {
        toast.success('Driver added successfully');
        setIsModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to add driver');
      }
    }
  };

  const handleDelete = (license) => {
    if (window.confirm(`Are you sure you want to delete driver with license ${license}?`)) {
      deleteDriver(license);
      toast.success('Driver deleted successfully');
    }
  };

  const handleFilterToggle = (statusVal) => {
    setSelectedStatusFilter(selectedStatusFilter === statusVal ? 'All' : statusVal);
  };

  // Filter drivers list
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'All' || d.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helpers for Avatar
  const getInitials = (n) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (n) => {
    const code = n.charCodeAt(0) % 4;
    if (code === 0) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (code === 1) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (code === 2) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
      
        {/* Top Controller Ribbon */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-5 shadow-sm">
          
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative group w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or license..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-xs font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50 focus:bg-white transition-all shadow-sm" 
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 border-r border-slate-200">
              <FiFilter className="text-slate-400 text-sm" />
            </div>
            {['Available', 'On Trip', 'Off Duty', 'Suspended'].map((statusOption) => (
              <button 
                key={statusOption}
                onClick={() => handleFilterToggle(statusOption)}
                className={`px-3.5 py-2 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none whitespace-nowrap ${
                  selectedStatusFilter === statusOption 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {statusOption}
              </button>
            ))}
            {selectedStatusFilter !== 'All' && (
              <button 
                onClick={() => setSelectedStatusFilter('All')}
                className="px-3 py-2 text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* View Toggles & Add Button */}
        <div className="flex flex-wrap items-center gap-4 pt-4 xl:pt-0 border-t border-slate-100 xl:border-none">
          {/* Grid/List Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid View"
            >
              <FiGrid className="text-sm" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <FiList className="text-sm" />
            </button>
          </div>

          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <FiPlus className="text-sm" />
            Add Driver
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-2xl shadow-sm">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <FiSearch size={24} />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No drivers found</h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">Try adjusting your search or filter parameters.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* --- GRID VIEW --- */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDrivers.map((d, idx) => {
                const isExpired = d.expiry < todayStr;
                const daysLeft = Math.ceil((new Date(d.expiry) - new Date()) / (24*60*60*1000));
                const isClosingExpiry = !isExpired && daysLeft <= 30;

                return (
                  <div 
                    key={idx} 
                    className={`bg-white p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative shadow-sm hover:shadow-lg group ${
                      isExpired ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Status Border Accent */}
                    <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity ${
                      isExpired ? 'bg-rose-500' : isClosingExpiry ? 'bg-amber-500' : 'bg-slate-200 group-hover:bg-amber-400'
                    }`}></div>

                    <div>
                      {/* Avatar & Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-xl border flex items-center justify-center font-black text-sm uppercase tracking-wider relative shrink-0 shadow-sm ${getAvatarBg(d.name)}`}>
                            {getInitials(d.name)}
                            <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              d.status === 'Available' ? 'bg-emerald-500 animate-pulse' :
                              d.status === 'On Trip' ? 'bg-sky-500' :
                              d.status === 'Off Duty' ? 'bg-slate-400' : 'bg-rose-500'
                            }`}></span>
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-[15px] truncate max-w-[150px]">{d.name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Cat: {d.category}</p>
                          </div>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
                        <div className="space-y-1">
                          <span className="flex items-center gap-1.5 text-slate-400 uppercase text-[9px] font-bold tracking-widest">
                            <FiShield /> License Key
                          </span>
                          <span className="text-xs font-bold text-slate-700">{d.licenseNo}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="flex items-center gap-1.5 text-slate-400 uppercase text-[9px] font-bold tracking-widest">
                            <FiPhone /> Contact
                          </span>
                          <span className="text-xs font-bold text-slate-700">{d.contact || 'Not Provided'}</span>
                        </div>
                      </div>

                      {/* Expiry Warning */}
                      <div className="mt-4 space-y-1">
                        <span className="flex items-center gap-1.5 text-slate-400 uppercase text-[9px] font-bold tracking-widest">
                          <FiClock /> Expiry Date
                        </span>
                        {isExpired ? (
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-black text-[10px] uppercase tracking-wider border border-rose-200">
                            <FiAlertTriangle className="animate-pulse" /> Expired (Blocked)
                          </div>
                        ) : isClosingExpiry ? (
                          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 font-black text-[10px] uppercase tracking-wider border border-amber-200">
                            <FiAlertTriangle /> Expiring in {daysLeft} days
                          </div>
                        ) : (
                          <span className="text-xs font-black text-slate-800">{d.expiry}</span>
                        )}
                      </div>

                      {/* Safety & Performance */}
                      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 items-end">
                        <div>
                          <span className="text-slate-400 block uppercase text-[9px] font-bold tracking-widest mb-1.5">Safety Index</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md border ${
                              d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                              d.safetyScore >= 80 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                            }`}>
                              {d.safetyScore}%
                            </span>
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${
                                d.safetyScore >= 90 ? 'bg-emerald-500' : 
                                d.safetyScore >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                              }`} style={{ width: `${d.safetyScore}%` }}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-slate-400 block uppercase text-[9px] font-bold tracking-widest mb-1">Dispatches</span>
                          <span className="text-xs font-black text-slate-800 flex items-center justify-end gap-1.5">
                            <FiMap className="text-amber-500" /> {d.tripsCompleted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleOpenEdit(d)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(d.licenseNo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 hover:border-rose-200 transition shadow-sm"
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* --- LIST VIEW --- */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Driver Profile</th>
                      <th className="px-6 py-4">License & Expiry</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Safety Index</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredDrivers.map((d, idx) => {
                      const isExpired = d.expiry < todayStr;
                      const daysLeft = Math.ceil((new Date(d.expiry) - new Date()) / (24*60*60*1000));
                      const isClosingExpiry = !isExpired && daysLeft <= 30;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          {/* Driver Col */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg border flex items-center justify-center font-black text-xs uppercase tracking-wider shrink-0 ${getAvatarBg(d.name)}`}>
                                {getInitials(d.name)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm">{d.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold tracking-wider">{d.contact || 'No Contact'}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* License Col */}
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{d.licenseNo}</p>
                            <div className="mt-1">
                              {isExpired ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                  <FiAlertTriangle/> Expired
                                </span>
                              ) : isClosingExpiry ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                  <FiAlertTriangle/> {daysLeft} Days left
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-semibold">{d.expiry}</span>
                              )}
                            </div>
                          </td>

                          {/* Status Col */}
                          <td className="px-6 py-4">
                            <StatusBadge status={d.status} />
                          </td>

                          {/* Safety Col */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 max-w-[120px]">
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                                d.safetyScore >= 90 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                                d.safetyScore >= 80 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                              }`}>
                                {d.safetyScore}%
                              </span>
                              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                                <div className={`h-full rounded-full ${
                                  d.safetyScore >= 90 ? 'bg-emerald-500' : 
                                  d.safetyScore >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} style={{ width: `${d.safetyScore}%` }}></div>
                              </div>
                            </div>
                          </td>

                          {/* Actions Col */}
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleOpenEdit(d)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(d.licenseNo)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Helper Warning Notification */}
      <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start sm:items-center gap-3 shadow-sm">
        <FiAlertTriangle className="text-rose-500 text-lg shrink-0" />
        <p>Driver license compliance validation is active. Drivers with expired licenses are dynamically flagged in red and blocked from receiving new trip dispatches via the dispatch portal.</p>
      </div>

      </div>

      {/* Create / Edit Modal Popup (Light Theme Refined) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] w-screen overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl relative text-left my-8">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <FiCheckCircle className="text-amber-500" />
              {isEditMode ? 'Edit Driver Profile' : 'Register New Driver'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5 text-left">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Driver Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rajesh Kumar"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">License Number</label>
                  <input 
                    type="text" 
                    placeholder="MH-01-2024-0012"
                    value={licenseNo} 
                    onChange={(e) => setLicenseNo(e.target.value)} 
                    disabled={isEditMode}
                    className={`w-full px-4 py-2.5 text-xs font-semibold border rounded-xl outline-none transition-all shadow-sm ${isEditMode ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500'}`}
                  />
                  {isDuplicateLicense && (
                    <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-1 pl-1">
                      <FiAlertTriangle/> License exists
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">License Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="LMV">LMV (Light Motor)</option>
                    <option value="HMV">HMV (Heavy Motor)</option>
                    <option value="TRANS">TRANS (Transport Heavy)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">License Expiry Date</label>
                  <input 
                    type="date" 
                    value={expiry} 
                    onChange={(e) => setExpiry(e.target.value)} 
                    className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all shadow-sm cursor-pointer" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Contact Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9876543210"
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)} 
                    className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Safety Index Score (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={safetyScore} 
                    onChange={(e) => setSafetyScore(Number(e.target.value))} 
                    className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Trips Completed</label>
                  <input 
                    type="number" 
                    min="0"
                    value={tripsCompleted} 
                    onChange={(e) => setTripsCompleted(Number(e.target.value))} 
                    disabled={true}
                    className="w-full px-4 py-2.5 text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 rounded-xl outline-none cursor-not-allowed shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Current Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    disabled={status === 'On Trip'}
                    className={`w-full px-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all shadow-sm ${
                      status === 'On Trip' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                    {status === 'On Trip' && <option value="On Trip">On Trip</option>}
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-5 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isDuplicateLicense}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-950 transition shadow-sm cursor-pointer ${
                    isDuplicateLicense 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-amber-500 hover:bg-amber-600 hover:shadow-md'
                  }`}
                >
                  {isEditMode ? 'Save Changes' : 'Register Driver'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}