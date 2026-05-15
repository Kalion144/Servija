
import { Router } from 'express'
import { ProfessionalController } from '../controllers/professionalController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', ProfessionalController.listar)
router.get('/:id', ProfessionalController.obterPorId)
router.post('/profile', authenticateToken, ProfessionalController.criarPerfil)
router.put('/profile', authenticateToken, ProfessionalController.atualizarPerfil)
router.post('/services', authenticateToken, ProfessionalController.adicionarServico)
router.delete('/services/:id', authenticateToken, ProfessionalController.removerServico)

export default router

