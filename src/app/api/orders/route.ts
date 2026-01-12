import { Order } from "@/types";
import { NextResponse } from "next/server";
import { getOrdersFromDb, saveOrderToDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  try {
    let orders = await getOrdersFromDb();

    if (phone) {
      orders = orders.filter(o => o.customer.phone === phone);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.id || `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const newOrder: Order = {
      ...body,
      id: orderId,
      status: body.status || 'Novo',
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: body.status || 'Novo', date: new Date().toISOString() }
      ]
    };

    await saveOrderToDb(newOrder);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);
    return NextResponse.json({ error: "Erro ao salvar pedido" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

    const orders = await getOrdersFromDb();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    
    const updatedOrder = {
      ...orders[orderIndex],
      status,
      statusHistory: [
        ...(orders[orderIndex].statusHistory || []),
        { status, date: new Date().toISOString() }
      ]
    };

    await saveOrderToDb(updatedOrder);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
