import { Users, Server, ShieldCheck, Activity } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">System Administration</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform overview and system health metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Cards */}
        {[
          { title: 'Total Users', value: '1,245', icon: <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
          { title: 'Active Officers', value: '342', icon: <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { title: 'System Health', value: '99.9%', icon: <Server className="h-6 w-6 text-green-600 dark:text-green-400" />, bg: 'bg-green-50 dark:bg-green-900/30' },
          { title: 'AI API Usage', value: '45k', icon: <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-50 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent System Audit Logs</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { action: 'New Officer Account created', user: 'Admin System', time: '10 mins ago', type: 'info' },
              { action: 'Failed login attempt detected', user: 'IP: 192.168.1.45', time: '1 hour ago', type: 'warning' },
              { action: 'Database backup completed', user: 'System Auto', time: '3 hours ago', type: 'success' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-4 ${log.type === 'warning' ? 'bg-amber-500' : log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
