
import type { Request, Response } from 'express'
import { db } from '../db/connection.js'
import {
  ratings,
  proposalProfessionals,
  professionalProfiles,
} from '../db/schema.js'
import { eq, and, desc, avg, count } from 'drizzle-orm'

export class RatingController {
  static async criar(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'CLIENTE') {
      return res
        .status(403)
        .json({ erro: 'Apenas clientes podem criar avaliações' })
    }

    const { proposal_professional_id, estrelas, comentario } = req.body

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(eq(proposalProfessionals.id, proposal_professional_id))

      if (!pp) {
        return res
          .status(404)
          .json({ erro: 'Registro de proposta não encontrado' })
      }

      if (pp.status !== 'FINALIZADA') {
        return res
          .status(400)
          .json({ erro: 'Só pode avaliar serviços finalizados' })
      }

      const existingRating = await db
        .select()
        .from(ratings)
        .where(eq(ratings.proposal_professional_id, proposal_professional_id))

      if (existingRating.length > 0) {
        return res
          .status(400)
          .json({ erro: 'Avaliação já existe para este serviço' })
      }

      const [avaliacao] = await db
        .insert(ratings)
        .values({
          proposal_professional_id,
          client_id: user.userId,
          professional_id: pp.professional_id,
          estrelas,
          comentario,
        })
        .$returningId()

      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, pp.professional_id))

      if (profile) {
        const stats = await db
          .select({
            media: avg(ratings.estrelas),
            total: count(ratings.id),
          })
          .from(ratings)
          .where(eq(ratings.professional_id, pp.professional_id))

        const [stat] = stats
        if (stat) {
          await db
            .update(professionalProfiles)
            .set({
              media_estrelas: Number(stat.media) || 0,
              total_avaliacoes: Number(stat.total),
            })
            .where(eq(professionalProfiles.user_id, pp.professional_id))
        }
      }

      await db
        .update(proposalProfessionals)
        .set({ status: 'AVALIADA' })
        .where(eq(proposalProfessionals.id, proposal_professional_id))

      res.status(201).json({
        mensagem: 'Avaliação criada com sucesso',
        avaliacao: { id: avaliacao.id, proposal_professional_id, client_id: user.userId, professional_id: pp.professional_id, estrelas, comentario },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async listarPorProfissional(req: Request, res: Response) {
    const { id } = req.params

    try {
      const avaliacoes = await db
        .select()
        .from(ratings)
        .where(eq(ratings.professional_id, Number(id)))
        .orderBy(desc(ratings.created_at))

      res.json(avaliacoes)
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }
}

