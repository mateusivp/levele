import { NextResponse } from "next/server";
import { Coupon } from "@/types";

// Simulação de banco de dados em memória
let dbCoupons: Coupon[] = [
  { code: 'PRIMEIRACOMPRA', discountType: 'percentage', value: 10 },
  { code: 'LEVELE20', discountType: 'fixed', value: 20 },
];

export async function GET() {
  return NextResponse.json(dbCoupons);
}

export async function POST(request: Request) {
  try {
    const coupon: Coupon = await request.json();
    
    // Validar se o cupom já existe
    if (dbCoupons.some(c => c.code.toUpperCase() === coupon.code.toUpperCase())) {
      return NextResponse.json({ error: "Cupom já existe" }, { status: 400 });
    }

    const newCoupon = {
      ...coupon,
      code: coupon.code.toUpperCase()
    };
    
    dbCoupons.push(newCoupon);
    console.log(`[Coupons API] Cupom criado: ${newCoupon.code}`);
    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar cupom" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { code } = await request.json();
    dbCoupons = dbCoupons.filter(c => c.code !== code);
    console.log(`[Coupons API] Cupom removido: ${code}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover cupom" }, { status: 500 });
  }
}
