import { Product } from "@/types";
import { slugify } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/seo";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProducts(): Promise<Product[]> {
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products`;
  try {
    const res = await fetch(apiUrl, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("[CategoryPage] Erro:", error);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  
  // Encontrar a categoria original baseada no slug
  const categoryName = products.find(p => slugify(p.category) === slug)?.category;

  if (!categoryName) {
    return constructMetadata({
      title: "Categoria não encontrada",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `Produtos em ${categoryName}`,
    description: `Confira nossa seleção de ${categoryName} com pagamento na entrega e envio rápido.`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const products = await getProducts();
  
  // Filtrar produtos pela categoria
  const filteredProducts = products.filter(p => slugify(p.category) === slug);
  
  if (filteredProducts.length === 0) {
    notFound();
  }

  const categoryName = filteredProducts[0].category;

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <a href="/" className="hover:text-primary transition-colors">Início</a>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {categoryName}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Mostrando todos os produtos da categoria {categoryName}. 
          Qualidade garantida com a conveniência do pagamento na entrega.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}
