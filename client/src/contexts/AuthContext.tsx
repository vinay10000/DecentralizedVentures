import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChange, getUserData } from '../firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'investor' | 'startup';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  walletAddress: string | null;
  createdAt?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserData: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userData = await getUserData(firebaseUser);
          
          if (userData) {
            // Combine Firebase auth user with Firestore user data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: userData.role || 'investor', // Default to investor if role not set
              walletAddress: userData.walletAddress || null,
              createdAt: userData.createdAt,
            });
          } else {
            // If no Firestore data, use just the Firebase auth data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'investor', // Default to investor
              walletAddress: null,
            });
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to update user data (e.g., after wallet connection)
  const updateUserData = async () => {
    if (!firebaseUser) return;

    try {
      const userData = await getUserData(firebaseUser);
      
      if (userData) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userData.role || 'investor',
          walletAddress: userData.walletAddress || null,
          createdAt: userData.createdAt,
        });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await import('../firebase/auth').then(({ signOutUser }) => signOutUser());
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
