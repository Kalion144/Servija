
import { Router } from 'express'
import { ProposalController } from '../controllers/proposalController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authenticateToken, ProposalController.criar)
router.get('/', authenticateToken, ProposalController.listarMinhas)
router.get('/:id', authenticateToken, ProposalController.obterPorId)
router.post('/:id/send', authenticateToken, ProposalController.enviarParaProfissionais)
router.patch('/:id/start/:professionalId', authenticateToken, ProposalController.iniciarServico)
router.patch('/:id/finish', authenticateToken, ProposalController.finalizarServico)

export default router

