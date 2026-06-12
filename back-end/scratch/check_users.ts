import { db } from "../src/db/connection.js";
import { users, professionalProfiles } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const profissionais = await db.select().from(users).where(eq(users.tipo, "PROFISSIONAL"));
  
  for (const prof of profissionais) {
    const missingFields = [];
    if (!prof.foto) missingFields.push("foto");
    if (!prof.telefone) missingFields.push("telefone");
    if (!prof.cpf) missingFields.push("cpf");
    if (!prof.cidade) missingFields.push("cidade");
    if (!prof.estado) missingFields.push("estado");

    const [profile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.user_id, prof.id));
    
    if (!profile || !profile.experiencia || !profile.habilidades) {
        missingFields.push("dados_profissionais");
    }

    console.log(`Profissional: ${prof.nome} (ID: ${prof.id})`);
    if (missingFields.length > 0) {
      console.log(`  Dados Incompletos: ${missingFields.join(", ")}`);
    } else {
      console.log(`  Perfil Completo!`);
    }
  }
  process.exit(0);
}

main().catch(console.error);
