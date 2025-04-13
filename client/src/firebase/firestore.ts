import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  orderBy,
  limit,
  startAfter,
  DocumentData
} from "firebase/firestore";
import { firestore } from "./config";

// Startup Types
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

export interface StartupUpdate {
  id?: string;
  startupId: string;
  message: string;
  createdAt: Timestamp | string;
}

// Investment Transaction Types
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

// CRUD Operations for Startups
export const createStartup = async (startupData: Omit<StartupData, 'id' | 'createdAt' | 'updatedAt' | 'fundingRaised' | 'investors'>) => {
  try {
    const now = new Date().toISOString();
    const newStartup = {
      ...startupData,
      fundingRaised: 0,
      investors: 0,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(firestore, 'startups'), newStartup);
    return {
      id: docRef.id,
      ...newStartup
    };
  } catch (error) {
    console.error('Error creating startup:', error);
    throw error;
  }
};

export const getStartupById = async (startupId: string) => {
  try {
    const docRef = doc(firestore, 'startups', startupId);
    const startupDoc = await getDoc(docRef);
    
    if (startupDoc.exists()) {
      return {
        id: startupDoc.id,
        ...startupDoc.data()
      } as StartupData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting startup:', error);
    throw error;
  }
};

export const getStartupByFounderId = async (founderId: string) => {
  try {
    const q = query(collection(firestore, 'startups'), where('founderId', '==', founderId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const startupDoc = querySnapshot.docs[0];
      return {
        id: startupDoc.id,
        ...startupDoc.data()
      } as StartupData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting startup by founder:', error);
    throw error;
  }
};

export const getAllStartups = async (lastStartup?: DocumentData, pageSize = 10) => {
  try {
    let startupQuery;
    
    if (lastStartup) {
      startupQuery = query(
        collection(firestore, 'startups'),
        orderBy('createdAt', 'desc'),
        startAfter(lastStartup),
        limit(pageSize)
      );
    } else {
      startupQuery = query(
        collection(firestore, 'startups'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(startupQuery);
    
    const startups: StartupData[] = [];
    querySnapshot.forEach(doc => {
      startups.push({
        id: doc.id,
        ...doc.data()
      } as StartupData);
    });
    
    return {
      startups,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error getting all startups:', error);
    throw error;
  }
};

export const getFilteredStartups = async (
  filters: {
    investmentStage?: string;
    industry?: string;
    searchTerm?: string;
  },
  sortBy = 'createdAt',
  lastStartup?: DocumentData,
  pageSize = 10
) => {
  try {
    let startupQuery = collection(firestore, 'startups');
    let constraints = [];
    
    if (filters.investmentStage && filters.investmentStage !== 'All Stages') {
      constraints.push(where('investmentStage', '==', filters.investmentStage));
    }
    
    if (filters.industry && filters.industry !== 'All Industries') {
      constraints.push(where('industry', '==', filters.industry));
    }
    
    // Note: For text search, Firestore doesn't have built-in full text search
    // For production, might need to use Algolia or similar
    // This is a simplified implementation
    
    let queryObj;
    if (constraints.length > 0) {
      queryObj = query(startupQuery, ...constraints, orderBy(sortBy, 'desc'), limit(pageSize));
    } else {
      queryObj = query(startupQuery, orderBy(sortBy, 'desc'), limit(pageSize));
    }
    
    if (lastStartup) {
      queryObj = query(queryObj, startAfter(lastStartup));
    }
    
    const querySnapshot = await getDocs(queryObj);
    
    const startups: StartupData[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data() as StartupData;
      
      // If there's a search term, filter in memory
      if (filters.searchTerm && !data.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !data.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return;
      }
      
      startups.push({
        id: doc.id,
        ...data
      });
    });
    
    return {
      startups,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error getting filtered startups:', error);
    throw error;
  }
};

export const updateStartup = async (startupId: string, updateData: Partial<StartupData>) => {
  try {
    const startupRef = doc(firestore, 'startups', startupId);
    await updateDoc(startupRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    // Get the updated startup
    const updatedStartup = await getStartupById(startupId);
    return updatedStartup;
  } catch (error) {
    console.error('Error updating startup:', error);
    throw error;
  }
};

// Startup Documents
export const addStartupDocument = async (documentData: Omit<StartupDocument, 'id' | 'createdAt'>) => {
  try {
    const now = new Date().toISOString();
    const newDocument = {
      ...documentData,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'startupDocuments'), newDocument);
    return {
      id: docRef.id,
      ...newDocument
    };
  } catch (error) {
    console.error('Error adding startup document:', error);
    throw error;
  }
};

export const getStartupDocuments = async (startupId: string) => {
  try {
    const q = query(
      collection(firestore, 'startupDocuments'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const documents: StartupDocument[] = [];
    querySnapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as StartupDocument);
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting startup documents:', error);
    throw error;
  }
};

// Startup Updates
export const addStartupUpdate = async (updateData: Omit<StartupUpdate, 'id' | 'createdAt'>) => {
  try {
    const now = new Date().toISOString();
    const newUpdate = {
      ...updateData,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'startupUpdates'), newUpdate);
    return {
      id: docRef.id,
      ...newUpdate
    };
  } catch (error) {
    console.error('Error adding startup update:', error);
    throw error;
  }
};

export const getStartupUpdates = async (startupId: string) => {
  try {
    const q = query(
      collection(firestore, 'startupUpdates'),
      where('startupId', '==', startupId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const updates: StartupUpdate[] = [];
    querySnapshot.forEach(doc => {
      updates.push({
        id: doc.id,
        ...doc.data()
      } as StartupUpdate);
    });
    
    return updates;
  } catch (error) {
    console.error('Error getting startup updates:', error);
    throw error;
  }
};

// Investment Transactions
export const createTransaction = async (transactionData: Omit<TransactionData, 'id' | 'createdAt'>) => {
  try {
    const now = new Date().toISOString();
    const newTransaction = {
      ...transactionData,
      createdAt: now
    };
    
    const docRef = await addDoc(collection(firestore, 'transactions'), newTransaction);
    
    // Update startup funding raised and investors count
    const startupRef = doc(firestore, 'startups', transactionData.startupId);
    const startupDoc = await getDoc(startupRef);
    
    if (startupDoc.exists()) {
      const startupData = startupDoc.data() as StartupData;
      const newFundingRaised = (startupData.fundingRaised || 0) + transactionData.amount;
      
      // Check if this investor has invested before
      const investorQ = query(
        collection(firestore, 'transactions'),
        where('startupId', '==', transactionData.startupId),
        where('investorId', '==', transactionData.investorId),
        where('status', '==', 'completed')
      );
      const investorQuerySnapshot = await getDocs(investorQ);
      
      // Only increment investors count if this is the first investment from this investor
      const isNewInvestor = investorQuerySnapshot.empty;
      const newInvestorsCount = isNewInvestor 
        ? (startupData.investors || 0) + 1 
        : (startupData.investors || 0);
      
      await updateDoc(startupRef, {
        fundingRaised: newFundingRaised,
        investors: newInvestorsCount,
        updatedAt: now
      });
    }
    
    return {
      id: docRef.id,
      ...newTransaction
    };
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransactionStatus = async (transactionId: string, status: 'pending' | 'completed' | 'failed', transactionHash?: string) => {
  try {
    const transactionRef = doc(firestore, 'transactions', transactionId);
    const updateData: any = { status };
    
    if (transactionHash) {
      updateData.transactionId = transactionHash;
    }
    
    await updateDoc(transactionRef, updateData);
    
    // If status is failed, we may need to revert the startup funding changes
    if (status === 'failed') {
      const transactionDoc = await getDoc(transactionRef);
      
      if (transactionDoc.exists()) {
        const transactionData = transactionDoc.data() as TransactionData;
        
        // Only revert if it was previously completed
        if (transactionData.status === 'completed') {
          const startupRef = doc(firestore, 'startups', transactionData.startupId);
          const startupDoc = await getDoc(startupRef);
          
          if (startupDoc.exists()) {
            const startupData = startupDoc.data() as StartupData;
            const newFundingRaised = (startupData.fundingRaised || 0) - transactionData.amount;
            
            // We don't decrement the investors count as it's more complex to determine
            await updateDoc(startupRef, {
              fundingRaised: newFundingRaised > 0 ? newFundingRaised : 0,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

export const getUserTransactions = async (userId: string, role: 'investor' | 'startup') => {
  try {
    const fieldToQuery = role === 'investor' ? 'investorId' : 'startupId';
    
    const q = query(
      collection(firestore, 'transactions'),
      where(fieldToQuery, '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const transactions: TransactionData[] = [];
    querySnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as TransactionData);
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

// Get user investment statistics
export const getInvestorStats = async (investorId: string) => {
  try {
    const q = query(
      collection(firestore, 'transactions'),
      where('investorId', '==', investorId),
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(q);
    
    let totalInvested = 0;
    const startupIds = new Set<string>();
    
    querySnapshot.forEach(doc => {
      const data = doc.data() as TransactionData;
      totalInvested += data.amount;
      startupIds.add(data.startupId);
    });
    
    return {
      totalInvested,
      activeInvestments: startupIds.size,
      totalTransactions: querySnapshot.size
    };
  } catch (error) {
    console.error('Error getting investor stats:', error);
    throw error;
  }
};

export const getStartupStats = async (startupId: string) => {
  try {
    const startupDoc = await getDoc(doc(firestore, 'startups', startupId));
    
    if (!startupDoc.exists()) {
      throw new Error('Startup not found');
    }
    
    const startupData = startupDoc.data() as StartupData;
    
    const q = query(
      collection(firestore, 'transactions'),
      where('startupId', '==', startupId),
      where('status', '==', 'completed')
    );
    
    const querySnapshot = await getDocs(q);
    
    const uniqueInvestors = new Set<string>();
    querySnapshot.forEach(doc => {
      const data = doc.data() as TransactionData;
      uniqueInvestors.add(data.investorId);
    });
    
    return {
      fundingRaised: startupData.fundingRaised || 0,
      fundingGoal: startupData.fundingGoal || 0,
      progress: startupData.fundingGoal ? (startupData.fundingRaised / startupData.fundingGoal) * 100 : 0,
      investors: uniqueInvestors.size,
      totalTransactions: querySnapshot.size
    };
  } catch (error) {
    console.error('Error getting startup stats:', error);
    throw error;
  }
};
