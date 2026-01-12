import { Pool } from 'pg';

// Cria o pool usando pg diretamente para suportar tanto local quanto Vercel Postgres
const pool = process.env.POSTGRES_URL 
  ? new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.POSTGRES_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : null;

export default pool;
