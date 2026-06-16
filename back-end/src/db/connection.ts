import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

/* =====================================================
   ENV VARIABLES
===================================================== */

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not defined in environment variables");
}

/* =====================================================
   TURSO CLIENT
===================================================== */

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
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
    console.log("✅ Banco conectado com sucesso (Turso)");
  } catch (error) {
    console.error("❌ Erro ao conectar no banco");
    console.error(error);
  }
}
