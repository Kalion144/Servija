
import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateSchema() {
  console.log('Starting schema update 2...');

  try {
    // Drop old proposal_professionals table
    console.log('Dropping old proposal_professionals table...');
    await client.execute('DROP TABLE IF EXISTS proposal_professionals');

    // Create new proposal_professionals table
    console.log('Creating new proposal_professionals table...');
    await client.execute(`
      CREATE TABLE proposal_professionals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id INTEGER NOT NULL REFERENCES professional_services(id) ON DELETE CASCADE,
        professional_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mensagem TEXT,
        valor REAL,
        negociavel INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDENTE',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    console.log('✅ Schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();

