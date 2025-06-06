import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  keepTrack: boolean("keep_track").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const couples = pgTable("couples", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull(),
  user2Id: integer("user2_id"),
  pairingCode: text("pairing_code").unique(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moods = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  duration: integer("duration").notNull().default(60), // duration in minutes
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  coupleId: integer("couple_id").notNull(),
  matchedAt: timestamp("matched_at").defaultNow().notNull(),
  acknowledged: boolean("acknowledged").default(false).notNull(),
  connected: boolean("connected").default(false).notNull(),
  connectedAt: timestamp("connected_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const insertCoupleSchema = createInsertSchema(couples).pick({
  user1Id: true,
  user2Id: true,
  pairingCode: true,
});

export const insertMoodSchema = createInsertSchema(moods).pick({
  userId: true,
  duration: true,
  expiresAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  coupleId: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const pairingSchema = z.object({
  pairingCode: z.string().length(6, "Pairing code must be 6 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCouple = z.infer<typeof insertCoupleSchema>;
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type User = typeof users.$inferSelect;
export type Couple = typeof couples.$inferSelect;
export type Mood = typeof moods.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type PairingData = z.infer<typeof pairingSchema>;
