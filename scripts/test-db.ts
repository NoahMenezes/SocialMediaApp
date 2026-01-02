import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local BEFORE anything else
config({ path: resolve(process.cwd(), ".env.local") });

interface DatabaseHealthCheck {
  isConnected: boolean;
  tablesExist: boolean;
  canQuery: boolean;
  userCount: number;
  error?: string;
  timestamp: Date;
}

function checkEnvironmentVariables(): {
  isConfigured: boolean;
  missing: string[];
} {
  const required = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"];
  const missing: string[] = [];

  for (const variable of required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  return {
    isConfigured: missing.length === 0,
    missing,
  };
}

async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const healthCheck: DatabaseHealthCheck = {
    isConnected: false,
    tablesExist: false,
    canQuery: false,
    userCount: 0,
    timestamp: new Date(),
  };

  try {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("../backend/db/index.js");
    const { users } = await import("../backend/db/schema.js");
    const { sql } = await import("drizzle-orm");

    // Test 1: Check basic connection
    await db.run(sql`SELECT 1`);
    healthCheck.isConnected = true;

    // Test 2: Check if users table exists
    try {
      const result = await db.run(
        sql`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
      );
      healthCheck.tablesExist = result.rows.length > 0;
    } catch (error) {
      console.error("Error checking tables:", error);
      healthCheck.tablesExist = false;
    }

    // Test 3: Try to query the users table
    if (healthCheck.tablesExist) {
      try {
        const userList = await db.select().from(users);
        healthCheck.canQuery = true;
        healthCheck.userCount = userList.length;
      } catch (error) {
        console.error("Error querying users table:", error);
        healthCheck.canQuery = false;
      }
    }

    return healthCheck;
  } catch (error) {
    console.error("Database health check failed:", error);
    healthCheck.error =
      error instanceof Error ? error.message : "Unknown error occurred";
    return healthCheck;
  }
}

async function testDatabase() {
  console.log("🔍 Testing Database Connection...\n");
  console.log("=".repeat(50));

  const envCheck = checkEnvironmentVariables();

  console.log("\n🔐 Environment Variables:");
  console.log(`   - Configured: ${envCheck.isConfigured ? "✅" : "❌"}`);
  if (envCheck.missing.length > 0) {
    console.log(`   - Missing: ${envCheck.missing.join(", ")}`);
    console.log("\n❌ Environment variables not configured!");
    console.log("\nPlease set the following variables in .env.local:");
    envCheck.missing.forEach((v) => console.log(`   - ${v}`));
    console.log("\n" + "=".repeat(50));
    process.exit(1);
  }

  try {
    const dbHealth = await checkDatabaseHealth();

    console.log("\n💾 Database Status:");
    console.log(`   - Connected: ${dbHealth.isConnected ? "✅" : "❌"}`);
    console.log(`   - Tables Exist: ${dbHealth.tablesExist ? "✅" : "❌"}`);
    console.log(`   - Can Query: ${dbHealth.canQuery ? "✅" : "❌"}`);
    console.log(`   - User Count: ${dbHealth.userCount}`);
    console.log(`   - Timestamp: ${dbHealth.timestamp.toISOString()}`);

    if (dbHealth.error) {
      console.log(`   - Error: ${dbHealth.error}`);
    }

    console.log("\n" + "=".repeat(50));

    if (!dbHealth.isConnected) {
      console.log("\n❌ Cannot connect to database!");
      console.log("\nPlease check:");
      console.log("   - TURSO_DATABASE_URL is correct");
      console.log("   - TURSO_AUTH_TOKEN is valid");
      console.log("   - Network connection is available");
      process.exit(1);
    }

    if (!dbHealth.tablesExist) {
      console.log("\n⚠️  Database connected but tables not found!");
      console.log("\nPlease run migrations:");
      console.log("   pnpm drizzle-kit push");
      process.exit(1);
    }

    if (!dbHealth.canQuery) {
      console.log("\n❌ Database tables exist but cannot query them!");
      console.log("\nPlease check table permissions and schema.");
      process.exit(1);
    }

    console.log("\n✅ All systems are operational!");
    console.log(`\n📊 Database contains ${dbHealth.userCount} user(s)`);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal error during health check:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testDatabase();
