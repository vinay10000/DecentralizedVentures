import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { HomeIcon, SearchIcon, BarChart2Icon, MessageSquareIcon, CreditCardIcon, SettingsIcon, CheckCircleIcon } from 'lucide-react';

interface SidebarLink {
  href: string;
  icon: React.ReactNode;
  text: string;
}

const Sidebar = () => {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isInvestor = user.role === 'investor';
  
  const investorLinks: SidebarLink[] = [
    { 
      href: '/investor/dashboard', 
      icon: <HomeIcon className="mr-3 h-5 w-5" />,
      text: 'Overview' 
    },
    { 
      href: '/investor/discover', 
      icon: <SearchIcon className="mr-3 h-5 w-5" />,
      text: 'Discover Startups' 
    },
    { 
      href: '/investor/transactions', 
      icon: <BarChart2Icon className="mr-3 h-5 w-5" />,
      text: 'My Investments' 
    },
    { 
      href: '/investor/messages', 
      icon: <MessageSquareIcon className="mr-3 h-5 w-5" />,
      text: 'Messages' 
    },
    { 
      href: '/settings', 
      icon: <SettingsIcon className="mr-3 h-5 w-5" />,
      text: 'Settings' 
    },
  ];

  const startupLinks: SidebarLink[] = [
    { 
      href: '/startup/dashboard', 
      icon: <HomeIcon className="mr-3 h-5 w-5" />,
      text: 'Overview' 
    },
    { 
      href: '/startup/transactions', 
      icon: <CreditCardIcon className="mr-3 h-5 w-5" />,
      text: 'Transactions' 
    },
    { 
      href: '/startup/messages', 
      icon: <MessageSquareIcon className="mr-3 h-5 w-5" />,
      text: 'Messages' 
    },
    { 
      href: '/startup/profile', 
      icon: <BarChart2Icon className="mr-3 h-5 w-5" />,
      text: 'Startup Profile' 
    },
    { 
      href: '/settings', 
      icon: <SettingsIcon className="mr-3 h-5 w-5" />,
      text: 'Settings' 
    },
  ];

  const links = isInvestor ? investorLinks : startupLinks;

  return (
    <aside className="w-64 hidden lg:block bg-white dark:bg-dark-100 shadow-sm transition-colors">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-400">
          <div className="flex items-center">
            <div className={`bg-${isInvestor ? 'primary' : 'secondary'}-100 dark:bg-${isInvestor ? 'primary' : 'secondary'}-900 p-2 rounded-lg`}>
              <svg className={`h-6 w-6 text-${isInvestor ? 'primary' : 'secondary'}-600 dark:text-${isInvestor ? 'primary' : 'secondary'}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {isInvestor ? 'Investor' : 'Startup Founder'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {links.map((link) => {
            const isActive = location === link.href;
            
            return (
              <Link key={link.href} href={link.href}>
                <a className={`flex items-center px-4 py-3 text-base font-medium rounded-md 
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-300' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200'} 
                  group`}
                >
                  <span className={isActive 
                    ? 'text-primary-500 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }>
                    {link.icon}
                  </span>
                  {link.text}
                </a>
              </Link>
            );
          })}
        </nav>
        
        {user.walletAddress && (
          <div className="p-4 border-t border-gray-200 dark:border-dark-400">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Wallet Connected</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
