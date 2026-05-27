
import { Router } from 'express'
import { ProposalClientController } from '../../controllers/client/ProposalController.js'
import { RatingClientController } from '../../controllers/client/RatingController.js'
import { authenticateToken } from '../../middleware/authMiddleware.js'

const router = Router()

router.post('/proposals', authenticateToken, ProposalClientController.criar)
router.get('/proposals', authenticateToken, ProposalClientController.listarMinhas)
router.get('/proposals/:id', authenticateToken, ProposalClientController.obterPorId)
router.post('/proposals/:id/send', authenticateToken, ProposalClientController.enviarParaProfissionais)
router.patch('/proposals/:id/start/:professionalId', authenticateToken, ProposalClientController.iniciarServico)
router.patch('/proposals/:id/finish', authenticateToken, ProposalClientController.finalizarServico)

router.post('/ratings', authenticateToken, RatingClientController.criar)

export default router

