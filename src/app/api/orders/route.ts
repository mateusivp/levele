import { Order } from "@/types";
import { NextResponse } from "next/server";
import { dbOrders } from "@/lib/db";
import pool from "@/lib/db_connection";

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = rows.map((row: any) => ({
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
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json(dbOrders);
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

    try {
      await pool.query(
        `INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_cpf, 
        address_street, address_number, address_complement, address_neighborhood, address_city, 
        address_state, address_zipcode, total_amount, status, items) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
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
      console.error("Erro ao salvar pedido:", error);
    }
    
    dbOrders.push(newOrder);
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
    
    if (!id || !status) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

    try {
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
    }
    
    const index = dbOrders.findIndex(o => o.id === id);
    if (index === -1) {
      return NextResponse.json({ success: true, id, status });
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
