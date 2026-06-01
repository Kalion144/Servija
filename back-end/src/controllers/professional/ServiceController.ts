
import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  professionalProfiles,
  professionalServices,
} from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export class ServiceController {
  static async adicionarServico(req: Request, res: Response) {
    const user = req.user!;

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem adicionar serviços" });
    }

    const { categoria, subcategoria, urgente, contato, localizacao, fotos } = req.body;

    try {
      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId));

      if (!profile) {
        return res
          .status(404)
          .json({ erro: "Perfil profissional não encontrado" });
      }

      const [servico] = await db
        .insert(professionalServices)
        .values({
          professional_profile_id: profile.id,
          categoria,
          subcategoria,
          urgente: urgente ? 1 : 0,
          contato,
          localizacao,
          fotos: fotos ? JSON.stringify(fotos) : null,
        })
        .returning({ id: professionalServices.id });

      res.status(201).json({
        mensagem: "Serviço adicionado com sucesso",
        servico: {
          id: servico.id,
          professional_profile_id: profile.id,
          categoria,
          subcategoria,
          urgente,
          contato,
          localizacao,
          fotos,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async removerServico(req: Request, res: Response) {
    const user = req.user!;

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem remover serviços" });
    }

    const { id } = req.params;

    try {
      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId));

      if (!profile) {
        return res
          .status(404)
          .json({ erro: "Perfil profissional não encontrado" });
      }

      await db
        .delete(professionalServices)
        .where(
          and(
            eq(professionalServices.id, Number(id)),
            eq(professionalServices.professional_profile_id, profile.id),
          ),
        );

      res.json({ mensagem: "Serviço removido com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async listarServicosProfissional(req: Request, res: Response) {
    const user = req.user!;

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem listar seus serviços" });
    }

    try {
      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.userId));

      if (!profile) {
        return res
          .status(404)
          .json({ erro: "Perfil profissional não encontrado" });
      }

      const servicos = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.professional_profile_id, profile.id));

      res.json({ servicos });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }
}
