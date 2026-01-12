import { NextResponse } from "next/server";
import { updateCustomerInDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name, email, addresses } = body;

    if (!phone) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 });
    }

    await updateCustomerInDb(phone, { name, email, addresses });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
