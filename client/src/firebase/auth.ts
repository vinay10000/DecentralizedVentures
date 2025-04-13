import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, firestore } from './config';
import { User, UserRole } from '../contexts/AuthContext';

// Export auth for usage in other components
export { auth };

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string,
  role: UserRole
): Promise<User> => {
  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;
  
  // Update user profile with display name
  await updateProfile(fbUser, { displayName });
  
  // Create user document in Firestore
  const userData: User = {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    role,
    walletAddress: null,
    createdAt: Timestamp.now().toDate().toISOString()
  };
  
  await setDoc(doc(firestore, 'users', fbUser.uid), userData);
  
  return userData;
};

// This is a wrapper for registerUser to match the expected function signature in SignUpForm
export const signUpWithEmail = async (
  { email, password, displayName, role }: 
  { email: string; password: string; displayName: string; role: UserRole }
): Promise<User> => {
  return registerUser(email, password, displayName, role);
};

/**
 * Sign in with email and password
 */
export const loginUser = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// This is a wrapper for loginUser to match the expected function signature in SignInForm
export const signInWithEmail = async ({ email, password }: { email: string; password: string }): Promise<FirebaseUser> => {
  return loginUser(email, password);
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<{ user: FirebaseUser, isNewUser: boolean }> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  
  // Check if user document exists in Firestore
  const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
  let isNewUser = false;
  
  if (!userDoc.exists()) {
    isNewUser = true;
  }
  
  return { user: userCredential.user, isNewUser };
};

/**
 * Complete Google sign-in process by creating user document
 */
export const completeGoogleSignIn = async (uid: string, role: UserRole): Promise<User> => {
  const fbUser = auth.currentUser;
  
  if (!fbUser || fbUser.uid !== uid) {
    throw new Error('User not authenticated');
  }
  
  // Create user document in Firestore
  const userData: User = {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    role,
    walletAddress: null,
    createdAt: Timestamp.now().toDate().toISOString()
  };
  
  await setDoc(doc(firestore, 'users', fbUser.uid), userData);
  
  return userData;
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Get current user data from Firestore
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(firestore, 'users', uid));
  
  if (!userDoc.exists()) {
    return null;
  }
  
  return userDoc.data() as User;
};

/**
 * Update user's wallet address
 */
export const updateUserWalletAddress = async (uid: string, walletAddress: string): Promise<void> => {
  await updateDoc(doc(firestore, 'users', uid), { walletAddress });
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string, 
  data: Partial<Pick<User, 'displayName' | 'photoURL' | 'role'>>
): Promise<void> => {
  // Update Auth profile if display name or photo URL is changed
  if (auth.currentUser && (data.displayName || data.photoURL)) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName || auth.currentUser.displayName,
      photoURL: data.photoURL || auth.currentUser.photoURL
    });
  }
  
  // Update Firestore document
  await updateDoc(doc(firestore, 'users', uid), data);
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};