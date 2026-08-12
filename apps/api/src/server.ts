import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config({ path: "apps/api/.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function extractErrorMessage(error: any): string {
  if (!error) return "Unknown error";
  
  // Handle AggregateError or errors with array property
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const firstErr = error.errors[0];
    if (firstErr?.code && firstErr?.address && firstErr?.port) {
      return `${firstErr.code}: cannot connect to ${firstErr.address}:${firstErr.port}`;
    }
    if (firstErr?.message) {
      return firstErr.message;
    }
  }
  
  // Handle regular Error
  if (error instanceof Error) {
    if (error.message) {
      return error.message;
    }
  }
  
  // Handle error objects with code
  if (error.code) {
    return `${error.code}: ${error.message || "Database connection failed"}`;
  }
  
  // Try to convert to string
  if (typeof error === "string") {
    return error;
  }
  
  return "Database connection failed - PostgreSQL may not be running";
}

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "BuildTrack API is running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/projects", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, location, progress, budget, status, created_at
       FROM projects
       ORDER BY id ASC`
    );

    res.json({
      success: true,
      projects: result.rows
    });
  } catch (error: any) {
    console.error("Failed to fetch projects:", error);
    
    const errorMessage = extractErrorMessage(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: errorMessage
    });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const {
      name,
      location,
      progress = 0,
      budget = 0,
      status = "In Progress",
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    // Validate progress is between 0 and 100
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be a number between 0 and 100",
      });
    }

    // Validate budget is a valid number
    if (typeof budget !== "number" || budget < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be a valid number",
      });
    }

    const validStatuses = ["In Progress", "On Track", "Needs Attention", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO projects (name, location, progress, budget, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, location, progress, budget, status, created_at
      `,
      [name, location, progress, budget, status]
    );

    res.status(201).json({
      success: true,
      project: result.rows[0],
    });
  } catch (error: any) {
    console.error("Failed to create project:", error);
    
    const errorMessage = extractErrorMessage(error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: errorMessage,
    });
  }
});

app.get("/api/projects/stats", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_projects,
        COUNT(*) FILTER (
          WHERE status != 'Completed'
        )::int AS active_projects,
        COUNT(*) FILTER (
          WHERE status = 'Completed'
        )::int AS completed_projects,
        COALESCE(SUM(budget), 0)::numeric AS total_budget,
        COALESCE(
          SUM(budget) FILTER (WHERE status != 'Completed'),
          0
        )::numeric AS remaining_budget,
        CASE
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            COUNT(*) FILTER (WHERE status != 'Completed') * 100.0 / COUNT(*)
          )
        END AS active_percentage
      FROM projects
    `);

    res.json({
      success: true,
      stats: result.rows[0]
    });
  } catch (error: any) {
    console.error("Failed to fetch project stats:", error);
    
    const errorMessage = extractErrorMessage(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project stats",
      error: errorMessage
    });
  }
});

app.post("/api/init-db", async (_req, res) => {
  try {
    // Create projects table
    await pool.query(`
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

    res.json({
      success: true,
      message: "Database initialized successfully"
    });
  } catch (error: any) {
    console.error("Failed to initialize database:", error);
    
    const errorMessage = extractErrorMessage(error);

    res.status(500).json({
      success: false,
      message: "Failed to initialize database",
      error: errorMessage
    });
  }
});

app.listen(PORT, () => {
  console.log(`BuildTrack API running on port ${PORT}`);
});
