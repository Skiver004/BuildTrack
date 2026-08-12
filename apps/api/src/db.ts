import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({
  path: envPath,
  override: true,
});

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is not configured. Expected env file: ${envPath}`);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
