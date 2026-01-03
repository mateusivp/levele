import { createPool } from '@vercel/postgres';

// O Vercel Postgres usa variáveis de ambiente automáticas quando conectado ao projeto
const pool = createPool();

export default pool;
