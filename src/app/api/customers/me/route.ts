import { NextResponse } from "next/server";
import { getCustomerByPhone } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 });
    }

    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      cashback: Number(customer.cashback),
      points: customer.points,
      level: customer.level,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    });
  } catch (error) {
    console.error("Erro ao buscar dados do cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
