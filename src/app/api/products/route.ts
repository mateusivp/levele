import { NextResponse } from "next/server";
import { dbProducts, getProductsFromDb, saveProductToDb } from "@/lib/db";
import pool from "@/lib/db_connection";

export async function GET() {
  const products = await getProductsFromDb();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  console.log("[API] Recebendo requisição POST para /api/products");
  try {
    const product = await request.json();
    console.log(`[API] Dados recebidos para o produto: ${product.name}`);
    const index = dbProducts.findIndex(p => p.id === product.id);
    if (index !== -1) {
      dbProducts[index] = product;
    } else {
      dbProducts.push(product);
    }

    if (pool) {
      console.log(`[API] Persistindo produto ${product.name} no banco de dados...`);
      await saveProductToDb(product);
      console.log(`[API] Produto ${product.name} salvo com sucesso no banco.`);
    } else {
      console.warn("Conexão com Postgres não configurada. Salvando produto apenas em memória.");
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
  console.log("[API] Recebendo requisição PUT para /api/products");
  try {
    const body = await request.json();
    const { id, ...data } = body;
    console.log(`[API] Dados recebidos para atualização (ID: ${id})`);
    
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    const products = await getProductsFromDb();
    const existingProduct = products.find(p => p.id === id);
    if (!existingProduct) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    
    const updatedProduct = { ...existingProduct, ...data };
    
    // Atualizar em memória primeiro para feedback imediato
    console.log(`[API] Atualizando produto ${updatedProduct.name} (ID: ${id}) em memória...`);
    const index = dbProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      dbProducts[index] = updatedProduct;
    }

    // Atualizar no banco de dados
    if (pool) {
      console.log(`[API] Persistindo atualização do produto ${updatedProduct.name} no banco...`);
      await saveProductToDb(updatedProduct);
      console.log(`[API] Produto ${updatedProduct.name} atualizado com sucesso no banco.`);
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[API] Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
