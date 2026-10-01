import { useState, useEffect } from 'react';
import { statsService } from '../../api/statsService';
import { FileText, AlertCircle, CheckCircle, Clock, ShieldAlert, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PublicDashboard = () => {
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
      
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Secure Portal Active</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">Citizen Dashboard</h1>
            <p className="text-indigo-200 text-lg max-w-xl font-medium">Monitor the status of your filed reports and active investigations in real-time.</p>
          </div>
          
          <Link to="/firs/new" className="group flex items-center justify-center px-6 py-3.5 bg-white text-indigo-900 font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600 group-hover:text-indigo-900 transition-colors" />
            File New Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]">
              <FileText className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Filed</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.totalFIRs}</h3>
            <span className="text-sm font-medium text-gray-500">records</span>
          </div>
        </div>

        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]">
              <Clock className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <Activity className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Pending Review</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.pendingFIRs}</h3>
            <span className="text-sm font-medium text-gray-500">awaiting</span>
          </div>
        </div>

        <div className="group bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Registered Cases</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900 dark:text-white">{metrics.registeredFIRs}</h3>
            <span className="text-sm font-medium text-gray-500">active</span>
          </div>
        </div>
      </div>

      {metrics.totalFIRs > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Status Distribution</h3>
              <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-widest">Analytics</div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.firStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {charts.firStatus.map((entry, index) => (
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
                    formatter={(value) => [`${value} Records`, 'Total']}
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
          
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Manage your intelligence profile and track case updates rapidly.</p>
              
              <div className="space-y-4">
                <Link to="/my-firs" className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">View My Reports</h4>
                      <p className="text-xs font-medium text-gray-500">Track current status and updates</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </Link>
                
                <Link to="/map" className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Crime Map Intel</h4>
                      <p className="text-xs font-medium text-gray-500">View geospatial crime data</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </Link>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 leading-relaxed">
                If your report involves immediate physical danger, dial emergency services directly rather than waiting for an online response.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-white/50 dark:bg-gray-900/40 backdrop-blur-xl p-10 sm:p-16 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl text-center flex flex-col items-center">
          <div className="p-8 bg-indigo-500/5 rounded-full mb-6 border border-indigo-500/10">
            <ShieldAlert className="w-16 h-16 text-indigo-500 mx-auto" strokeWidth={1.5} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Secure Portal Ready</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg text-lg font-medium">You haven't filed any intelligence reports yet. If you need to report an incident, our secure channel is open 24/7.</p>
          <Link to="/firs/new" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all">
            Initiate New Report
          </Link>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;
