import { Briefcase, AlertCircle, CheckCircle, Brain, TrendingUp } from 'lucide-react';

const PoliceDashboard = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Officer Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your active cases and pending investigations.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
            + Register FIR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'My Active Cases', value: '12', icon: <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
          { title: 'Pending FIRs', value: '5', icon: <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { title: 'Resolved Cases', value: '84', icon: <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />, bg: 'bg-green-50 dark:bg-green-900/30' },
          { title: 'AI Suspect Matches', value: '3', icon: <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />, bg: 'bg-purple-50 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-3 h-3 mr-1" /> Today
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Cases</h3>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase font-semibold text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4">Case ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Update</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { id: 'CAS-2023-089', title: 'Cyber Fraud at TechPark', status: 'Investigation', time: '2 hrs ago', color: 'blue' },
                { id: 'CAS-2023-092', title: 'Vehicle Theft - Sector 4', status: 'Pending Evidence', time: '1 day ago', color: 'amber' },
                { id: 'CAS-2023-071', title: 'Burglary - Main Street', status: 'Court Pending', time: '3 days ago', color: 'purple' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{row.id}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{row.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${row.color}-100 text-${row.color}-800 dark:bg-${row.color}-900/30 dark:text-${row.color}-400`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300">Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
