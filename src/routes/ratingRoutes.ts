
import { Router } from 'express'
import { RatingController } from '../controllers/ratingController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/', authenticateToken, RatingController.criar)
router.get('/professionals/:id', RatingController.listarPorProfissional)

export default router

