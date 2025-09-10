import { db } from "@/db";
import { platforms } from "@/db/schema/platforms";
import { os } from "@orpc/server";
import { sql } from "drizzle-orm";

export const dbDiagnostics = os.handler(async () => {
  const results: any = {};

  try {
    // Test basic DB connection
    console.log("Testing basic database connection...");
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    results.connectionTest = { success: true, result: connectionTest };
    console.log("✓ Database connection successful");
  } catch (error) {
    results.connectionTest = { success: false, error: (error as Error).message };
    console.error("✗ Database connection failed:", error);
  }

  try {
    // Check if platforms table exists
    console.log("Checking if platforms table exists...");
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'platforms'
      );
    `);
    results.tableExists = { success: true, exists: (tableExists as any).rows?.[0]?.exists };
    console.log(`✓ Platforms table exists: ${(tableExists as any).rows?.[0]?.exists}`);
  } catch (error) {
    results.tableExists = { success: false, error: (error as Error).message };
    console.error("✗ Table existence check failed:", error);
  }

  try {
    // Get table info
    console.log("Getting platforms table info...");
    const tableInfo = await db.execute(sql`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'platforms'
      ORDER BY ordinal_position;
    `);
    results.tableInfo = { success: true, columns: (tableInfo as any).rows || [] };
    console.log("✓ Table info retrieved:", ((tableInfo as any).rows || []).length, "columns");
  } catch (error) {
    results.tableInfo = { success: false, error: (error as Error).message };
    console.error("✗ Table info check failed:", error);
  }

  try {
    // Count records in platforms table
    console.log("Counting records in platforms table...");
    const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM platforms`);
    results.recordCount = { success: true, count: (countResult as any).rows?.[0]?.count };
    console.log(`✓ Platforms table has ${(countResult as any).rows?.[0]?.count} records`);
  } catch (error) {
    results.recordCount = { success: false, error: (error as Error).message };
    console.error("✗ Record count failed:", error);
  }

  try {
    // Test simple select with timeout
    console.log("Testing simple select from platforms...");
    const simpleSelect = await db.execute(sql`SELECT id, name FROM platforms LIMIT 5`);
    results.simpleSelect = { success: true, records: (simpleSelect as any).rows || [] };
    console.log(`✓ Simple select successful, ${((simpleSelect as any).rows || []).length} records returned`);
  } catch (error) {
    results.simpleSelect = { success: false, error: (error as Error).message };
    console.error("✗ Simple select failed:", error);
  }

  try {
    // Check for any locks or active queries
    console.log("Checking for database locks...");
    const locks = await db.execute(sql`
      SELECT
        pl.pid,
        pl.mode,
        pl.locktype,
        pl.granted,
        a.query,
        a.state,
        a.query_start
      FROM pg_locks pl
      LEFT JOIN pg_stat_activity a ON pl.pid = a.pid
      WHERE pl.relation::regclass::text = 'platforms'
      OR a.query ILIKE '%platforms%';
    `);
    results.locks = { success: true, locks: (locks as any).rows || [] };
    console.log(`✓ Lock check completed, ${((locks as any).rows || []).length} relevant locks/queries found`);
  } catch (error) {
    results.locks = { success: false, error: (error as Error).message };
    console.error("✗ Lock check failed:", error);
  }

  return results;
});

export const diagnosticsRoute = {
  dbDiagnostics,
};
