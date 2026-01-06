import { NextResponse } from "next/server";
import { getProductById } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error(`[API] Erro ao buscar produto por ID:`, error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
