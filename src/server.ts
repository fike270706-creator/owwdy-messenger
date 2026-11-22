import express from "express";
import { Pool } from "pg";
import { createClient } from "redis";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));

const port = Number(process.env.PORT ?? 3000);
const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, max: 5 })
  : process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE
    ? new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? 5432),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        max: 5
      })
    : null;

const redisUrl = process.env.REDIS_URL;
const redis = redisUrl ? createClient({ url: redisUrl }) : null;

if (redis) {
  redis.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });
}

app.get("/", (_req, res) => {
  res.json({ name: "owwdy", service: "api", status: "starting" });
});

app.get("/health", async (_req, res) => {
  const checks: Record<string, "ok" | "error" | "not_configured"> = {
    database: "not_configured",
    redis: "not_configured"
  };

  try {
    if (pool) {
      await pool.query("SELECT 1");
      checks.database = "ok";
    }
    if (redis?.isReady) {
      await redis.ping();
      checks.redis = "ok";
    } else if (redis) {
      checks.redis = "error";
    }
  } catch (error) {
    console.error("Health check failed:", error);
    if (pool && checks.database !== "ok") checks.database = "error";
    if (redis && checks.redis !== "ok") checks.redis = "error";
  }

  const healthy = checks.database === "ok" && checks.redis === "ok";
  res.status(healthy ? 200 : 503).json({
    name: "owwdy",
    status: healthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(port, "0.0.0.0", async () => {
  console.log(`owwdy API listening on ${port}`);
  if (redis && !redis.isOpen) {
    try {
      await redis.connect();
    } catch (error) {
      console.error("Redis initial connection failed:", error);
    }
  }
});

async function shutdown() {
  server.close();
  await Promise.allSettled([pool?.end(), redis?.isOpen ? redis.quit() : Promise.resolve()]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
