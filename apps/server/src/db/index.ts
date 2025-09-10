import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log("Initializing database connection pool...");
console.log("Database URL format check:", databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://') ? '✓ Valid format' : '✗ Invalid format');

// Create a connection pool with proper timeout settings
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Reduced from 20 to be more conservative
  min: 2, // Maintain minimum connections
  idleTimeoutMillis: 10000, // Reduced to 10 seconds
  connectionTimeoutMillis: 5000, // Reduced to 5 seconds for faster failure detection
  statement_timeout: 10000, // Reduced to 10 second query timeout
  query_timeout: 10000, // 10 second query timeout
  // Add additional PostgreSQL-specific options
  application_name: 'gamestashv2-server',
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Add pool event listeners for debugging
pool.on('connect', (client) => {
  console.log('✓ New database client connected');
});

pool.on('error', (err, client) => {
  console.error('✗ Database pool error:', err.message);
});

pool.on('remove', (client) => {
  console.log('Database client removed from pool');
});

console.log('Database pool initialized successfully');

export const db = drizzle(pool);

export * from "./schema/platforms";
export * from "./schema/categories";
export * from "./schema/products";
export * from "./schema/tags";
export * from "./schema/reviews";
