import { NextResponse } from "next/server";
import { dbAbandonedCarts } from "@/lib/db";
import { AbandonedCart } from "@/types";

export async function GET() {
  return NextResponse.json(dbAbandonedCarts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, name, phone, total } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
    }

    // Verificar se já existe um carrinho abandonado para este telefone recentemente (última 1 hora)
    const existingIndex = dbAbandonedCarts.findIndex(c => 
      c.customer.phone === phone && 
      c.status === 'Pendente' &&
      (new Date().getTime() - new Date(c.createdAt).getTime()) < 3600000
    );

    if (existingIndex !== -1) {
      // Atualizar o existente
      dbAbandonedCarts[existingIndex] = {
        ...dbAbandonedCarts[existingIndex],
        productId,
        productName,
        customer: { name, phone },
        total,
        createdAt: new Date().toISOString()
      };
      return NextResponse.json(dbAbandonedCarts[existingIndex]);
    }

    const newAbandoned: AbandonedCart = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      productName,
      customer: { name, phone },
      total,
      createdAt: new Date().toISOString(),
      status: 'Pendente'
    };

    dbAbandonedCarts.push(newAbandoned);
    console.log(`[API] Carrinho abandonado capturado para ${name} (${phone})`);
    
    return NextResponse.json(newAbandoned, { status: 201 });
  } catch (error) {
    console.error("[API] Erro ao capturar carrinho abandonado:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    const index = dbAbandonedCarts.findIndex(c => c.id === id);
    if (index !== -1) {
      dbAbandonedCarts.splice(index, 1);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
