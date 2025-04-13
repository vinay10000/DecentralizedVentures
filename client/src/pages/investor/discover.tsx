import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import FilterBar, { FilterOptions } from '@/components/common/FilterBar';
import StartupCard from '@/components/startup/StartupCard';
import { Button } from '@/components/ui/button';
import { StartupData, getFilteredStartups } from '@/firebase/firestore';
import { useNavigateToChat } from '@/hooks/useChat';
import { DocumentData } from 'firebase/firestore';

const DiscoverStartups = () => {
  const [startups, setStartups] = useState<StartupData[]>([]);
  const [lastStartup, setLastStartup] = useState<DocumentData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    investmentStage: 'All Stages',
    industry: 'All Industries',
    sortBy: 'Newest First'
  });
  
  const navigateToChat = useNavigateToChat();

  useEffect(() => {
    fetchStartups();
  }, [filters]);

  const fetchStartups = async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setLastStartup(undefined);
      } else {
        setLoadingMore(true);
      }

      const sortByMap: Record<string, string> = {
        'Newest First': 'createdAt',
        'Funding Goal': 'fundingGoal',
        'Progress': 'fundingRaised',
        'Most Investors': 'investors'
      };

      const { startups: fetchedStartups, lastVisible } = await getFilteredStartups(
        filters,
        sortByMap[filters.sortBy || 'Newest First'],
        reset ? undefined : lastStartup
      );

      if (reset) {
        setStartups(fetchedStartups);
      } else {
        setStartups(prev => [...prev, ...fetchedStartups]);
      }

      setLastStartup(lastVisible);
      setHasMore(fetchedStartups.length > 0 && !!lastVisible);
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchStartups(false);
    }
  };

  const handleChatClick = (startupId: string, startupName: string) => {
    navigateToChat(startupId, startupName);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Discover Promising Startups</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Find and invest in the next big innovation.</p>
          </div>

          <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dark-100 rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="pt-2 flex justify-between">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : startups.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map((startup) => (
                  <StartupCard 
                    key={startup.id} 
                    startup={startup} 
                    onChatClick={handleChatClick}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6"
                  >
                    {loadingMore ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current"></span>
                        Loading...
                      </>
                    ) : (
                      'Load More Startups'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No startups found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                No startups match your current filter criteria. Try adjusting your filters.
              </p>
              <Button onClick={() => setFilters({
                searchTerm: '',
                investmentStage: 'All Stages',
                industry: 'All Industries',
                sortBy: 'Newest First'
              })}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscoverStartups;
