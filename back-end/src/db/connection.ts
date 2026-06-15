import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../config/env.js";
import logger from "../config/logger.js";

/* =====================================================
   TURSO CLIENT
===================================================== */

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN as string,
});

/* =====================================================
   DRIZZLE ORM
===================================================== */

export const db = drizzle(client);

/* =====================================================
   TEST DATABASE
===================================================== */

export async function conectarBanco() {
  try {
    await client.execute("SELECT 1");
    logger.info("Banco conectado com sucesso (Turso)");
  } catch (error) {
    logger.error({ error }, "Erro ao conectar no banco");
  }
}
