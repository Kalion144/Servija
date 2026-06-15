
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

interface JwtPayload {
  userId: number
  userType: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' })
  }

  jwt.verify(token, env.JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      logger.warn({ err }, 'Token inválido');
      return res.status(403).json({ erro: 'Token inválido' })
    }

    const payload = decoded as JwtPayload;
    
    // Validate userId is a finite number
    if (!payload || typeof payload.userId !== 'number' || !Number.isFinite(payload.userId)) {
      logger.warn({ userId: payload?.userId }, 'Invalid userId in token');
      return res.status(403).json({ erro: 'Token inválido' });
    }

    req.user = payload;
    next();
  });
}

