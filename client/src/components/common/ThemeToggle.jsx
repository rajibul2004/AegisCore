import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 text-gray-400 hover:text-indigo-600 dark:hover:text-amber-400 focus:outline-none transition-all duration-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-amber-400/10 group flex items-center justify-center"
      aria-label="Toggle Theme"
      title="Toggle Theme"
    >
      {/* Sun Icon (Visible in Dark Mode) */}
      <Sun 
        className={`h-5 w-5 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
        }`} 
        strokeWidth={2} 
      />
      
      {/* Moon Icon (Visible in Light Mode) */}
      <Moon 
        className={`h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'
        }`} 
        strokeWidth={2} 
      />
    </button>
  );
};

export default ThemeToggle;
