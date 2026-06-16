import type { Request, Response } from "express";
import { db } from "../db/connection.js";
import {
  conversations,
  messages,
  professionalServices,
  proposalProfessionals,
  users,
} from "../db/schema.js";
import { eq, and, desc, or } from "drizzle-orm";
import { getProfessionalLimits, getUserPlan } from "../services/subscriptionService.js";

export class ConversationController {
  static async iniciar(req: Request, res: Response) {
    const user = req.user!;
    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({ erro: "ID do serviço é obrigatório" });
    }

    if (user.userType !== "PROFISSIONAL") {
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem iniciar conversas" });
    }

    try {
      const [servico] = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.id, Number(service_id)));

      if (!servico) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      if (servico.status !== "PENDENTE") {
        return res.status(400).json({ erro: "Este serviço não está aberto" });
      }

      const [profLimits, clientPlan] = await Promise.all([
        getProfessionalLimits(user.userId),
        getUserPlan(servico.client_id, "CLIENTE"),
      ]);

      // Gate: serviços de clientes PREMIUM só podem ser contactados por profissionais PREMIUM
      if (clientPlan === "PREMIUM" && profLimits.plan !== "PREMIUM") {
        return res.status(403).json({
          erro: "Este serviço é exclusivo para profissionais com plano Premium. Faça upgrade para contactar clientes premium.",
          clientPlan,
          professionalPlan: profLimits.plan,
          requiresUpgrade: true,
        });
      }

      const [existing] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.service_id, Number(service_id)),
            eq(conversations.professional_id, user.userId),
          ),
        );

      if (existing) {
        return res.json({ conversa: existing, criada: false });
      }

      if (!profLimits.canContactMore) {
        return res.status(400).json({
          erro: `Limite diário de ${profLimits.maxDailyContacts} contatos atingido (plano ${profLimits.plan}). Faça upgrade para continuar.`,
          plan: profLimits.plan,
          maxDailyContacts: profLimits.maxDailyContacts,
          currentDailyContacts: profLimits.currentDailyContacts,
        });
      }

      const [conversa] = await db
        .insert(conversations)
        .values({
          service_id: Number(service_id),
          client_id: servico.client_id,
          professional_id: user.userId,
          status: "ABERTA",
        })
        .returning();

      await db.insert(messages).values({
        conversation_id: conversa.id,
        sender_id: user.userId,
        tipo: "sistema",
        conteudo: "Conversa iniciada. Negocie os detalhes do serviço aqui.",
      });

      res.status(201).json({ conversa, criada: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao iniciar conversa" });
    }
  }

  static async listar(req: Request, res: Response) {
    const user = req.user!;

    try {
      const condition =
        user.userType === "CLIENTE"
          ? eq(conversations.client_id, user.userId)
          : eq(conversations.professional_id, user.userId);

      const lista = await db
        .select({
          id: conversations.id,
          service_id: conversations.service_id,
          client_id: conversations.client_id,
          professional_id: conversations.professional_id,
          status: conversations.status,
          created_at: conversations.created_at,
          updated_at: conversations.updated_at,
          servico_titulo: professionalServices.titulo,
          servico_categoria: professionalServices.categoria,
          servico_status: professionalServices.status,
          outro_nome: users.nome,
          outro_foto: users.foto,
        })
        .from(conversations)
        .innerJoin(
          professionalServices,
          eq(conversations.service_id, professionalServices.id),
        )
        .innerJoin(
          users,
          user.userType === "CLIENTE"
            ? eq(conversations.professional_id, users.id)
            : eq(conversations.client_id, users.id),
        )
        .where(condition)
        .orderBy(desc(conversations.updated_at));

      res.json({ conversas: lista });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao listar conversas" });
    }
  }

  static async obter(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    try {
      const [conversa] = await db
        .select({
          id: conversations.id,
          service_id: conversations.service_id,
          client_id: conversations.client_id,
          professional_id: conversations.professional_id,
          status: conversations.status,
          created_at: conversations.created_at,
          updated_at: conversations.updated_at,
          servico: professionalServices,
        })
        .from(conversations)
        .innerJoin(
          professionalServices,
          eq(conversations.service_id, professionalServices.id),
        )
        .where(eq(conversations.id, Number(id)));

      if (!conversa) {
        return res.status(404).json({ erro: "Conversa não encontrada" });
      }

      const isParticipant =
        conversa.client_id === user.userId ||
        conversa.professional_id === user.userId;

      if (!isParticipant) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      const msgs = await db
        .select({
          id: messages.id,
          conversation_id: messages.conversation_id,
          sender_id: messages.sender_id,
          tipo: messages.tipo,
          conteudo: messages.conteudo,
          metadata: messages.metadata,
          lida: messages.lida,
          created_at: messages.created_at,
          sender_nome: users.nome,
        })
        .from(messages)
        .innerJoin(users, eq(messages.sender_id, users.id))
        .where(eq(messages.conversation_id, Number(id)))
        .orderBy(messages.created_at);

      const parsedMessages = msgs.map((m) => ({
        ...m,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
      }));

      res.json({ conversa, mensagens: parsedMessages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao obter conversa" });
    }
  }

  static async enviarMensagem(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const { conteudo, tipo = "texto", metadata } = req.body;

    if (!conteudo?.trim()) {
      return res.status(400).json({ erro: "Mensagem vazia" });
    }

    try {
      const [conversa] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, Number(id)));

      if (!conversa) {
        return res.status(404).json({ erro: "Conversa não encontrada" });
      }

      const isParticipant =
        conversa.client_id === user.userId ||
        conversa.professional_id === user.userId;

      if (!isParticipant) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      if (["CONCLUIDA", "CANCELADA"].includes(conversa.status)) {
        return res.status(400).json({ erro: "Conversa encerrada" });
      }

      const msgTipo = tipo === "oferta" ? "oferta" : tipo === "imagem" ? "imagem" : "texto";

      if (msgTipo === "oferta" && user.userType !== "PROFISSIONAL") {
        return res.status(403).json({ erro: "Apenas profissionais enviam ofertas" });
      }

      const [mensagem] = await db
        .insert(messages)
        .values({
          conversation_id: Number(id),
          sender_id: user.userId,
          tipo: msgTipo,
          conteudo: conteudo.trim(),
          metadata: metadata ? JSON.stringify(metadata) : null,
        })
        .returning();

      const newStatus =
        msgTipo === "oferta" ? "EM_NEGOCIACAO" : conversa.status === "ABERTA" ? "EM_NEGOCIACAO" : conversa.status;

      await db
        .update(conversations)
        .set({ status: newStatus, updated_at: new Date() })
        .where(eq(conversations.id, Number(id)));

      res.status(201).json({
        mensagem: {
          ...mensagem,
          metadata: mensagem.metadata ? JSON.parse(mensagem.metadata) : null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao enviar mensagem" });
    }
  }

  static async contratar(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    if (user.userType !== "CLIENTE") {
      return res.status(403).json({ erro: "Apenas o cliente pode contratar" });
    }

    try {
      const [conversa] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, Number(id)),
            eq(conversations.client_id, user.userId),
          ),
        );

      if (!conversa) {
        return res.status(404).json({ erro: "Conversa não encontrada" });
      }

      const ofertas = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversation_id, Number(id)),
            eq(messages.tipo, "oferta"),
          ),
        )
        .orderBy(desc(messages.created_at));

      const ultimaOferta = ofertas[0];
      const meta = ultimaOferta?.metadata
        ? JSON.parse(ultimaOferta.metadata)
        : {};

      await db
        .update(conversations)
        .set({ status: "CONTRATADA", updated_at: new Date() })
        .where(eq(conversations.id, Number(id)));

      await db
        .update(professionalServices)
        .set({ status: "EM_ANDAMENTO", status_solicitacao: "PROFISSIONAL_CONTRATADO" })
        .where(eq(professionalServices.id, conversa.service_id));

      const [existingProposal] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.service_id, conversa.service_id),
            eq(proposalProfessionals.professional_id, conversa.professional_id),
          ),
        );

      let proposalId: number;
      if (existingProposal) {
        await db
          .update(proposalProfessionals)
          .set({ status: "ACEITA", valor: meta.valor ?? existingProposal.valor })
          .where(eq(proposalProfessionals.id, existingProposal.id));
        proposalId = existingProposal.id;
      } else {
        const [prop] = await db
          .insert(proposalProfessionals)
          .values({
            service_id: conversa.service_id,
            professional_id: conversa.professional_id,
            mensagem: ultimaOferta?.conteudo || "Contratado via chat",
            valor: meta.valor ?? null,
            negociavel: meta.negociavel ? 1 : 0,
            status: "ACEITA",
          })
          .returning();
        proposalId = prop.id;
      }

      await db.insert(messages).values({
        conversation_id: Number(id),
        sender_id: user.userId,
        tipo: "sistema",
        conteudo: "✅ Profissional contratado! O serviço está em andamento.",
      });

      await db
        .update(conversations)
        .set({ status: "EM_ANDAMENTO", updated_at: new Date() })
        .where(eq(conversations.id, Number(id)));

      res.json({ mensagem: "Profissional contratado", proposal_id: proposalId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao contratar profissional" });
    }
  }

  static async concluir(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    try {
      const [conversa] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, Number(id)));

      if (!conversa) {
        return res.status(404).json({ erro: "Conversa não encontrada" });
      }

      const canComplete =
        (user.userType === "PROFISSIONAL" &&
          conversa.professional_id === user.userId) ||
        (user.userType === "CLIENTE" && conversa.client_id === user.userId);

      if (!canComplete) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      if (!["CONTRATADA", "EM_ANDAMENTO"].includes(conversa.status)) {
        return res.status(400).json({ erro: "Serviço não está em andamento" });
      }

      await db
        .update(conversations)
        .set({ status: "CONCLUIDA", updated_at: new Date() })
        .where(eq(conversations.id, Number(id)));

      await db
        .update(professionalServices)
        .set({ status: "FINALIZADA", status_solicitacao: "CONCLUIDA" })
        .where(eq(professionalServices.id, conversa.service_id));

      await db
        .update(proposalProfessionals)
        .set({ status: "FINALIZADA" })
        .where(
          and(
            eq(proposalProfessionals.service_id, conversa.service_id),
            eq(proposalProfessionals.professional_id, conversa.professional_id),
          ),
        );

      await db.insert(messages).values({
        conversation_id: Number(id),
        sender_id: user.userId,
        tipo: "sistema",
        conteudo: "🏁 Serviço marcado como concluído.",
      });

      res.json({ mensagem: "Serviço concluído" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao concluir serviço" });
    }
  }

  static async porServico(req: Request, res: Response) {
    const user = req.user!;
    const { serviceId } = req.params;

    try {
      const [servico] = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.id, Number(serviceId)));

      if (!servico) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      const isOwner =
        user.userType === "CLIENTE" && servico.client_id === user.userId;

      const condition = isOwner
        ? eq(conversations.service_id, Number(serviceId))
        : and(
            eq(conversations.service_id, Number(serviceId)),
            eq(conversations.professional_id, user.userId),
          );

      const [conversa] = await db
        .select()
        .from(conversations)
        .where(condition);

      res.json({ conversa: conversa || null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro ao buscar conversa" });
    }
  }
}
