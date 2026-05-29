
import type { Request, Response } from 'express'
import { db } from '../db/connection.js'
import {
  proposals,
  proposalProfessionals,
  users,
  professionalProfiles,
} from '../db/schema.js'
import { eq, and, ne, desc } from 'drizzle-orm'

export class ProposalController {
  static async criar(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'CLIENTE') {
      return res
        .status(403)
        .json({ erro: 'Apenas clientes podem criar propostas' })
    }

    const { titulo, descricao, valor, prazo } = req.body

    try {
      const [proposta] = await db
        .insert(proposals)
        .values({
          client_id: user.userId,
          titulo,
          descricao,
          valor,
          prazo,
          status: 'PENDENTE',
        })
        .returning({ id: proposals.id })

      res.status(201).json({
        mensagem: 'Proposta criada com sucesso',
        proposta: { id: proposta.id, client_id: user.userId, titulo, descricao, valor, prazo, status: 'PENDENTE' },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async listarMinhas(req: Request, res: Response) {
    const user = req.user!

    try {
      let propostas

      if (user.userType === 'CLIENTE') {
        propostas = await db
          .select()
          .from(proposals)
          .where(eq(proposals.client_id, user.userId))
          .orderBy(desc(proposals.created_at))
      } else {
        propostas = await db
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
      }

      res.json(propostas)
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async obterPorId(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(eq(proposals.id, Number(id)))

      if (!proposta) {
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      if (
        user.userType === 'CLIENTE' &&
        proposta.client_id !== user.userId
      ) {
        return res
          .status(403)
          .json({ erro: 'Acesso negado a esta proposta' })
      }

      const profissionais = await db
        .select({
          id: users.id,
          nome: users.nome,
          email: users.email,
          foto: users.foto,
          profile: professionalProfiles,
          status: proposalProfessionals.status,
          proposalProfessionalId: proposalProfessionals.id,
        })
        .from(proposalProfessionals)
        .innerJoin(users, eq(users.id, proposalProfessionals.professional_id))
        .leftJoin(
          professionalProfiles,
          eq(professionalProfiles.user_id, users.id)
        )
        .where(eq(proposalProfessionals.proposal_id, Number(id)))

      const [cliente] = await db
        .select()
        .from(users)
        .where(eq(users.id, proposta.client_id))

      res.json({
        ...proposta,
        cliente,
        profissionais,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async enviarParaProfissionais(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params
    const { professionals } = req.body

    if (user.userType !== 'CLIENTE') {
      return res
        .status(403)
        .json({ erro: 'Apenas clientes podem enviar propostas' })
    }

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(
          and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId))
        )

      if (!proposta) {
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      const registros = professionals.map((professionalId: number) => ({
        proposal_id: Number(id),
        professional_id: professionalId,
        status: 'PENDENTE' as const,
      }))

      await db.insert(proposalProfessionals).values(registros)

      res.json({
        mensagem: 'Proposta enviada para os profissionais com sucesso',
      })
    } catch (error) {
      console.error(error)
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
        return res.status(404).json({ erro: 'Registro não encontrado' })
      }

      await db
        .update(proposalProfessionals)
        .set({ status: 'ACEITA' })
        .where(eq(proposalProfessionals.id, Number(id)))

      res.json({ mensagem: 'Proposta aceita com sucesso' })
    } catch (error) {
      console.error(error)
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
        return res.status(404).json({ erro: 'Registro não encontrado' })
      }

      await db
        .update(proposalProfessionals)
        .set({ status: 'RECUSADA' })
        .where(eq(proposalProfessionals.id, Number(id)))

      res.json({ mensagem: 'Proposta recusada com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async iniciarServico(req: Request, res: Response) {
    const user = req.user!
    const { id, professionalId } = req.params

    if (user.userType !== 'CLIENTE') {
      return res
        .status(403)
        .json({ erro: 'Apenas clientes podem iniciar serviços' })
    }

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(
          and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId))
        )

      if (!proposta) {
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      await db
        .update(proposals)
        .set({ status: 'EM_ANDAMENTO' })
        .where(eq(proposals.id, Number(id)))

      await db
        .update(proposalProfessionals)
        .set({ status: 'EM_ANDAMENTO' })
        .where(
          and(
            eq(proposalProfessionals.proposal_id, Number(id)),
            eq(proposalProfessionals.professional_id, Number(professionalId))
          )
        )

      res.json({ mensagem: 'Serviço iniciado com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async finalizarServico(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(eq(proposals.id, Number(id)))

      if (!proposta) {
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      if (
        user.userType === 'CLIENTE' &&
        proposta.client_id !== user.userId
      ) {
        return res
          .status(403)
          .json({ erro: 'Acesso negado a esta proposta' })
      }

      await db
        .update(proposals)
        .set({ status: 'FINALIZADA' })
        .where(eq(proposals.id, Number(id)))

      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.proposal_id, Number(id)),
            eq(proposalProfessionals.status, 'EM_ANDAMENTO')
          )
        )

      if (pp) {
        await db
          .update(proposalProfessionals)
          .set({ status: 'FINALIZADA' })
          .where(eq(proposalProfessionals.id, pp.id))
      }

      res.json({ mensagem: 'Serviço finalizado com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  // Todas as propostas PENDENTE dos clientes (marketplace para profissionais)
  static async listarMarketplace(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'PROFISSIONAL') {
      return res.status(403).json({ erro: 'Acesso restrito a profissionais' })
    }

    try {
      const propostas = await db
        .select({
          id: proposals.id,
          titulo: proposals.titulo,
          descricao: proposals.descricao,
          valor: proposals.valor,
          prazo: proposals.prazo,
          status: proposals.status,
          created_at: proposals.created_at,
          clienteNome: users.nome,
          clienteId: proposals.client_id,
        })
        .from(proposals)
        .innerJoin(users, eq(users.id, proposals.client_id))
        .where(eq(proposals.status, 'PENDENTE'))
        .orderBy(desc(proposals.created_at))

      // Marca quais este profissional já demonstrou interesse
      const interesses = await db
        .select({ proposal_id: proposalProfessionals.proposal_id })
        .from(proposalProfessionals)
        .where(eq(proposalProfessionals.professional_id, user.userId))

      const interesseIds = new Set(interesses.map((i) => i.proposal_id))

      const resultado = propostas.map((p) => ({
        ...p,
        jaInteressou: interesseIds.has(p.id),
      }))

      res.json(resultado)
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  // Profissional demonstra interesse em uma proposta do marketplace
  static async demonstrarInteresse(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    if (user.userType !== 'PROFISSIONAL') {
      return res.status(403).json({ erro: 'Apenas profissionais podem demonstrar interesse' })
    }

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.status, 'PENDENTE')))

      if (!proposta) {
        return res.status(404).json({ erro: 'Proposta não encontrada ou não está pendente' })
      }

      const [existing] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.proposal_id, Number(id)),
            eq(proposalProfessionals.professional_id, user.userId)
          )
        )

      if (existing) {
        return res.status(400).json({ erro: 'Você já demonstrou interesse nesta proposta' })
      }

      await db.insert(proposalProfessionals).values({
        proposal_id: Number(id),
        professional_id: user.userId,
        status: 'PENDENTE',
      })

      res.json({ mensagem: 'Interesse registrado com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }
}

