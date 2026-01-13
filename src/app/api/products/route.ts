import { NextResponse } from "next/server";
import { getProductsFromDb, saveProductToDb, deleteProductFromDb } from "@/lib/db";
import pool from "@/lib/db_connection";

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getProductsFromDb();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  console.log("[API] Recebendo requisição POST para /api/products em " + new Date().toISOString());
  try {
    const product = await request.json();
    console.log(`[API] Payload recebido para o produto: ${product.name} (ID: ${product.id})`);
    
    if (!product.id || !product.name || !product.slug) {
      console.error("[API] Dados incompletos recebidos:", { id: product.id, name: product.name, slug: product.slug });
      return NextResponse.json({ error: "Dados incompletos (id, name, slug são obrigatórios)" }, { status: 400 });
    }

    // Salvar no banco (que também atualiza a memória interna)
    console.log(`[API] Chamando saveProductToDb para ${product.id}...`);
    await saveProductToDb(product);
    console.log(`[API] saveProductToDb concluído com sucesso para ${product.id}`);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("[API] Erro ao salvar produto:", error);
    return NextResponse.json({ 
      error: "Erro ao salvar produto", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
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
  console.log("[API] Recebendo requisição PUT para /api/products em " + new Date().toISOString());
  try {
    const body = await request.json();
    const { id, ...data } = body;
    console.log(`[API] Dados recebidos para atualização (ID: ${id})`);
    
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    const products = await getProductsFromDb();
    const existingProduct = products.find(p => p.id === id);
    if (!existingProduct) {
      console.warn(`[API] Produto ${id} não encontrado para atualização.`);
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    
    const updatedProduct = { ...existingProduct, ...data };
    
    // Salvar no banco (que também atualiza a memória interna)
    console.log(`[API] Chamando saveProductToDb para atualização de ${id}...`);
    await saveProductToDb(updatedProduct);
    console.log(`[API] Atualização concluída com sucesso para ${id}`);

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("[API] Erro ao atualizar produto:", error);
    return NextResponse.json({ 
      error: "Erro ao atualizar produto", 
      details: error.message 
    }, { status: 500 });
  }
}
