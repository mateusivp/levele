import { Order, Product, Coupon, AbandonedCart } from "@/types";
import { products } from "@/data/products";
import pool from "./db_connection";

// Singleton para o banco de dados em memória (Fallback)
const globalForDb = global as unknown as {
  dbOrders: Order[] | undefined;
  dbProducts: Product[] | undefined;
  dbCoupons: Coupon[] | undefined;
  dbAbandonedCarts: AbandonedCart[] | undefined;
  dbVisits: number | undefined;
};

// Funções para lidar com Vercel Postgres
export async function getProductsFromDb(): Promise<Product[]> {
  if (!pool) {
    console.warn("Conexão com Postgres não configurada para busca de produtos. Retornando dados em memória.");
    return dbProducts;
  }
  
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    
    const dbRows = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      image: row.image,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
      videoUrl: row.video_url,
      slug: row.slug,
      category: row.category,
      active: row.active === 1 || row.active === true,
      seo: {
        title: row.seo_title || "",
        description: row.seo_description || "",
        keywords: row.name ? row.name.split(" ").map((k: any) => k.toLowerCase()) : [],
      },
      upsellProductId: row.upsell_product_id,
      orderBumpId: row.order_bump_id,
      variations: typeof row.variations === 'string' ? JSON.parse(row.variations) : (row.variations || []),
      postPurchaseUpsell: typeof row.post_purchase_upsell === 'string' ? JSON.parse(row.post_purchase_upsell) : (row.post_purchase_upsell || null),
    }));

    // Retornamos os produtos do banco combinados com os produtos em memória
    // Priorizamos o que está em memória para refletir alterações recentes da sessão
    const dbProductMap = new Map();
    
    // Adicionamos primeiro o que veio do banco de dados real
    dbRows.forEach(p => {
      dbProductMap.set(p.id, p);
    });

    // Sobrescrevemos com o que está em memória (prioridade para alterações da sessão atual)
    dbProducts.forEach(p => {
      dbProductMap.set(p.id, p);
    });
    
    return Array.from(dbProductMap.values());
  } catch (error) {
    console.error("Erro ao buscar produtos do Postgres:", error);
    return dbProducts;
  }
}

export async function saveProductToDb(product: Product) {
  if (!pool) {
    console.warn("Conexão com Postgres não configurada para salvar produto.");
    return;
  }

  try {
    await pool.query(
      `INSERT INTO products (id, name, description, price, image, images, video_url, slug, category, active, seo_title, seo_description, upsell_product_id, order_bump_id, variations, post_purchase_upsell)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (id) DO UPDATE SET 
       name=EXCLUDED.name, description=EXCLUDED.description, price=EXCLUDED.price, image=EXCLUDED.image, 
       images=EXCLUDED.images, video_url=EXCLUDED.video_url, slug=EXCLUDED.slug, category=EXCLUDED.category, 
       active=EXCLUDED.active, seo_title=EXCLUDED.seo_title, seo_description=EXCLUDED.seo_description,
       upsell_product_id=EXCLUDED.upsell_product_id, order_bump_id=EXCLUDED.order_bump_id,
       variations=EXCLUDED.variations, post_purchase_upsell=EXCLUDED.post_purchase_upsell`,
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.image,
        JSON.stringify(product.images || []),
        product.videoUrl,
        product.slug,
        product.category,
        product.active,
        product.seo.title,
        product.seo.description,
        product.upsellProductId,
        product.orderBumpId,
        JSON.stringify(product.variations || []),
        JSON.stringify(product.postPurchaseUpsell || null)
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar produto no Postgres:", error);
    throw error; // Re-lança o erro para a API tratar
  }
}

export const dbOrders = globalForDb.dbOrders ?? [];
export const dbAbandonedCarts = globalForDb.dbAbandonedCarts ?? [];
export const dbVisits = globalForDb.dbVisits ?? 0;
export const dbProducts: Product[] = globalForDb.dbProducts ?? products.map((product, pIdx) => ({
  ...product,
  active: true,
  reviews: [
    {
      id: `${pIdx + 1}-1`,
      userName: "Ricardo S.",
      rating: 5,
      date: new Date(Date.now() - 172800000).toISOString(),
      comment: "Simplesmente fantástico! O produto superou todas as minhas expectativas. A entrega foi super rápida e o atendimento excelente.",
      status: 'aprovada'
    },
    {
      id: `${pIdx + 1}-2`,
      userName: "Mariana Costa",
      rating: 5,
      date: new Date(Date.now() - 604800000).toISOString(),
      comment: "Excelente custo-benefício. Recomendo muito para quem busca qualidade e confiança. O pague na entrega facilita demais a vida!",
      status: 'aprovada'
    },
    {
      id: `${pIdx + 1}-3`,
      userName: "Felipe Almeida",
      rating: 4,
      date: new Date(Date.now() - 1209600000).toISOString(),
      comment: "Produto de ótima qualidade. Chegou dentro do prazo e bem embalado. Recomendo.",
      status: 'aprovada'
    }
  ] as Product['reviews']
}));

if (!globalForDb.dbProducts) {
  globalForDb.dbProducts = dbProducts;
}

// Cupons iniciais
export const dbCoupons = globalForDb.dbCoupons ?? [
  { code: "LEVELE10", discountType: "percentage", value: 10 },
  { code: "BEMVINDO", discountType: "fixed", value: 20 }
];

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbOrders = dbOrders;
  globalForDb.dbProducts = dbProducts;
  globalForDb.dbCoupons = dbCoupons;
  globalForDb.dbAbandonedCarts = dbAbandonedCarts;
  globalForDb.dbVisits = dbVisits;
}

export function incrementVisits() {
  const current = globalForDb.dbVisits ?? 0;
  globalForDb.dbVisits = current + 1;
  return globalForDb.dbVisits;
}
