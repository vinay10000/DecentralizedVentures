import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (!user) return null;

  const { displayName, photoURL, role } = user;
  const isInvestor = role === 'investor';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-3 relative p-1 flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={photoURL || ''} alt={displayName || 'User'} />
            <AvatarFallback>{displayName ? getInitials(displayName) : 'U'}</AvatarFallback>
          </Avatar>
          <span className="ml-2 hidden md:block font-medium text-gray-700 dark:text-gray-200">{displayName}</span>
          <svg className="ml-1 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isInvestor ? 'Investor' : 'Startup Founder'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={isInvestor ? '/investor/dashboard' : '/startup/dashboard'}>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>
          <Link href={isInvestor ? '/investor/transactions' : '/startup/transactions'}>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>{isInvestor ? 'My Investments' : 'Transactions'}</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
