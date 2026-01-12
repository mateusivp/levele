import { NextResponse } from "next/server";
import { 
  getProductsFromDb, 
  getCategoriesFromDb, 
  getCouponsFromDb,
  getOrdersFromDb,
  getAbandonedCartsFromDb,
  getVisitsFromDb
} from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products, categories, coupons, orders, abandonedCarts, visits] = await Promise.all([
      getProductsFromDb(),
      getCategoriesFromDb(),
      getCouponsFromDb(),
      getOrdersFromDb(),
      getAbandonedCartsFromDb(),
      getVisitsFromDb()
    ]);

    return NextResponse.json({
      products,
      orders,
      coupons,
      abandonedCarts,
      visits,
      categories
    });
  } catch (error) {
    console.error("[API] Erro ao buscar dados consolidados do admin:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do admin" }, { status: 500 });
  }
}
