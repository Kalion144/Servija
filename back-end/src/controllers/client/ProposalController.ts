
import type { Request, Response } from 'express'
import { db } from '../../db/connection.js'
import {
  proposals,
  proposalProfessionals,
  users,
  professionalProfiles,
} from '../../db/schema.js'
import { eq, and, desc, inArray } from 'drizzle-orm'

export class ProposalClientController {
  static async criar(req: Request, res: Response) {
    const user = req.user!
    const { titulo, descricao, valor, prazo } = req.body

    console.log('📝 Criando proposta para cliente ID:', user.userId)

    if (user.userType !== 'CLIENTE') {
      return res
        .status(403)
        .json({ erro: 'Apenas clientes podem criar propostas' })
    }

    try {
      const [proposta] = await db
        .insert(proposals)
        .values({
          client_id: user.userId,
          titulo,
          descricao,
          valor: valor ? Number(valor) : null,
          prazo,
        })
        .returning()

      console.log('✅ Proposta criada com sucesso! ID:', proposta.id)

      res.status(201).json({
        mensagem: 'Proposta criada com sucesso',
        proposta,
      })
    } catch (error) {
      console.error('❌ Erro ao criar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async listarMinhas(req: Request, res: Response) {
    const user = req.user!

    console.log('📋 Listando propostas do cliente ID:', user.userId)

    try {
      const propostas = await db
        .select()
        .from(proposals)
        .where(eq(proposals.client_id, user.userId))
        .orderBy(desc(proposals.created_at))

      console.log('✅', propostas.length, 'proposta(s) encontrada(s)')
      res.json({ propostas })
    } catch (error) {
      console.error('❌ Erro ao listar propostas:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async obterPorId(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    console.log('🔍 Obtendo proposta ID:', id)

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId)))

      if (!proposta) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      const profissionaisPropostas = await db
        .select({
          id: proposalProfessionals.id,
          professional_id: proposalProfessionals.professional_id,
          status: proposalProfessionals.status,
          professional_nome: users.nome,
          professional_foto: users.foto,
        })
        .from(proposalProfessionals)
        .innerJoin(users, eq(proposalProfessionals.professional_id, users.id))
        .where(eq(proposalProfessionals.proposal_id, Number(id)))

      console.log('✅ Proposta encontrada com', profissionaisPropostas.length, 'propostas de profissionais')
      res.json({ proposta, profissionaisPropostas })
    } catch (error) {
      console.error('❌ Erro ao obter proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async atualizar(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params
    const { titulo, descricao, valor, prazo } = req.body

    console.log('🔄 Atualizando proposta ID:', id)

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId)))

      if (!proposta) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      const updateData: any = {}
      if (titulo) updateData.titulo = titulo
      if (descricao) updateData.descricao = descricao
      if (valor !== undefined) updateData.valor = Number(valor)
      if (prazo) updateData.prazo = prazo

      const [updatedProposal] = await db
        .update(proposals)
        .set(updateData)
        .where(eq(proposals.id, Number(id)))
        .returning()

      console.log('✅ Proposta atualizada com sucesso')
      res.json({ mensagem: 'Proposta atualizada com sucesso', proposta: updatedProposal })
    } catch (error) {
      console.error('❌ Erro ao atualizar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async deletar(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    console.log('🗑️ Deletando proposta ID:', id)

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId)))

      if (!proposta) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      await db.delete(proposals).where(eq(proposals.id, Number(id)))

      console.log('✅ Proposta deletada com sucesso')
      res.json({ mensagem: 'Proposta deletada com sucesso' })
    } catch (error) {
      console.error('❌ Erro ao deletar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async enviarParaProfissionais(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params
    const { professionals } = req.body

    console.log('📤 Enviando proposta ID:', id, 'para profissionais:', professionals)

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId)))

      if (!proposta) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      // Insert all professionals
      const insertedProposals = await db
        .insert(proposalProfessionals)
        .values(
          professionals.map((pId: number) => ({
            proposal_id: Number(id),
            professional_id: pId,
            status: 'PENDENTE',
          }))
        )
        .returning()

      console.log('✅ Proposta enviada para', insertedProposals.length, 'profissionais')
      res.json({ mensagem: 'Proposta enviada com sucesso', profissionaisPropostas: insertedProposals })
    } catch (error) {
      console.error('❌ Erro ao enviar proposta:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async iniciarServico(req: Request, res: Response) {
    const user = req.user!
    const { id, professionalId } = req.params

    console.log('▶️ Iniciando serviço para proposta ID:', id, 'e profissional ID:', professionalId)

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId)))

      if (!proposta) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      // Find and update the professional proposal
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.proposal_id, Number(id)),
            eq(proposalProfessionals.professional_id, Number(professionalId))
          )
        )

      if (!pp) {
        console.log('❌ Proposta profissional não encontrada')
        return res.status(404).json({ erro: 'Registro não encontrado' })
      }

      // Update both to EM_ANDAMENTO
      await db
        .update(proposalProfessionals)
        .set({ status: 'EM_ANDAMENTO' })
        .where(eq(proposalProfessionals.id, pp.id))

      await db
        .update(proposals)
        .set({ status: 'EM_ANDAMENTO' })
        .where(eq(proposals.id, Number(id)))

      console.log('✅ Serviço iniciado com sucesso')
      res.json({ mensagem: 'Serviço iniciado com sucesso' })
    } catch (error) {
      console.error('❌ Erro ao iniciar serviço:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async finalizarServico(req: Request, res: Response) {
    const user = req.user!
    const { id } = req.params

    console.log('🏁 Finalizando serviço para proposta ID:', id)

    try {
      const [proposta] = await db
        .select()
        .from(proposals)
        .where(and(eq(proposals.id, Number(id)), eq(proposals.client_id, user.userId)))

      if (!proposta) {
        console.log('❌ Proposta não encontrada')
        return res.status(404).json({ erro: 'Proposta não encontrada' })
      }

      await db
        .update(proposals)
        .set({ status: 'FINALIZADA' })
        .where(eq(proposals.id, Number(id)))

      console.log('✅ Serviço finalizado com sucesso')
      res.json({ mensagem: 'Serviço finalizado com sucesso' })
    } catch (error) {
      console.error('❌ Erro ao finalizar serviço:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }
}
