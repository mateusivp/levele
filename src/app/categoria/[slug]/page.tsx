import { getProductsFromDb } from "@/lib/db";
import { slugify } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/seo";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const products = await getProductsFromDb();
  
  const categoryName = products.find(p => slugify(p.category) === slug)?.category;
  
  if (!categoryName) return constructMetadata();

  return constructMetadata({
    title: `${categoryName} | Levele`,
    description: `Confira os melhores produtos da categoria ${categoryName}. Pagamento na entrega e qualidade garantida na Levele.`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const allProducts = await getProductsFromDb();
  
  const categoryName = allProducts.find(p => slugify(p.category) === slug)?.category;
  
  if (!categoryName) {
    notFound();
  }

  const filteredProducts = allProducts.filter(p => p.category === categoryName);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
          {categoryName}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Encontre os melhores itens de {categoryName} com preços exclusivos e a facilidade do pagamento na entrega.
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground italic">Nenhum produto encontrado nesta categoria.</p>
        </div>
      )}

      {/* Seção de Conteúdo SEO para o Google */}
      <section className="mt-20 border-t pt-16">
        <div className="max-w-3xl mx-auto prose prose-slate">
          <h2 className="text-3xl font-bold mb-6">Por que comprar {categoryName} na Levele?</h2>
          <p className="mb-4">
            Na Levele, selecionamos cuidadosamente cada item da nossa categoria de <strong>{categoryName}</strong> para garantir que você receba apenas o melhor em sua casa. 
            Nosso compromisso é com a sua satisfação e segurança.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Pagamento na Entrega:</strong> Só pague quando o produto chegar em suas mãos.</li>
            <li><strong>Qualidade Garantida:</strong> Todos os produtos passam por uma curadoria rigorosa.</li>
            <li><strong>Suporte Dedicado:</strong> Estamos sempre prontos para tirar suas dúvidas via WhatsApp.</li>
            <li><strong>Entrega Rápida:</strong> Logística otimizada para sua região.</li>
          </ul>
          <p>
            Explore nossa coleção completa de {categoryName.toLowerCase()} e descubra por que milhares de clientes confiam na Levele para suas compras online.
          </p>
        </div>
      </section>
    </div>
  );
}
