
import type { Request, Response } from 'express'
import { db } from '../../db/connection.js'
import {
  proposals,
  proposalProfessionals,
  users,
  professionalProfiles,
} from '../../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'

export class ProposalController {
  static async enviar(req: Request, res: Response) {
    const user = req.user!
    const { serviceId, valor, mensagem } = req.body

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem enviar propostas' })
    }

    console.log('📤 Enviando proposta para serviço ID:', serviceId)

    try {
      const [servico] = await db
        .select()
        .from(proposals)
        .where(eq(proposals.id, Number(serviceId)))

      if (!servico) {
        console.log('❌ Serviço não encontrado')
        return res.status(404).json({ erro: 'Serviço não encontrado' })
      }

      const [proposta] = await db
        .insert(proposalProfessionals)
        .values({
          proposal_id: Number(serviceId),
          professional_id: user.userId,
          status: 'PENDENTE',
        })
        .returning({ id: proposalProfessionals.id })

      console.log('✅ Proposta enviada com sucesso, ID:', proposta.id)

      res.status(201).json({
        mensagem: 'Proposta enviada com sucesso',
        proposta: {
          id: proposta.id,
          proposal_id: Number(serviceId),
          professional_id: user.userId,
          status: 'PENDENTE',
        },
      })
    } catch (error) {
      console.error('❌ Erro ao enviar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async listarMinhas(req: Request, res: Response) {
    const user = req.user!

    console.log('📋 Listando propostas do profissional ID:', user.userId)

    try {
      const propostas = await db
        .select({
          id: proposals.id,
          client_id: proposals.client_id,
          titulo: proposals.titulo,
          descricao: proposals.descricao,
          valor: proposals.valor,
          prazo: proposals.prazo,
          status: proposals.status,
          created_at: proposals.created_at,
          proposalProfessional: proposalProfessionals,
        })
        .from(proposals)
        .innerJoin(
          proposalProfessionals,
          eq(proposalProfessionals.proposal_id, proposals.id)
        )
        .where(eq(proposalProfessionals.professional_id, user.userId))
        .orderBy(desc(proposals.created_at))

      console.log('✅', propostas.length, 'propostas encontradas')
      res.json(propostas)
    } catch (error) {
      console.error('❌ Erro ao listar propostas:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async aceitar(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem aceitar propostas' })
    }

    console.log('✅ Aceitando proposta ID:', id)

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.id, Number(id)),
            eq(proposalProfessionals.professional_id, user.userId)
          )
        )

      if (!pp) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Registro não encontrado' })
      }

      await db
        .update(proposalProfessionals)
        .set({ status: 'ACEITA' })
        .where(eq(proposalProfessionals.id, Number(id)))

      console.log('✅ Proposta aceita com sucesso')
      res.json({ mensagem: 'Proposta aceita com sucesso' })
    } catch (error) {
      console.error('❌ Erro ao aceitar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async recusar(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem recusar propostas' })
    }

    console.log('❌ Recusando proposta ID:', id)

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.id, Number(id)),
            eq(proposalProfessionals.professional_id, user.userId)
          )
        )

      if (!pp) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Registro não encontrado' })
      }

      await db
        .update(proposalProfessionals)
        .set({ status: 'RECUSADA' })
        .where(eq(proposalProfessionals.id, Number(id)))

      console.log('✅ Proposta recusada com sucesso')
      res.json({ mensagem: 'Proposta recusada com sucesso' })
    } catch (error) {
      console.error('❌ Erro ao recusar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async marcarConcluido(req: Request, res: Response) {
    const user = req.user!
    const { proposalProfessionalId } = req.params

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem marcar serviços como concluídos' })
    }

    console.log('🏁 Marcando serviço como concluído, proposalProfessionalId:', proposalProfessionalId)

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.id, Number(proposalProfessionalId)),
            eq(proposalProfessionals.professional_id, user.userId)
          )
        )

      if (!pp) {
        console.log('❌ Proposta profissional não encontrada')
        return res.status(404).json({ erro: 'Registro não encontrado' })
      }

      console.log('🔍 Atualizando proposta profissional para FINALIZADA...')
      await db
        .update(proposalProfessionals)
        .set({ status: 'FINALIZADA' })
        .where(eq(proposalProfessionals.id, Number(proposalProfessionalId)))

      console.log('🔍 Atualizando proposta principal para FINALIZADA...')
      await db
        .update(proposals)
        .set({ status: 'FINALIZADA' })
        .where(eq(proposals.id, pp.proposal_id))

      // Simular envio de WhatsApp para cliente
      console.log('📱 [SIMULAÇÃO] Enviando WhatsApp para cliente para avaliar o serviço!')

      res.json({ mensagem: 'Serviço marcado como concluído com sucesso' })
    } catch (error) {
      console.error('❌ Erro ao marcar serviço como concluído:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }
}
