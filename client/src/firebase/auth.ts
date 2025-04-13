import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { auth, firestore } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserRole } from "../contexts/AuthContext";

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email and password
export const signUpWithEmail = async ({ email, password, displayName, role }: SignUpData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user profile with display name
    await updateProfile(user, { displayName });
    
    // Store additional user data in Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      walletAddress: null,
    });
    
    return user;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async ({ email, password }: SignInData) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user already exists in Firestore
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    
    if (!userDoc.exists()) {
      // If user doesn't exist, create a new user document
      // Note: Role will need to be set later, defaulting to investor
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "investor", // Default role, can be changed in settings
        createdAt: new Date().toISOString(),
        walletAddress: null,
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user data from Firestore
export const getUserData = async (user: FirebaseUser) => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Update user wallet address
export const updateUserWalletAddress = async (userId: string, walletAddress: string) => {
  try {
    await setDoc(doc(firestore, "users", userId), {
      walletAddress
    }, { merge: true });
  } catch (error) {
    console.error("Error updating wallet address:", error);
    throw error;
  }
};

// Set up an auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
