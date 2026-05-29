import { Router } from "express";
import { ProfessionalController } from "../../controllers/professionalController.js";
import { ProposalController } from "../../controllers/proposalController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

// Rotas fixas ANTES de /:id para evitar captura incorreta
router.get("/", ProfessionalController.listar);

router.post("/profile", authenticateToken, ProfessionalController.criarPerfil);
router.put("/profile", authenticateToken, ProfessionalController.atualizarPerfil);

router.post("/services", authenticateToken, ProfessionalController.adicionarServico);
router.delete("/services/:id", authenticateToken, ProfessionalController.removerServico);

// Marketplace: todas as propostas abertas dos clientes
router.get("/proposals/marketplace", authenticateToken, ProposalController.listarMarketplace);
// Propostas enviadas especificamente a este profissional
router.get("/proposals", authenticateToken, ProposalController.listarMinhas);
router.post("/proposals/:id/accept", authenticateToken, ProposalController.aceitar);
router.post("/proposals/:id/reject", authenticateToken, ProposalController.recusar);
// Profissional demonstra interesse em uma proposta do marketplace
router.post("/proposals/:id/interest", authenticateToken, ProposalController.demonstrarInteresse);

// /:id por último para não capturar as rotas acima
router.get("/:id", ProfessionalController.obterPorId);

export default router;
