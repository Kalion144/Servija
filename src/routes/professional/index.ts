import { Router } from "express";
import { ProfessionalController } from "../../controllers/professionalController.js";
import { ProposalController } from "../../controllers/proposalController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

router.get("/", ProfessionalController.listar);
router.get("/:id", ProfessionalController.obterPorId);
router.post("/profile", authenticateToken, ProfessionalController.criarPerfil);
router.put(
  "/profile",
  authenticateToken,
  ProfessionalController.atualizarPerfil,
);
router.post(
  "/services",
  authenticateToken,
  ProfessionalController.adicionarServico,
);
router.delete(
  "/services/:id",
  authenticateToken,
  ProfessionalController.removerServico,
);

router.post(
  "/proposals/:id/accept",
  authenticateToken,
  ProposalController.aceitar,
);
router.post(
  "/proposals/:id/reject",
  authenticateToken,
  ProposalController.recusar,
);
router.get("/proposals", authenticateToken, ProposalController.listarMinhas);

export default router;
