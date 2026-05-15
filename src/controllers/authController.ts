
import type { Request, Response } from 'express'
import { db } from '../db/connection.js'
import { users, professionalProfiles } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt'

export class AuthController {
  static async register(req: Request, res: Response) {
    const { nome, email, senha, tipo, foto } = req.body

    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (existingUser.length > 0) {
        return res.status(400).json({ erro: 'Email já cadastrado' })
      }

      const senha_hash = await bcrypt.hash(senha, 10)

      const [newUser] = await db
        .insert(users)
        .values({
          nome,
          email,
          senha_hash,
          tipo,
          foto,
        })
        .$returningId()

      const token = jwt.sign(
        { userId: newUser.id, userType: tipo },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso',
        token,
        usuario: {
          id: newUser.id,
          nome,
          email,
          tipo,
          foto,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }

  static async login(req: Request, res: Response) {
    const { email, senha } = req.body

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))

      if (!user) {
        return res.status(401).json({ erro: 'Credenciais inválidas' })
      }

      const senhaValida = await bcrypt.compare(senha, user.senha_hash)

      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas' })
      }

      const token = jwt.sign(
        { userId: user.id, userType: user.tipo },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      const [profile] =
        user.tipo === 'PROFISSIONAL'
          ? await db
              .select()
              .from(professionalProfiles)
              .where(eq(professionalProfiles.user_id, user.id))
          : [null]

      res.json({
        mensagem: 'Login realizado com sucesso',
        token,
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
      console.error(error)
      res.status(500).json({ erro: 'Erro interno do servidor' })
    }
  }
}

