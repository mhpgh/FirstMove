import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import WebSocket from 'ws';
import * as schema from "@shared/schema";

// Configure Neon to use WebSocket for database connections
neonConfig.webSocketConstructor = WebSocket;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
export const db = drizzle({ client: pool, schema });

// Test database connection on startup
export async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}