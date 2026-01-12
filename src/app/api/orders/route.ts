import { Order } from "@/types";
import { NextResponse } from "next/server";
import { dbOrders } from "@/lib/db";
import pool from "@/lib/db_connection";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!pool) {
    console.warn("Conexão com Postgres não configurada. Retornando dados em memória.");
    if (phone) {
      return NextResponse.json(dbOrders.filter(o => o.customer.phone === phone));
    }
    return NextResponse.json(dbOrders);
  }

  try {
    let query = 'SELECT * FROM orders';
    const params = [];

    if (phone) {
      query += ' WHERE customer_phone = $1';
      params.push(phone);
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
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

    if (pool) {
      try {
        // Iniciar transação ou salvar pedido
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

        // Criar ou atualizar cliente automaticamente
        // Usamos INSERT ... ON CONFLICT (phone) DO UPDATE para garantir que o cliente exista
        // e seus pontos/cashback sejam atualizados (simulação básica)
        const cashbackAmount = newOrder.total * 0.05; // 5% de cashback
        const pointsEarned = Math.floor(newOrder.total);

        await pool.query(
          `INSERT INTO customers (id, name, email, phone, cashback, points) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (phone) DO UPDATE SET 
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           cashback = customers.cashback + EXCLUDED.cashback,
           points = customers.points + EXCLUDED.points`,
          [
            `CUST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            newOrder.customer.name,
            newOrder.customer.email || "",
            newOrder.customer.phone,
            cashbackAmount,
            pointsEarned
          ]
        );
      } catch (error) {
        console.error("Erro ao salvar pedido ou cliente no Postgres:", error);
      }
    } else {
      console.warn("Conexão com Postgres não configurada. Salvando apenas em memória.");
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

    if (pool) {
      try {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
      } catch (error) {
        console.error("Erro ao atualizar pedido no Postgres:", error);
      }
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
