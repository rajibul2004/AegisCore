import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Menu, LogOut, ShieldAlert } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 sticky top-0">
      <div className="flex items-center">
        <button 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none lg:hidden mr-4"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center lg:hidden mr-4">
          <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" strokeWidth={1.5} />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Case<span className="text-indigo-600 dark:text-indigo-400">Intel</span></span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden lg:block">Overview</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        
        <NotificationBell />

        <div className="hidden sm:flex items-center space-x-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user?.name}</span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
        
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white dark:border-gray-700">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

        <button 
          onClick={logout}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 focus:outline-none transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
