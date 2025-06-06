import { 
  users, couples, moods, matches,
  type User, type InsertUser, 
  type Couple, type InsertCouple,
  type Mood, type InsertMood,
  type Match, type InsertMatch
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, lt, gt } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  updateUserKeepTrack(userId: number, keepTrack: boolean): Promise<void>;
  clearUserHistory(userId: number): Promise<void>;
  
  // Couple methods
  getCouple(id: number): Promise<Couple | undefined>;
  getCoupleByUserId(userId: number): Promise<Couple | undefined>;
  getCoupleByPairingCode(code: string): Promise<Couple | undefined>;
  createCouple(couple: InsertCouple): Promise<Couple>;
  updateCouple(coupleId: number, user2Id: number): Promise<void>;
  activateCouple(coupleId: number): Promise<void>;
  generatePairingCode(userId: number): Promise<string>;
  
  // Mood methods
  getMood(id: number): Promise<Mood | undefined>;
  getMoodByUserId(userId: number): Promise<Mood | undefined>;
  createMood(mood: InsertMood): Promise<Mood>;
  deleteMood(moodId: number): Promise<void>;
  deleteUserMood(userId: number): Promise<void>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByCoupleId(coupleId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  acknowledgeMatch(matchId: number): Promise<void>;
  connectMatch(matchId: number): Promise<void>;
  deleteMatch(matchId: number): Promise<void>;
  deleteUnconnectedMatchesByCoupleId(coupleId: number): Promise<void>;
  
  // Partnership methods
  getPartner(userId: number): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getCouple(id: number): Promise<Couple | undefined> {
    const [couple] = await db.select().from(couples).where(eq(couples.id, id));
    return couple || undefined;
  }

  async getCoupleByUserId(userId: number): Promise<Couple | undefined> {
    const [couple] = await db
      .select()
      .from(couples)
      .where(
        and(
          eq(couples.isActive, true),
          or(eq(couples.user1Id, userId), eq(couples.user2Id, userId))
        )
      )
      .limit(1);
    
    if (couple) return couple;
    
    const [result] = await db
      .select()
      .from(couples)
      .where(eq(couples.user1Id, userId))
      .limit(1);
    
    return result || undefined;
  }

  async getCoupleByPairingCode(code: string): Promise<Couple | undefined> {
    const [couple] = await db
      .select()
      .from(couples)
      .where(eq(couples.pairingCode, code));
    return couple || undefined;
  }

  async createCouple(insertCouple: InsertCouple): Promise<Couple> {
    const [couple] = await db
      .insert(couples)
      .values(insertCouple)
      .returning();
    return couple;
  }

  async updateCouple(coupleId: number, user2Id: number): Promise<void> {
    await db
      .update(couples)
      .set({ user2Id })
      .where(eq(couples.id, coupleId));
  }

  async activateCouple(coupleId: number): Promise<void> {
    await db
      .update(couples)
      .set({ isActive: true })
      .where(eq(couples.id, coupleId));
  }

  async generatePairingCode(userId: number): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Check if user already has a couple record
    const existingCouple = await db
      .select()
      .from(couples)
      .where(eq(couples.user1Id, userId))
      .limit(1);
    
    if (existingCouple.length > 0) {
      // Update existing couple with new pairing code
      await db
        .update(couples)
        .set({ pairingCode: code })
        .where(eq(couples.user1Id, userId));
    } else {
      // Create new couple record
      await db
        .insert(couples)
        .values({
          user1Id: userId,
          user2Id: null, // Will be set when someone joins
          pairingCode: code,
        });
    }
    
    return code;
  }

  async getMood(id: number): Promise<Mood | undefined> {
    const [mood] = await db.select().from(moods).where(eq(moods.id, id));
    return mood || undefined;
  }

  async getMoodByUserId(userId: number): Promise<Mood | undefined> {
    // Delete expired moods first
    await db.delete(moods).where(lt(moods.expiresAt, new Date()));
    
    const [mood] = await db
      .select()
      .from(moods)
      .where(eq(moods.userId, userId))
      .limit(1);
    return mood || undefined;
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    // First, delete any existing mood for this user
    await this.deleteUserMood(insertMood.userId);
    
    // Then create the new mood
    const [mood] = await db
      .insert(moods)
      .values(insertMood)
      .returning();
    return mood;
  }

  async deleteMood(moodId: number): Promise<void> {
    await db
      .delete(moods)
      .where(eq(moods.id, moodId));
  }

  async deleteUserMood(userId: number): Promise<void> {
    await db
      .delete(moods)
      .where(eq(moods.userId, userId));
  }

  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getMatchesByCoupleId(coupleId: number): Promise<Match[]> {
    return await db.select().from(matches).where(eq(matches.coupleId, coupleId));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values(insertMatch)
      .returning();
    return match;
  }

  async acknowledgeMatch(matchId: number): Promise<void> {
    await db
      .update(matches)
      .set({ acknowledged: true })
      .where(eq(matches.id, matchId));
  }

  async connectMatch(matchId: number): Promise<void> {
    await db
      .update(matches)
      .set({ 
        connected: true,
        connectedAt: new Date()
      })
      .where(eq(matches.id, matchId));
  }

  async deleteMatch(matchId: number): Promise<void> {
    await db
      .delete(matches)
      .where(eq(matches.id, matchId));
  }

  async deleteUnconnectedMatchesByCoupleId(coupleId: number): Promise<void> {
    await db
      .delete(matches)
      .where(and(eq(matches.coupleId, coupleId), eq(matches.connected, false)));
  }

  async updateUserKeepTrack(userId: number, keepTrack: boolean): Promise<void> {
    await db
      .update(users)
      .set({ keepTrack })
      .where(eq(users.id, userId));
  }

  async clearUserHistory(userId: number): Promise<void> {
    const couple = await this.getCoupleByUserId(userId);
    if (couple) {
      await db
        .delete(matches)
        .where(eq(matches.coupleId, couple.id));
    }
  }

  async getPartner(userId: number): Promise<User | undefined> {
    const couple = await this.getCoupleByUserId(userId);
    if (!couple || !couple.isActive) return undefined;
    
    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    if (partnerId === 0) return undefined;
    
    return this.getUser(partnerId);
  }
}

export const storage = new DatabaseStorage();