import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import clientAuthRoutes from "./routes/client/authRoutes.js";
import professionalAuthRoutes from "./routes/professional/authRoutes.js";
import professionalRoutes from "./routes/professional/index.js";
import clientRoutes from "./routes/client/index.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Servir arquivos staticamente (imagens)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware de logging de requisições
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("📋 Body:", JSON.stringify(req.body, null, 2));
  }
  if (req.params && Object.keys(req.params).length > 0) {
    console.log("📍 Params:", JSON.stringify(req.params, null, 2));
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("🔍 Query:", JSON.stringify(req.query, null, 2));
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/client/auth", clientAuthRoutes);
app.use("/professional/auth", professionalAuthRoutes);
app.use("/professionals", professionalRoutes);
app.use("/client", clientRoutes);
app.use("/api/upload", uploadRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(
    `\n❌ [${timestamp}] Erro na requisição ${req.method} ${req.url}:`,
  );
  console.error(err.stack || err);

  res.status(500).json({
    erro: "Erro interno do servidor",
    detalhes: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
