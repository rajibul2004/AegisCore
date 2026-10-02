import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Menu, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-[72px] min-h-[72px] shrink-0 flex items-center justify-between px-6 bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-xl saturate-150 border-b border-gray-200/60 dark:border-white/5 z-10 sticky top-0 transition-colors duration-300">
      <div className="flex items-center">
        {/* Mobile Menu Toggle */}
        <button 
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none lg:hidden mr-4 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Mobile Premium Branding */}
        <div className="flex items-center lg:hidden mr-4">
          <img src="/favicon.png" alt="AegisCore Logo" className="h-8 w-auto rounded-lg mr-2 object-contain" />
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
            Aegis<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">Core</span>
          </span>
        </div>

        {/* Desktop Page Title (Can be dynamic later, static for now) */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white hidden lg:block tracking-tight">Overview</h2>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-5">
        
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

        {/* User Info (Desktop) */}
        <Link to="/profile" className="hidden sm:flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex flex-col text-right justify-center">
            <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{user?.role}</span>
          </div>
        </Link>
        
        {/* Premium Glowing Avatar */}
        <Link to="/profile" className="relative group cursor-pointer block">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
          <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white dark:ring-[#0A0A0B]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </Link>

        <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none transition-all duration-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group"
          title="Logout"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
