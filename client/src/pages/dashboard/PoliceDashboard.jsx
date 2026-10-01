import { useState, useEffect } from 'react';
import { statsService } from '../../api/statsService';
import { Users, FileText, Shield, AlertCircle, CheckCircle, Clock, Briefcase, Fingerprint, Activity, MapPin } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PoliceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsService.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="relative flex justify-center items-center">
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full h-24 w-24 animate-pulse"></div>
        <img src="/favicon.png" alt="Loading" className="h-16 w-16 animate-bounce relative z-10 drop-shadow-2xl opacity-90" />
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-red-500 mb-2">Sync Error</h3>
        <p className="text-red-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-all font-bold">
          Retry Connection
        </button>
      </div>
    </div>
  );

  const { metrics, charts } = stats;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-blue-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-blue-400 font-bold tracking-widest uppercase text-xs">Officer Station Active</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">Tactical Dashboard</h1>
          <p className="text-blue-200 text-lg max-w-xl font-medium">Real-time overview of active cases, FIRs, and intelligence gathering operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]">
              <FileText className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total FIRs</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.totalFIRs}</h3>
          </div>
        </div>

        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]">
              <Briefcase className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Active Cases</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.activeCases}</h3>
          </div>
        </div>

        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Solved Cases</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.solvedCases}</h3>
          </div>
        </div>

        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]">
              <Fingerprint className="w-8 h-8" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Suspect Profiles</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.totalSuspects}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Case Statuses</h3>
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest">Distribution</div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.casesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {charts.casesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-bold text-gray-600 dark:text-gray-300 capitalize">{value.replace('_', ' ')}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">FIR Intake (Last 7 Days)</h3>
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest">Trend</div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.firTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#6B7280'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PoliceDashboard;
