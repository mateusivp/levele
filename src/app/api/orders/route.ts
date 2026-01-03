import { Order } from "@/types";
import { NextResponse } from "next/server";
import { dbOrders } from "@/lib/db";
import pool from "@/lib/mysql";

export async function GET() {
  if (process.env.MYSQL_HOST) {
    try {
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      const dbRows = rows as any[];
      const orders = dbRows.map(row => ({
        id: row.id,
        customer: {
          name: row.customer_name,
          email: row.customer_email || "",
          phone: row.customer_phone,
          cpf: row.customer_cpf || "",
        },
        address: {
          street: row.address_street,
          number: row.address_number,
          complement: row.address_complement,
          neighborhood: row.address_neighborhood,
          city: row.address_city,
          state: row.address_state,
          cep: row.address_zipcode,
        },
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        total: Number(row.total_amount),
        status: row.status,
        createdAt: row.created_at,
      }));
      return NextResponse.json(orders);
    } catch (error) {
      console.error("Erro ao buscar pedidos do MySQL:", error);
    }
  }
  
  console.log(`[API] GET /api/orders - Retornando ${dbOrders.length} pedidos`);
  return NextResponse.json(dbOrders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    console.log(`[API] POST /api/orders - Criando pedido: ${orderId} para ${body.customer.name}`);
    
    const newOrder: Order = {
      ...body,
      id: orderId,
      status: 'Novo',
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: 'Novo', date: new Date().toISOString() }
      ]
    };

    // Salvar no MySQL se disponível
    if (process.env.MYSQL_HOST) {
      try {
        await pool.query(
          `INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_cpf, 
          address_street, address_number, address_complement, address_neighborhood, address_city, 
          address_state, address_zipcode, total_amount, status, items) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newOrder.id,
            newOrder.customer.name,
            newOrder.customer.email || "",
            newOrder.customer.phone,
            newOrder.customer.cpf || "",
            newOrder.customer.address.street,
            newOrder.customer.address.number,
            newOrder.customer.address.complement || "",
            newOrder.customer.address.neighborhood,
            newOrder.customer.address.city,
            newOrder.customer.address.state,
            newOrder.customer.address.cep,
            newOrder.total,
            newOrder.status,
            JSON.stringify(newOrder.items)
          ]
        );
      } catch (error) {
        console.error("Erro ao salvar pedido no MySQL:", error);
      }
    }
    
    dbOrders.push(newOrder);
    console.log(`[API] Pedido criado com sucesso: ${orderId}`);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("[API] Erro ao criar pedido:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    console.log(`[API] PUT /api/orders - Atualizando pedido ${id} para status: ${status}`);
    
    if (!id || !status) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

    // Atualizar no MySQL
    if (process.env.MYSQL_HOST) {
      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    }
    
    const index = dbOrders.findIndex(o => o.id === id);
    if (index === -1) {
      // Se não encontrou na memória mas atualizou no banco, retorna sucesso
      if (process.env.MYSQL_HOST) return NextResponse.json({ success: true, id, status });
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    
    dbOrders[index] = { 
      ...dbOrders[index], 
      status,
      statusHistory: [
        ...(dbOrders[index].statusHistory || []),
        { status, date: new Date().toISOString() }
      ]
    };
    return NextResponse.json(dbOrders[index]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
