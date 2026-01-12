import { Order, Product, Coupon, AbandonedCart, Category } from "@/types";
import { products } from "@/data/products";
import pool from "./db_connection";

// Singleton para o banco de dados em memória (Fallback)
const globalForDb = global as unknown as {
  dbOrders: Order[] | undefined;
  dbProducts: Product[] | undefined;
  dbCoupons: Coupon[] | undefined;
  dbAbandonedCarts: AbandonedCart[] | undefined;
  dbCategories: Category[] | undefined;
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
      orderBumpIds: (() => {
        try {
          return typeof row.order_bump_ids === 'string' ? JSON.parse(row.order_bump_ids) : (row.order_bump_ids || []);
        } catch (e) {
          console.error("Erro ao processar order_bump_ids:", e);
          return [];
        }
      })(),
      variations: typeof row.variations === 'string' ? JSON.parse(row.variations) : (row.variations || []),
      postPurchaseUpsell: typeof row.post_purchase_upsell === 'string' ? JSON.parse(row.post_purchase_upsell) : (row.post_purchase_upsell || null),
    }));

    // Retornamos os produtos do banco combinados com os produtos em memória
    // Priorizamos o que está no banco de dados. Só usamos a memória se o banco falhar ou estiver vazio.
    const dbProductMap = new Map();
    
    // Adicionamos primeiro o que está em memória (estáticos + novos da sessão)
    dbProducts.forEach(p => {
      dbProductMap.set(p.id, p);
    });

    // Sobrescrevemos com o que veio do banco de dados real (que é a fonte da verdade)
    dbRows.forEach(p => {
      dbProductMap.set(p.id, p);
    });
    
    const allProducts = Array.from(dbProductMap.values());
    console.log(`[DB] IDs carregados do Banco: ${dbRows.map(p => p.id).join(', ')}`);
    console.log(`[DB] Total de produtos carregados: ${allProducts.length} (Banco: ${dbRows.length}, Memória: ${dbProducts.length})`);
    return allProducts;
  } catch (error) {
    console.error("Erro ao buscar produtos do Postgres:", error);
    return dbProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!pool) {
    return dbProducts.find(p => p.slug === slug) || null;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    if (rows.length === 0) {
      // Tentar na memória se não achar no banco (pode ser um produto estático)
      return dbProducts.find(p => p.slug === slug) || null;
    }

    const row = rows[0];
    return {
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
      orderBumpIds: (() => {
        try {
          return typeof row.order_bump_ids === 'string' ? JSON.parse(row.order_bump_ids) : (row.order_bump_ids || []);
        } catch (e) {
          console.error("Erro ao processar order_bump_ids:", e);
          return [];
        }
      })(),
      variations: typeof row.variations === 'string' ? JSON.parse(row.variations) : (row.variations || []),
      postPurchaseUpsell: typeof row.post_purchase_upsell === 'string' ? JSON.parse(row.post_purchase_upsell) : (row.post_purchase_upsell || null),
    };
  } catch (error) {
    console.error("Erro ao buscar produto por slug no Postgres:", error);
    return dbProducts.find(p => p.slug === slug) || null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!pool) {
    return dbProducts.find(p => p.id === id) || null;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
      return dbProducts.find(p => p.id === id) || null;
    }

    const row = rows[0];
    return {
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
      orderBumpIds: (() => {
        try {
          return typeof row.order_bump_ids === 'string' ? JSON.parse(row.order_bump_ids) : (row.order_bump_ids || []);
        } catch (e) {
          console.error("Erro ao processar order_bump_ids:", e);
          return [];
        }
      })(),
      variations: typeof row.variations === 'string' ? JSON.parse(row.variations) : (row.variations || []),
      postPurchaseUpsell: typeof row.post_purchase_upsell === 'string' ? JSON.parse(row.post_purchase_upsell) : (row.post_purchase_upsell || null),
    };
  } catch (error) {
    console.error("Erro ao buscar produto por ID no Postgres:", error);
    return dbProducts.find(p => p.id === id) || null;
  }
}

export async function saveProductToDb(product: Product) {
  if (!pool) {
    console.warn("Conexão com Postgres não configurada para salvar produto.");
    return;
  }

  try {
    await pool.query(
      `INSERT INTO products (id, name, description, price, image, images, video_url, slug, category, active, seo_title, seo_description, upsell_product_id, order_bump_id, order_bump_ids, variations, post_purchase_upsell)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET 
       name=EXCLUDED.name, description=EXCLUDED.description, price=EXCLUDED.price, image=EXCLUDED.image, 
       images=EXCLUDED.images, video_url=EXCLUDED.video_url, slug=EXCLUDED.slug, category=EXCLUDED.category, 
       active=EXCLUDED.active, seo_title=EXCLUDED.seo_title, seo_description=EXCLUDED.seo_description,
       upsell_product_id=EXCLUDED.upsell_product_id, order_bump_id=EXCLUDED.order_bump_id, order_bump_ids=EXCLUDED.order_bump_ids,
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
        JSON.stringify(product.orderBumpIds || []),
        JSON.stringify(product.variations || []),
        JSON.stringify(product.postPurchaseUpsell || null)
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar produto no Postgres:", error);
    throw error; // Re-lança o erro para a API tratar
  }
}

export async function getCategoriesFromDb(): Promise<Category[]> {
  const categoriesMap = new Map<string, Category>();

  // 1. Carregar do banco primeiro se disponível (Fonte da verdade persistente)
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
      rows.forEach((cat: Category) => {
        categoriesMap.set(cat.id, cat);
      });
      console.log(`[DB] ${rows.length} categorias carregadas do Postgres`);
    } catch (error) {
      console.error("Erro ao buscar categorias do Postgres:", error);
    }
  }

  // 2. Aplicar categorias da memória por cima (Fonte da verdade da sessão/hot-reload)
  const currentCategories = globalForDb.dbCategories || dbCategories;
  currentCategories.forEach(cat => {
    categoriesMap.set(cat.id, cat);
  });
  console.log(`[DB] Memória mesclada: ${currentCategories.length} categorias na memória`);

  // 3. Extrair categorias dos produtos (Apenas se ainda não existirem no Map)
  try {
    const products = await getProductsFromDb();
    products.forEach(p => {
      if (p.category) {
        const slug = slugify(p.category);
        
        // Verifica se já existe por NOME ou SLUG (ignorando case)
        const alreadyExists = Array.from(categoriesMap.values()).some(
          c => c.slug === slug || c.name.toLowerCase() === p.category?.toLowerCase()
        );

        if (!alreadyExists) {
          console.log(`[DB] Detectada categoria automática: ${p.category}`);
          categoriesMap.set(`auto-${slug}`, {
            id: `auto-${slug}`,
            name: p.category,
            slug: slug,
            description: `Categoria detectada automaticamente de produtos`
          });
        }
      }
    });
  } catch (error) {
    console.error("Erro ao extrair categorias dos produtos:", error);
  }

  // 4. Converter para array e desduplicar por nome (Garante que "Acessórios" e "acessórios" não coexistam)
  const finalCategories: Category[] = [];
  const namesSeen = new Set<string>();

  // Ordena para que categorias reais (sem "auto-") venham antes e ganhem a preferência no Set
  const sortedCategories = Array.from(categoriesMap.values()).sort((a, b) => {
    const aIsAuto = a.id.startsWith('auto-');
    const bIsAuto = b.id.startsWith('auto-');
    if (aIsAuto && !bIsAuto) return 1;
    if (!aIsAuto && bIsAuto) return -1;
    return a.name.localeCompare(b.name);
  });

  sortedCategories.forEach(cat => {
    const normalizedName = cat.name.toLowerCase().trim();
    if (!namesSeen.has(normalizedName)) {
      namesSeen.add(normalizedName);
      finalCategories.push(cat);
    }
  });

  return finalCategories;
}

// Helper para slugify no backend se não estiver disponível
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function saveCategoryToDb(category: Category) {
  console.log("Tentando salvar categoria:", category);
  
  // SEMPRE usa a referência global para garantir consistência entre chamadas
  if (!globalForDb.dbCategories) {
    globalForDb.dbCategories = [...dbCategories];
  }
  const categories = globalForDb.dbCategories;

  // Captura o nome antigo para atualizar produtos depois
  let oldCategoryName = "";
  const index = categories.findIndex(c => c.id === category.id);
  
  if (index >= 0) {
    oldCategoryName = categories[index].name;
    console.log(`Atualizando categoria existente no index ${index} (ID: ${category.id})`);
    categories[index] = { ...category }; // Cria cópia para evitar problemas de referência
  } else {
    // Se não achou por ID, tenta por slug (promoção de auto- para real)
    const slugIndex = categories.findIndex(c => c.slug === category.slug);
    if (slugIndex >= 0) {
      oldCategoryName = categories[slugIndex].name;
      console.log(`Atualizando categoria via slug no index ${slugIndex} (Slug: ${category.slug})`);
      categories[slugIndex] = { ...category };
    } else {
      console.log("Adicionando nova categoria à memória");
      categories.push({ ...category });
    }
  }

  // Garante que a memória global está atualizada
  globalForDb.dbCategories = [...categories];

  // Atualiza produtos em memória se o nome mudou
  if (oldCategoryName && oldCategoryName !== category.name) {
    try {
      const products = await getProductsFromDb();
      let updatedCount = 0;
      products.forEach(p => {
        if (p.category === oldCategoryName) {
          p.category = category.name;
          updatedCount++;
        }
      });
      if (updatedCount > 0) {
        globalForDb.dbProducts = products;
        console.log(`Atualizados ${updatedCount} produtos em memória: ${oldCategoryName} -> ${category.name}`);
      }
    } catch (e) {
      console.error("Erro ao atualizar categorias nos produtos em memória:", e);
    }
  }

  if (!pool) {
    console.log("Postgres não disponível, salvo apenas em memória");
    return;
  }
  try {
    // Tenta inserir, se houver conflito de ID ou SLUG, atualiza
    // Nota: Para usar ON CONFLICT em múltiplos campos, precisamos de restrições de unicidade no banco.
    // Como não temos certeza das restrições, vamos tentar um UPSERT manual mais robusto.
    
    const { rows } = await pool.query('SELECT id FROM categories WHERE id = $1 OR slug = $2', [category.id, category.slug]);
    
    if (rows.length > 0) {
      // Existe, vamos atualizar pelo ID encontrado
      const existingId = rows[0].id;
      await pool.query(
        `UPDATE categories SET name=$1, slug=$2, description=$3 WHERE id=$4`,
        [category.name, category.slug, category.description, existingId]
      );
      console.log(`Categoria atualizada no Postgres (ID: ${existingId})`);
    } else {
      // Não existe, insere
      await pool.query(
        `INSERT INTO categories (id, name, slug, description) VALUES ($1, $2, $3, $4)`,
        [category.id, category.name, category.slug, category.description]
      );
      console.log(`Categoria inserida no Postgres (ID: ${category.id})`);
    }
  } catch (error) {
    console.error("Erro ao salvar categoria no Postgres:", error);
  }

  // Se o nome mudou, atualiza os produtos no banco também
  if (oldCategoryName && oldCategoryName !== category.name && pool) {
    try {
      const result = await pool.query(
        'UPDATE products SET category = $1 WHERE category = $2',
        [category.name, oldCategoryName]
      );
      console.log(`Produtos atualizados no Postgres: ${oldCategoryName} -> ${category.name}. Linhas afetadas: ${result.rowCount}`);
    } catch (error) {
      console.error("Erro ao atualizar categoria nos produtos no Postgres:", error);
    }
  }

  return;
}

export async function deleteCategoryFromDb(id: string) {
  console.log(`Iniciando exclusão da categoria ID: ${id}`);
  
  // Garante que dbCategories aponta para a referência global correta
  if (!globalForDb.dbCategories) {
    globalForDb.dbCategories = [...dbCategories];
  }
  const categories = globalForDb.dbCategories;
  
  // 1. Localizar a categoria para pegar o nome antes de deletar
  const index = categories.findIndex(c => c.id === id);
  let categoryName = "";
  
  if (index >= 0) {
    categoryName = categories[index].name;
    console.log(`Categoria encontrada na memória: ${categoryName}`);
    categories.splice(index, 1);
  } else if (id.startsWith('auto-')) {
    // Se for automática, o nome geralmente está no ID após o prefixo ou podemos inferir
    categoryName = id.replace('auto-', '');
    console.log(`Tentando excluir categoria automática: ${categoryName}`);
  }
  
  // Atualiza a referência global da memória imediatamente
  globalForDb.dbCategories = [...categories];

  // 2. LIMPEZA CRUCIAL: Remover esta categoria de TODOS os produtos
  // Se não fizermos isso, a categoria "auto-" voltará no próximo refresh
  if (categoryName) {
    try {
      const products = await getProductsFromDb();
      let updatedProductsCount = 0;
      
      products.forEach(p => {
        // Comparação insensível a maiúsculas/minúsculas para garantir limpeza total
        if (p.category && (
            p.category.toLowerCase() === categoryName.toLowerCase() || 
            slugify(p.category) === slugify(categoryName)
        )) {
          p.category = "";
          updatedProductsCount++;
        }
      });
      
      if (updatedProductsCount > 0) {
        console.log(`Limpando categoria de ${updatedProductsCount} produtos para evitar recriação automática.`);
        globalForDb.dbProducts = [...products];
        
        if (pool) {
          // No Postgres, limpamos por nome (case-insensitive)
          await pool.query('UPDATE products SET category = NULL WHERE LOWER(category) = LOWER($1)', [categoryName]);
        }
      }
    } catch (e) {
      console.error("Erro ao limpar categorias dos produtos durante exclusão:", e);
    }
  }

  // 3. Remover do Banco de Dados
  if (pool) {
    try {
      await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      console.log(`Categoria ${id} removida do Postgres.`);
    } catch (error) {
      console.error("Erro ao deletar categoria no Postgres:", error);
      // Não lançamos erro aqui se for apenas uma categoria que já não existia no banco
    }
  }
}

export const dbOrders: Order[] = globalForDb.dbOrders ?? [];
if (!globalForDb.dbOrders) {
  globalForDb.dbOrders = dbOrders;
}
export const dbCategories: Category[] = globalForDb.dbCategories ?? [
  // Deixando vazio ou com o mínimo para ser preenchido pelo banco/produtos
  // "Acessórios" e outras virão do banco ou serão detectadas automaticamente
];

if (!globalForDb.dbCategories) {
  globalForDb.dbCategories = dbCategories;
}
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
      date: "2024-05-15T10:00:00.000Z",
      comment: "Simplesmente fantástico! O produto superou todas as minhas expectativas. A entrega foi super rápida e o atendimento excelente.",
      status: 'aprovada'
    },
    {
      id: `${pIdx + 1}-2`,
      userName: "Mariana Costa",
      rating: 5,
      date: "2024-05-10T14:30:00.000Z",
      comment: "Excelente custo-benefício. Recomendo muito para quem busca qualidade e confiança. O pague na entrega facilita demais a vida!",
      status: 'aprovada'
    },
    {
      id: `${pIdx + 1}-3`,
      userName: "Felipe Almeida",
      rating: 4,
      date: "2024-05-05T09:15:00.000Z",
      comment: "Produto de ótima qualidade. Chegou dentro do prazo e bem embalado. Recomendo.",
      status: 'aprovada'
    }
  ] as Product['reviews']
}));

if (!globalForDb.dbProducts) {
  globalForDb.dbProducts = dbProducts;
}

export const dbCoupons: Coupon[] = globalForDb.dbCoupons ?? [];

if (!globalForDb.dbCoupons) {
  globalForDb.dbCoupons = dbCoupons;
}

export async function getCouponsFromDb(): Promise<Coupon[]> {
  if (!pool) {
    return globalForDb.dbCoupons || [];
  }

  try {
    const { rows } = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    const coupons = rows.map(row => ({
      code: row.code,
      discountType: row.discounttype as 'percentage' | 'fixed',
      value: Number(row.value),
      minPurchase: Number(row.minpurchase || 0)
    }));

    // Sincroniza memória global
    globalForDb.dbCoupons = coupons;
    return coupons;
  } catch (error) {
    console.error("Erro ao buscar cupons do Postgres:", error);
    return globalForDb.dbCoupons || [];
  }
}

export async function saveCouponToDb(coupon: Coupon) {
  // Atualiza memória
  const coupons = globalForDb.dbCoupons || [];
  const index = coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
  
  const normalizedCoupon = {
    ...coupon,
    code: coupon.code.toUpperCase()
  };

  if (index >= 0) {
    coupons[index] = normalizedCoupon;
  } else {
    coupons.push(normalizedCoupon);
  }
  globalForDb.dbCoupons = coupons;

  if (!pool) return;

  try {
    await pool.query(
      `INSERT INTO coupons (code, discounttype, value, minpurchase)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET 
       discounttype=EXCLUDED.discounttype, value=EXCLUDED.value, minpurchase=EXCLUDED.minpurchase`,
      [
        normalizedCoupon.code,
        normalizedCoupon.discountType,
        normalizedCoupon.value,
        normalizedCoupon.minPurchase || 0
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar cupom no Postgres:", error);
    throw error;
  }
}

export async function deleteCouponFromDb(code: string) {
  // Atualiza memória
  const coupons = globalForDb.dbCoupons || [];
  globalForDb.dbCoupons = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());

  if (!pool) return;

  try {
    await pool.query('DELETE FROM coupons WHERE code = $1', [code.toUpperCase()]);
  } catch (error) {
    console.error("Erro ao deletar cupom no Postgres:", error);
    throw error;
  }
}

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
