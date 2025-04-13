import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="bg-white dark:bg-dark-100 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M15 8.5C15 7.11929 13.6569 6 12 6C10.3431 6 9 7.11929 9 8.5C9 9.88071 10.3431 11 12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 11V18M12 18L9 15M12 18L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-2 text-xl font-heading font-bold text-gray-800 dark:text-white">StartupVest</span>
              </a>
            </Link>
          </div>
          
          <div className="flex items-center">
            <ThemeToggle />
            
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="ml-3 relative">
                  <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                </Button>
                <UserDropdown />
              </>
            ) : (
              <>
                {location !== '/auth' && (
                  <Link href="/auth">
                    <Button variant="outline" className="ml-3">
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
