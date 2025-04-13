import React, { createContext, useState, useEffect, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, getUserData, signOutUser } from '../firebase/auth';

// Define user role type
export type UserRole = 'investor' | 'startup';

// Define user interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  walletAddress: string | null;
  createdAt?: string;
}

// Define AuthContext props
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserData: () => Promise<void>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserData: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data from Firestore
  const fetchUserData = async (fbUser: FirebaseUser) => {
    try {
      const userData = await getUserData(fbUser.uid);
      
      if (userData) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          role: userData.role || 'investor',
          walletAddress: userData.walletAddress || null,
          createdAt: userData.createdAt || undefined,
        });
      } else {
        // If no user data is found in Firestore, set default values
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          role: 'investor', // Default role
          walletAddress: null,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set basic user info if Firestore fetch fails
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        role: 'investor', // Default role
        walletAddress: null,
      });
    }
  };

  // Function to update user data
  const updateUserData = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        await fetchUserData(fbUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    logout,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to access auth context
export function useAuthContext() {
  return useContext(AuthContext);
}