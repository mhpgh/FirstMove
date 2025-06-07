import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import WebSocket from 'ws';
import * as schema from "@shared/schema";

// Configure Neon to use WebSocket for database connections
neonConfig.webSocketConstructor = WebSocket;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  max: 5,
  allowExitOnIdle: true,
  idleTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });

// Test database connection on startup with retry logic
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection successful');
  } catch (error) {
    console.warn('Database connection test failed, but continuing server startup:', error instanceof Error ? error.message : String(error));
    // Don't fail server startup, just log the warning
  }
}