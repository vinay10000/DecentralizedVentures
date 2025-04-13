import { useContext } from 'react';
import { AuthContext, User } from '../contexts/AuthContext';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserData: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
