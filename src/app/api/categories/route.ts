import { NextResponse } from "next/server";
import { getCategoriesFromDb, getProductsFromDb, saveCategoryToDb, deleteCategoryFromDb } from "@/lib/db";
import { Category } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategoriesFromDb();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const category: Category = await request.json();
    await saveCategoryToDb(category);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar categoria:", error);
    return NextResponse.json({ error: "Erro ao salvar categoria" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    await deleteCategoryFromDb(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return NextResponse.json({ error: "Erro ao deletar categoria" }, { status: 500 });
  }
}
