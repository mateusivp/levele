import { Order, Product, Coupon, AbandonedCart, Category, Customer } from "@/types";
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

// Inicialização segura das variáveis globais no Singleton
if (!globalForDb.dbProducts) {
  globalForDb.dbProducts = products.map((product, pIdx) => ({
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
}
if (!globalForDb.dbOrders) globalForDb.dbOrders = [];
if (!globalForDb.dbCoupons) globalForDb.dbCoupons = [];
if (!globalForDb.dbAbandonedCarts) globalForDb.dbAbandonedCarts = [];
if (!globalForDb.dbCategories) globalForDb.dbCategories = [];
if (globalForDb.dbVisits === undefined) globalForDb.dbVisits = 0;

// Atalhos para acesso interno (sempre usam o valor atual do Singleton)
const getDbProducts = () => globalForDb.dbProducts || products;
const getDbOrders = () => globalForDb.dbOrders || [];
const getDbCategories = () => globalForDb.dbCategories || [];
const getDbCoupons = () => globalForDb.dbCoupons || [];
const getDbAbandonedCarts = () => globalForDb.dbAbandonedCarts || [];

// Funções para lidar com Vercel Postgres
export async function getProductsFromDb(): Promise<Product[]> {
  const currentDbProducts = getDbProducts();
  if (!pool) {
    console.warn("Conexão com Postgres não configurada para busca de produtos. Retornando dados em memória.");
    return currentDbProducts;
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
      reviews: typeof row.reviews === 'string' ? JSON.parse(row.reviews) : (row.reviews || []),
    }));

    // Retornamos os produtos do banco combinados com os produtos em memória
    // Priorizamos o que está no banco de dados. Só usamos a memória se o banco falhar ou estiver vazio.
    const dbProductMap = new Map();
    
    // Adicionamos primeiro o que está em memória (estáticos + novos da sessão)
    currentDbProducts.forEach(p => {
      dbProductMap.set(p.id, p);
    });

    // Sobrescrevemos com o que veio do banco de dados real (que é a fonte da verdade)
    dbRows.forEach(p => {
      dbProductMap.set(p.id, p);
    });
    
    const allProducts = Array.from(dbProductMap.values());
    console.log(`[DB] IDs carregados do Banco: ${dbRows.map(p => p.id).join(', ')}`);
    console.log(`[DB] Total de produtos carregados: ${allProducts.length} (Banco: ${dbRows.length}, Memória: ${currentDbProducts.length})`);
    
    // Sincroniza memória global
    globalForDb.dbProducts = allProducts;
    
    return allProducts;
  } catch (error) {
    console.error("Erro ao buscar produtos do Postgres:", error);
    return currentDbProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const currentDbProducts = getDbProducts();
  if (!pool) {
    return currentDbProducts.find(p => p.slug === slug) || null;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);
    if (rows.length === 0) {
      // Tentar na memória se não achar no banco (pode ser um produto estático)
      return currentDbProducts.find(p => p.slug === slug) || null;
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
    return currentDbProducts.find(p => p.slug === slug) || null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const currentDbProducts = getDbProducts();
  if (!pool) {
    return currentDbProducts.find(p => p.id === id) || null;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
      return currentDbProducts.find(p => p.id === id) || null;
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
    return currentDbProducts.find(p => p.id === id) || null;
  }
}

export async function saveProductToDb(product: Product) {
  // Atualiza a memória
  if (globalForDb.dbProducts) {
    const index = globalForDb.dbProducts.findIndex(p => p.id === product.id);
    if (index >= 0) {
      globalForDb.dbProducts[index] = product;
    } else {
      globalForDb.dbProducts.push(product);
    }
  } else {
    globalForDb.dbProducts = [product];
  }

  if (!pool) {
    console.warn("Conexão com Postgres não configurada para salvar produto.");
    return;
  }

  try {
    await pool.query(
      `INSERT INTO products (id, name, description, price, image, images, video_url, slug, category, active, seo_title, seo_description, upsell_product_id, order_bump_id, order_bump_ids, variations, post_purchase_upsell, reviews)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO UPDATE SET 
       name=EXCLUDED.name, description=EXCLUDED.description, price=EXCLUDED.price, image=EXCLUDED.image, 
       images=EXCLUDED.images, video_url=EXCLUDED.video_url, slug=EXCLUDED.slug, category=EXCLUDED.category, 
       active=EXCLUDED.active, seo_title=EXCLUDED.seo_title, seo_description=EXCLUDED.seo_description,
       upsell_product_id=EXCLUDED.upsell_product_id, order_bump_id=EXCLUDED.order_bump_id, order_bump_ids=EXCLUDED.order_bump_ids,
       variations=EXCLUDED.variations, post_purchase_upsell=EXCLUDED.post_purchase_upsell, reviews=EXCLUDED.reviews`,
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
        JSON.stringify(product.postPurchaseUpsell || null),
        JSON.stringify(product.reviews || [])
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar produto no Postgres:", error);
    throw error; // Re-lança o erro para a API tratar
  }
}

export async function deleteProductFromDb(id: string) {
  if (globalForDb.dbProducts) {
    globalForDb.dbProducts = globalForDb.dbProducts.filter(p => p.id !== id);
  }

  if (!pool) return;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    console.log(`[DB] Produto ${id} deletado do Postgres`);
  } catch (error) {
    console.error("Erro ao deletar produto no Postgres:", error);
    throw error;
  }
}

export async function getOrdersFromDb(): Promise<Order[]> {
  if (!pool) return globalForDb.dbOrders || [];
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = rows.map(row => ({
      id: row.id,
      customer: typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      total: Number(row.total),
      status: row.status,
      createdAt: row.created_at,
      statusHistory: typeof row.status_history === 'string' ? JSON.parse(row.status_history) : (row.status_history || []),
      deliveryDate: row.delivery_date,
      discount: typeof row.discount === 'string' ? JSON.parse(row.discount) : row.discount,
    }));
    
    // Sincroniza memória
    globalForDb.dbOrders = orders;
    return orders;
  } catch (error) {
    console.error("Erro ao buscar pedidos do Postgres:", error);
    return globalForDb.dbOrders || [];
  }
}

export async function saveOrderToDb(order: Order) {
  const orders = globalForDb.dbOrders || [];
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
  globalForDb.dbOrders = orders;

  if (!pool) return;
  try {
    // Salvar o pedido
    await pool.query(
      `INSERT INTO orders (id, customer, items, total, status, created_at, status_history, delivery_date, discount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET 
       customer=EXCLUDED.customer, items=EXCLUDED.items, total=EXCLUDED.total, 
       status=EXCLUDED.status, status_history=EXCLUDED.status_history, 
       delivery_date=EXCLUDED.delivery_date, discount=EXCLUDED.discount`,
      [
        order.id,
        JSON.stringify(order.customer),
        JSON.stringify(order.items),
        order.total,
        order.status,
        order.createdAt,
        JSON.stringify(order.statusHistory || []),
        order.deliveryDate,
        JSON.stringify(order.discount || null)
      ]
    );

    // Salvar ou atualizar o cliente
    if (order.customer && order.customer.phone) {
      await pool.query(
        `INSERT INTO customers (id, name, email, phone, cashback, points)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (phone) DO UPDATE SET 
         name=EXCLUDED.name, email=EXCLUDED.email, 
         cashback = customers.cashback + EXCLUDED.cashback,
         points = customers.points + EXCLUDED.points`,
        [
          `cust-${Math.random().toString(36).substr(2, 9)}`,
          order.customer.name,
          order.customer.email || "",
          order.customer.phone,
          (order.total * 0.05), // 5% de cashback por padrão
          Math.floor(order.total) // 1 ponto por real
        ]
      );
    }
  } catch (error) {
    console.error("Erro ao salvar pedido e cliente no Postgres:", error);
  }
}

export async function getCustomerByPhone(phone: string) {
  if (!pool) return null;
  try {
    const { rows } = await pool.query('SELECT * FROM customers WHERE phone = $1', [phone]);
    return rows[0] || null;
  } catch (error) {
    console.error("Erro ao buscar cliente por telefone no Postgres:", error);
    return null;
  }
}

export async function updateCustomerPassword(phone: string, password: string) {
  if (!pool) return;
  try {
    await pool.query('UPDATE customers SET password = $1 WHERE phone = $2', [password, phone]);
  } catch (error) {
    console.error("Erro ao atualizar senha do cliente no Postgres:", error);
    throw error;
  }
}

export async function updateCustomerInDb(phone: string, data: { name?: string, email?: string, addresses?: any[] }) {
  if (!pool) return;
  try {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.name) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${i++}`);
      values.push(data.email);
    }
    if (data.addresses !== undefined) {
      fields.push(`addresses = $${i++}`);
      values.push(JSON.stringify(data.addresses));
    }

    if (fields.length === 0) return;

    values.push(phone);
    await pool.query(`UPDATE customers SET ${fields.join(', ')}, updated_at = NOW() WHERE phone = $${i}`, values);
  } catch (error) {
    console.error("Erro ao atualizar cliente no Postgres:", error);
    throw error;
  }
}

export async function getCustomersFromDb(): Promise<Customer[]> {
  if (!pool) return [];
  try {
    const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      password: row.password,
      cashback: Number(row.cashback),
      points: row.points,
      level: row.level,
      addresses: row.addresses || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error("Erro ao buscar clientes no Postgres:", error);
    return [];
  }
}

export async function saveCustomerToDb(customer: Customer) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO customers (id, name, email, phone, cashback, points, level, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (phone) DO UPDATE SET 
       name=EXCLUDED.name, email=EXCLUDED.email, 
       cashback=EXCLUDED.cashback, points=EXCLUDED.points, 
       level=EXCLUDED.level, password=EXCLUDED.password`,
      [
        customer.id,
        customer.name,
        customer.email || "",
        customer.phone,
        customer.cashback,
        customer.points,
        customer.level,
        customer.password || null
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar cliente no Postgres:", error);
    throw error;
  }
}

export async function deleteCustomerFromDb(id: string) {
  if (!pool) return;
  try {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  } catch (error) {
    console.error("Erro ao deletar cliente no Postgres:", error);
    throw error;
  }
}

export async function getVisitsFromDb(): Promise<number> {
  if (!pool) return globalForDb.dbVisits || 0;
  try {
    const { rows } = await pool.query("SELECT metric_value FROM analytics WHERE metric_name = 'visits'");
    return rows.length > 0 ? rows[0].metric_value : 0;
  } catch (error) {
    console.error("Erro ao buscar visitas do Postgres:", error);
    return globalForDb.dbVisits || 0;
  }
}

export async function incrementVisitsInDb() {
  globalForDb.dbVisits = (globalForDb.dbVisits || 0) + 1;
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO analytics (metric_name, metric_value) VALUES ('visits', 1)
       ON CONFLICT (metric_name) DO UPDATE SET metric_value = analytics.metric_value + 1`
    );
  } catch (error) {
    console.error("Erro ao incrementar visitas no Postgres:", error);
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
  const currentCategories = getDbCategories();
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

export const dbOrders: Order[] = globalForDb.dbOrders!;
export const dbCategories: Category[] = globalForDb.dbCategories!;
export const dbAbandonedCarts = globalForDb.dbAbandonedCarts!;
export const dbProducts: Product[] = globalForDb.dbProducts!;
export const dbCoupons: Coupon[] = globalForDb.dbCoupons!;
export const dbVisits: number = globalForDb.dbVisits!;

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

export async function getAbandonedCartsFromDb(): Promise<AbandonedCart[]> {
  if (!pool) {
    return globalForDb.dbAbandonedCarts || [];
  }

  try {
    const { rows } = await pool.query('SELECT * FROM abandoned_carts ORDER BY createdat DESC');
    const carts = rows.map(row => ({
      id: row.id,
      productId: row.productid,
      productName: row.productname,
      variationId: row.variationid,
      variationName: row.variationname,
      customer: {
        name: row.customer_name,
        phone: row.customer_phone
      },
      total: Number(row.total),
      status: row.status,
      createdAt: row.createdat
    }));

    globalForDb.dbAbandonedCarts = carts;
    return carts;
  } catch (error) {
    console.error("Erro ao buscar carrinhos abandonados do Postgres:", error);
    return globalForDb.dbAbandonedCarts || [];
  }
}

export async function saveAbandonedCartToDb(cart: AbandonedCart) {
  // Atualiza memória
  const carts = globalForDb.dbAbandonedCarts || [];
  const index = carts.findIndex(c => c.id === cart.id);
  
  if (index >= 0) {
    carts[index] = cart;
  } else {
    carts.push(cart);
  }
  globalForDb.dbAbandonedCarts = carts;

  if (!pool) return;

  try {
    await pool.query(
      `INSERT INTO abandoned_carts (id, productid, productname, variationid, variationname, customer_name, customer_phone, total, status, createdat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET 
       productid=EXCLUDED.productid, productname=EXCLUDED.productname, variationid=EXCLUDED.variationid, 
       variationname=EXCLUDED.variationname, customer_name=EXCLUDED.customer_name, customer_phone=EXCLUDED.customer_phone, 
       total=EXCLUDED.total, status=EXCLUDED.status, createdat=EXCLUDED.createdat`,
      [
        cart.id,
        cart.productId,
        cart.productName,
        cart.variationId,
        cart.variationName,
        cart.customer.name,
        cart.customer.phone,
        cart.total,
        cart.status,
        cart.createdAt
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar carrinho abandonado no Postgres:", error);
  }
}

export async function deleteAbandonedCartFromDb(id: string) {
  // Atualiza memória
  const carts = globalForDb.dbAbandonedCarts || [];
  globalForDb.dbAbandonedCarts = carts.filter(c => c.id !== id);

  if (!pool) return;

  try {
    await pool.query('DELETE FROM abandoned_carts WHERE id = $1', [id]);
  } catch (error) {
    console.error("Erro ao deletar carrinho abandonado no Postgres:", error);
  }
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbOrders = globalForDb.dbOrders || [];
  globalForDb.dbProducts = globalForDb.dbProducts || [];
  globalForDb.dbCoupons = globalForDb.dbCoupons || [];
  globalForDb.dbAbandonedCarts = globalForDb.dbAbandonedCarts || [];
  globalForDb.dbVisits = globalForDb.dbVisits || 0;
}
