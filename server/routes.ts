import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertStartupSchema,
  insertStartupDocumentSchema,
  insertStartupUpdateSchema,
  insertTransactionSchema,
  insertChatRoomSchema,
  insertMessageSchema,
} from "@shared/schema";
import { z } from "zod";
import { ZodValidationError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "startup-vest-secret"
    })
  );

  // Helper function to handle validation and common error responses
  const validateRequest = async <T extends z.ZodTypeAny>(
    schema: T,
    data: any
  ): Promise<z.infer<T>> => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ZodValidationError(error);
        throw new Error(validationError.message);
      }
      throw error;
    }
  };

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // USER ROUTES
  // Create a new user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = await validateRequest(insertUserSchema, req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user by UID
  app.get("/api/users/:uid", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUID(req.params.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user wallet
  app.patch("/api/users/:uid/wallet", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }
      
      const updatedUser = await storage.updateUserWallet(req.params.uid, walletAddress);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // STARTUP ROUTES
  // Create a new startup
  app.post("/api/startups", async (req: Request, res: Response) => {
    try {
      const startupData = await validateRequest(insertStartupSchema, req.body);
      const startup = await storage.createStartup(startupData);
      res.status(201).json(startup);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all startups with optional pagination
  app.get("/api/startups", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const startups = await storage.getStartups(page, limit);
      res.json(startups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get startup by ID
  app.get("/api/startups/:id", async (req: Request, res: Response) => {
    try {
      const startup = await storage.getStartupById(parseInt(req.params.id));
      if (!startup) {
        return res.status(404).json({ error: "Startup not found" });
      }
      res.json(startup);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get startup by firebase ID
  app.get("/api/startups/firebase/:firebaseId", async (req: Request, res: Response) => {
    try {
      const startup = await storage.getStartupByFirebaseId(req.params.firebaseId);
      if (!startup) {
        return res.status(404).json({ error: "Startup not found" });
      }
      res.json(startup);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get startup by founder ID
  app.get("/api/startups/founder/:founderId", async (req: Request, res: Response) => {
    try {
      const startup = await storage.getStartupByFounderId(req.params.founderId);
      if (!startup) {
        return res.status(404).json({ error: "Startup not found" });
      }
      res.json(startup);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update startup
  app.patch("/api/startups/:id", async (req: Request, res: Response) => {
    try {
      const startupId = parseInt(req.params.id);
      const startup = await storage.getStartupById(startupId);
      
      if (!startup) {
        return res.status(404).json({ error: "Startup not found" });
      }
      
      // We only validate fields that are being updated
      const validFields = Object.keys(insertStartupSchema.shape).filter(key => key in req.body);
      const updateSchema = z.object(
        validFields.reduce((acc: Record<string, any>, key) => {
          acc[key] = (insertStartupSchema.shape as any)[key];
          return acc;
        }, {})
      );
      
      const updateData = await validateRequest(updateSchema, req.body);
      const updatedStartup = await storage.updateStartup(startupId, updateData);
      
      res.json(updatedStartup);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // STARTUP DOCUMENT ROUTES
  // Add a document to a startup
  app.post("/api/startups/:startupId/documents", async (req: Request, res: Response) => {
    try {
      const startupId = parseInt(req.params.startupId);
      const documentData = await validateRequest(
        insertStartupDocumentSchema.extend({ startupId: z.number() }),
        { ...req.body, startupId }
      );
      
      const document = await storage.addStartupDocument(documentData);
      res.status(201).json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all documents for a startup
  app.get("/api/startups/:startupId/documents", async (req: Request, res: Response) => {
    try {
      const startupId = parseInt(req.params.startupId);
      const documents = await storage.getStartupDocuments(startupId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // STARTUP UPDATE ROUTES
  // Add an update to a startup
  app.post("/api/startups/:startupId/updates", async (req: Request, res: Response) => {
    try {
      const startupId = parseInt(req.params.startupId);
      const updateData = await validateRequest(
        insertStartupUpdateSchema.extend({ startupId: z.number() }),
        { ...req.body, startupId }
      );
      
      const update = await storage.addStartupUpdate(updateData);
      res.status(201).json(update);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all updates for a startup
  app.get("/api/startups/:startupId/updates", async (req: Request, res: Response) => {
    try {
      const startupId = parseInt(req.params.startupId);
      const updates = await storage.getStartupUpdates(startupId);
      res.json(updates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // TRANSACTION ROUTES
  // Create a new transaction
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = await validateRequest(insertTransactionSchema, req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update transaction status
  app.patch("/api/transactions/:id/status", async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { status, transactionHash } = req.body;
      
      if (!['pending', 'completed', 'failed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const transaction = await storage.updateTransactionStatus(transactionId, status, transactionHash);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get transactions by investor ID
  app.get("/api/transactions/investor/:investorId", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactionsByInvestorId(req.params.investorId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get transactions by startup ID
  app.get("/api/transactions/startup/:startupId", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactionsByStartupId(req.params.startupId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get investor statistics
  app.get("/api/investors/:investorId/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getInvestorStats(req.params.investorId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get startup statistics
  app.get("/api/startups/:startupId/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStartupStats(parseInt(req.params.startupId));
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
