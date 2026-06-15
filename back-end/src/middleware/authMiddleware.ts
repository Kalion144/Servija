
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-jwt'

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

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ erro: 'Token inválido' })
    }

    const payload = decoded as JwtPayload;
    
    // Validate userId is a finite number
    if (!payload || typeof payload.userId !== 'number' || !Number.isFinite(payload.userId)) {
      console.warn('⚠️ [authenticateToken] Invalid userId in token:', payload?.userId);
      return res.status(403).json({ erro: 'Token inválido' });
    }

    req.user = payload;
    next()
  })
}

