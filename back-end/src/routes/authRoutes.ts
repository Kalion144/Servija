import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.me);
router.put("/update", authenticateToken, AuthController.updateUser);
router.put("/onboarding", authenticateToken, AuthController.updateOnboarding);
router.post(
  "/profile/photo",
  authenticateToken,
  upload.single("foto"),
  AuthController.uploadProfilePhoto,
);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
