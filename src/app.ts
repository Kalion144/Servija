import express from 'express'
import authRoutes from './routes/authRoutes.js'
import professionalRoutes from './routes/professionalRoutes.js'
import proposalRoutes from './routes/proposalRoutes.js'
import proposalProfessionalRoutes from './routes/proposalProfessionalRoutes.js'
import ratingRoutes from './routes/ratingRoutes.js'

const app = express()

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/professionals', professionalRoutes)
app.use('/proposals', proposalRoutes)
app.use('/proposal-professionals', proposalProfessionalRoutes)
app.use('/ratings', ratingRoutes)

export default app