import Link from "next/link";
import { getProductsFromDb } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { ChevronRight, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Categorias | Levele",
  description: "Explore nossos produtos por categoria. Qualidade e pagamento na entrega.",
};

export default async function CategoriesPage() {
  const products = await getProductsFromDb();
  
  // Extrair categorias únicas
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Nossas Categorias</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            key={category}
            href={`/categoria/${slugify(category)}`}
            className="group bg-card border rounded-2xl p-8 hover:shadow-xl transition-all hover:border-primary/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{category}</h2>
                <p className="text-sm text-muted-foreground">
                  {products.filter(p => p.category === category).length} produtos
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground italic">Nenhuma categoria encontrada no momento.</p>
        </div>
      )}
    </div>
  );
}
