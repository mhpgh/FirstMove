import { 
  users, couples, moods, matches,
  type User, type InsertUser, 
  type Couple, type InsertCouple,
  type Mood, type InsertMood,
  type Match, type InsertMatch
} from "@shared/schema";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  
  // Couple methods
  getCouple(id: number): Promise<Couple | undefined>;
  getCoupleByUserId(userId: number): Promise<Couple | undefined>;
  getCoupleByPairingCode(code: string): Promise<Couple | undefined>;
  createCouple(couple: InsertCouple): Promise<Couple>;
  activateCouple(coupleId: number): Promise<void>;
  generatePairingCode(userId: number): Promise<string>;
  
  // Mood methods
  getMood(id: number): Promise<Mood | undefined>;
  getActiveMoodsByUserId(userId: number): Promise<Mood[]>;
  createMood(mood: InsertMood): Promise<Mood>;
  deactivateMood(moodId: number): Promise<void>;
  deactivateUserMoods(userId: number): Promise<void>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByCoupleId(coupleId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  acknowledgeMatch(matchId: number): Promise<void>;
  
  // Partnership methods
  getPartner(userId: number): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private couples: Map<number, Couple>;
  private moods: Map<number, Mood>;
  private matches: Map<number, Match>;
  private userIdCounter: number;
  private coupleIdCounter: number;
  private moodIdCounter: number;
  private matchIdCounter: number;

  constructor() {
    this.users = new Map();
    this.couples = new Map();
    this.moods = new Map();
    this.matches = new Map();
    this.userIdCounter = 1;
    this.coupleIdCounter = 1;
    this.moodIdCounter = 1;
    this.matchIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Couple methods
  async getCouple(id: number): Promise<Couple | undefined> {
    return this.couples.get(id);
  }

  async getCoupleByUserId(userId: number): Promise<Couple | undefined> {
    return Array.from(this.couples.values()).find(
      (couple) => couple.user1Id === userId || couple.user2Id === userId
    );
  }

  async getCoupleByPairingCode(code: string): Promise<Couple | undefined> {
    return Array.from(this.couples.values()).find(
      (couple) => couple.pairingCode === code
    );
  }

  async createCouple(insertCouple: InsertCouple): Promise<Couple> {
    const id = this.coupleIdCounter++;
    const couple: Couple = { 
      ...insertCouple, 
      id,
      isActive: false,
      createdAt: new Date()
    };
    this.couples.set(id, couple);
    return couple;
  }

  async activateCouple(coupleId: number): Promise<void> {
    const couple = this.couples.get(coupleId);
    if (couple) {
      couple.isActive = true;
      couple.pairingCode = null;
    }
  }

  async generatePairingCode(userId: number): Promise<string> {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Create a new couple entry with this user and pairing code
    await this.createCouple({
      user1Id: userId,
      user2Id: 0, // Will be filled when partner joins
      pairingCode: code
    });
    
    return code;
  }

  // Mood methods
  async getMood(id: number): Promise<Mood | undefined> {
    return this.moods.get(id);
  }

  async getActiveMoodsByUserId(userId: number): Promise<Mood[]> {
    const now = new Date();
    return Array.from(this.moods.values()).filter(
      (mood) => mood.userId === userId && mood.isActive && mood.expiresAt > now
    );
  }

  async createMood(insertMood: InsertMood): Promise<Mood> {
    const id = this.moodIdCounter++;
    const mood: Mood = { 
      ...insertMood, 
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.moods.set(id, mood);
    return mood;
  }

  async deactivateMood(moodId: number): Promise<void> {
    const mood = this.moods.get(moodId);
    if (mood) {
      mood.isActive = false;
    }
  }

  async deactivateUserMoods(userId: number): Promise<void> {
    for (const mood of this.moods.values()) {
      if (mood.userId === userId && mood.isActive) {
        mood.isActive = false;
      }
    }
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByCoupleId(coupleId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.coupleId === coupleId
    );
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.matchIdCounter++;
    const match: Match = { 
      ...insertMatch, 
      id,
      matchedAt: new Date(),
      acknowledged: false
    };
    this.matches.set(id, match);
    return match;
  }

  async acknowledgeMatch(matchId: number): Promise<void> {
    const match = this.matches.get(matchId);
    if (match) {
      match.acknowledged = true;
    }
  }

  // Partnership methods
  async getPartner(userId: number): Promise<User | undefined> {
    const couple = await this.getCoupleByUserId(userId);
    if (!couple || !couple.isActive) return undefined;
    
    const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
    return this.getUser(partnerId);
  }
}

export const storage = new MemStorage();
