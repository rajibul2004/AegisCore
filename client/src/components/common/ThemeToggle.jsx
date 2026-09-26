import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg border border-gray-200 dark:border-gray-700 z-50 hover:scale-110"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <Sun className="h-6 w-6" strokeWidth={1.5} />
      ) : (
        <Moon className="h-6 w-6" strokeWidth={1.5} />
      )}
    </button>
  );
};

export default ThemeToggle;
