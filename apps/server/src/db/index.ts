import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log("Initializing database connection pool...");
console.log(
  "Database URL format check:",
  databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("postgresql://")
    ? "✓ Valid format"
    : "✗ Invalid format"
);

// Create a connection pool with proper timeout settings
const pool = new Pool({
  connectionString: databaseUrl,
  idleTimeoutMillis: 10000,
  keepAliveInitialDelayMillis: 0,
});

export const db = drizzle(pool);

export * from "./schema/platforms";
export * from "./schema/categories";
export * from "./schema/products";
export * from "./schema/tags";
export * from "./schema/reviews";
