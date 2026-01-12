import { NextResponse } from "next/server";
import { 
  getProductsFromDb, 
  getCategoriesFromDb, 
  getCouponsFromDb,
  dbOrders, 
  dbAbandonedCarts, 
  dbVisits 
} from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products, categories, coupons] = await Promise.all([
      getProductsFromDb(),
      getCategoriesFromDb(),
      getCouponsFromDb()
    ]);

    return NextResponse.json({
      products,
      orders: dbOrders,
      coupons,
      abandonedCarts: dbAbandonedCarts,
      visits: dbVisits,
      categories
    });
  } catch (error) {
    console.error("[API] Erro ao buscar dados consolidados do admin:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do admin" }, { status: 500 });
  }
}
