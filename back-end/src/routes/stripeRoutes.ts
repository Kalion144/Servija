import { Router } from "express";
import express from "express";
import { SubscriptionController } from "../controllers/SubscriptionController.js";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  SubscriptionController.webhook,
);

export default router;
