import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload, { processImage } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  onboardingSchema,
  updateUserSchema,
} from "../schemas/authSchemas.js";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.get("/me", authenticateToken, AuthController.me);
router.put(
  "/update",
  authenticateToken,
  validate(updateUserSchema),
  AuthController.updateUser
);
router.put(
  "/onboarding",
  authenticateToken,
  validate(onboardingSchema),
  AuthController.updateOnboarding
);
router.post(
  "/profile/photo",
  authenticateToken,
  upload.single("foto"),
  processImage,
  AuthController.uploadProfilePhoto
);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
