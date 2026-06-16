import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  proposalProfessionals,
  conversations,
  professionalProfiles,
  ratings,
  subscriptions,
} from "../../db/schema.js";
import { eq, and, inArray, count, sum, sql } from "drizzle-orm";

export class MetricsController {
  static async obter(req: Request, res: Response) {
    const user = req.user!;
    const profId = user.userId;

    try {
      const [
        earningsResult,
        clientsResult,
        proposalStats,
        activeConvs,
        profile,
        recentRatings,
        monthlyEarnings,
        planResult,
      ] = await Promise.all([
        // Total ganho (proposals finalizadas/avaliadas)
        db
          .select({ total: sum(proposalProfessionals.valor) })
          .from(proposalProfessionals)
          .where(
            and(
              eq(proposalProfessionals.professional_id, profId),
              inArray(proposalProfessionals.status, ["FINALIZADA", "AVALIADA"]),
            ),
          ),

        // Clientes atendidos (distinct clients from concluded conversations)
        db
          .select({ total: sql<number>`COUNT(DISTINCT ${conversations.client_id})` })
          .from(conversations)
          .where(
            and(
              eq(conversations.professional_id, profId),
              inArray(conversations.status, ["CONCLUIDA", "CONTRATADA", "EM_ANDAMENTO"]),
            ),
          ),

        // Proposals: enviadas, aceitas, recusadas, pendentes
        db
          .select({
            status: proposalProfessionals.status,
            total: count(),
          })
          .from(proposalProfessionals)
          .where(eq(proposalProfessionals.professional_id, profId))
          .groupBy(proposalProfessionals.status),

        // Conversas ativas
        db
          .select({ total: count() })
          .from(conversations)
          .where(
            and(
              eq(conversations.professional_id, profId),
              inArray(conversations.status, ["ABERTA", "EM_NEGOCIACAO", "CONTRATADA", "EM_ANDAMENTO"]),
            ),
          ),

        // Perfil com médias de avaliação
        db
          .select({
            media_estrelas: professionalProfiles.media_estrelas,
            media_trabalho: professionalProfiles.media_trabalho,
            media_tempo_execucao: professionalProfiles.media_tempo_execucao,
            media_tempo_resposta: professionalProfiles.media_tempo_resposta,
            total_avaliacoes: professionalProfiles.total_avaliacoes,
          })
          .from(professionalProfiles)
          .where(eq(professionalProfiles.user_id, profId))
          .limit(1),

        // Últimas 5 avaliações
        db
          .select({
            estrelas: ratings.estrelas,
            comentario: ratings.comentario,
            created_at: ratings.created_at,
          })
          .from(ratings)
          .where(eq(ratings.professional_id, profId))
          .orderBy(sql`${ratings.created_at} DESC`)
          .limit(5),

        // Ganhos mensais (últimos 6 meses)
        db
          .select({
            mes: sql<string>`strftime('%Y-%m', ${proposalProfessionals.created_at}/1000, 'unixepoch')`,
            total: sum(proposalProfessionals.valor),
          })
          .from(proposalProfessionals)
          .where(
            and(
              eq(proposalProfessionals.professional_id, profId),
              inArray(proposalProfessionals.status, ["FINALIZADA", "AVALIADA"]),
              sql`${proposalProfessionals.created_at} >= ${Date.now() - 180 * 24 * 60 * 60 * 1000}`,
            ),
          )
          .groupBy(sql`strftime('%Y-%m', ${proposalProfessionals.created_at}/1000, 'unixepoch')`)
          .orderBy(sql`strftime('%Y-%m', ${proposalProfessionals.created_at}/1000, 'unixepoch')`),

        // Plano atual
        db
          .select({ plan: subscriptions.plan, status: subscriptions.status })
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.user_id, profId),
              eq(subscriptions.user_type, "PROFISSIONAL"),
            ),
          )
          .limit(1),
      ]);

      const totalGanho = Number(earningsResult[0]?.total ?? 0);
      const clientesAtendidos = Number(clientsResult[0]?.total ?? 0);
      const conversasAtivas = Number(activeConvs[0]?.total ?? 0);
      const perfil = profile[0] ?? null;
      const plan = planResult[0]?.plan ?? "FREE";

      // Aggregate proposal stats
      const proposalMap: Record<string, number> = {};
      for (const row of proposalStats) {
        proposalMap[row.status] = Number(row.total);
      }
      const totalPropostas = Object.values(proposalMap).reduce((a, b) => a + b, 0);
      const propostsAceitas =
        (proposalMap["ACEITA"] ?? 0) +
        (proposalMap["EM_ANDAMENTO"] ?? 0) +
        (proposalMap["FINALIZADA"] ?? 0) +
        (proposalMap["AVALIADA"] ?? 0);
      const taxaAceitacao =
        totalPropostas > 0 ? Math.round((propostsAceitas / totalPropostas) * 100) : 0;

      res.json({
        totalGanho,
        clientesAtendidos,
        conversasAtivas,
        totalPropostas,
        propostsAceitas,
        taxaAceitacao,
        plan,
        avaliacoes: {
          media: perfil?.media_estrelas ?? 0,
          mediaTrabalho: perfil?.media_trabalho ?? 0,
          mediaTempoExecucao: perfil?.media_tempo_execucao ?? 0,
          mediaTempoResposta: perfil?.media_tempo_resposta ?? 0,
          total: perfil?.total_avaliacoes ?? 0,
        },
        ganhosMessais: monthlyEarnings.map((r) => ({
          mes: r.mes,
          total: Number(r.total ?? 0),
        })),
        ultimasAvaliacoes: recentRatings,
      });
    } catch (error) {
      console.error("Metrics error:", error);
      res.status(500).json({ erro: "Erro ao carregar métricas" });
    }
  }
}
