import { NextResponse } from "next/server";
import pool from "@/lib/db_connection";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password, action } = body;

    if (!phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 });
    }

    if (!pool) {
      // Fallback para desenvolvimento sem banco (simulado)
      if (phone === "43 9 9824-5853") {
        if (!action) {
          return NextResponse.json({
            status: "enter_password",
            name: "João Silva"
          });
        }

        if (action === "login") {
          return NextResponse.json({
            status: "authenticated",
            customer: {
              id: 999,
              name: "João Silva",
              email: "joao@exemplo.com",
              phone: "43 9 9824-5853",
              cashback: 45.90,
              points: 1250,
              level: "Prata"
            }
          });
        }
      }
      return NextResponse.json({ error: "Banco de dados não conectado. Verifique o POSTGRES_URL." }, { status: 500 });
    }

    // Buscar cliente pelo telefone
    const { rows } = await pool.query('SELECT * FROM customers WHERE phone = $1', [phone]);
    const customer = rows[0];

    if (!customer) {
      return NextResponse.json({ status: "not_found", message: "Cliente não encontrado. Finalize um pedido primeiro." });
    }

    // Se a ação for apenas verificar o status do cliente (primeiro passo do login)
    if (!action) {
      if (!customer.password) {
        return NextResponse.json({ status: "set_password", name: customer.name });
      } else {
        return NextResponse.json({ status: "enter_password", name: customer.name });
      }
    }

    // Se a ação for definir a senha pela primeira vez
    if (action === "set_password") {
      if (customer.password) {
        return NextResponse.json({ error: "Senha já definida" }, { status: 400 });
      }
      
      await pool.query('UPDATE customers SET password = $1 WHERE phone = $2', [password, phone]);
      
      // Retornar dados do cliente logado
      return NextResponse.json({
        status: "authenticated",
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          cashback: Number(customer.cashback),
          points: customer.points,
          level: customer.level
        }
      });
    }

    // Se a ação for login normal
    if (action === "login") {
      if (!customer.password) {
        return NextResponse.json({ error: "Defina sua senha primeiro" }, { status: 400 });
      }

      if (customer.password === password) {
        return NextResponse.json({
          status: "authenticated",
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            cashback: Number(customer.cashback),
            points: customer.points,
            level: customer.level
          }
        });
      } else {
        return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
      }
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });

  } catch (error) {
    console.error("[API Auth] Erro:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
