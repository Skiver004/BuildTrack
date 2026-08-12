import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "apps/api/.env" });

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

try {
  await client.connect();
  const result = await client.query("SELECT NOW() AS current_time");
  console.log("Database connection successful:", result.rows[0]);
} catch (error) {
  console.error("Database connection failed:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
