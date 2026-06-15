import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import { professionalServices, users } from "../../db/schema.js";
import { eq, and, desc, or, like, type SQL } from "drizzle-orm";
import {
  getClientLimits,
  getClientOpenServicesCount,
} from "../../services/subscriptionService.js";

export class ServiceController {
  static async criar(req: Request, res: Response) {
    const user = req.user!;

    console.log("📝 Criando serviço para cliente ID:", user.userId);

    if (user.userType !== "CLIENTE") {
      return res
        .status(403)
        .json({ erro: "Apenas clientes podem criar serviços" });
    }

    const body = req.body;
    const {
      titulo,
      descricao,
      categoria,
      subcategoria,
      objetivo,
      preco,
      valor_minimo,
      valor_maximo,
      orcamento_definido,
      aceita_propostas,
      urgente,
      urgencia_nivel,
      data_inicio_desejada,
      data_limite,
      tipo_atendimento,
      contato,
      nome_contratante,
      telefone,
      whatsapp,
      email_contato,
      localizacao,
      endereco,
      cidade,
      estado,
      cep,
      referencia_local,
      fotos,
      anexos,
      detalhes,
    } = body;

    try {
      const limits = await getClientLimits(user.userId);

      if (!limits.canCreateMore) {
        const max = limits.maxOpenServices;
        return res.status(400).json({
          erro: `Limite de ${max} serviços abertos atingido (plano ${limits.plan}). Finalize um serviço ou faça upgrade do plano.`,
          plan: limits.plan,
          maxOpenServices: max,
          currentOpenServices: limits.currentOpenServices,
        });
      }

      const localizacaoFinal =
        localizacao ||
        (cidade && estado ? `${cidade} - ${estado}` : cidade || endereco);

      const [servico] = await db
        .insert(professionalServices)
        .values({
          client_id: user.userId,
          titulo,
          descricao,
          categoria,
          subcategoria,
          objetivo,
          preco: preco ? Number(preco) : null,
          valor_minimo: valor_minimo ? Number(valor_minimo) : null,
          valor_maximo: valor_maximo ? Number(valor_maximo) : null,
          orcamento_definido: orcamento_definido ? 1 : 0,
          aceita_propostas: aceita_propostas === false ? 0 : 1,
          urgente: (urgente || urgencia_nivel === "24h") ? 1 : 0,
          urgencia_nivel,
          data_inicio_desejada,
          data_limite,
          tipo_atendimento,
          contato: contato || telefone || whatsapp,
          nome_contratante,
          telefone,
          whatsapp,
          email_contato,
          localizacao: localizacaoFinal,
          endereco,
          cidade,
          estado,
          cep,
          referencia_local,
          fotos: fotos ? JSON.stringify(fotos) : null,
          anexos: anexos ? JSON.stringify(anexos) : null,
          detalhes: detalhes ? JSON.stringify(detalhes) : null,
          status_solicitacao: "AGUARDANDO_PROPOSTAS",
          status: "PENDENTE",
        })
        .returning();

      console.log("✅ Serviço criado com sucesso! ID:", servico.id);

      res.status(201).json({
        mensagem: "Serviço criado com sucesso",
        servico,
      });
    } catch (error) {
      console.error("❌ Erro ao criar serviço:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async listarMeus(req: Request, res: Response) {
    const user = req.user!;
    const { cidade, busca } = req.query;

    console.log("📋 Listando serviços do cliente ID:", user.userId);

    try {
      const conditions: SQL[] = [
        eq(professionalServices.client_id, user.userId),
      ];

      if (cidade && typeof cidade === "string" && cidade.trim()) {
        const term = `%${cidade.trim()}%`;
        conditions.push(like(professionalServices.localizacao, term));
      }

      if (busca && typeof busca === "string" && busca.trim()) {
        const term = `%${busca.trim()}%`;
        conditions.push(
          or(
            like(professionalServices.titulo, term),
            like(professionalServices.descricao, term),
            like(professionalServices.localizacao, term),
            like(professionalServices.categoria, term),
          )!,
        );
      }

      const servicos = await db
        .select()
        .from(professionalServices)
        .where(and(...conditions))
        .orderBy(desc(professionalServices.created_at));

      const limits = await getClientLimits(user.userId);
      const pendingCount = await getClientOpenServicesCount(user.userId);

      console.log("✅", servicos.length, "serviço(s) encontrado(s)");
      res.json({
        servicos,
        subscription: {
          plan: limits.plan,
          maxOpenServices: limits.maxOpenServices,
          currentOpenServices: pendingCount,
          canCreateMore: limits.canCreateMore,
        },
      });
    } catch (error) {
      console.error("❌ Erro ao listar serviços:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async obterPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const [servico] = await db
        .select({
          servico: professionalServices,
          cliente_nome: users.nome,
          cliente_foto: users.foto,
          cliente_cidade: users.cidade,
        })
        .from(professionalServices)
        .innerJoin(users, eq(professionalServices.client_id, users.id))
        .where(eq(professionalServices.id, Number(id)));

      if (!servico) {
        return res.status(404).json({ erro: "Serviço não encontrado" });
      }

      res.json({
        ...servico.servico,
        cliente_nome: servico.cliente_nome,
        cliente_foto: servico.cliente_foto,
        cliente_cidade: servico.cliente_cidade,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async listarTodos(req: Request, res: Response) {
    const user = req.user!;
    const { cidade, busca } = req.query;

    console.log("🔍 Listando todos os serviços pendentes...");

    try {
      const conditions: SQL[] = [
        eq(professionalServices.status, "PENDENTE"),
      ];

      if (cidade && typeof cidade === "string" && cidade.trim()) {
        const term = `%${cidade.trim()}%`;
        conditions.push(
          or(
            like(professionalServices.localizacao, term),
            like(users.cidade, term),
          )!,
        );
      }

      if (busca && typeof busca === "string" && busca.trim()) {
        const term = `%${busca.trim()}%`;
        conditions.push(
          or(
            like(professionalServices.titulo, term),
            like(professionalServices.descricao, term),
            like(professionalServices.localizacao, term),
            like(professionalServices.categoria, term),
            like(users.nome, term),
            like(users.cidade, term),
          )!,
        );
      }

      const servicosComClientes = await db
        .select({
          id: professionalServices.id,
          titulo: professionalServices.titulo,
          descricao: professionalServices.descricao,
          categoria: professionalServices.categoria,
          preco: professionalServices.preco,
          urgente: professionalServices.urgente,
          contato: professionalServices.contato,
          localizacao: professionalServices.localizacao,
          fotos: professionalServices.fotos,
          status: professionalServices.status,
          created_at: professionalServices.created_at,
          cliente_id: users.id,
          cliente_nome: users.nome,
          cliente_foto: users.foto,
          cliente_cidade: users.cidade,
          cliente_estado: users.estado,
        })
        .from(professionalServices)
        .innerJoin(users, eq(professionalServices.client_id, users.id))
        .where(and(...conditions))
        .orderBy(desc(professionalServices.created_at));

      console.log(
        "✅",
        servicosComClientes.length,
        "serviço(s) pendente(s) encontrado(s)",
      );
      res.json({ servicos: servicosComClientes });
    } catch (error) {
      console.error("❌ Erro ao listar serviços:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }
}
