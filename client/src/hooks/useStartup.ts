import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  StartupData, 
  StartupDocument, 
  StartupUpdate, 
  TransactionData,
  getStartupByFounderId,
  getStartupStats,
  getStartupDocuments,
  getUserTransactions,
  getStartupUpdates,
} from '../firebase/firestore';

interface UseStartupReturn {
  startup: StartupData | null;
  stats: {
    fundingRaised: number;
    fundingGoal: number;
    progress: number;
    investors: number;
    totalTransactions: number;
  };
  documents: StartupDocument[];
  updates: StartupUpdate[];
  transactions: TransactionData[];
  isLoading: boolean;
  error: Error | null;
  refetchStartup: () => Promise<void>;
}

export const useStartup = (startupId?: string): UseStartupReturn => {
  const { user } = useAuth();
  const [startup, setStartup] = useState<StartupData | null>(null);
  const [stats, setStats] = useState({
    fundingRaised: 0,
    fundingGoal: 0,
    progress: 0,
    investors: 0,
    totalTransactions: 0,
  });
  const [documents, setDocuments] = useState<StartupDocument[]>([]);
  const [updates, setUpdates] = useState<StartupUpdate[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStartupData = async () => {
    if (!user && !startupId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // If startupId is provided, use it; otherwise get the startup by founder ID
      const fetchedStartup = startupId 
        ? await import('../firebase/firestore').then(({ getStartupById }) => getStartupById(startupId))
        : user?.role === 'startup' 
          ? await getStartupByFounderId(user.uid) 
          : null;
      
      if (fetchedStartup) {
        setStartup(fetchedStartup);
        
        // Fetch additional data in parallel
        const [statsData, docsData, updatesData, transactionsData] = await Promise.all([
          getStartupStats(fetchedStartup.id as string),
          getStartupDocuments(fetchedStartup.id as string),
          getStartupUpdates(fetchedStartup.id as string),
          getUserTransactions(fetchedStartup.id as string, 'startup')
        ]);
        
        setStats(statsData);
        setDocuments(docsData);
        setUpdates(updatesData);
        setTransactions(transactionsData);
      }
    } catch (err) {
      console.error('Error fetching startup data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load startup data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStartupData();
  }, [user, startupId]);

  return {
    startup,
    stats,
    documents,
    updates,
    transactions,
    isLoading,
    error,
    refetchStartup: fetchStartupData,
  };
};
