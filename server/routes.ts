import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, pairingSchema, insertMoodSchema } from "@shared/schema";
import { z } from "zod";

// Store active WebSocket connections by user ID
const userConnections = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(loginData.username, loginData.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pairing routes
  app.post("/api/pairing/generate", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const pairingCode = await storage.generatePairingCode(userId);
      res.json({ pairingCode });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/pairing/join", async (req, res) => {
    try {
      const { userId, pairingCode } = req.body;
      
      if (!userId || !pairingCode) {
        return res.status(400).json({ message: "User ID and pairing code are required" });
      }
      
      const couple = await storage.getCoupleByPairingCode(pairingCode);
      if (!couple) {
        return res.status(404).json({ message: "Invalid pairing code" });
      }
      
      if (couple.user1Id === userId) {
        return res.status(400).json({ message: "Cannot pair with yourself" });
      }
      
      // Update the couple with the second user
      await storage.updateCouple(couple.id, userId);
      await storage.activateCouple(couple.id);
      
      res.json({ success: true, coupleId: couple.id });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User and couple info routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id/couple", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const couple = await storage.getCoupleByUserId(userId);
      
      if (!couple || !couple.isActive) {
        return res.status(404).json({ message: "No active couple found" });
      }
      
      const partner = await storage.getPartner(userId);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      
      const { password, ...partnerWithoutPassword } = partner;
      res.json({ couple, partner: partnerWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mood routes
  app.post("/api/mood", async (req, res) => {
    try {
      const { userId, moodType } = req.body;
      
      if (!userId || !moodType) {
        return res.status(400).json({ message: "User ID and mood type are required" });
      }
      
      // Deactivate any existing moods for this user
      await storage.deactivateUserMoods(userId);
      
      // Create new mood that expires in 2 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);
      
      const mood = await storage.createMood({
        userId,
        moodType,
        expiresAt
      });
      
      // Check for potential matches
      await checkForMatches(userId, moodType);
      
      res.json({ mood });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id/moods", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const moods = await storage.getActiveMoodsByUserId(userId);
      res.json({ moods });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Match routes
  app.get("/api/couple/:id/matches", async (req, res) => {
    try {
      const coupleId = parseInt(req.params.id);
      const matches = await storage.getMatchesByCoupleId(coupleId);
      res.json({ matches });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/match/:id/acknowledge", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      await storage.acknowledgeMatch(matchId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/match/:id/connect", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      await storage.connectMatch(matchId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let userId: number | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          userId = message.userId;
          userConnections.set(userId, ws);
          ws.send(JSON.stringify({ type: 'auth_success', userId }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        userConnections.delete(userId);
      }
    });
  });

  // Helper function to check for matches
  async function checkForMatches(userId: number, moodType: string) {
    const couple = await storage.getCoupleByUserId(userId);
    if (!couple || !couple.isActive) return;

    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    const partnerMoods = await storage.getActiveMoodsByUserId(partnerId);
    
    // Check if partner has a matching mood
    const matchingMood = partnerMoods.find(mood => mood.moodType === moodType);
    
    if (matchingMood) {
      // Create a match
      const match = await storage.createMatch({
        coupleId: couple.id,
        moodType
      });
      
      // Notify both users via WebSocket
      const userWs = userConnections.get(userId);
      const partnerWs = userConnections.get(partnerId);
      
      const matchNotification = {
        type: 'match',
        matchId: match.id,
        moodType,
        matchedAt: match.matchedAt
      };
      
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify(matchNotification));
      }
      
      if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
        partnerWs.send(JSON.stringify(matchNotification));
      }
    }
  }

  return httpServer;
}
