import { Router } from "express";
import { ProfessionalAuthController } from "../../controllers/professional/ProfessionalAuthController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/register", ProfessionalAuthController.register);
router.post("/login", ProfessionalAuthController.login);
router.get("/me", authenticateToken, ProfessionalAuthController.me);
router.put("/update", authenticateToken, ProfessionalAuthController.updateUser);
router.post("/logout", authenticateToken, ProfessionalAuthController.logout);

export default router;
