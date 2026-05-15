
import { Router } from 'express'
import { ProposalController } from '../controllers/proposalController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/:id/accept', authenticateToken, ProposalController.aceitar)
router.post('/:id/reject', authenticateToken, ProposalController.recusar)

export default router

