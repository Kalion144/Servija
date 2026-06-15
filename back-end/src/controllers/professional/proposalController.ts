import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import {
  professionalServices,
  proposalProfessionals,
  users,
} from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

export class ProposalController {
  static async enviar(req: Request, res: Response) {
    const user = req.user!;
    const { servicoId, valor, mensagem, negociavel } = req.body;

    console.log("🔍 [enviar] Dados recebidos:", {
      servicoId,
      valor,
      mensagem,
      negociavel,
      user,
    });

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn("⚠️ [enviar] Usuário não autenticado ou userId inválido");
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (user.userType !== "PROFISSIONAL") {
      console.warn("⚠️ [enviar] Acesso negado - usuário não é profissional");
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem enviar propostas" });
    }

    if (!servicoId) {
      console.warn("⚠️ [enviar] servicoId não fornecido");
      return res.status(400).json({ erro: "ID do serviço é obrigatório" });
    }

    console.log("📤 [enviar] Enviando proposta para serviço ID:", servicoId);

    try {
      console.log("🔍 [enviar] Buscando serviço no banco...");
      const [servico] = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.id, Number(servicoId)));

      if (!servico) {
        console.warn("⚠️ [enviar] Serviço não encontrado no banco");
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      console.log("✅ [enviar] Serviço encontrado, inserindo proposta...");
      const [proposta] = await db
        .insert(proposalProfessionals)
        .values({
          service_id: Number(servicoId),
          professional_id: user.userId,
          mensagem,
          valor: valor ? Number(valor) : null,
          negociavel: negociavel ? 1 : 0,
          status: "PENDENTE",
        })
        .returning();

      console.log("✅ [enviar] Proposta enviada com sucesso, ID:", proposta.id);
      res.status(201).json({
        mensagem: "Proposta enviada com sucesso",
        proposta,
      });
    } catch (error) {
      console.error("❌ [enviar] Erro completo ao enviar proposta:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error
          ? `Erro ao enviar proposta: ${error.message}`
          : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async listarMinhas(req: Request, res: Response) {
    const user = req.user!;

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn(
        "⚠️ [listarMinhas] Usuário não autenticado ou userId inválido",
      );
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    console.log(
      "🔍 [listarMinhas] Iniciando listagem para profissional ID:",
      user.userId,
    );

    try {
      console.log("🔍 [listarMinhas] Consultando banco de dados...");
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
          servico: professionalServices,
          cliente: {
            id: users.id,
            nome: users.nome,
            foto: users.foto,
          },
        })
        .from(proposalProfessionals)
        .innerJoin(
          professionalServices,
          eq(proposalProfessionals.service_id, professionalServices.id),
        )
        .innerJoin(users, eq(professionalServices.client_id, users.id))
        .where(eq(proposalProfessionals.professional_id, user.userId))
        .orderBy(desc(proposalProfessionals.created_at));

      console.log(
        "✅ [listarMinhas]",
        propostas.length,
        "propostas encontradas",
      );
      res.json({ propostas });
    } catch (error) {
      console.error("❌ [listarMinhas] Erro completo ao listar propostas:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error
          ? `Erro ao listar propostas: ${error.message}`
          : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async aceitar(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn("⚠️ [aceitar] Usuário não autenticado ou userId inválido");
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    console.log("🔍 [aceitar] Dados recebidos:", { id, user });

    if (user.userType !== "PROFISSIONAL") {
      console.warn("⚠️ [aceitar] Acesso negado - usuário não é profissional");
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem aceitar propostas" });
    }

    if (!id) {
      console.warn("⚠️ [aceitar] ID da proposta não fornecido");
      return res.status(400).json({ erro: "ID da proposta é obrigatório" });
    }

    console.log("✅ [aceitar] Iniciando processo de aceitar proposta ID:", id);

    try {
      console.log("🔍 [aceitar] Buscando proposta no banco...");
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.id, Number(id)),
            eq(proposalProfessionals.professional_id, user.userId),
          ),
        );

      if (!pp) {
        console.warn("⚠️ [aceitar] Proposta não encontrada no banco");
        return res.status(404).json({ erro: "Registro não encontrado" });
      }

      console.log("🔍 [aceitar] Atualizando status da proposta para ACEITA...");
      await db
        .update(proposalProfessionals)
        .set({ status: "ACEITA" })
        .where(eq(proposalProfessionals.id, Number(id)));

      console.log(
        "🔍 [aceitar] Atualizando status do serviço para EM_ANDAMENTO...",
      );
      await db
        .update(professionalServices)
        .set({ status: "EM_ANDAMENTO" })
        .where(eq(professionalServices.id, pp.service_id));

      console.log("✅ [aceitar] Proposta aceita com sucesso!");
      res.json({ mensagem: "Proposta aceita com sucesso" });
    } catch (error) {
      console.error("❌ [aceitar] Erro completo ao aceitar proposta:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error
          ? `Erro ao aceitar proposta: ${error.message}`
          : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async recusar(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn("⚠️ [recusar] Usuário não autenticado ou userId inválido");
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    console.log("🔍 [recusar] Dados recebidos:", { id, user });

    if (user.userType !== "PROFISSIONAL") {
      console.warn("⚠️ [recusar] Acesso negado - usuário não é profissional");
      return res
        .status(403)
        .json({ erro: "Apenas profissionais podem recusar propostas" });
    }

    if (!id) {
      console.warn("⚠️ [recusar] ID da proposta não fornecido");
      return res.status(400).json({ erro: "ID da proposta é obrigatório" });
    }

    console.log("❌ [recusar] Iniciando processo de recusar proposta ID:", id);

    try {
      console.log("🔍 [recusar] Buscando proposta no banco...");
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.id, Number(id)),
            eq(proposalProfessionals.professional_id, user.userId),
          ),
        );

      if (!pp) {
        console.warn("⚠️ [recusar] Proposta não encontrada no banco");
        return res.status(404).json({ erro: "Registro não encontrado" });
      }

      console.log(
        "🔍 [recusar] Atualizando status da proposta para RECUSADA...",
      );
      await db
        .update(proposalProfessionals)
        .set({ status: "RECUSADA" })
        .where(eq(proposalProfessionals.id, Number(id)));

      console.log("✅ [recusar] Proposta recusada com sucesso!");
      res.json({ mensagem: "Proposta recusada com sucesso" });
    } catch (error) {
      console.error("❌ [recusar] Erro completo ao recusar proposta:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error
          ? `Erro ao recusar proposta: ${error.message}`
          : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async marcarConcluido(req: Request, res: Response) {
    const user = req.user!;
    const { proposalProfessionalId } = req.params;
    if (!proposalProfessionalId) {
      console.log(
        "🔍 [marcarConcluido] ID da proposta profissional não fornecido",
      );
    }

    // Validate user and userId
    if (!user || !Number.isFinite(user.userId)) {
      console.warn(
        "⚠️ [marcarConcluido] Usuário não autenticado ou userId inválido",
      );
      return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    console.log("🔍 [marcarConcluido] Dados recebidos:", {
      proposalProfessionalId,
      user,
    });

    if (user.userType !== "PROFISSIONAL") {
      console.warn(
        "⚠️ [marcarConcluido] Acesso negado - usuário não é profissional",
      );
      return res.status(403).json({
        erro: "Apenas profissionais podem marcar serviços como concluídos",
      });
    }

    if (!proposalProfessionalId) {
      console.warn("⚠️ [marcarConcluido] ID da proposta não fornecido");
      return res.status(400).json({ erro: "ID da proposta é obrigatório" });
    }

    console.log(
      "🏁 [marcarConcluido] Iniciando processo para marcar como concluído, proposal ID:",
      proposalProfessionalId,
    );

    try {
      console.log(
        "🔍 [marcarConcluido] Buscando proposta profissional no banco...",
      );
      const [pp] = await db
        .select()
        .from(proposalProfessionals)
        .where(
          and(
            eq(proposalProfessionals.id, Number(proposalProfessionalId)),
            eq(proposalProfessionals.professional_id, user.userId),
          ),
        );

      if (!pp) {
        console.warn(
          "⚠️ [marcarConcluido] Proposta profissional não encontrada",
        );
        return res.status(404).json({ erro: "Registro não encontrado" });
      }

      console.log(
        "🔍 [marcarConcluido] Atualizando proposta profissional para FINALIZADA...",
      );
      await db
        .update(proposalProfessionals)
        .set({ status: "FINALIZADA" })
        .where(eq(proposalProfessionals.id, Number(proposalProfessionalId)));

      console.log(
        "🔍 [marcarConcluido] Atualizando serviço para FINALIZADA...",
      );
      await db
        .update(professionalServices)
        .set({ status: "FINALIZADA" })
        .where(eq(professionalServices.id, pp.service_id));

      console.log(
        "📱 [marcarConcluido] [SIMULAÇÃO] Enviando WhatsApp para cliente para avaliar o serviço!",
      );
      console.log("✅ [marcarConcluido] Processo concluído com sucesso!");
      res.json({ mensagem: "Serviço marcado como concluído com sucesso" });
    } catch (error) {
      console.error(
        "❌ [marcarConcluido] Erro completo ao marcar serviço como concluído:",
        {
          message: error instanceof Error ? error.message : "Erro desconhecido",
          stack: error instanceof Error ? error.stack : undefined,
          error,
        },
      );
      const mensagemErro =
        error instanceof Error
          ? `Erro ao marcar serviço como concluído: ${error.message}`
          : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }
}
