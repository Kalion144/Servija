import type { Request, Response } from "express";
import { db } from "../db/connection.js";
import { users, professionalProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-jwt";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { nome, email, senha, tipo, foto } = req.body;

    try {
      console.log("🔍 [register] Verificando se usuário já existe com email:", email);
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        console.log("❌ [register] Email já cadastrado");
        return res.status(400).json({ erro: "Email já cadastrado" });
      }

      console.log("🔐 [register] Gerando hash da senha...");
      const senha_hash = await bcrypt.hash(senha, 10);

      console.log("💾 [register] Inserindo usuário no banco...");
      const result = await db
        .insert(users)
        .values({
          nome,
          email,
          senha_hash,
          tipo,
          foto,
        })
        .returning({ id: users.id });

      const newUser = result[0];

      if (!newUser) {
        throw new Error("Falha ao criar usuário");
      }

      console.log("🔑 [register] Gerando token JWT...");
      const token = jwt.sign(
        { userId: newUser.id, userType: tipo },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUser.id));

      const response = {
        mensagem: "Usuário cadastrado com sucesso",
        usuario: userData,
      };

      console.log("✅ [register] Resposta de registro:", JSON.stringify(response, null, 2));
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.status(201).json(response);
    } catch (error) {
      console.error("❌ [register] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro = error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    console.log("📥 [login] Recebendo solicitação de login - Dados recebidos:", { email: email ? "enviado" : "não enviado" });

    try {
      console.log("🔍 [login] Buscando usuário no banco com email:", email);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        console.log("❌ [login] Login falhou: Email não encontrado no banco de dados");
        return res.status(401).json({ erro: "Email não encontrado" });
      }

      console.log("✅ [login] Usuário encontrado no banco:", { id: user.id, nome: user.nome, tipo: user.tipo });

      console.log("🔐 [login] Verificando senha...");
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);

      if (!senhaValida) {
        console.log("❌ [login] Login falhou: Senha incorreta");
        return res.status(401).json({ erro: "Senha incorreta" });
      }

      console.log("✅ [login] Senha correta!");
      console.log("🔑 [login] Gerando token JWT...");
      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const [profile] =
        user.tipo === "PROFISSIONAL"
          ? await db
              .select()
              .from(professionalProfiles)
              .where(eq(professionalProfiles.user_id, user.id))
          : [null];

      const response = {
        mensagem: "Login realizado com sucesso",
        usuario: {
          ...user,
          perfilProfissional: profile,
        },
      };

      console.log("✅ [login] Login bem-sucedido!");
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.json(response);
    } catch (error) {
      console.error("❌ [login] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro = error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId || !Number.isFinite(userId)) {
        console.warn("⚠️ [me] Usuário não autenticado ou userId inválido");
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      console.log("🔍 [me] Buscando usuário com ID:", userId);

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        console.warn("⚠️ [me] Usuário não encontrado");
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      const [profile] =
        user.tipo === "PROFISSIONAL"
          ? await db
              .select()
              .from(professionalProfiles)
              .where(eq(professionalProfiles.user_id, user.id))
          : [null];

      console.log("✅ [me] Usuário encontrado:", { id: user.id, nome: user.nome });

      res.json({
        usuario: {
          ...user,
          perfilProfissional: profile,
        },
      });
    } catch (error) {
      console.error("❌ [me] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro = error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
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
      if (!userId || !Number.isFinite(userId)) {
        console.warn("⚠️ [updateUser] Usuário não autenticado ou userId inválido");
        return res.status(401).json({ erro: "Usuário não autenticado" });
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

      console.log("🔍 [updateUser] Atualizando usuário com ID:", userId, "dados:", updateData);

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Usuário não encontrado");
      }

      console.log("✅ [updateUser] Usuário atualizado com sucesso");
      res.json({
        mensagem: "Usuário atualizado com sucesso",
        usuario: updatedUser,
      });
    } catch (error) {
      console.error("❌ [updateUser] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro = error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async logout(req: Request, res: Response) {
    console.log("📤 [logout] Realizando logout...");
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ mensagem: "Logout realizado com sucesso" });
  }
}
