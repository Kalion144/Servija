
import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  users,
  professionalProfiles,
  professionalServices,
  ratings,
} from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

export class ProfessionalController {
  static async listar(req: Request, res: Response) {
    const { cidade, categoria } = req.query;

    try {
      const profissionais = await db
        .select({
          id: users.id,
          nome: users.nome,
          email: users.email,
          foto: users.foto,
          tipo: users.tipo,
        })
        .from(users)
        .where(eq(users.tipo, "PROFISSIONAL"));

      res.json({ profissionais });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async obterPorId(req: Request, res: Response) {
    const { id } = req.params;

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
        .innerJoin(
          professionalProfiles,
          eq(professionalProfiles.user_id, users.id),
        )
        .where(and(eq(users.id, Number(id)), eq(users.tipo, "PROFISSIONAL")));

      if (!profissional) {
        return res.status(404).json({ erro: "Profissional não encontrado" });
      }

      const servicos = await db
        .select()
        .from(professionalServices)
        .where(
          eq(
            professionalServices.professional_profile_id,
            profissional.profile.id,
          ),
        );

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
        .orderBy(desc(ratings.created_at));

      res.json({
        ...profissional,
        servicos,
        avaliacoes,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async criarPerfil(req: Request, res: Response) {
    const user = req.user!;

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem criar perfil" });
    }

    const { profissao, bio, experiencia, habilidades, localizacao, descricao, cidade, valor_hora, telefone } = req.body;

    try {
      const existingProfile = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId));

      if (existingProfile.length > 0) {
        return res.status(400).json({ erro: "Perfil profissional já existe" });
      }

      const [perfil] = await db
        .insert(professionalProfiles)
        .values({
          user_id: user.userId,
          profissao,
          bio,
          experiencia,
          habilidades: habilidades ? JSON.stringify(habilidades) : null,
          localizacao,
          descricao,
          cidade,
          valor_hora,
          telefone,
        })
        .returning({ id: professionalProfiles.id });

      res.status(201).json({
        mensagem: "Perfil profissional criado com sucesso",
        perfil: {
          id: perfil.id,
          user_id: user.userId,
          profissao,
          bio,
          experiencia,
          habilidades,
          localizacao,
          descricao,
          cidade,
          valor_hora,
          telefone,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async atualizarPerfil(req: Request, res: Response) {
    const user = req.user!;

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem atualizar perfil" });
    }

    const { nome, profissao, bio, experiencia, habilidades, localizacao, descricao, cidade, valor_hora, telefone, fotoPerfil } = req.body;

    try {
      if (nome || fotoPerfil !== undefined) {
        const userUpdateData: any = {};
        if (nome) userUpdateData.nome = nome;
        if (fotoPerfil !== undefined) userUpdateData.foto = fotoPerfil;
        await db.update(users).set(userUpdateData).where(eq(users.id, user.userId));
      }

      const existingProfile = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId));

      if (existingProfile.length === 0) {
        await db.insert(professionalProfiles).values({
          user_id: user.userId,
          profissao,
          bio,
          experiencia,
          habilidades: habilidades ? JSON.stringify(habilidades) : null,
          localizacao,
          descricao,
          cidade,
          valor_hora,
          telefone,
        });
      } else {
        const profileUpdateData: any = {};
        if (profissao !== undefined) profileUpdateData.profissao = profissao;
        if (bio !== undefined) profileUpdateData.bio = bio;
        if (experiencia !== undefined) profileUpdateData.experiencia = experiencia;
        if (habilidades !== undefined) profileUpdateData.habilidades = JSON.stringify(habilidades);
        if (localizacao !== undefined) profileUpdateData.localizacao = localizacao;
        if (descricao !== undefined) profileUpdateData.descricao = descricao;
        if (cidade !== undefined) profileUpdateData.cidade = cidade;
        if (valor_hora !== undefined) profileUpdateData.valor_hora = valor_hora;
        if (telefone !== undefined) profileUpdateData.telefone = telefone;

        await db
          .update(professionalProfiles)
          .set(profileUpdateData)
          .where(eq(professionalProfiles.user_id, user.userId));
      }

      res.json({ mensagem: "Perfil atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }
}
