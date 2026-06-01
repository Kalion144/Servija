import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import { professionalServices, users } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export class ServiceController {
  static async criar(req: Request, res: Response) {
    const user = req.user!;

    console.log("📝 Criando serviço para cliente ID:", user.userId);

    if (user.userType !== "CLIENTE") {
      return res
        .status(403)
        .json({ erro: "Apenas clientes podem criar serviços" });
    }

    const { titulo, descricao, valor, prazo } = req.body;

    try {
      console.log("💾 Inserindo serviço no banco (tabela professionalServices)...");
      const [servico] = await db
        .insert(professionalServices)
        .values({
          client_id: user.userId,
          titulo,
          descricao,
          valor: valor ? Number(valor) : null,
          prazo,
          status: "PENDENTE",
        })
        .returning({ id: professionalServices.id });

      console.log("✅ Serviço criado com sucesso! ID:", servico.id);

      res.status(201).json({
        mensagem: "Serviço criado com sucesso",
        servico: {
          id: servico.id,
          client_id: user.userId,
          titulo,
          descricao,
          valor,
          prazo,
          status: "PENDENTE",
        },
      });
    } catch (error) {
      console.error("❌ Erro ao criar serviço:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async listarMeus(req: Request, res: Response) {
    const user = req.user!;

    console.log("📋 Listando serviços do cliente ID:", user.userId);

    try {
      const servicos = await db
        .select()
        .from(professionalServices)
        .where(eq(professionalServices.client_id, user.userId))
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

    console.log("🔍 Listando todos os serviços pendentes...");

    try {
      const servicosComClientes = await db
        .select({
          id: professionalServices.id,
          titulo: professionalServices.titulo,
          descricao: professionalServices.descricao,
          valor: professionalServices.valor,
          prazo: professionalServices.prazo,
          status: professionalServices.status,
          created_at: professionalServices.created_at,
          cliente_id: users.id,
          cliente_nome: users.nome,
          cliente_foto: users.foto,
        })
        .from(professionalServices)
        .innerJoin(users, eq(professionalServices.client_id, users.id))
        .where(eq(professionalServices.status, "PENDENTE"))
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
