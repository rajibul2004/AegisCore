import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Briefcase, Activity, CheckCircle, Brain, TrendingUp, TrendingDown, FileText, Zap } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cases</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">124</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              12%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Investigations</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">42</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 font-medium flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" />
              3%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Cases</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">82</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              18%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Insights</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">156</h3>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              42%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          
          <div className="space-y-6">
            {/* Activity Item */}
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New FIR Registered</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">FIR #2023-1045 filed for investigation.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>

            {/* Activity Item */}
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">AI Analysis Completed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Groq AI generated suspect profile for Case #892.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 hours ago</p>
              </div>
            </div>
            
            {/* Activity Item */}
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Status Update</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Case #890 escalated to high priority.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Profile</h2>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{user?.email}</p>
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide border border-blue-200 dark:border-blue-800">
              {user?.role}
            </span>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Account Status</span>
              <span className="font-medium text-green-600 dark:text-green-400 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span> Active
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Member Since</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
