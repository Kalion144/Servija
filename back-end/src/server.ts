import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import clientAuthRoutes from "./routes/client/authRoutes.js";
import professionalAuthRoutes from "./routes/professional/authRoutes.js";
import professionalRoutes from "./routes/professional/index.js";
import clientRoutes from "./routes/client/index.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { env } from "./config/env.js";
import logger from "./config/logger.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helmet para segurança HTTP
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:5174"],
    credentials: true,
  }),
);

// Stripe webhook precisa do body raw (antes do express.json)
app.use("/stripe", stripeRoutes);

app.use(express.json());
app.use(cookieParser());

// Servir arquivos staticamente (imagens)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware de logging de requisições usando pino
app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    "Requisição recebida",
  );
  next();
});

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/client/auth", clientAuthRoutes);
app.use("/professional/auth", professionalAuthRoutes);
app.use("/professionals", professionalRoutes);
app.use("/client", clientRoutes);
app.use("/api/upload", uploadRoutes);

// Middleware de tratamento de erros
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err, method: req.method, url: req.url }, "Erro na requisição");

  res.status(500).json({
    erro: "Erro interno do servidor",
    detalhes:
      env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : undefined,
  });
};

app.use(errorHandler);

import { conectarBanco } from "./db/connection.js";

const port = env.PORT;

async function iniciarServidor() {
  await conectarBanco();

  app.listen(port, () => {
    logger.info(`🚀 Servidor rodando em http://localhost:${port}`);
  });
}

iniciarServidor();
