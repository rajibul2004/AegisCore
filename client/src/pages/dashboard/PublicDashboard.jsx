import { useState, useEffect } from 'react';
import { statsService } from '../../api/statsService';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE', '#8884d8'];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your filed complaints and FIRs.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mr-4 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Filed</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.totalFIRs}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-full mr-4 text-yellow-600 dark:text-yellow-400">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Review</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.pendingFIRs}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-full mr-4 text-green-600 dark:text-green-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.registeredFIRs}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      {metrics.totalFIRs > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Status Breakdown (Pie Chart) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Complaint Status Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.firStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.replace('_', ' ')} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {charts.firStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-center">
          <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't filed any reports yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">If you need to report a crime, you can file an FIR securely through this portal.</p>
          <Link to="/firs/new" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
            File an FIR Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;
