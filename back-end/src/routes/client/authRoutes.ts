import { Router } from "express";
import { ClientAuthController } from "../../controllers/client/ClientAuthController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/register", ClientAuthController.register);
router.post("/login", ClientAuthController.login);
router.get("/me", authenticateToken, ClientAuthController.me);
router.put("/update", authenticateToken, ClientAuthController.updateUser);
router.post("/logout", authenticateToken, ClientAuthController.logout);

export default router;
