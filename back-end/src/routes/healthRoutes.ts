import { Router, type Request, type Response } from "express";
import logger from "../config/logger.js";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  let dbStatus = "ok";
  try {
    // Simple DB query to test connection
    await db.select().from(users).limit(1);
  } catch (error) {
    dbStatus = "error";
    logger.error({ error }, "DB health check failed");
  }

  const uptime = process.uptime();
  const now = new Date();

  res.json({
    status: "healthy",
    db: dbStatus,
    uptime: {
      seconds: Math.floor(uptime),
      minutes: Math.floor(uptime / 60),
      hours: Math.floor(uptime / 3600),
    },
    timestamp: now.toISOString(),
  });
});

export default router;
