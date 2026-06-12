import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  professionalServices,
  proposalProfessionals,
  users,
  professionalProfiles,
  ratings,
} from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

export class ProposalClientController {
  static async listarPropostasRecebidas(req: Request, res: Response) {
    const user = req.user!;

    console.log(
      "📋 Listando propostas recebidas para cliente ID:",
      user.userId,
    );

    try {
      const propostas = await db
        .select({
          id: proposalProfessionals.id,
          service_id: proposalProfessionals.service_id,
          professional_id: proposalProfessionals.professional_id,
          mensagem: proposalProfessionals.mensagem,
          valor: proposalProfessionals.valor,
          negociavel: proposalProfessionals.negociavel,
          status: proposalProfessionals.status,
          created_at: proposalProfessionals.created_at,
          profissional: {
            id: users.id,
            nome: users.nome,
            foto: users.foto,
            bio: users.bio,
            profissao: professionalProfiles.profissao,
            experiencia: professionalProfiles.experiencia,
            localizacao: professionalProfiles.localizacao,
            habilidades: professionalProfiles.habilidades,
            media_estrelas: professionalProfiles.media_estrelas,
            total_avaliacoes: professionalProfiles.total_avaliacoes,
          },
          servico: professionalServices,
          avaliacao: ratings,
        })
        .from(proposalProfessionals)
        .innerJoin(
          professionalServices,
          eq(proposalProfessionals.service_id, professionalServices.id),
        )
        .innerJoin(users, eq(proposalProfessionals.professional_id, users.id))
        .leftJoin(
          professionalProfiles,
          eq(professionalProfiles.user_id, users.id),
        )
        .leftJoin(
          ratings,
          eq(ratings.proposal_professional_id, proposalProfessionals.id),
        )
        .where(eq(professionalServices.client_id, user.userId))
        .orderBy(desc(proposalProfessionals.created_at));

      // Process habilidades
      const processedPropostas = propostas.map((proposta) => ({
        ...proposta,
        profissional: {
          ...proposta.profissional,
          habilidades: proposta.profissional.habilidades
            ? typeof proposta.profissional.habilidades === "string"
              ? JSON.parse(proposta.profissional.habilidades)
              : proposta.profissional.habilidades
            : null,
        },
      }));

      console.log("✅", propostas.length, "propostas recebidas");
      res.json({ propostas: processedPropostas });
    } catch (error) {
      console.error("❌ Erro ao listar propostas recebidas:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async aceitarProposta(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    console.log("✅ Aceitando proposta de profissional ID:", id);

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .innerJoin(
          professionalServices,
          eq(proposalProfessionals.service_id, professionalServices.id),
        )
        .where(
          and(
            eq(proposalProfessionals.id, Number(id)),
            eq(professionalServices.client_id, user.userId),
          ),
        );

      if (!pp) {
        console.log("❌ Proposta não encontrada");
        return res.status(404).json({ erro: "Proposta não encontrada" });
      }

      await db
        .update(proposalProfessionals)
        .set({ status: "ACEITA" })
        .where(eq(proposalProfessionals.id, Number(id)));

      await db
        .update(professionalServices)
        .set({ status: "EM_ANDAMENTO" })
        .where(eq(professionalServices.id, pp.professional_services.id));

      console.log("✅ Proposta aceita com sucesso");
      res.json({ mensagem: "Proposta aceita com sucesso" });
    } catch (error) {
      console.error("❌ Erro ao aceitar proposta:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async recusarProposta(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    console.log("❌ Recusando proposta de profissional ID:", id);

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .innerJoin(
          professionalServices,
          eq(proposalProfessionals.service_id, professionalServices.id),
        )
        .where(
          and(
            eq(proposalProfessionals.id, Number(id)),
            eq(professionalServices.client_id, user.userId),
          ),
        );

      if (!pp) {
        console.log("❌ Proposta não encontrada");
        return res.status(404).json({ erro: "Proposta não encontrada" });
      }

      await db
        .update(proposalProfessionals)
        .set({ status: "RECUSADA" })
        .where(eq(proposalProfessionals.id, Number(id)));

      console.log("✅ Proposta recusada com sucesso");
      res.json({ mensagem: "Proposta recusada com sucesso" });
    } catch (error) {
      console.error("❌ Erro ao recusar proposta:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }
}
