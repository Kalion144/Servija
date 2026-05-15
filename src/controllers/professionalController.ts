
import type { Request, Response } from 'express'
import { db } from '../db/connection.js'
import {
  users,
  professionalProfiles,
  professionalServices,
  ratings,
} from '../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'

export class ProfessionalController {
  static async listar(req: Request, res: Response) {
    const { cidade, categoria } = req.query

    try {
      let query = db
        .select({
          id: users.id,
          nome: users.nome,
          email: users.email,
          foto: users.foto,
          tipo: users.tipo,
          profile: professionalProfiles,
        })
        .from(users)
        .innerJoin(professionalProfiles, eq(professionalProfiles.user_id, users.id))
        .where(eq(users.tipo, 'PROFISSIONAL'))

      if (cidade) {
        query = query.where(eq(professionalProfiles.cidade, String(cidade)))
      }

      if (categoria) {
        query = query
          .innerJoin(
            professionalServices,
            eq(professionalServices.professional_profile_id, professionalProfiles.id)
          )
          .where(eq(professionalServices.categoria, String(categoria)))
      }

      const profissionais = await query

      res.json(profissionais)
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async obterPorId(req: Request, res: Response) {
    const { id } = req.params

    try {
      const [profissional] = await db
        .select({
          id: users.id,
          nome: users.nome,
          email: users.email,
          foto: users.foto,
          tipo: users.tipo,
          profile: professionalProfiles,
        })
        .from(users)
        .innerJoin(professionalProfiles, eq(professionalProfiles.user_id, users.id))
        .where(and(eq(users.id, Number(id)), eq(users.tipo, 'PROFISSIONAL')))

      if (!profissional) {
        return res.status(404).json({ erro: 'Profissional não encontrado' })
      }

      const servicos = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.professional_profile_id, profissional.profile.id))

      const avaliacoes = await db
        .select({
          id: ratings.id,
          estrelas: ratings.estrelas,
          comentario: ratings.comentario,
          created_at: ratings.created_at,
          cliente: users,
        })
        .from(ratings)
        .innerJoin(users, eq(users.id, ratings.client_id))
        .where(eq(ratings.professional_id, Number(id)))
        .orderBy(desc(ratings.created_at))

      res.json({
        ...profissional,
        servicos,
        avaliacoes,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async criarPerfil(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem criar perfil' })
    }

    const { descricao, experiencia, cidade, valor_hora, telefone } = req.body

    try {
      const existingProfile = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId))

      if (existingProfile.length > 0) {
        return res
          .status(400)
          .json({ erro: 'Perfil profissional já existe' })
      }

      const [perfil] = await db
        .insert(professionalProfiles)
        .values({
          user_id: user.userId,
          descricao,
          experiencia,
          cidade,
          valor_hora,
          telefone,
        })
        .$returningId()

      res.status(201).json({
        mensagem: 'Perfil profissional criado com sucesso',
        perfil: { id: perfil.id, user_id: user.userId, descricao, experiencia, cidade, valor_hora, telefone },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async atualizarPerfil(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem atualizar perfil' })
    }

    const { descricao, experiencia, cidade, valor_hora, telefone } = req.body

    try {
      await db
        .update(professionalProfiles)
        .set({
          descricao,
          experiencia,
          cidade,
          valor_hora,
          telefone,
        })
        .where(eq(professionalProfiles.user_id, user.userId))

      res.json({ mensagem: 'Perfil atualizado com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async adicionarServico(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem adicionar serviços' })
    }

    const { categoria, subcategoria } = req.body

    try {
      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId))

      if (!profile) {
        return res
          .status(404)
          .json({ erro: 'Perfil profissional não encontrado' })
      }

      const [servico] = await db
        .insert(professionalServices)
        .values({
          professional_profile_id: profile.id,
          categoria,
          subcategoria,
        })
        .$returningId()

      res.status(201).json({
        mensagem: 'Serviço adicionado com sucesso',
        servico: { id: servico.id, professional_profile_id: profile.id, categoria, subcategoria },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async removerServico(req: Request, res: Response) {
    const user = req.user!

    if (user.userType !== 'PROFISSIONAL') {
      return res
        .status(403)
        .json({ erro: 'Apenas profissionais podem remover serviços' })
    }

    const { id } = req.params

    try {
      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId))

      if (!profile) {
        return res
          .status(404)
          .json({ erro: 'Perfil profissional não encontrado' })
      }

      await db
        .delete(professionalServices)
        .where(
          and(
            eq(professionalServices.id, Number(id)),
            eq(professionalServices.professional_profile_id, profile.id)
          )
        )

      res.json({ mensagem: 'Serviço removido com sucesso' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }
}

