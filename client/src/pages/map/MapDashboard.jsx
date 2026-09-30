import { useContext } from 'react';
import { Map as MapIcon, Filter, Layers, Navigation, ShieldAlert, Users } from 'lucide-react';
import CrimeMap from '../../components/map/CrimeMap';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const MapDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const isPublic = user?.role === 'public';

  return (
    <DashboardLayout>
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center">
          <div className={`p-3 mr-5 rounded-2xl shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)] ${isPublic ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
            {isPublic ? (
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            ) : (
              <MapIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              {isPublic ? 'Community Safety Map' : 'Geospatial Intelligence'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
              {isPublic 
                ? 'Stay informed about recent incidents and safety alerts in your neighborhood.' 
                : 'Live visualization of tactical data and active investigations.'}
            </p>
          </div>
        </div>

        <button className="flex items-center px-4 py-2 bg-white dark:bg-[#0A0A0B] border border-gray-200 dark:border-white/5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
          <Filter className="w-4 h-4 mr-2" />
          Filter Data
        </button>
      </div>

      {/* Map Container */}
      <div className="relative bg-white dark:bg-[#0A0A0B] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-2">
        
        {/* Floating Toolbars overlaying the map (UI only) */}
        <div className="absolute top-6 left-6 z-[400] flex flex-col gap-2 pointer-events-none">
          <div className="pointer-events-auto bg-white/90 dark:bg-[#0A0A0B]/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-200/50 dark:border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            <span className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase">
              {isPublic ? 'Community Alerts' : 'Live Feed'}
            </span>
          </div>
        </div>

        {/* The Actual Map */}
        <div className="rounded-[1.5rem] overflow-hidden border border-gray-200/50 dark:border-white/5 relative z-0">
          <CrimeMap height="650px" theme={theme} isPublic={isPublic} />
        </div>

        {/* Premium Legend Panel */}
        <div className="mt-4 px-6 pb-4 pt-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            {isPublic ? 'Incident Severity Indicators' : 'Threat Level Indicators'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-red-500/30 transition-colors cursor-default">
              <span className="flex-shrink-0 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] mr-3 ring-2 ring-red-500/20"></span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isPublic ? 'Critical Safety Alert' : 'Critical Priority'}
              </span>
            </div>

            <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-orange-500/30 transition-colors cursor-default">
              <span className="flex-shrink-0 w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] mr-3 ring-2 ring-orange-500/20"></span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isPublic ? 'High Concern' : 'High Priority'}
              </span>
            </div>

            <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-blue-500/30 transition-colors cursor-default">
              <span className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] mr-3 ring-2 ring-blue-500/20"></span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isPublic ? 'Moderate Incident' : 'Medium Priority'}
              </span>
            </div>

            <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-green-500/30 transition-colors cursor-default">
              <span className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] mr-3 ring-2 ring-green-500/20"></span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isPublic ? 'General Advisory' : 'Low Priority'}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
    </DashboardLayout>
  );
};

export default MapDashboard;
