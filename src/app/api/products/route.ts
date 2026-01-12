import { NextResponse } from "next/server";
import { getProductsFromDb, saveProductToDb, deleteProductFromDb } from "@/lib/db";
import pool from "@/lib/db_connection";

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getProductsFromDb();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  console.log("[API] Recebendo requisição POST para /api/products");
  try {
    const product = await request.json();
    console.log(`[API] Dados recebidos para o produto: ${product.name}`);
    
    // Salvar no banco (que também atualiza a memória interna)
    await saveProductToDb(product);
    
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
    
    await deleteProductFromDb(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
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
    
    // Salvar no banco (que também atualiza a memória interna)
    await saveProductToDb(updatedProduct);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[API] Erro ao atualizar produto:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
