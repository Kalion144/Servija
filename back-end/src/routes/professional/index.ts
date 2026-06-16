import { Router } from "express";
import { ProfessionalController } from "../../controllers/professional/professionalController.js";
import { ProposalController } from "../../controllers/professional/proposalController.js";
import { ServiceController } from "../../controllers/professional/ServiceController.js";
import { FavoritesController } from "../../controllers/FavoritesController.js";
import { ProfessionalRatingController } from "../../controllers/professional/ratingController.js";
import { ConversationController } from "../../controllers/ConversationController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import { SubscriptionController } from "../../controllers/SubscriptionController.js";
import { MetricsController } from "../../controllers/professional/metricsController.js";

const router = Router();

router.get("/metrics", authenticateToken, MetricsController.obter);

router.get(
  "/subscription/status",
  authenticateToken,
  SubscriptionController.status,
);
router.post(
  "/subscription/checkout",
  authenticateToken,
  SubscriptionController.createCheckout,
);
router.get(
  "/subscription/confirm",
  authenticateToken,
  SubscriptionController.confirmSession,
);

router.get("/", ProfessionalController.listar);

router.post("/profile", authenticateToken, ProfessionalController.criarPerfil);
router.put("/profile", authenticateToken, ProfessionalController.atualizarPerfil);

router.post("/services", authenticateToken, ServiceController.adicionarServico);
router.delete("/services/:id", authenticateToken, ServiceController.removerServico);
router.get("/services", authenticateToken, ServiceController.listarServicosProfissional);

// Marketplace: todas as propostas abertas dos clientes
router.get("/proposals/marketplace", authenticateToken, ProposalController.listarMarketplace);
// Propostas enviadas especificamente a este profissional
router.get("/proposals", authenticateToken, ProposalController.listarMinhas);
router.post("/proposals", authenticateToken, ProposalController.enviar);
router.post("/proposals/:id/accept", authenticateToken, ProposalController.aceitar);
router.post("/proposals/:id/reject", authenticateToken, ProposalController.recusar);
// Profissional demonstra interesse em uma proposta do marketplace
router.post("/proposals/:id/interest", authenticateToken, ProposalController.demonstrarInteresse);
router.post(
  "/proposals/:proposalProfessionalId/complete",
  authenticateToken,
  ProposalController.marcarConcluido,
);

router.post("/conversations", authenticateToken, ConversationController.iniciar);
router.get("/conversations", authenticateToken, ConversationController.listar);
router.get(
  "/conversations/service/:serviceId",
  authenticateToken,
  ConversationController.porServico,
);
router.get("/conversations/:id", authenticateToken, ConversationController.obter);
router.post(
  "/conversations/:id/messages",
  authenticateToken,
  ConversationController.enviarMensagem,
);
router.patch(
  "/conversations/:id/concluir",
  authenticateToken,
  ConversationController.concluir,
);

router.post(
  "/favorites/users",
  authenticateToken,
  FavoritesController.toggleFavoriteUser,
);
router.get("/favorites/users", authenticateToken, FavoritesController.listFavoriteUsers);
router.get(
  "/favorites/users/check/:favorite_user_id",
  authenticateToken,
  FavoritesController.checkFavoriteUser,
);

router.post(
  "/favorites/services",
  authenticateToken,
  FavoritesController.toggleFavoriteService,
);
router.get("/favorites/services", authenticateToken, FavoritesController.listFavoriteServices);
router.get(
  "/favorites/services/check/:favorite_service_id",
  authenticateToken,
  FavoritesController.checkFavoriteService,
);

router.post("/ratings", authenticateToken, ProfessionalRatingController.criar);

// Dynamic route last!
router.get("/:id", ProfessionalController.obterPorId);

export default router;
