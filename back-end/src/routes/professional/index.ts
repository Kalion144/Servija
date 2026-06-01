import { Router } from "express";
import { ProfessionalController } from "../../controllers/professional/professionalController.js";
import { ProposalController } from "../../controllers/professional/proposalController.js";
import { ServiceController } from "../../controllers/professional/ServiceController.js";
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
router.post("/services", authenticateToken, ServiceController.adicionarServico);
router.delete(
  "/services/:id",
  authenticateToken,
  ServiceController.removerServico,
);
router.get(
  "/services",
  authenticateToken,
  ServiceController.listarServicosProfissional,
);

router.post("/proposals", authenticateToken, ProposalController.enviar);
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
router.post(
  "/proposals/:proposalProfessionalId/complete",
  authenticateToken,
  ProposalController.marcarConcluido,
);
router.get("/proposals", authenticateToken, ProposalController.listarMinhas);

export default router;
