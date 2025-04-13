import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  StartupData,
  TransactionData,
  getInvestorStats,
  getUserTransactions,
  getAllStartups,
  getFilteredStartups,
} from '../firebase/firestore';
import { DocumentData } from 'firebase/firestore';

interface InvestorStats {
  totalInvested: number;
  activeInvestments: number;
  totalTransactions: number;
}

interface UseInvestorReturn {
  stats: InvestorStats;
  recentTransactions: TransactionData[];
  recentInvestments: StartupData[];
  trendingStartups: StartupData[];
  isLoading: boolean;
  error: Error | null;
  refetchInvestorData: () => Promise<void>;
  fetchMoreStartups: () => Promise<{ hasMore: boolean }>;
  lastStartup: DocumentData | undefined;
}

export const useInvestor = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<InvestorStats>({
    totalInvested: 0,
    activeInvestments: 0,
    totalTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const [recentInvestments, setRecentInvestments] = useState<StartupData[]>([]);
  const [trendingStartups, setTrendingStartups] = useState<StartupData[]>([]);
  const [lastStartup, setLastStartup] = useState<DocumentData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvestorData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch basic investor stats and transactions
      const [statsData, transactionsData] = await Promise.all([
        getInvestorStats(user.uid),
        getUserTransactions(user.uid, 'investor')
      ]);
      
      setStats(statsData);
      setRecentTransactions(transactionsData);
      
      // Fetch trending startups (top funded ones)
      const { startups, lastVisible } = await getAllStartups(undefined, 6);
      setTrendingStartups(startups);
      setLastStartup(lastVisible);
      
      // Create a map of startups the user has invested in
      const startupIds = new Set<string>();
      transactionsData.forEach(transaction => {
        startupIds.add(transaction.startupId);
      });
      
      // Fetch details for each startup the user has invested in
      const investmentPromises = Array.from(startupIds).map(id => 
        import('../firebase/firestore').then(({ getStartupById }) => getStartupById(id))
      );
      
      const investmentResults = await Promise.all(investmentPromises);
      setRecentInvestments(investmentResults.filter(Boolean) as StartupData[]);
    } catch (err) {
      console.error('Error fetching investor data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load investor data'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreStartups = async () => {
    try {
      if (!lastStartup) return { hasMore: false };
      
      const { startups, lastVisible } = await getAllStartups(lastStartup, 6);
      setTrendingStartups(prev => [...prev, ...startups]);
      setLastStartup(lastVisible);
      
      return { hasMore: startups.length > 0 && !!lastVisible };
    } catch (err) {
      console.error('Error fetching more startups:', err);
      return { hasMore: false };
    }
  };

  useEffect(() => {
    fetchInvestorData();
  }, [user]);

  return {
    stats,
    recentTransactions,
    recentInvestments,
    trendingStartups,
    isLoading,
    error,
    refetchInvestorData: fetchInvestorData,
    fetchMoreStartups,
    lastStartup
  };
};
