import { Router } from "express";
import { ClientAuthController } from "../../controllers/client/ClientAuthController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import upload, { processImage } from "../../middleware/upload.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../../uploads");

const router = Router();

router.post("/register", ClientAuthController.register);
router.post("/login", ClientAuthController.login);
router.get("/me", authenticateToken, ClientAuthController.me);
router.put("/update", authenticateToken, ClientAuthController.updateUser);
router.post("/logout", authenticateToken, ClientAuthController.logout);

// Rota para upload de imagem de perfil do cliente
router.post(
  "/profile/upload",
  authenticateToken,
  upload.single("image"),
  processImage,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }

      const relativePath = path.relative(uploadDir, req.file.path);
      const imageUrl = `/uploads/${relativePath.replace(/\\/g, "/")}`;

      res.status(201).json({
        message: "Imagem de perfil enviada com sucesso!",
        url: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Erro no upload de perfil:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
);

export default router;
