import { NextResponse } from "next/server";
import { dbProducts, getProductsFromDb, saveProductToDb } from "@/lib/db";
import pool from "@/lib/db_connection";

export async function GET() {
  const products = await getProductsFromDb();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const product = await request.json();
    if (pool) {
      await saveProductToDb(product);
    } else {
      console.warn("Conexão com Postgres não configurada. Salvando produto apenas em memória.");
      dbProducts.push(product);
    }
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    return NextResponse.json({ error: "Erro ao salvar produto" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    // Deletar do Postgres
    if (pool) {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
    
    const index = dbProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      dbProducts.splice(index, 1);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    const products = await getProductsFromDb();
    const existingProduct = products.find(p => p.id === id);
    if (!existingProduct) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    
    const updatedProduct = { ...existingProduct, ...data };
    
    // Atualizar no MySQL
    await saveProductToDb(updatedProduct);
    
    // Fallback em memória
    const index = dbProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      dbProducts[index] = updatedProduct;
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[API] Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
