import { Pool } from 'pg'; // Import the Pool class from pg package
import { drizzle } from 'drizzle-orm'; // Import Drizzle ORM
import ws from "ws";
import * as schema from "@shared/schema"; // Assuming you still have a shared schema file

// Neon config setup for WebSocket (not used in this case but can be kept for other scenarios)
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Local PostgreSQL connection settings
const localDbConfig = {
  user: 'postgres',         // Replace with your PostgreSQL username
  host: 'localhost',        // The host where your PostgreSQL database is running
  database: 'college_lab_portal', // The name of your database
  password: '12345678',     // The password for your PostgreSQL user
  port: 5432,               // The default PostgreSQL port (use 5432 unless configured otherwise)
};

// Use the DATABASE_URL environment variable if set, otherwise fall back to local configuration
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || new URL(`postgres://${localDbConfig.user}:${localDbConfig.password}@${localDbConfig.host}:${localDbConfig.port}/${localDbConfig.database}`).toString()
});

// Set WebSocket constructor for Neon (this part can be skipped for local PostgreSQL)
import { neonConfig } from '@neondatabase/serverless'; 
neonConfig.webSocketConstructor = ws;

// Initialize Drizzle ORM with the pool and schema
export const db = drizzle({ client: pool, schema });

