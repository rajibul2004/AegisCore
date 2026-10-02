import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Briefcase, FileText, Users, FilePlus, Search, Settings, Activity, Map as MapIcon, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', icon: <LayoutDashboard strokeWidth={2} />, path: '/' },
      { name: 'Notifications', icon: <Bell strokeWidth={2} />, path: '/notifications' },
      { name: 'Crime Map', icon: <MapIcon strokeWidth={2} />, path: '/map' },
      { name: 'My Profile', icon: <User strokeWidth={2} />, path: '/profile' }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'System Audit', icon: <Activity strokeWidth={2} />, path: '/audit' },
        { name: 'AI Audit Logs', icon: <Activity strokeWidth={2} className="text-purple-500" />, path: '/admin/ai-logs' },
        { name: 'Manage Users', icon: <Users strokeWidth={2} />, path: '/users' },
        { name: 'FIR Registry', icon: <FileText strokeWidth={2} />, path: '/firs' },
        { name: 'All Cases', icon: <Briefcase strokeWidth={2} />, path: '/cases' },
        { name: 'Suspects', icon: <Users strokeWidth={2} />, path: '/suspects' },
        { name: 'Evidence Locker', icon: <FileText strokeWidth={2} />, path: '/evidence' },
        { name: 'Advanced Search', icon: <Search strokeWidth={2} />, path: '/search' },
        { name: 'Settings', icon: <Settings strokeWidth={2} />, path: '/settings' },
      ];
    }

    if (user?.role === 'police') {
      return [
        ...baseItems,
        { name: 'FIR Registry', icon: <FileText strokeWidth={2} />, path: '/firs' },
        { name: 'My Cases', icon: <Briefcase strokeWidth={2} />, path: '/cases' },
        { name: 'Suspects', icon: <Users strokeWidth={2} />, path: '/suspects' },
        { name: 'Evidence Locker', icon: <FileText strokeWidth={2} />, path: '/evidence' },
        { name: 'Advanced Search', icon: <Search strokeWidth={2} />, path: '/search' },
      ];
    }

    // Public / User
    return [
      ...baseItems,
      { name: 'File New FIR', icon: <FilePlus strokeWidth={2} />, path: '/firs/new' },
      { name: 'My Submissions', icon: <FileText strokeWidth={2} />, path: '/my-firs' },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop with premium blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/40 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-[#0A0A0B] border-r border-gray-200/60 dark:border-white/5 transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:static lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Desktop Logo Header (matches Navbar height & style) */}
        <div className="hidden lg:flex items-center justify-center h-[72px] min-h-[72px] shrink-0 border-b border-gray-200/60 dark:border-white/5">
          <img src="/favicon.png" alt="AegisCore Logo" className="h-10 w-auto rounded-xl mr-3 object-contain" />
          <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
            Aegis<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">Core</span>
          </span>
        </div>
        
        {/* Navigation Links Area */}
        <div className="overflow-y-auto overflow-x-hidden flex-grow py-8 px-4">
          <ul className="flex flex-col space-y-2">
            <li className="px-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Overview & Analytics
            </li>
            
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                    className={`group relative flex flex-row items-center h-12 focus:outline-none rounded-xl px-3 transition-all duration-300 ${
                      isActive 
                        ? 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold shadow-[inset_4px_0_0_0_rgb(79,70,229)] dark:shadow-[inset_4px_0_0_0_rgb(129,140,248)]' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
                    }`}
                  >
                    <span className={`inline-flex justify-center items-center w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`}>
                      {item.icon}
                    </span>
                    <span className={`ml-3.5 tracking-wide truncate transition-transform duration-300 ${!isActive && 'group-hover:translate-x-1'}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Premium Help / Support Card at the bottom of the sidebar */}
          <div className="mt-12 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-[#0A0A0B] border border-indigo-100 dark:border-white/5 shadow-sm relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Support</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">Need help with an active case investigation?</p>
            <button className="text-xs font-bold w-full py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
              Contact Dispatch
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
