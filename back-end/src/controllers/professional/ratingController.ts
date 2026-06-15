import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  ratings,
  proposalProfessionals,
  users,
} from "../../db/schema.js";
import { eq, and, avg, count } from "drizzle-orm";

export class ProfessionalRatingController {
  static async criar(req: Request, res: Response) {
    const user = req.user!;

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem avaliar clientes" });
    }

    const {
      proposal_professional_id,
      estrelas_trabalho,
      estrelas_tempo_execucao,
      estrelas_tempo_resposta,
      comentario,
    } = req.body;

    const estrelas = Math.round(
      (estrelas_trabalho + estrelas_tempo_execucao + estrelas_tempo_resposta) / 3
    );

    try {
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(eq(proposalProfessionals.id, proposal_professional_id));

      if (!pp) {
        return res
          .status(404)
          .json({ erro: "Registro de proposta não encontrado" });
      }

      if (pp.status !== "FINALIZADA" && pp.status !== "AVALIADA") {
        return res
          .status(400)
          .json({ erro: "Só pode avaliar serviços finalizados" });
      }

      const existingRating = await db
        .select()
        .from(ratings)
        .where(
          and(
            eq(ratings.proposal_professional_id, proposal_professional_id),
            eq(ratings.avaliador_tipo, "PROFISSIONAL")
          )
        );

      if (existingRating.length > 0) {
        return res
          .status(400)
          .json({ erro: "Você já avaliou o cliente para este serviço" });
      }

      // Precisamos encontrar o client_id através da tabela professionalServices
      const clientQuery = await db.query.proposalProfessionals.findFirst({
        where: eq(proposalProfessionals.id, proposal_professional_id),
        with: {
          service: true,
        },
      });

      if (!clientQuery || !clientQuery.service) {
        return res
          .status(404)
          .json({ erro: "Serviço original não encontrado" });
      }

      const client_id = clientQuery.service.client_id;

      const [avaliacao] = await db
        .insert(ratings)
        .values({
          proposal_professional_id,
          client_id: client_id,
          professional_id: user.userId,
          avaliador_tipo: "PROFISSIONAL",
          estrelas,
          estrelas_trabalho,
          estrelas_tempo_execucao,
          estrelas_tempo_resposta,
          comentario,
        })
        .returning({ id: ratings.id });

      const stats = await db
        .select({
          media: avg(ratings.estrelas),
          media_trabalho: avg(ratings.estrelas_trabalho),
          media_tempo_execucao: avg(ratings.estrelas_tempo_execucao),
          media_tempo_resposta: avg(ratings.estrelas_tempo_resposta),
          total: count(ratings.id),
        })
        .from(ratings)
        .where(
          and(
            eq(ratings.client_id, client_id),
            eq(ratings.avaliador_tipo, "PROFISSIONAL")
          )
        );

      const [stat] = stats;
      if (stat) {
        await db
          .update(users)
          .set({
            media_estrelas: Number(stat.media) || 0,
            media_trabalho: Number(stat.media_trabalho) || 0,
            media_tempo_execucao: Number(stat.media_tempo_execucao) || 0,
            media_tempo_resposta: Number(stat.media_tempo_resposta) || 0,
            total_avaliacoes: Number(stat.total),
          })
          .where(eq(users.id, client_id));
      }

      res.status(201).json({
        mensagem: "Avaliação do cliente criada com sucesso",
        avaliacao: {
          id: avaliacao?.id,
          proposal_professional_id,
          client_id,
          professional_id: user.userId,
          estrelas,
          estrelas_trabalho,
          estrelas_tempo_execucao,
          estrelas_tempo_resposta,
          comentario,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }
}
