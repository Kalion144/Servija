import type { Request, Response } from "express";
import { db } from "../../db/connection.js";
import { users, professionalProfiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "seu-segredo-jwt";

export class ProfessionalAuthController {
  static async register(req: Request, res: Response) {
    const { nome, email, senha, foto } = req.body;

    try {
      console.log(
        "🔍 [ProfessionalAuth register] Verificando se usuário já existe com email:",
        email,
      );
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        console.log("❌ [ProfessionalAuth register] Email já cadastrado");
        return res.status(400).json({ erro: "Email já cadastrado" });
      }

      console.log("🔐 [ProfessionalAuth register] Gerando hash da senha...");
      const senha_hash = await bcrypt.hash(senha, 10);

      console.log(
        "💾 [ProfessionalAuth register] Inserindo usuário no banco...",
      );
      const result = await db
        .insert(users)
        .values({
          nome,
          email,
          senha_hash,
          tipo: "PROFISSIONAL",
          foto,
        })
        .returning({ id: users.id });

      const newUser = result[0];

      if (!newUser) {
        throw new Error("Falha ao criar usuário");
      }

      console.log("🔑 [ProfessionalAuth register] Gerando token JWT...");
      const token = jwt.sign(
        { userId: newUser.id, userType: "PROFISSIONAL" },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUser.id));

      const response = {
        mensagem: "Profissional cadastrado com sucesso",
        usuario: userData,
      };

      console.log(
        "✅ [ProfessionalAuth register] Resposta de registro:",
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
      console.error("❌ [ProfessionalAuth register] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    console.log(
      "📥 [ProfessionalAuth login] Recebendo solicitação de login profissional - Dados recebidos:",
      { email: email ? "enviado" : "não enviado" },
    );

    try {
      console.log(
        "🔍 [ProfessionalAuth login] Buscando profissional no banco com email:",
        email,
      );
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        console.log(
          "❌ [ProfessionalAuth login] Login falhou: Email não encontrado no banco de dados",
        );
        return res.status(401).json({ erro: "Email não encontrado" });
      }

      console.log("✅ [ProfessionalAuth login] Usuário encontrado no banco:", {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo,
      });

      if (user.tipo !== "PROFISSIONAL") {
        console.log(
          "❌ [ProfessionalAuth login] Login falhou: Tipo de usuário não é profissional",
        );
        return res
          .status(401)
          .json({ erro: "Acesso negado. Esta área é para profissionais." });
      }

      console.log("🔐 [ProfessionalAuth login] Verificando senha...");
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);

      if (!senhaValida) {
        console.log(
          "❌ [ProfessionalAuth login] Login falhou: Senha incorreta",
        );
        return res.status(401).json({ erro: "Senha incorreta" });
      }

      console.log("✅ [ProfessionalAuth login] Senha correta!");
      console.log("🔑 [ProfessionalAuth login] Gerando token JWT...");
      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.id));

      const response = {
        mensagem: "Login realizado com sucesso",
        usuario: {
          ...user,
          perfilProfissional: profile,
        },
      };

      console.log("✅ [ProfessionalAuth login] Login bem-sucedido!");
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.json(response);
    } catch (error) {
      console.error("❌ [ProfessionalAuth login] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId || !Number.isFinite(userId)) {
        console.warn(
          "⚠️ [ProfessionalAuth me] Usuário não autenticado ou userId inválido",
        );
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      console.log(
        "🔍 [ProfessionalAuth me] Buscando profissional com ID:",
        userId,
      );

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user || user.tipo !== "PROFISSIONAL") {
        console.warn("⚠️ [ProfessionalAuth me] Profissional não encontrado");
        return res.status(404).json({ erro: "Profissional não encontrado" });
      }

      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, user.id));

      console.log("✅ [ProfessionalAuth me] Profissional encontrado:", {
        id: user.id,
        nome: user.nome,
      });

      res.json({
        usuario: {
          ...user,
          perfilProfissional: profile,
        },
      });
    } catch (error) {
      console.error("❌ [ProfessionalAuth me] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
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
        console.warn(
          "⚠️ [ProfessionalAuth updateUser] Usuário não autenticado ou userId inválido",
        );
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      const [userCheck] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!userCheck || userCheck.tipo !== "PROFISSIONAL") {
        console.warn(
          "⚠️ [ProfessionalAuth updateUser] Profissional não encontrado",
        );
        return res.status(404).json({ erro: "Profissional não encontrado" });
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

      console.log(
        "🔍 [ProfessionalAuth updateUser] Atualizando profissional com ID:",
        userId,
        "dados:",
        updateData,
      );

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Profissional não encontrado");
      }

      const [profile] = await db
        .select()
        .from(professionalProfiles)
        .where(eq(professionalProfiles.user_id, updatedUser.id));

      console.log(
        "✅ [ProfessionalAuth updateUser] Profissional atualizado com sucesso",
      );
      res.json({
        mensagem: "Profissional atualizado com sucesso",
        usuario: {
          ...updatedUser,
          perfilProfissional: profile,
        },
      });
    } catch (error) {
      console.error("❌ [ProfessionalAuth updateUser] Erro completo:", {
        message: error instanceof Error ? error.message : "Erro desconhecido",
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
      const mensagemErro =
        error instanceof Error ? error.message : "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async logout(req: Request, res: Response) {
    console.log("📤 [ProfessionalAuth logout] Realizando logout...");
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ mensagem: "Logout realizado com sucesso" });
  }
}
