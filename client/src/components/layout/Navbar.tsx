import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ModeToggle } from './ModeToggle';
import { useAuth } from '@/hooks/useAuth';
import { Menu, User, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <svg 
                  className="h-8 w-8 text-primary-500" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                  />
                  <path 
                    d="M15 8.5C15 7.11929 13.6569 6 12 6C10.3431 6 9 7.11929 9 8.5C9 9.88071 10.3431 11 12 11" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M12 11V18M12 18L9 15M12 18L15 15" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
                <span className="ml-2 text-xl font-bold">StartupVest</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user ? (
              <>
                {user.role === 'investor' ? (
                  <>
                    <Link href="/investor/dashboard">
                      <a className={`text-sm font-medium ${isActive('/investor/dashboard') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/investor/discover">
                      <a className={`text-sm font-medium ${isActive('/investor/discover') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        Discover
                      </a>
                    </Link>
                    <Link href="/investor/transactions">
                      <a className={`text-sm font-medium ${isActive('/investor/transactions') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        Transactions
                      </a>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/startup/dashboard">
                      <a className={`text-sm font-medium ${isActive('/startup/dashboard') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        Dashboard
                      </a>
                    </Link>
                    <Link href="/startup/profile">
                      <a className={`text-sm font-medium ${isActive('/startup/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        Profile
                      </a>
                    </Link>
                    <Link href="/startup/transactions">
                      <a className={`text-sm font-medium ${isActive('/startup/transactions') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        Transactions
                      </a>
                    </Link>
                  </>
                )}
                
                <Link href="/debug">
                  <a className={`text-sm font-medium ${isActive('/debug') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Debug
                  </a>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?tab=signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            
            <ModeToggle />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.displayName && (
                        <p className="font-medium">{user.displayName}</p>
                      )}
                      {user.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <a className="w-full cursor-pointer">Settings</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleLogout}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ModeToggle />
            <button
              className="inline-flex items-center justify-center p-2 ml-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">{user.displayName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {user.role === 'investor' ? (
                    <>
                      <Link href="/investor/dashboard">
                        <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                          Dashboard
                        </a>
                      </Link>
                      <Link href="/investor/discover">
                        <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                          Discover
                        </a>
                      </Link>
                      <Link href="/investor/transactions">
                        <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                          Transactions
                        </a>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/startup/dashboard">
                        <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                          Dashboard
                        </a>
                      </Link>
                      <Link href="/startup/profile">
                        <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                          Profile
                        </a>
                      </Link>
                      <Link href="/startup/transactions">
                        <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                          Transactions
                        </a>
                      </Link>
                    </>
                  )}
                  <Link href="/debug">
                    <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      Debug
                    </a>
                  </Link>
                  <Link href="/settings">
                    <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      Settings
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link href="/auth">
                  <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                    Sign In
                  </a>
                </Link>
                <Link href="/auth?tab=signup">
                  <a className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                    Sign Up
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;