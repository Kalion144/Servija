import { Router } from "express";
import { ServiceController } from "../../controllers/client/ServiceController.js";
import { ProposalClientController } from "../../controllers/client/ProposalController.js";
import { RatingController } from "../../controllers/client/ratingController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

// Rotas de serviços (criados por clientes)
router.post("/services", authenticateToken, ServiceController.criar);
router.get("/services", authenticateToken, ServiceController.listarMeus);
router.get("/services/all", authenticateToken, ServiceController.listarTodos);

// Rotas antigas de propostas
router.post("/proposals", authenticateToken, ProposalClientController.criar);
router.get(
  "/proposals",
  authenticateToken,
  ProposalClientController.listarMinhas,
);
router.get(
  "/proposals/:id",
  authenticateToken,
  ProposalClientController.obterPorId,
);
router.put(
  "/proposals/:id",
  authenticateToken,
  ProposalClientController.atualizar,
);
router.delete(
  "/proposals/:id",
  authenticateToken,
  ProposalClientController.deletar,
);
router.post(
  "/proposals/:id/send",
  authenticateToken,
  ProposalClientController.enviarParaProfissionais,
);
router.patch(
  "/proposals/:id/start/:professionalId",
  authenticateToken,
  ProposalClientController.iniciarServico,
);
router.patch(
  "/proposals/:id/finish",
  authenticateToken,
  ProposalClientController.finalizarServico,
);

router.post("/ratings", authenticateToken, RatingController.criar);

export default router;
