import { useState, useEffect } from 'react';
import { statsService } from '../../api/statsService';
import { Users, FileText, Shield, AlertCircle, CheckCircle, Clock, Briefcase, Fingerprint } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
  );

  const { metrics, charts } = stats;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Police Station Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of active cases and reports.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mr-4 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total FIRs</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalFIRs}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-full mr-4 text-purple-600 dark:text-purple-400">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Cases</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.activeCases}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-full mr-4 text-green-600 dark:text-green-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Solved Cases</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.solvedCases}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-full mr-4 text-orange-600 dark:text-orange-400">
            <Fingerprint className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Suspect Profiles</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalSuspects}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Cases by Status (Pie Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cases by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.casesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.replace('_', ' ')} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {charts.casesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7 Day FIR Trend (Bar Chart) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">FIRs Filed (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.firTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9CA3AF" />
                <YAxis allowDecimals={false} stroke="#9CA3AF" />
                <RechartsTooltip cursor={{fill: 'rgba(79, 70, 229, 0.1)'}} />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PoliceDashboard;
