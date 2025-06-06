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

  app.delete("/api/user/:id/couple", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const couple = await storage.getCoupleByUserId(userId);
      
      if (!couple) {
        return res.status(404).json({ message: "No couple found" });
      }
      
      // Clear user's history
      await storage.clearUserHistory(userId);
      
      // Get partner ID for cleanup
      const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
      if (partnerId) {
        await storage.clearUserHistory(partnerId);
      }
      
      // Delete all matches for this couple
      await storage.deleteUnconnectedMatchesByCoupleId(couple.id);
      const matches = await storage.getMatchesByCoupleId(couple.id);
      for (const match of matches) {
        await storage.deleteMatch(match.id);
      }
      
      // Deactivate the couple
      await storage.deactivateCouple(couple.id);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Mood routes
  app.post("/api/mood", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Use the duration from the request body
      const duration = req.body.duration || 60; // Default to 60 minutes
      const expiresAt = new Date(req.body.expiresAt || Date.now() + duration * 60 * 1000);
      
      const mood = await storage.createMood({
        userId,
        duration,
        expiresAt
      });
      
      // Check for potential matches
      await checkForMatches(userId);
      
      res.json({ mood });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/:id/moods", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const mood = await storage.getMoodByUserId(userId);
      res.json({ moods: mood ? [mood] : [] });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/:id/moods/deactivate", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUserMood(userId);
      res.json({ success: true });
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

  app.put("/api/match/:id/connect", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // Check if this match is already connected
      if (match.connected) {
        return res.status(200).json({ success: true, recorded: true, alreadyConnected: true });
      }
      
      // Get the couple and both users to check tracking preferences
      const couple = await storage.getCouple(match.coupleId);
      if (!couple) {
        return res.status(404).json({ message: "Couple not found" });
      }
      
      const user1 = await storage.getUser(couple.user1Id);
      const user2 = couple.user2Id ? await storage.getUser(couple.user2Id) : null;
      
      if (!user1 || !user2) {
        return res.status(404).json({ message: "Users not found" });
      }
      
      // Only record in history if both users have tracking enabled
      const shouldRecord = user1.keepTrack && user2.keepTrack;
      
      // Mark the match as connected and set recording status
      await storage.connectMatch(matchId, shouldRecord);
      
      // Delete moods for both users after connection
      await storage.deleteUserMood(couple.user1Id);
      if (couple.user2Id) {
        await storage.deleteUserMood(couple.user2Id);
      }
      
      // Notify both users via WebSocket that connection was made
      const user1Ws = userConnections.get(couple.user1Id);
      const user2Ws = couple.user2Id ? userConnections.get(couple.user2Id) : null;
      
      const connectionNotification = {
        type: 'connection',
        matchId: match.id,
        recorded: shouldRecord
      };
      
      if (user1Ws && user1Ws.readyState === WebSocket.OPEN) {
        user1Ws.send(JSON.stringify(connectionNotification));
      }
      
      if (user2Ws && user2Ws.readyState === WebSocket.OPEN) {
        user2Ws.send(JSON.stringify(connectionNotification));
      }
      
      res.json({ success: true, recorded: shouldRecord });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User tracking preference routes
  app.put("/api/user/:id/keep-track", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { keepTrack } = req.body;
      
      if (typeof keepTrack !== "boolean") {
        return res.status(400).json({ message: "keepTrack must be a boolean" });
      }
      
      // If turning off tracking, clear history
      if (!keepTrack) {
        await storage.clearUserHistory(userId);
      }
      
      await storage.updateUserKeepTrack(userId, keepTrack);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user account
  app.delete("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user's couple data before deletion
      const couple = await storage.getCoupleByUserId(userId);
      
      if (couple) {
        // Get partner ID for cleanup
        const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
        
        // Clear user's history and mood
        await storage.clearUserHistory(userId);
        await storage.deleteUserMood(userId);
        
        // If partner exists, clear their history too since shared data will be lost
        if (partnerId) {
          await storage.clearUserHistory(partnerId);
          await storage.deleteUserMood(partnerId);
        }
        
        // Delete all matches for this couple
        const matches = await storage.getMatchesByCoupleId(couple.id);
        for (const match of matches) {
          await storage.deleteMatch(match.id);
        }
        
        // Deactivate the couple
        await storage.deactivateCouple(couple.id);
      } else {
        // If no couple, still clear user's individual data
        await storage.clearUserHistory(userId);
        await storage.deleteUserMood(userId);
      }
      
      // Delete the user account
      await storage.deleteUser(userId);
      
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
          if (userId !== null) {
            userConnections.set(userId, ws);
          }
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
  async function checkForMatches(userId: number) {
    const couple = await storage.getCoupleByUserId(userId);
    if (!couple || !couple.isActive) return;

    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    if (!partnerId) return; // No partner paired yet
    const partnerMood = await storage.getMoodByUserId(partnerId);
    
    console.log(`Checking matches for user ${userId}, partner ${partnerId}`);
    console.log(`Partner mood:`, partnerMood);
    
    // Check if partner has an active mood
    if (partnerMood) {
      console.log(`Found partner mood: ${partnerMood.id}`);
      
      // Check if there's already an active unconnected match for this couple
      const existingMatches = await storage.getMatchesByCoupleId(couple.id);
      const activeMatch = existingMatches.find(match => !match.connected);
      
      if (activeMatch) {
        console.log(`Active unconnected match found (${activeMatch.id}), skipping new match creation`);
        return;
      }
      
      // Delete any existing unconnected matches for this couple to keep only one active match
      await storage.deleteUnconnectedMatchesByCoupleId(couple.id);
      console.log(`Cleaned up old unconnected matches for couple ${couple.id}`);
      
      // Create a new match (only one active match per couple)
      const match = await storage.createMatch({
        coupleId: couple.id
      });
      console.log(`Created new match: ${match.id}`);
      
      // Notify both users via WebSocket
      const userWs = userConnections.get(userId);
      const partnerWs = userConnections.get(partnerId);
      
      const matchNotification = {
        type: 'match',
        matchId: match.id,
        matchedAt: match.matchedAt
      };
      
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify(matchNotification));
      }
      
      if (partnerWs && partnerWs.readyState === WebSocket.OPEN) {
        partnerWs.send(JSON.stringify(matchNotification));
      }
    } else {
      console.log(`No partner mood found`);
    }
  }

  return httpServer;
}
