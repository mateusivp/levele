import { NextResponse } from "next/server";
import { getCustomersFromDb, saveCustomerToDb, deleteCustomerFromDb } from "@/lib/db";
import { Customer } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers = await getCustomersFromDb();
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer: Customer = await request.json();
    await saveCustomerToDb(customer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);
    return NextResponse.json({ error: "Erro ao salvar cliente" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    
    await deleteCustomerFromDb(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json({ error: "Erro ao deletar cliente" }, { status: 500 });
  }
}
