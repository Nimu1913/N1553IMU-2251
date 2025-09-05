#!/usr/bin/env tsx

/**
 * Database Migration Script
 * Runs Drizzle migrations against your Supabase database
 * Usage: npx tsx scripts/migrate.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";
import path from "path";

// Load environment variables from the root directory
config({ path: path.resolve("../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is required");
  console.error("Make sure the .env file exists in the root directory");
  process.exit(1);
}

async function runMigrations() {
  console.log("🔄 Starting database migrations...");
  
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();