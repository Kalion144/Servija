
import type { Request, Response } from 'express'
import { db } from '../db/connection.js'
import { users, professionalProfiles } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export class AuthController {
  static async register(req: Request, res: Response) {
    const { nome, email, senha, tipo, foto } = req.body

    try {
      console.log('🔍 Verificando se usuário já existe...')
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (existingUser.length > 0) {
        console.log('❌ Email já cadastrado')
        return res.status(400).json({ erro: 'Email já cadastrado' })
      }

      console.log('🔐 Gerando hash da senha...')
      const senha_hash = await bcrypt.hash(senha, 10)

      console.log('💾 Inserindo usuário no banco...')
      const [newUser] = await db
        .insert(users)
        .values({
          nome,
          email,
          senha_hash,
          tipo,
          foto,
        })
        .returning({ id: users.id })

      console.log('🔑 Gerando token JWT...')
      const token = jwt.sign(
        { userId: newUser.id, userType: tipo },
        JWT_SECRET,
        { expiresIn: '3h' }
      )

      const response = {
        mensagem: 'Usuário cadastrado com sucesso',
        usuario: {
          id: newUser.id,
          nome,
          email,
          tipo,
          foto,
        },
      }

      console.log('✅ Resposta de registro:', JSON.stringify(response, null, 2))
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 60 * 1000,
      })
      res.status(201).json(response)
    } catch (error) {
      console.error('❌ Erro no registro:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body

    try {
      console.log('🔍 Buscando usuário no banco...')
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (!user) {
        console.log('❌ Usuário não encontrado')
        return res.status(401).json({ erro: 'Credenciais inválidas' })
      }

      console.log('🔐 Verificando senha...')
      const senhaValida = await bcrypt.compare(senha, user.senha_hash)

      if (!senhaValida) {
        console.log('❌ Senha inválida')
        return res.status(401).json({ erro: 'Credenciais inválidas' })
      }

      console.log('🔑 Gerando token JWT...')
      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        JWT_SECRET,
        { expiresIn: '3h' }
      )

      const [profile] =
        user.tipo === 'PROFISSIONAL'
          ? await db
              .select()
              .from(professionalProfiles)
              .where(eq(professionalProfiles.user_id, user.id))
          : [null]

      const response = {
        mensagem: 'Login realizado com sucesso',
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          foto: user.foto,
          perfilProfissional: profile,
        },
      }

      console.log('✅ Resposta de login:', JSON.stringify(response, null, 2))
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3 * 60 * 60 * 1000,
      })
      res.json(response)
    } catch (error) {
      console.error('❌ Erro no login:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado' })
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId))

      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado' })
      }

      const [profile] =
        user.tipo === 'PROFISSIONAL'
          ? await db
              .select()
              .from(professionalProfiles)
              .where(eq(professionalProfiles.user_id, user.id))
          : [null]

      res.json({
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          foto: user.foto,
          perfilProfissional: profile,
        },
      })
    } catch (error) {
      console.error('❌ Erro ao obter dados do usuário:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async updateUser(req: Request, res: Response) {
    const userId = req.user?.userId
    const { nome, email, foto, telefone, cpf, endereco, cidade, estado, dataNascimento, bio } = req.body

    try {
      if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado' })
      }

      const updateData: any = {}
      if (nome) updateData.nome = nome
      if (email) updateData.email = email
      if (foto !== undefined) updateData.foto = foto
      if (telefone) updateData.telefone = telefone
      if (cpf) updateData.cpf = cpf
      if (endereco) updateData.endereco = endereco
      if (cidade) updateData.cidade = cidade
      if (estado) updateData.estado = estado
      if (dataNascimento) updateData.dataNascimento = dataNascimento
      if (bio) updateData.bio = bio

      await db.update(users).set(updateData).where(eq(users.id, userId))

      const [updatedUser] = await db.select().from(users).where(eq(users.id, userId))

      res.json({
        mensagem: 'Usuário atualizado com sucesso',
        usuario: updatedUser
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    res.json({ mensagem: 'Logout realizado com sucesso' })
  }
}

