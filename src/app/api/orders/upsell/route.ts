import { NextResponse } from "next/server";
import { getOrdersFromDb, saveOrderToDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, productId, productName, price, quantity } = body;

    console.log(`[API] POST /api/orders/upsell - Adicionando upsell ao pedido: ${orderId}`);

    if (!orderId || !productId || !productName || !price || !quantity) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const orders = await getOrdersFromDb();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      console.warn(`[API] Pedido não encontrado para upsell: ${orderId}`);
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const order = orders[orderIndex];

    // Adiciona o item ao pedido
    const newItem = {
      productId,
      productName,
      price,
      quantity,
      isUpsell: true // Marcando como upsell para referência futura
    };

    order.items.push(newItem);
    
    // Recalcula o total do pedido
    order.total = Number(order.total) + (price * quantity);

    await saveOrderToDb(order);

    console.log(`[API] Upsell adicionado com sucesso ao pedido ${orderId}`);
    return NextResponse.json(order);
  } catch (error) {
    console.error("[API] Erro ao adicionar upsell:", error);
    return NextResponse.json({ error: "Erro ao processar upsell" }, { status: 500 });
  }
}
