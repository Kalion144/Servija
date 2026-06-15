import { Router } from "express";
import { ServiceController } from "../../controllers/client/ServiceController.js";
import { ProposalClientController } from "../../controllers/client/ProposalController.js";
import { RatingController } from "../../controllers/client/ratingController.js";
import { FavoritesController } from "../../controllers/FavoritesController.js";
import { ConversationController } from "../../controllers/ConversationController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import { SubscriptionController } from "../../controllers/SubscriptionController.js";

const router = Router();

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

// Rotas de serviços (criados por clientes)
router.post("/services", authenticateToken, ServiceController.criar);
router.get("/services", authenticateToken, ServiceController.listarMeus);
router.get("/services/all", authenticateToken, ServiceController.listarTodos);
router.get("/services/:id", authenticateToken, ServiceController.obterPorId);

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
  "/conversations/:id/contratar",
  authenticateToken,
  ConversationController.contratar,
);
router.patch(
  "/conversations/:id/concluir",
  authenticateToken,
  ConversationController.concluir,
);

// Rotas de propostas recebidas
router.get(
  "/proposals/received",
  authenticateToken,
  ProposalClientController.listarPropostasRecebidas,
);
router.patch(
  "/proposals/:id/accept",
  authenticateToken,
  ProposalClientController.aceitarProposta,
);
router.patch(
  "/proposals/:id/reject",
  authenticateToken,
  ProposalClientController.recusarProposta,
);

// Rotas de avaliações
router.post("/ratings", authenticateToken, RatingController.criar);
router.get(
  "/professionals/:id/ratings",
  authenticateToken,
  RatingController.listarPorProfissional,
);

// Rotas de favoritos (Usuários)
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

// Rotas de favoritos (Serviços)
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

export default router;
