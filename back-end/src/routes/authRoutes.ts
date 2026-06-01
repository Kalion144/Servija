import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.me);
router.put("/update", authenticateToken, AuthController.updateUser);
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
