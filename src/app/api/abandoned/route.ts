import { NextResponse } from "next/server";
import { dbAbandonedCarts, getAbandonedCartsFromDb, saveAbandonedCartToDb, deleteAbandonedCartFromDb } from "@/lib/db";
import { AbandonedCart } from "@/types";

export async function GET() {
  const carts = await getAbandonedCartsFromDb();
  return NextResponse.json(carts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, name, phone, total } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
    }

    const abandonedCarts = await getAbandonedCartsFromDb();

    // Verificar se já existe um carrinho abandonado para este telefone recentemente (última 1 hora)
    const existingCart = abandonedCarts.find(c => 
      c.customer.phone === phone && 
      c.status === 'Pendente' &&
      (new Date().getTime() - new Date(c.createdAt).getTime()) < 3600000
    );

    if (existingCart) {
      // Atualizar o existente
      const updatedCart = {
        ...existingCart,
        productId,
        productName,
        customer: { name, phone },
        total,
        createdAt: new Date().toISOString()
      };
      await saveAbandonedCartToDb(updatedCart);
      return NextResponse.json(updatedCart);
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

    await saveAbandonedCartToDb(newAbandoned);
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

    await deleteAbandonedCartFromDb(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
