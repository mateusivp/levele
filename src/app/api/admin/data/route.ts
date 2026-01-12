import { NextResponse } from "next/server";
import { 
  getProductsFromDb, 
  getCategoriesFromDb, 
  getCouponsFromDb,
  getOrdersFromDb,
  getAbandonedCartsFromDb,
  getVisitsFromDb,
  getCustomersFromDb
} from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products, categories, coupons, orders, abandonedCarts, visits, customers] = await Promise.all([
      getProductsFromDb(),
      getCategoriesFromDb(),
      getCouponsFromDb(),
      getOrdersFromDb(),
      getAbandonedCartsFromDb(),
      getVisitsFromDb(),
      getCustomersFromDb()
    ]);

    return NextResponse.json({
      products,
      orders,
      coupons,
      abandonedCarts,
      visits,
      categories,
      customers
    });
  } catch (error) {
    console.error("[API] Erro ao buscar dados consolidados do admin:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do admin" }, { status: 500 });
  }
}
