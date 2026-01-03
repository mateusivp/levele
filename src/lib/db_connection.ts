import { createPool } from '@vercel/postgres';

// Cria o pool apenas se a URL do Postgres estiver presente para evitar erros de build
const pool = process.env.POSTGRES_URL 
  ? createPool() 
  : null;

export default pool;
