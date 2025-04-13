import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeText?: string;
  changeDirection?: 'up' | 'down' | 'none';
  bgColor?: string;
  isLoading?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeText, 
  changeDirection = 'none',
  bgColor = 'primary',
  isLoading = false
}: StatCardProps) => {
  return (
    <Card className="bg-white dark:bg-dark-100 rounded-lg shadow-sm p-6 transition-colors">
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 ml-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <div className={`flex-shrink-0 bg-${bgColor}-100 dark:bg-${bgColor}-900 p-3 rounded-md`}>
              {icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
          {(change || changeText) && (
            <div className="mt-4">
              <div className="flex items-center text-sm">
                {changeDirection === 'up' && (
                  <div className="flex items-center text-green-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                    </svg>
                    <span>{change} {changeText}</span>
                  </div>
                )}
                {changeDirection === 'down' && (
                  <div className="flex items-center text-red-500">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 13a1 1 0 110 2h-5a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L13 9.414l-3.586 3.586H12z" clipRule="evenodd"></path>
                    </svg>
                    <span>{change} {changeText}</span>
                  </div>
                )}
                {changeDirection === 'none' && (
                  <div className="flex items-center text-gray-500">
                    <span>{change} {changeText}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default StatCard;
