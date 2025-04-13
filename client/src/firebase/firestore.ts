import { 
  collection, 
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { firestore } from './config';

// Startup data interface
export interface StartupData {
  id?: string;
  name: string;
  description: string;
  pitch: string;
  investmentStage: string;
  industry: string;
  founderId: string;
  founderName: string;
  upiId: string;
  qrCodeUrl: string;
  coverImageUrl: string;
  logoUrl: string;
  fundingGoal: number;
  fundingRaised: number;
  investors: number;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

// Startup document interface
export interface StartupDocument {
  id?: string;
  startupId: string;
  type: 'pitchDeck' | 'financialReport' | 'investorAgreement' | 'riskDisclosure';
  name: string;
  url: string;
  contentType: string;
  size: number;
  createdAt: Timestamp | string;
}

// Startup update/post interface
export interface StartupUpdate {
  id?: string;
  startupId: string;
  message: string;
  createdAt: Timestamp | string;
}

// Transaction data interface
export interface TransactionData {
  id?: string;
  investorId: string;
  investorName: string;
  startupId: string;
  startupName: string;
  amount: number;
  method: 'metamask' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  walletAddress?: string;
  createdAt: Timestamp | string;
}

/**
 * Create a new startup
 */
export const createStartup = async (startupData: Omit<StartupData, 'id' | 'createdAt' | 'updatedAt' | 'fundingRaised' | 'investors'>) => {
  try {
    const now = Timestamp.now();
    
    const data = {
      ...startupData,
      fundingRaised: 0,
      investors: 0,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'startups'), data);
    
    return {
      id: docRef.id,
      ...data
    };
  } catch (error) {
    console.error('Error creating startup:', error);
    throw error;
  }
};

/**
 * Get a startup by its ID
 */
export const getStartupById = async (startupId: string) => {
  try {
    const docRef = doc(firestore, 'startups', startupId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as StartupData;
  } catch (error) {
    console.error('Error getting startup:', error);
    throw error;
  }
};

/**
 * Get a startup by founder ID
 */
export const getStartupByFounderId = async (founderId: string) => {
  try {
    const q = query(
      collection(firestore, 'startups'),
      where('founderId', '==', founderId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docSnap = querySnapshot.docs[0];
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as StartupData;
  } catch (error) {
    console.error('Error getting startup by founder ID:', error);
    throw error;
  }
};

/**
 * Get all startups with pagination
 */
export const getAllStartups = async (lastStartup?: DocumentData, pageSize = 10) => {
  try {
    let q = query(
      collection(firestore, 'startups'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastStartup) {
      q = query(
        collection(firestore, 'startups'),
        orderBy('createdAt', 'desc'),
        startAfter(lastStartup),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const startups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StartupData[];
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      startups,
      lastVisible,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting all startups:', error);
    throw error;
  }
};

/**
 * Get filtered startups with pagination
 */
export const getFilteredStartups = async (
  filters: {
    industry?: string;
    investmentStage?: string;
    minFundingGoal?: number;
    maxFundingGoal?: number;
  },
  lastStartup?: DocumentData,
  pageSize = 10
) => {
  try {
    // Build query
    let q = query(
      collection(firestore, 'startups'),
      orderBy('createdAt', 'desc')
    );
    
    // Add filters
    if (filters.industry) {
      q = query(q, where('industry', '==', filters.industry));
    }
    
    if (filters.investmentStage) {
      q = query(q, where('investmentStage', '==', filters.investmentStage));
    }
    
    if (filters.minFundingGoal) {
      q = query(q, where('fundingGoal', '>=', filters.minFundingGoal));
    }
    
    if (filters.maxFundingGoal) {
      q = query(q, where('fundingGoal', '<=', filters.maxFundingGoal));
    }
    
    // Add pagination
    if (lastStartup) {
      q = query(q, startAfter(lastStartup));
    }
    
    q = query(q, limit(pageSize));
    
    const querySnapshot = await getDocs(q);
    
    const startups = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StartupData[];
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      startups,
      lastVisible,
      hasMore: querySnapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error getting filtered startups:', error);
    throw error;
  }
};

/**
 * Update a startup
 */
export const updateStartup = async (startupId: string, updateData: Partial<StartupData>) => {
  try {
    const docRef = doc(firestore, 'startups', startupId);
    
    // Add updated timestamp
    const data = {
      ...updateData,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(docRef, data);
    
    // Get the updated startup
    const docSnap = await getDoc(docRef);
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as StartupData;
  } catch (error) {
    console.error('Error updating startup:', error);
    throw error;
  }
};

/**
 * Add a startup document
 */
export const addStartupDocument = async (documentData: Omit<StartupDocument, 'id' | 'createdAt'>) => {
  try {
    const now = Timestamp.now();
    
    const data = {
      ...documentData,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'startupDocuments'), data);
    
    return {
      id: docRef.id,
      ...data
    };
  } catch (error) {
    console.error('Error adding startup document:', error);
    throw error;
  }
};

/**
 * Get startup documents
 */
export const getStartupDocuments = async (startupId: string) => {
  try {
    const q = query(
      collection(firestore, 'startupDocuments'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StartupDocument[];
  } catch (error) {
    console.error('Error getting startup documents:', error);
    throw error;
  }
};

/**
 * Add a startup update/post
 */
export const addStartupUpdate = async (updateData: Omit<StartupUpdate, 'id' | 'createdAt'>) => {
  try {
    const now = Timestamp.now();
    
    const data = {
      ...updateData,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'startupUpdates'), data);
    
    return {
      id: docRef.id,
      ...data
    };
  } catch (error) {
    console.error('Error adding startup update:', error);
    throw error;
  }
};

/**
 * Get startup updates/posts
 */
export const getStartupUpdates = async (startupId: string) => {
  try {
    const q = query(
      collection(firestore, 'startupUpdates'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StartupUpdate[];
  } catch (error) {
    console.error('Error getting startup updates:', error);
    throw error;
  }
};

/**
 * Create a transaction
 */
export const createTransaction = async (transactionData: Omit<TransactionData, 'id' | 'createdAt'>) => {
  try {
    const now = Timestamp.now();
    
    const data = {
      ...transactionData,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'transactions'), data);
    
    // Update startup funding and investor count if transaction is completed
    if (transactionData.status === 'completed') {
      const startupRef = doc(firestore, 'startups', transactionData.startupId);
      
      await updateDoc(startupRef, {
        fundingRaised: increment(transactionData.amount),
        investors: increment(1),
        updatedAt: now
      });
    }
    
    return {
      id: docRef.id,
      ...data
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (transactionId: string, status: 'pending' | 'completed' | 'failed', transactionHash?: string) => {
  try {
    const docRef = doc(firestore, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = docSnap.data() as TransactionData;
    const previousStatus = transaction.status;
    
    // Update transaction status
    const updateData: Record<string, any> = { status };
    
    if (transactionHash) {
      updateData.transactionId = transactionHash;
    }
    
    await updateDoc(docRef, updateData);
    
    // Update startup funding and investor count if status changed to completed
    if (previousStatus !== 'completed' && status === 'completed') {
      const startupRef = doc(firestore, 'startups', transaction.startupId);
      
      await updateDoc(startupRef, {
        fundingRaised: increment(transaction.amount),
        investors: increment(1),
        updatedAt: Timestamp.now()
      });
    }
    
    // If status changed from completed to failed, decrement funding and investor count
    if (previousStatus === 'completed' && status === 'failed') {
      const startupRef = doc(firestore, 'startups', transaction.startupId);
      
      await updateDoc(startupRef, {
        fundingRaised: increment(-transaction.amount),
        investors: increment(-1),
        updatedAt: Timestamp.now()
      });
    }
    
    const updatedDocSnap = await getDoc(docRef);
    
    return {
      id: updatedDocSnap.id,
      ...updatedDocSnap.data()
    } as TransactionData;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (userId: string, role: 'investor' | 'startup') => {
  try {
    const field = role === 'investor' ? 'investorId' : 'startupId';
    
    const q = query(
      collection(firestore, 'transactions'),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TransactionData[];
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

/**
 * Get investor stats
 */
export const getInvestorStats = async (investorId: string) => {
  try {
    // Get all completed transactions
    const q = query(
      collection(firestore, 'transactions'),
      where('investorId', '==', investorId),
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TransactionData[];
    
    // Calculate stats
    const totalInvested = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const activeInvestments = new Set(transactions.map(tx => tx.startupId)).size;
    
    return {
      totalInvested,
      activeInvestments,
      totalTransactions: transactions.length
    };
  } catch (error) {
    console.error('Error getting investor stats:', error);
    throw error;
  }
};

/**
 * Get startup stats
 */
export const getStartupStats = async (startupId: string) => {
  try {
    // Get startup data
    const startupDoc = await getStartupById(startupId);
    
    if (!startupDoc) {
      throw new Error('Startup not found');
    }
    
    // Get completed transactions
    const q = query(
      collection(firestore, 'transactions'),
      where('startupId', '==', startupId),
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(q);
    
    const transactions = querySnapshot.docs.map(doc => doc.data());
    
    // Calculate stats
    const fundingRaised = startupDoc.fundingRaised;
    const fundingGoal = startupDoc.fundingGoal;
    const progress = fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;
    const investors = startupDoc.investors;
    
    return {
      fundingRaised,
      fundingGoal,
      progress,
      investors,
      totalTransactions: transactions.length
    };
  } catch (error) {
    console.error('Error getting startup stats:', error);
    throw error;
  }
};