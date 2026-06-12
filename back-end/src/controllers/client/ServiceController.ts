import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import { professionalServices, users } from "../../db/schema.js";
import { eq, and, desc, count, or, like, type SQL } from "drizzle-orm";

export class ServiceController {
  static async criar(req: Request, res: Response) {
    const user = req.user!;

    console.log("📝 Criando serviço para cliente ID:", user.userId);

    if (user.userType !== "CLIENTE") {
      return res
        .status(403)
        .json({ erro: "Apenas clientes podem criar serviços" });
    }

    const {
      titulo,
      descricao,
      categoria,
      preco,
      urgente,
      contato,
      localizacao,
      fotos,
    } = req.body;

    try {
      // Check max 3 pending services per client
      const [countResult] = await db
        .select({ count: count() })
        .from(professionalServices)
        .where(
          and(
            eq(professionalServices.client_id, user.userId),
            eq(professionalServices.status, "PENDENTE"),
          ),
        );

      if (countResult.count >= 3) {
        return res.status(400).json({
          erro: "Limite de 3 serviços abertos atingido. Finalize ou cancele um serviço para criar outro.",
        });
      }

      const [servico] = await db
        .insert(professionalServices)
        .values({
          client_id: user.userId,
          titulo,
          descricao,
          categoria,
          preco: preco ? Number(preco) : null,
          urgente: urgente ? 1 : 0,
          contato,
          localizacao,
          fotos: fotos ? JSON.stringify(fotos) : null,
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

      console.log("✅", servicos.length, "serviço(s) encontrado(s)");
      res.json({ servicos });
    } catch (error) {
      console.error("❌ Erro ao listar serviços:", error);
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
