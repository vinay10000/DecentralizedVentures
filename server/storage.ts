import { 
  User, 
  InsertUser, 
  Startup, 
  InsertStartup,
  StartupDocument,
  InsertStartupDocument,
  StartupUpdate,
  InsertStartupUpdate,
  Transaction,
  InsertTransaction,
  ChatRoom,
  InsertChatRoom,
  Message,
  InsertMessage
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUID(uid: string): Promise<User | undefined>;
  updateUserWallet(uid: string, walletAddress: string): Promise<User | undefined>;

  // Startup operations
  createStartup(startup: InsertStartup): Promise<Startup>;
  getStartupById(id: number): Promise<Startup | undefined>;
  getStartupByFirebaseId(firebaseId: string): Promise<Startup | undefined>;
  getStartupByFounderId(founderId: string): Promise<Startup | undefined>;
  getStartups(page?: number, limit?: number): Promise<{ startups: Startup[], total: number }>;
  updateStartup(id: number, data: Partial<InsertStartup>): Promise<Startup>;

  // Startup document operations
  addStartupDocument(document: InsertStartupDocument): Promise<StartupDocument>;
  getStartupDocuments(startupId: number): Promise<StartupDocument[]>;

  // Startup update operations
  addStartupUpdate(update: InsertStartupUpdate): Promise<StartupUpdate>;
  getStartupUpdates(startupId: number): Promise<StartupUpdate[]>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByInvestorId(investorId: string): Promise<Transaction[]>;
  getTransactionsByStartupId(startupId: string): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string, transactionHash?: string): Promise<Transaction | undefined>;

  // Statistics operations
  getInvestorStats(investorId: string): Promise<{
    totalInvested: number;
    activeInvestments: number;
    totalTransactions: number;
  }>;
  getStartupStats(startupId: number): Promise<{
    fundingRaised: number;
    fundingGoal: number;
    progress: number;
    investors: number;
    totalTransactions: number;
  }>;

  // Chat operations
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatRoomById(id: number): Promise<ChatRoom | undefined>;
  getChatRoomsByUserId(userId: string): Promise<ChatRoom[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  getMessagesByRoomId(roomId: string): Promise<Message[]>;
  markMessagesAsRead(roomId: string, userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private startups: Map<number, Startup>;
  private startupDocuments: Map<number, StartupDocument>;
  private startupUpdates: Map<number, StartupUpdate>;
  private transactions: Map<number, Transaction>;
  private chatRooms: Map<number, ChatRoom>;
  private messages: Map<number, Message>;
  
  private currentUserId: number = 1;
  private currentStartupId: number = 1;
  private currentDocumentId: number = 1;
  private currentUpdateId: number = 1;
  private currentTransactionId: number = 1;
  private currentChatRoomId: number = 1;
  private currentMessageId: number = 1;

  constructor() {
    this.users = new Map();
    this.startups = new Map();
    this.startupDocuments = new Map();
    this.startupUpdates = new Map();
    this.transactions = new Map();
    this.chatRooms = new Map();
    this.messages = new Map();
  }

  // USER OPERATIONS
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    const user: User = {
      id,
      ...insertUser,
      createdAt: now,
    };
    
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUID(uid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.uid === uid);
  }

  async updateUserWallet(uid: string, walletAddress: string): Promise<User | undefined> {
    const user = await this.getUserByUID(uid);
    
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      walletAddress,
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }

  // STARTUP OPERATIONS
  async createStartup(insertStartup: InsertStartup): Promise<Startup> {
    const id = this.currentStartupId++;
    const now = new Date();
    
    const startup: Startup = {
      id,
      ...insertStartup,
      fundingRaised: 0,
      investors: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    this.startups.set(id, startup);
    return startup;
  }

  async getStartupById(id: number): Promise<Startup | undefined> {
    return this.startups.get(id);
  }

  async getStartupByFirebaseId(firebaseId: string): Promise<Startup | undefined> {
    return Array.from(this.startups.values()).find(
      startup => startup.firebaseId === firebaseId
    );
  }

  async getStartupByFounderId(founderId: string): Promise<Startup | undefined> {
    return Array.from(this.startups.values()).find(
      startup => startup.founderId === founderId
    );
  }

  async getStartups(page: number = 1, limit: number = 10): Promise<{ startups: Startup[], total: number }> {
    const startups = Array.from(this.startups.values());
    const total = startups.length;
    
    // Sort by created date (newest first)
    startups.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedStartups = startups.slice(start, end);
    
    return {
      startups: paginatedStartups,
      total,
    };
  }

  async updateStartup(id: number, data: Partial<InsertStartup>): Promise<Startup> {
    const startup = await this.getStartupById(id);
    
    if (!startup) {
      throw new Error(`Startup with ID ${id} not found`);
    }
    
    const updatedStartup: Startup = {
      ...startup,
      ...data,
      updatedAt: new Date(),
    };
    
    this.startups.set(id, updatedStartup);
    return updatedStartup;
  }

  // STARTUP DOCUMENT OPERATIONS
  async addStartupDocument(insertDocument: InsertStartupDocument): Promise<StartupDocument> {
    const id = this.currentDocumentId++;
    const now = new Date();
    
    const document: StartupDocument = {
      id,
      ...insertDocument,
      createdAt: now,
    };
    
    this.startupDocuments.set(id, document);
    return document;
  }

  async getStartupDocuments(startupId: number): Promise<StartupDocument[]> {
    return Array.from(this.startupDocuments.values())
      .filter(doc => doc.startupId === startupId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }

  // STARTUP UPDATE OPERATIONS
  async addStartupUpdate(insertUpdate: InsertStartupUpdate): Promise<StartupUpdate> {
    const id = this.currentUpdateId++;
    const now = new Date();
    
    const update: StartupUpdate = {
      id,
      ...insertUpdate,
      createdAt: now,
    };
    
    this.startupUpdates.set(id, update);
    return update;
  }

  async getStartupUpdates(startupId: number): Promise<StartupUpdate[]> {
    return Array.from(this.startupUpdates.values())
      .filter(update => update.startupId === startupId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }

  // TRANSACTION OPERATIONS
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const now = new Date();
    
    const transaction: Transaction = {
      id,
      ...insertTransaction,
      createdAt: now,
    };
    
    this.transactions.set(id, transaction);
    
    // If transaction is completed, update startup funding stats
    if (transaction.status === 'completed') {
      await this.updateStartupFunding(transaction);
    }
    
    return transaction;
  }

  private async updateStartupFunding(transaction: Transaction): Promise<void> {
    // Find the startup by firebase ID
    const startup = await this.getStartupByFirebaseId(transaction.startupId);
    
    if (!startup) return;
    
    // Get all completed transactions for this startup
    const completedTransactions = Array.from(this.transactions.values())
      .filter(t => t.startupId === transaction.startupId && t.status === 'completed');
    
    // Calculate total funding and unique investors
    const totalFunding = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const uniqueInvestors = new Set(completedTransactions.map(t => t.investorId)).size;
    
    // Update the startup record
    const updatedStartup: Startup = {
      ...startup,
      fundingRaised: totalFunding,
      investors: uniqueInvestors,
      updatedAt: new Date(),
    };
    
    this.startups.set(startup.id, updatedStartup);
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByInvestorId(investorId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.investorId === investorId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async getTransactionsByStartupId(startupId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.startupId === startupId)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async updateTransactionStatus(
    id: number, 
    status: string, 
    transactionHash?: string
  ): Promise<Transaction | undefined> {
    const transaction = await this.getTransactionById(id);
    
    if (!transaction) return undefined;
    
    const previousStatus = transaction.status;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status,
      transactionId: transactionHash || transaction.transactionId,
    };
    
    this.transactions.set(id, updatedTransaction);
    
    // If status changed to or from 'completed', update startup funding
    if (
      (status === 'completed' && previousStatus !== 'completed') ||
      (status !== 'completed' && previousStatus === 'completed')
    ) {
      await this.updateStartupFunding(updatedTransaction);
    }
    
    return updatedTransaction;
  }

  // STATISTICS OPERATIONS
  async getInvestorStats(investorId: string): Promise<{
    totalInvested: number;
    activeInvestments: number;
    totalTransactions: number;
  }> {
    const transactions = await this.getTransactionsByInvestorId(investorId);
    
    // Count only completed transactions
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    
    // Calculate total invested
    const totalInvested = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Count unique startups (active investments)
    const uniqueStartups = new Set(completedTransactions.map(t => t.startupId)).size;
    
    return {
      totalInvested,
      activeInvestments: uniqueStartups,
      totalTransactions: completedTransactions.length,
    };
  }

  async getStartupStats(startupId: number): Promise<{
    fundingRaised: number;
    fundingGoal: number;
    progress: number;
    investors: number;
    totalTransactions: number;
  }> {
    const startup = await this.getStartupById(startupId);
    
    if (!startup) {
      throw new Error(`Startup with ID ${startupId} not found`);
    }
    
    const startupFirebaseId = startup.firebaseId;
    const transactions = await this.getTransactionsByStartupId(startupFirebaseId);
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    
    // Count unique investors
    const uniqueInvestors = new Set(completedTransactions.map(t => t.investorId)).size;
    
    const fundingRaised = Number(startup.fundingRaised);
    const fundingGoal = Number(startup.fundingGoal);
    
    return {
      fundingRaised,
      fundingGoal,
      progress: fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0,
      investors: uniqueInvestors,
      totalTransactions: completedTransactions.length,
    };
  }

  // CHAT OPERATIONS
  async createChatRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const id = this.currentChatRoomId++;
    const now = new Date();
    
    const room: ChatRoom = {
      id,
      ...insertRoom,
      createdAt: now,
    };
    
    this.chatRooms.set(id, room);
    return room;
  }

  async getChatRoomById(id: number): Promise<ChatRoom | undefined> {
    return this.chatRooms.get(id);
  }

  async getChatRoomsByUserId(userId: string): Promise<ChatRoom[]> {
    return Array.from(this.chatRooms.values())
      .filter(room => room.participants.includes(userId))
      .sort((a, b) => {
        // Sort by last message timestamp, then by created date
        const lastMsgTimeA = a.lastMessage?.timestamp || 0;
        const lastMsgTimeB = b.lastMessage?.timestamp || 0;
        
        if (lastMsgTimeA !== lastMsgTimeB) {
          return lastMsgTimeB - lastMsgTimeA;
        }
        
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    
    const message: Message = {
      id,
      ...insertMessage,
    };
    
    this.messages.set(id, message);
    
    // Update the last message in the chat room
    const rooms = Array.from(this.chatRooms.values());
    const room = rooms.find(r => r.firebaseId === insertMessage.roomId);
    
    if (room) {
      const updatedRoom: ChatRoom = {
        ...room,
        lastMessage: {
          text: insertMessage.message,
          timestamp: new Date(insertMessage.timestamp),
          senderId: insertMessage.senderId,
        },
      };
      
      this.chatRooms.set(room.id, updatedRoom);
    }
    
    return message;
  }

  async getMessagesByRoomId(roomId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.roomId === roomId)
      .sort((a, b) => {
        const timeA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const timeB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return timeA.getTime() - timeB.getTime();
      });
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    const messages = Array.from(this.messages.values())
      .filter(message => message.roomId === roomId && message.recipientId === userId && !message.read);
    
    for (const message of messages) {
      const updatedMessage: Message = {
        ...message,
        read: true,
      };
      
      this.messages.set(message.id, updatedMessage);
    }
  }
}

export const storage = new MemStorage();
