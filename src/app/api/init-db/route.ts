import { NextResponse } from "next/server";
import pool from "@/lib/db_connection";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!pool) {
    return NextResponse.json({ 
      error: "POSTGRES_URL não configurada no ambiente.",
      success: false 
    }, { status: 500 });
  }

  try {
    console.log("[INIT-DB] Iniciando criação das tabelas no Vercel Postgres...");

    // Tabela de Produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT,
        images JSONB,
        video_url TEXT,
        slug TEXT UNIQUE,
        category TEXT,
        active BOOLEAN DEFAULT TRUE,
        seo_title TEXT,
        seo_description TEXT,
        upsell_product_id TEXT,
        order_bump_id TEXT,
        order_bump_ids JSONB,
        variations JSONB,
        post_purchase_upsell JSONB,
        reviews JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer JSONB NOT NULL,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'Novo',
        status_history JSONB,
        delivery_date TEXT,
        discount JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Cupons
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        discounttype TEXT NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        minpurchase DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Carrinhos Abandonados
    await pool.query(`
      CREATE TABLE IF NOT EXISTS abandoned_carts (
        id TEXT PRIMARY KEY,
        productid TEXT,
        productname TEXT,
        variationid TEXT,
        variationname TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        total DECIMAL(10, 2),
        status TEXT DEFAULT 'Pendente',
        createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Categorias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Analytics
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        metric_name TEXT UNIQUE,
        metric_value INTEGER DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT UNIQUE NOT NULL,
        password TEXT,
        cashback DECIMAL(10, 2) DEFAULT 0.00,
        points INTEGER DEFAULT 0,
        level TEXT DEFAULT 'Bronze',
        addresses JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Garantir que a coluna addresses existe (migração)
    try {
      await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS addresses JSONB`);
    } catch (e) {
      console.log("Coluna addresses já existe ou erro ao adicionar:", e);
    }

    // Inicializar métricas
    await pool.query(`
      INSERT INTO analytics (metric_name, metric_value) 
      VALUES ('visits', 0) 
      ON CONFLICT (metric_name) DO NOTHING
    `);

    console.log("[INIT-DB] Banco de dados inicializado com sucesso.");

    return NextResponse.json({ 
      message: "Banco de dados inicializado com sucesso no Vercel Postgres.",
      success: true 
    });
  } catch (error: any) {
    console.error("[INIT-DB] Erro detalhado ao inicializar banco de dados:", error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}
