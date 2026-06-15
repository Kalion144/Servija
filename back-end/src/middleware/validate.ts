import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import logger from "../config/logger.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      logger.warn({ error, body: req.body }, "Validação falhou");
      res.status(400).json({
        erro: "Dados inválidos",
        detalhes: error,
      });
    }
  };
};
