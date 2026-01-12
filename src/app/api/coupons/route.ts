import { NextResponse } from "next/server";
import { Coupon } from "@/types";
import { getCouponsFromDb, saveCouponToDb, deleteCouponFromDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coupons = await getCouponsFromDb();
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar cupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const coupon: Coupon = await request.json();
    
    if (!coupon.code) {
      return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 });
    }

    await saveCouponToDb(coupon);
    console.log(`[Coupons API] Cupom salvo/atualizado: ${coupon.code}`);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar cupom:", error);
    return NextResponse.json({ error: "Erro ao salvar cupom" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 });
    }
    await deleteCouponFromDb(code);
    console.log(`[Coupons API] Cupom removido: ${code}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover cupom:", error);
    return NextResponse.json({ error: "Erro ao remover cupom" }, { status: 500 });
  }
}
