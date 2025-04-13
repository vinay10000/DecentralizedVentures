import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {theme === 'dark' ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </Button>
  );
};

export default ThemeToggle;
