import { NextResponse } from "next/server";
import pool from "@/lib/db_connection";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!pool) {
    return NextResponse.json({ 
      connected: false, 
      message: "POSTGRES_URL não configurada no ambiente da Vercel." 
    });
  }

  try {
    // Tenta uma consulta simples para verificar a conexão e a existência da tabela products
    await pool.query('SELECT 1 FROM products LIMIT 1');
    return NextResponse.json({ 
      connected: true, 
      message: "Conectado ao Vercel Postgres e tabelas prontas." 
    });
  } catch (error: any) {
    // Se falhar porque a tabela não existe
    if (error.message.includes('relation "products" does not exist')) {
      return NextResponse.json({ 
        connected: true, 
        tablesReady: false,
        message: "Conectado ao banco, mas as tabelas ainda não foram criadas." 
      });
    }
    
    return NextResponse.json({ 
      connected: false, 
      message: `Erro na conexão com o banco: ${error.message}` 
    });
  }
}
