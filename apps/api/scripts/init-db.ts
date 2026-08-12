import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (apps/api/)
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({
  path: envPath,
  override: true,
});

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(`DATABASE_URL is not configured. Expected env file: ${envPath}`);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log("Initializing database schema...");

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✓ Projects table created or already exists");

    // Verify table structure
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position;
    `);

    console.log("\nTable structure:");
    columns.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log("\n✓ Database initialization complete!");
  } catch (error) {
    console.error("✗ Database initialization failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
    await pool.end();
  }
}

initDatabase();
