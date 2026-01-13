import { Pool } from 'pg';

// Cria o pool usando pg diretamente para suportar tanto local quanto Vercel Postgres
const pool = process.env.POSTGRES_URL 
  ? (() => {
      console.log("[DB] Criando novo pool de conexão com Postgres...");
      return new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: process.env.POSTGRES_URL.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000, // Timeout de 5 segundos para conexão
        query_timeout: 10000, // Timeout de 10 segundos para queries
      });
    })()
  : null;

// Log de erro no pool para facilitar diagnóstico
if (pool) {
  pool.on('error', (err) => {
    console.error('Erro inesperado no pool do Postgres:', err);
  });
}

export default pool;
