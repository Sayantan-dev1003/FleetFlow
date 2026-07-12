import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import { 
  FiSettings, FiShield, FiCheck, FiEye, 
  FiMinus, FiSave, FiMapPin, FiDollarSign, FiNavigation,
  FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

export default function Settings() {
  const { settings, updateSettings, user } = useContext(AppContext);

  // Local Form state
  const [depotName, setDepotName] = useState('');
  const [currency, setCurrency] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('');

  // Check role authorization (Only Fleet Managers can modify)
  const isFleetManager = user?.role === 'Fleet Manager';

  // Pre-fill local state once loaded
  useEffect(() => {
    if (settings) {
      setDepotName(settings.depotName || '');
      setCurrency(settings.currency || '');
      setDistanceUnit(settings.distanceUnit || '');
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!isFleetManager) {
      toast.error('Access Denied: Only Fleet Managers are authorized to modify depot settings.');
      return;
    }

    if (!depotName.trim()) {
      toast.error('Depot identification name cannot be empty.');
      return;
    }

    const res = await updateSettings({
      depotName,
      currency,
      distanceUnit
    });

    if (res.success) {
      toast.success('Depot settings committed successfully.');
    } else {
      toast.error(res.error || 'An error occurred while saving.');
    }
  };

  // Helper to render RBAC status icons in light theme
  const renderAccess = (type) => {
    if (type === 'full') {
      return (
        <div className="mx-auto h-7 w-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm" title="Full Access">
          <FiCheck size={14} strokeWidth={3} />
        </div>
      );
    }
    if (type === 'view') {
      return (
        <div className="mx-auto h-7 w-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm" title="View Only">
          <FiEye size={14} strokeWidth={2.5} />
        </div>
      );
    }
    return (
      <div className="mx-auto h-7 w-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400" title="No Access">
        <FiMinus size={14} strokeWidth={3} />
      </div>
    );
  };

  return (
    <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-10 shadow-sm animate-fadeIn">
      
      {/* General Settings Area Form Parameters */}
      <form onSubmit={handleSave} className="lg:col-span-4 space-y-6 text-left">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="h-7 w-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <FiSettings className="text-sm" />
          </div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">General Params</h3>
        </div>

        {/* Restricted warning for non-managers */}
        {!isFleetManager && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-xl flex items-start gap-2">
            <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-600" />
            <span>Read-Only Mode: You must be signed in as a Fleet Manager to update these fields.</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Depot Identification</label>
            <div className="relative group">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text" 
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                disabled={!isFleetManager}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-amber-500 focus:bg-white transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">System Currency</label>
            <div className="relative group">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                disabled={!isFleetManager}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-amber-500 focus:bg-white transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Distance Unit</label>
            <div className="relative group">
              <FiNavigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text" 
                value={distanceUnit} 
                onChange={(e) => setDistanceUnit(e.target.value)}
                disabled={!isFleetManager}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-amber-500 focus:bg-white transition-all shadow-sm disabled:opacity-75 disabled:cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!isFleetManager}
          className={`w-full flex items-center justify-center gap-2 font-black px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all shadow-sm mt-2 cursor-pointer ${
            isFleetManager 
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow active:scale-98' 
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <FiSave className="text-sm" />
          Commit Changes
        </button>
      </form>

      {/* Role-Based Access Controls Matrix Mapping */}
      <div className="lg:col-span-8 space-y-6 text-left">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="h-7 w-7 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600">
            <FiShield className="text-sm" />
          </div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Access Matrix (RBAC)</h3>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="min-w-full text-xs text-left bg-white">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-4">Assigned Role</th>
                <th className="px-3 py-4 text-center">Fleet</th>
                <th className="px-3 py-4 text-center">Drivers</th>
                <th className="px-3 py-4 text-center">Trips</th>
                <th className="px-3 py-4 text-center">Fuel/Exp.</th>
                <th className="px-3 py-4 text-center">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-left font-black text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Fleet Manager
                </td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-left font-black text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span> Driver
                </td>
                <td className="px-3 py-3.5">{renderAccess('view')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-left font-black text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Safety Officer
                </td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
                <td className="px-3 py-3.5">{renderAccess('view')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-left font-black text-slate-900 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span> Financial Analyst
                </td>
                <td className="px-3 py-3.5">{renderAccess('view')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('none')}</td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
                <td className="px-3 py-3.5">{renderAccess('full')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-5 pt-1 pl-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="h-3 w-3 rounded-sm border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-600"><FiCheck size={8} strokeWidth={4}/></div> 
            Write Access
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="h-3 w-3 rounded-sm border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600"><FiEye size={8} strokeWidth={3}/></div> 
            Read-Only
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="h-3 w-3 rounded-sm border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400"><FiMinus size={8} strokeWidth={4}/></div> 
            Restricted
          </div>
        </div>
      </div>
      
    </div>
  );
}