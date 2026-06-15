import type { Request, Response } from "express";
import { db } from "../db/connection.js";
import { users, professionalProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import logger from "../config/logger.js";

const JWT_SECRET = env.JWT_SECRET;

async function checkCompleteness(user: any) {
  const missingFields: string[] = [];
  if (!user.foto) missingFields.push("foto");
  if (!user.telefone) missingFields.push("telefone");
  if (!user.cpf) missingFields.push("cpf");
  if (!user.cidade) missingFields.push("cidade");
  if (!user.estado) missingFields.push("estado");

  let profile = null;
  if (user.tipo === "PROFISSIONAL") {
    const [profProfile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.user_id, user.id));

    profile = profProfile || null;
    if (!profProfile) {
      missingFields.push("profissao", "experiencia", "habilidades");
    } else {
      if (!profProfile.profissao) missingFields.push("profissao");
      if (!profProfile.experiencia) missingFields.push("experiencia");
      if (!profProfile.habilidades) missingFields.push("habilidades");
    }
  } else if (user.tipo === "CLIENTE") {
    const { clientProfiles } = await import("../db/schema.js");
    const [cliProfile] = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.user_id, user.id));

    profile = cliProfile || null;
    if (!cliProfile) {
      missingFields.push("tipo_cliente", "preferencias_busca");
    } else {
      if (!cliProfile.tipo_cliente) missingFields.push("tipo_cliente");
      if (!cliProfile.preferencias_busca)
        missingFields.push("preferencias_busca");
    }
  }

  if (missingFields.length > 0) {
    logger.warn(
      { userId: user.id, tipo: user.tipo, missingFields },
      "Perfil incompleto",
    );
  } else {
    logger.info({ userId: user.id }, "Perfil completo");
  }

  return {
    perfilIncompleto: missingFields.length > 0,
    missingFields,
    profile,
  };
}

export class AuthController {
  static async register(req: Request, res: Response) {
    const { nome, email, senha, tipo, foto } = req.body;

    try {
      logger.info({ email }, "Verificando se usuário já existe com email");
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser.length > 0) {
        logger.warn({ email }, "Email já cadastrado");
        // Evita enumeração de usuários retornando a mesma resposta para sucesso e falha
        // Por enquanto, mantendo o comportamento anterior, mas com log seguro
        return res.status(400).json({ erro: "Email já cadastrado" });
      }

      logger.debug("Gerando hash da senha");
      const senha_hash = await bcrypt.hash(senha, 10);

      logger.debug("Inserindo usuário no banco");
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

      logger.debug("Gerando token JWT");
      const token = jwt.sign(
        { userId: newUser.id, userType: tipo },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUser.id));

      const completeness = await checkCompleteness(userData!);

      const response = {
        mensagem: "Usuário cadastrado com sucesso",
        usuario: {
          ...userData,
          perfilProfissional:
            tipo === "PROFISSIONAL" ? completeness.profile : null,
          perfilCliente: tipo === "CLIENTE" ? completeness.profile : null,
          perfilIncompleto: completeness.perfilIncompleto,
          missingFields: completeness.missingFields,
        },
      };

      logger.info({ userId: newUser.id }, "Usuário registrado com sucesso");
      res.cookie("token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.status(201).json(response);
    } catch (error) {
      logger.error({ error, email }, "Erro no registro");
      const mensagemErro = "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    logger.info(
      { email: email ? "enviado" : "não enviado" },
      "Solicitação de login recebida",
    );

    try {
      logger.debug({ email }, "Buscando usuário no banco");
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        logger.warn({ email }, "Email não encontrado");
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      logger.debug({ userId: user.id }, "Verificando senha");
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);

      if (!senhaValida) {
        logger.warn({ userId: user.id }, "Senha incorreta");
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      logger.debug({ userId: user.id }, "Gerando token JWT");
      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        JWT_SECRET,
        { expiresIn: "3h" },
      );

      const completeness = await checkCompleteness(user);

      const response = {
        mensagem: "Login realizado com sucesso",
        usuario: {
          ...user,
          perfilProfissional:
            user.tipo === "PROFISSIONAL" ? completeness.profile : null,
          perfilCliente: user.tipo === "CLIENTE" ? completeness.profile : null,
          perfilIncompleto: completeness.perfilIncompleto,
          missingFields: completeness.missingFields,
        },
      };

      logger.info({ userId: user.id }, "Login bem-sucedido");
      res.cookie("token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 60 * 60 * 1000,
      });
      res.json(response);
    } catch (error) {
      logger.error({ error, email }, "Erro no login");
      const mensagemErro = "Erro interno do servidor";
      res.status(500).json({ erro: mensagemErro });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId || !Number.isFinite(userId)) {
        logger.warn("Usuário não autenticado ou userId inválido");
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      logger.debug({ userId }, "Buscando usuário");

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        logger.warn({ userId }, "Usuário não encontrado");
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      const completeness = await checkCompleteness(user);

      logger.debug({ userId }, "Usuário encontrado");

      res.json({
        usuario: {
          ...user,
          perfilProfissional:
            user.tipo === "PROFISSIONAL" ? completeness.profile : null,
          perfilCliente: user.tipo === "CLIENTE" ? completeness.profile : null,
          perfilIncompleto: completeness.perfilIncompleto,
          missingFields: completeness.missingFields,
        },
      });
    } catch (error) {
      logger.error({ error, userId: req.user?.userId }, "Erro em /me");
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async updateOnboarding(req: Request, res: Response) {
    const userId = req.user?.userId;
    const {
      foto,
      telefone,
      cpf,
      cidade,
      estado,
      // Profissional fields
      profissao,
      experiencia,
      habilidades,
      // Cliente fields
      tipo_cliente,
      preferencias_busca,
    } = req.body;

    const habilidadesStr = Array.isArray(habilidades)
      ? JSON.stringify(habilidades)
      : habilidades;
    const preferenciasStr = Array.isArray(preferencias_busca)
      ? JSON.stringify(preferencias_busca)
      : preferencias_busca;

    try {
      if (!userId || !Number.isFinite(userId)) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      const userUpdate: any = {};
      if (foto) userUpdate.foto = foto;
      if (telefone) userUpdate.telefone = telefone;
      if (cpf) userUpdate.cpf = cpf;
      if (cidade) userUpdate.cidade = cidade;
      if (estado) userUpdate.estado = estado;

      if (Object.keys(userUpdate).length > 0) {
        await db.update(users).set(userUpdate).where(eq(users.id, userId));
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      if (user.tipo === "PROFISSIONAL") {
        const profData: Record<string, string | undefined> = {};
        if (profissao) profData.profissao = profissao;
        if (experiencia) profData.experiencia = experiencia;
        if (habilidadesStr) profData.habilidades = habilidadesStr;
        if (telefone) profData.telefone = telefone;
        if (cidade) profData.cidade = cidade;
        if (cidade && estado) profData.localizacao = `${cidade} - ${estado}`;

        if (Object.keys(profData).length > 0) {
          const [existing] = await db
            .select()
            .from(professionalProfiles)
            .where(eq(professionalProfiles.user_id, userId));

          if (existing) {
            await db
              .update(professionalProfiles)
              .set(profData)
              .where(eq(professionalProfiles.user_id, userId));
          } else {
            await db.insert(professionalProfiles).values({
              user_id: userId,
              ...profData,
            });
          }
        }
      } else if (user.tipo === "CLIENTE") {
        const clientData: Record<string, string | undefined> = {};
        if (tipo_cliente) clientData.tipo_cliente = tipo_cliente;
        if (preferenciasStr) clientData.preferencias_busca = preferenciasStr;

        if (Object.keys(clientData).length > 0) {
          const { clientProfiles } = await import("../db/schema.js");
          const [existing] = await db
            .select()
            .from(clientProfiles)
            .where(eq(clientProfiles.user_id, userId));

          if (existing) {
            await db
              .update(clientProfiles)
              .set(clientData)
              .where(eq(clientProfiles.user_id, userId));
          } else {
            await db.insert(clientProfiles).values({
              user_id: userId,
              tipo_cliente: tipo_cliente || "PF",
              ...clientData,
            });
          }
        }
      }

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Usuário não encontrado");
      }

      const completeness = await checkCompleteness(updatedUser);

      logger.info({ userId }, "Onboarding atualizado com sucesso");
      res.status(200).json({
        mensagem: "Onboarding atualizado com sucesso",
        usuario: {
          ...updatedUser,
          perfilProfissional:
            updatedUser.tipo === "PROFISSIONAL" ? completeness.profile : null,
          perfilCliente:
            updatedUser.tipo === "CLIENTE" ? completeness.profile : null,
          perfilIncompleto: completeness.perfilIncompleto,
          missingFields: completeness.missingFields,
        },
      });
    } catch (error) {
      logger.error({ error, userId }, "Erro ao atualizar onboarding");
      res.status(500).json({ erro: "Erro ao atualizar onboarding" });
    }
  }

  static async uploadProfilePhoto(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId || !Number.isFinite(userId)) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ erro: "Nenhuma foto enviada" });
      }

      const userType = req.user?.userType || "CLIENTE";
      const subdir =
        userType === "CLIENTE" ? "profile/cliente" : "profile/profissional";
      const fotoUrl = `/uploads/${subdir}/${file.filename}`;

      await db.update(users).set({ foto: fotoUrl }).where(eq(users.id, userId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Usuário não encontrado");
      }

      const completeness = await checkCompleteness(updatedUser);

      logger.info({ userId, fotoUrl }, "Foto enviada com sucesso");
      res.status(201).json({
        mensagem: "Foto enviada com sucesso",
        url: fotoUrl,
        usuario: {
          ...updatedUser,
          perfilProfissional:
            updatedUser.tipo === "PROFISSIONAL" ? completeness.profile : null,
          perfilCliente:
            updatedUser.tipo === "CLIENTE" ? completeness.profile : null,
          perfilIncompleto: completeness.perfilIncompleto,
          missingFields: completeness.missingFields,
        },
      });
    } catch (error) {
      logger.error({ error, userId: req.user?.userId }, "Erro ao enviar foto");
      res.status(500).json({ erro: "Erro ao enviar foto" });
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
        logger.warn("Usuário não autenticado ou userId inválido");
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

      logger.debug({ userId, updateData }, "Atualizando usuário");

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!updatedUser) {
        throw new Error("Usuário não encontrado");
      }

      logger.info({ userId }, "Usuário atualizado com sucesso");
      res.json({
        mensagem: "Usuário atualizado com sucesso",
        usuario: updatedUser,
      });
    } catch (error) {
      logger.error({ error, userId }, "Erro ao atualizar usuário");
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  static async logout(req: Request, res: Response) {
    logger.info({ userId: req.user?.userId }, "Realizando logout");
    res.clearCookie("token", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ mensagem: "Logout realizado com sucesso" });
  }
}
