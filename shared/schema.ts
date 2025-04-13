import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").notNull(), // 'investor' or 'startup'
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  uid: true,
  email: true,
  displayName: true,
  photoURL: true,
  role: true,
  walletAddress: true,
});

// Startup schema
export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pitch: text("pitch").notNull(),
  investmentStage: text("investment_stage").notNull(),
  industry: text("industry").notNull(),
  founderId: text("founder_id").notNull(),
  founderName: text("founder_name"),
  upiId: text("upi_id").notNull(),
  qrCodeUrl: text("qr_code_url"),
  coverImageUrl: text("cover_image_url"),
  logoUrl: text("logo_url"),
  fundingGoal: numeric("funding_goal").notNull(),
  fundingRaised: numeric("funding_raised").default("0"),
  investors: integer("investors").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStartupSchema = createInsertSchema(startups).pick({
  firebaseId: true,
  name: true,
  description: true,
  pitch: true,
  investmentStage: true,
  industry: true,
  founderId: true,
  founderName: true,
  upiId: true,
  qrCodeUrl: true,
  coverImageUrl: true,
  logoUrl: true,
  fundingGoal: true,
});

// Startup Documents schema
export const startupDocuments = pgTable("startup_documents", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  firebaseId: text("firebase_id"),
  type: text("type").notNull(), // 'pitchDeck', 'financialReport', 'investorAgreement', 'riskDisclosure'
  name: text("name").notNull(),
  url: text("url").notNull(),
  contentType: text("content_type"),
  size: integer("size"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStartupDocumentSchema = createInsertSchema(startupDocuments).pick({
  startupId: true,
  firebaseId: true,
  type: true,
  name: true,
  url: true,
  contentType: true,
  size: true,
});

// Startup Updates schema
export const startupUpdates = pgTable("startup_updates", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  firebaseId: text("firebase_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStartupUpdateSchema = createInsertSchema(startupUpdates).pick({
  startupId: true,
  firebaseId: true,
  message: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id"),
  investorId: text("investor_id").notNull(),
  investorName: text("investor_name"),
  startupId: text("startup_id").notNull(),
  startupName: text("startup_name"),
  amount: numeric("amount").notNull(),
  method: text("method").notNull(), // 'metamask' or 'upi'
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed'
  transactionId: text("transaction_id"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  firebaseId: true,
  investorId: true,
  investorName: true,
  startupId: true,
  startupName: true,
  amount: true,
  method: true,
  status: true,
  transactionId: true,
  walletAddress: true,
});

// Chat Room schema
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  participants: text("participants").array().notNull(),
  lastMessage: jsonb("last_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).pick({
  firebaseId: true,
  participants: true,
  lastMessage: true,
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  firebaseId: text("firebase_id").notNull().unique(),
  roomId: text("room_id").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name"),
  recipientId: text("recipient_id").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  read: boolean("read").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  firebaseId: true,
  roomId: true,
  senderId: true,
  senderName: true,
  recipientId: true,
  message: true,
  timestamp: true,
  read: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Startup = typeof startups.$inferSelect;
export type InsertStartup = z.infer<typeof insertStartupSchema>;

export type StartupDocument = typeof startupDocuments.$inferSelect;
export type InsertStartupDocument = z.infer<typeof insertStartupDocumentSchema>;

export type StartupUpdate = typeof startupUpdates.$inferSelect;
export type InsertStartupUpdate = z.infer<typeof insertStartupUpdateSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
