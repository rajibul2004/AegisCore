import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Briefcase, FileText, Users, ShieldAlert, FilePlus, Search, Settings, Activity, Map as MapIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
      { name: 'Crime Map', icon: <MapIcon className="w-5 h-5" />, path: '/map' }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'System Audit', icon: <Activity className="w-5 h-5" />, path: '/audit' },
        { name: 'AI Audit Logs', icon: <Activity className="w-5 h-5 text-purple-500" />, path: '/admin/ai-logs' },
        { name: 'Manage Users', icon: <Users className="w-5 h-5" />, path: '/users' },
        { name: 'All Cases', icon: <Briefcase className="w-5 h-5" />, path: '/cases' },
        { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
      ];
    }

    if (user?.role === 'police') {
      return [
        ...baseItems,
        { name: 'FIR Registry', icon: <FileText className="w-5 h-5" />, path: '/firs' },
        { name: 'My Cases', icon: <Briefcase className="w-5 h-5" />, path: '/cases' },
        { name: 'Suspects', icon: <Users className="w-5 h-5" />, path: '/suspects' },
        { name: 'Advanced Search', icon: <Search className="w-5 h-5" />, path: '/search' },
      ];
    }

    // Public / User
    return [
      ...baseItems,
      { name: 'File New FIR', icon: <FilePlus className="w-5 h-5" />, path: '/firs/new' },
      { name: 'My Submissions', icon: <FileText className="w-5 h-5" />, path: '/my-firs' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 hidden lg:flex">
          <ShieldAlert className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mr-2" strokeWidth={1.5} />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Case<span className="text-indigo-600 dark:text-indigo-400">Intel</span></span>
        </div>
        
        <div className="overflow-y-auto overflow-x-hidden flex-grow py-6">
          <ul className="flex flex-col space-y-1.5 px-3">
            <li className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Navigation
            </li>
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                    className={`relative flex flex-row items-center h-11 focus:outline-none rounded-lg px-4 transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <span className="inline-flex justify-center items-center">
                      {item.icon}
                    </span>
                    <span className="ml-3 tracking-wide truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
