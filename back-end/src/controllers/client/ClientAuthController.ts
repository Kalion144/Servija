import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET não definido no .env");

export class ClientAuthController {
  static async register(req: Request, res: Response) {
    const { nome, email, senha, foto } = req.body;

    try {
      console.log("🔍 Verificando se usuário já existe...");
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        console.log("❌ Email já cadastrado");
        return res.status(400).json({ erro: "Email já cadastrado" });
      }

      console.log("🔐 Gerando hash da senha...");
      const senha_hash = await bcrypt.hash(senha, 10);

      console.log("💾 Inserindo usuário no banco...");
      const result = await db
        .insert(users)
        .values({
          nome,
          email,
          senha_hash,
          tipo: "CLIENTE",
          foto,
        })
        .returning({ id: users.id });

      const newUser = result[0];

      if (!newUser) {
        throw new Error("Falha ao criar usuário");
      }

      console.log("🔑 Gerando token JWT...");
      const token = jwt.sign(
        { userId: newUser.id, userType: "CLIENTE" },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUser.id));

      const response = {
        mensagem: "Cliente cadastrado com sucesso",
        usuario: userData,
      };

      console.log(
        "✅ Resposta de registro:",
        JSON.stringify(response, null, 2),
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.status(201).json(response);
    } catch (error) {
      console.error("❌ Erro no registro:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    console.log("📥 Recebendo solicitação de login - Dados recebidos:", { email: email ? 'enviado' : 'não enviado' });

    try {
      console.log("🔍 Buscando cliente no banco com email:", email);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        console.log("❌ Login falhou: Email não encontrado no banco de dados");
        return res.status(401).json({ erro: "Email não encontrado" });
      }

      console.log("✅ Usuário encontrado no banco:", { id: user.id, nome: user.nome, tipo: user.tipo });

      if (user.tipo !== "CLIENTE") {
        console.log("❌ Login falhou: Tipo de usuário não é cliente");
        return res.status(401).json({ erro: "Acesso negado. Esta área é para clientes." });
      }

      console.log("🔐 Verificando senha...");
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);

      if (!senhaValida) {
        console.log("❌ Login falhou: Senha incorreta");
        return res.status(401).json({ erro: "Senha incorreta" });
      }

      console.log("✅ Senha correta!");
      console.log("🔑 Gerando token JWT...");
      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const response = {
        mensagem: "Login realizado com sucesso",
        usuario: user,
      };

      console.log("✅ Login bem-sucedido! Resposta:", JSON.stringify(response, null, 2));
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.json(response);
    } catch (error) {
      console.error("❌ Erro CRÍTICO no login:", error);
      if (error instanceof Error) {
        console.error("❌ Stack trace:", error.stack);
      }
      res.status(500).json({
        erro: "Erro interno do servidor",
        detalhes: error instanceof Error ? error.message : String(error),
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user || user.tipo !== "CLIENTE") {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      res.json({
        usuario: user,
      });
    } catch (error) {
      console.error("❌ Erro ao obter dados do cliente:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const userId = req.user?.userId;
    const {
      nome,
      email,
      foto,
      telefone,
      cpf,
      endereco,
      cidade,
      estado,
      dataNascimento,
      bio,
    } = req.body;

    try {
      if (!userId) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      const [userCheck] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!userCheck || userCheck.tipo !== "CLIENTE") {
        return res.status(404).json({ erro: "Cliente não encontrado" });
      }

      const updateData: any = {};
      if (nome) updateData.nome = nome;
      if (email) updateData.email = email;
      if (foto !== undefined) updateData.foto = foto;
      if (telefone) updateData.telefone = telefone;
      if (cpf) updateData.cpf = cpf;
      if (endereco) updateData.endereco = endereco;
      if (cidade) updateData.cidade = cidade;
      if (estado) updateData.estado = estado;
      if (dataNascimento) updateData.dataNascimento = dataNascimento;
      if (bio) updateData.bio = bio;

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Usuário não encontrado");
      }

      res.json({
        mensagem: "Cliente atualizado com sucesso",
        usuario: updatedUser,
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar cliente:", error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ mensagem: "Logout realizado com sucesso" });
  }
}
