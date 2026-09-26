import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Menu, LogOut, LayoutDashboard, Briefcase, FileText, Users, ShieldAlert } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" strokeWidth={1.5} />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Case<span className="text-blue-600 dark:text-blue-400">Intel</span></span>
        </div>
        
        <div className="overflow-y-auto overflow-x-hidden flex-grow">
          <ul className="flex flex-col py-4 space-y-1 px-4">
            <li className="px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</li>
            
            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 bg-blue-50 dark:bg-gray-700/50 pr-6 rounded-r-lg">
                <span className="inline-flex justify-center items-center ml-4">
                  <LayoutDashboard className="w-5 h-5" />
                </span>
                <span className="ml-2 font-medium tracking-wide truncate">Dashboard</span>
              </a>
            </li>

            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-l-4 border-transparent hover:border-gray-300 dark:hover:border-gray-600 pr-6 rounded-r-lg transition-colors">
                <span className="inline-flex justify-center items-center ml-4">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="ml-2 font-medium tracking-wide truncate">FIR Registry</span>
              </a>
            </li>

            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-l-4 border-transparent hover:border-gray-300 dark:hover:border-gray-600 pr-6 rounded-r-lg transition-colors">
                <span className="inline-flex justify-center items-center ml-4">
                  <Briefcase className="w-5 h-5" />
                </span>
                <span className="ml-2 font-medium tracking-wide truncate">Cases</span>
              </a>
            </li>

            <li>
              <a href="#" className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-l-4 border-transparent hover:border-gray-300 dark:hover:border-gray-600 pr-6 rounded-r-lg transition-colors">
                <span className="inline-flex justify-center items-center ml-4">
                  <Users className="w-5 h-5" />
                </span>
                <span className="ml-2 font-medium tracking-wide truncate">Suspects</span>
              </a>
            </li>

          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center">
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none lg:hidden mr-4"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">Overview</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wide border border-blue-200 dark:border-blue-800">
                {user?.role}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
            </div>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <button 
              onClick={logout}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
