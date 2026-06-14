import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  users,
  professionalProfiles,
  professionalServices,
  ratings,
  subscriptions,
} from "../../db/schema.js";
import { eq, and, desc, or, like, sql, type SQL } from "drizzle-orm";

export class ProfessionalController {
  static async listar(req: Request, res: Response) {
    const { cidade, busca } = req.query;

    try {
      const conditions: SQL[] = [eq(users.tipo, "PROFISSIONAL")];

      if (cidade && typeof cidade === "string" && cidade.trim()) {
        const term = `%${cidade.trim()}%`;
        conditions.push(
          or(
            like(professionalProfiles.cidade, term),
            like(professionalProfiles.localizacao, term),
            like(users.cidade, term),
          )!,
        );
      }

      if (busca && typeof busca === "string" && busca.trim()) {
        const term = `%${busca.trim()}%`;
        conditions.push(
          or(
            like(users.nome, term),
            like(professionalProfiles.profissao, term),
            like(professionalProfiles.cidade, term),
            like(professionalProfiles.localizacao, term),
            like(users.cidade, term),
          )!,
        );
      }

      const profissionais = await db
        .select({
          id: users.id,
          nome: users.nome,
          email: users.email,
          foto: users.foto,
          tipo: users.tipo,
          bio: users.bio,
          verified: users.verified,
          user_cidade: users.cidade,
          user_estado: users.estado,
          profissao: professionalProfiles.profissao,
          experiencia: professionalProfiles.experiencia,
          habilidades: professionalProfiles.habilidades,
          localizacao: professionalProfiles.localizacao,
          cidade: professionalProfiles.cidade,
          valor_hora: professionalProfiles.valor_hora,
          avaliacao: professionalProfiles.media_estrelas,
          total_avaliacoes: professionalProfiles.total_avaliacoes,
          plan: subscriptions.plan,
        })
        .from(users)
        .leftJoin(professionalProfiles, eq(professionalProfiles.user_id, users.id))
        .leftJoin(
          subscriptions,
          and(eq(subscriptions.user_id, users.id), eq(subscriptions.user_type, "PROFISSIONAL")),
        )
        .where(and(...conditions))
        .orderBy(
          desc(sql`CASE WHEN ${subscriptions.plan} = 'PREMIUM' THEN 2 WHEN ${subscriptions.plan} = 'PRO' THEN 1 ELSE 0 END`),
          desc(professionalProfiles.media_estrelas),
        );

      // Process habilidades: parse JSON string to array if present
      const processedProfissionais = profissionais.map((prof) => ({
        ...prof,
        plan: prof.plan ?? "FREE",
        verified: prof.verified === 1,
        habilidades: prof.habilidades
          ? typeof prof.habilidades === "string"
            ? JSON.parse(prof.habilidades)
            : prof.habilidades
          : null,
      }));

      res.json({ profissionais: processedProfissionais });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async obterPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Validate that id is a number
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        return res.status(400).json({ erro: "ID inválido" });
      }

      const [profissional] = await db
        .select({
          id: users.id,
          nome: users.nome,
          email: users.email,
          foto: users.foto,
          tipo: users.tipo,
          bio: users.bio,
          profile_id: professionalProfiles.id,
          profissao: professionalProfiles.profissao,
          experiencia: professionalProfiles.experiencia,
          habilidades: professionalProfiles.habilidades,
          localizacao: professionalProfiles.localizacao,
          cidade: professionalProfiles.cidade,
          valor_hora: professionalProfiles.valor_hora,
          avaliacao: professionalProfiles.media_estrelas,
          total_avaliacoes: professionalProfiles.total_avaliacoes,
          descricao: professionalProfiles.descricao,
        })
        .from(users)
        .innerJoin(
          professionalProfiles,
          eq(professionalProfiles.user_id, users.id),
        )
        .where(and(eq(users.id, numericId), eq(users.tipo, "PROFISSIONAL")));

      if (!profissional) {
        return res.status(404).json({ erro: "Profissional não encontrado" });
      }

      // Process habilidades
      const processedProfissional = {
        ...profissional,
        habilidades: profissional.habilidades
          ? typeof profissional.habilidades === "string"
            ? JSON.parse(profissional.habilidades)
            : profissional.habilidades
          : null,
      };

      const servicos = await db
        .select()
        .from(professionalServices)
        .where(
          eq(
            professionalServices.professional_profile_id,
            profissional.profile_id,
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
        .where(eq(ratings.professional_id, numericId))
        .orderBy(desc(ratings.created_at));

      res.json({
        ...processedProfissional,
        servicos,
        avaliacoes,
      });
    } catch (error) {
      console.error(error);
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async criarPerfil(req: Request, res: Response) {
    const user = req.user!;

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn(
        "⚠️ [criarPerfil] Usuário não autenticado ou userId inválido",
      );
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem criar perfil" });
    }

    const {
      profissao,
      bio,
      experiencia,
      habilidades,
      localizacao,
      descricao,
      cidade,
      valor_hora,
      telefone,
    } = req.body;

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
      console.error("❌ [criarPerfil] Erro completo:", error);
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async atualizarPerfil(req: Request, res: Response) {
    const user = req.user!;

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn(
        "⚠️ [atualizarPerfil] Usuário não autenticado ou userId inválido",
      );
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem atualizar perfil" });
    }

    const {
      nome,
      profissao,
      bio,
      experiencia,
      habilidades,
      localizacao,
      descricao,
      cidade,
      valor_hora,
      telefone,
      fotoPerfil,
    } = req.body;

    try {
      if (nome || fotoPerfil !== undefined) {
        const userUpdateData: any = {};
        if (nome) userUpdateData.nome = nome;
        if (fotoPerfil !== undefined) userUpdateData.foto = fotoPerfil;
        await db
          .update(users)
          .set(userUpdateData)
          .where(eq(users.id, user.userId));
      }

      const existingProfile = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId));

      const cidadeValor = cidade || localizacao || 'Não informado';
      const valorHoraNum = valor_hora !== undefined && valor_hora !== null && valor_hora !== ''
        ? parseFloat(valor_hora)
        : null;

      if (existingProfile.length === 0) {
        await db.insert(professionalProfiles).values({
          user_id: user.userId,
          profissao: profissao || null,
          bio: bio || null,
          experiencia: experiencia || null,
          habilidades: habilidades ? JSON.stringify(habilidades) : null,
          localizacao: localizacao || null,
          descricao: descricao || null,
          cidade: cidadeValor,
          valor_hora: valorHoraNum,
          telefone: telefone || null,
        });
      } else {
        const profileUpdateData: any = {};
        if (profissao !== undefined) profileUpdateData.profissao = profissao;
        if (bio !== undefined) profileUpdateData.bio = bio;
        if (experiencia !== undefined) profileUpdateData.experiencia = experiencia;
        if (habilidades !== undefined) profileUpdateData.habilidades = JSON.stringify(habilidades);
        if (localizacao !== undefined) {
          profileUpdateData.localizacao = localizacao;
          profileUpdateData.cidade = localizacao || 'Não informado';
        }
        if (cidade !== undefined) profileUpdateData.cidade = cidade;
        if (descricao !== undefined) profileUpdateData.descricao = descricao;
        profileUpdateData.valor_hora = valorHoraNum;
        if (telefone !== undefined) profileUpdateData.telefone = telefone;

        await db
          .update(professionalProfiles)
          .set(profileUpdateData)
          .where(eq(professionalProfiles.user_id, user.userId));
      }

      res.json({ mensagem: "Perfil atualizado com sucesso" });
    } catch (error) {
      console.error("❌ [atualizarPerfil] Erro completo:", error);
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }
}
