import { NextResponse } from "next/server";
import { dbProducts, getProductsFromDb, saveProductToDb } from "@/lib/db";
import pool from "@/lib/mysql";

export async function GET() {
  const products = await getProductsFromDb();
  console.log(`[API] GET /api/products - Retornando ${products.length} produtos`);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(`[API] POST /api/products - Criando produto: ${body.name}`);
    
    const baseSlug = body.name.toLowerCase()
      .replace(/ /g, '-')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w-]/g, '');
    
    const products = await getProductsFromDb();
    let slug = baseSlug;
    let counter = 1;
    while (products.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProduct = {
      ...body,
      id: Math.random().toString(36).substr(2, 9),
      slug: slug,
    };
    
    // Salvar no MySQL se disponível
    await saveProductToDb(newProduct);
    
    // Fallback em memória
    dbProducts.push(newProduct);
    
    console.log(`[API] Produto criado com sucesso: ${slug}`);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[API] Erro ao criar produto:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    // Deletar do MySQL
    if (process.env.MYSQL_HOST) {
      await pool.query('DELETE FROM products WHERE id = ?', [id]);
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
