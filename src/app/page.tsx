import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

async function getProducts(): Promise<Product[]> {
  const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products`;
  try {
    console.log(`[getProducts] Buscando todos os produtos em ${apiUrl}`);
    const res = await fetch(apiUrl, {
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      console.error(`[getProducts] Erro na resposta da API: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    console.log(`[getProducts] ${data.length} produtos encontrados`);
    return data;
  } catch (error) {
    console.error("[getProducts] Erro ao buscar produtos na Home:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Qualidade que você confia,<br />
          <span className="text-primary">pagamento na entrega.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore nossa seleção exclusiva de produtos e pague apenas quando receber em sua casa. 
          Segurança total para suas compras online.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <section className="mt-20 bg-muted/30 rounded-3xl p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <h3 className="font-bold mb-2">Pagamento na Entrega</h3>
            <p className="text-sm text-muted-foreground">Pague apenas quando o produto chegar em suas mãos.</p>
          </div>
          <div>
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <h3 className="font-bold mb-2">Entrega Rápida</h3>
            <p className="text-sm text-muted-foreground">Logística eficiente para você receber seu pedido o quanto antes.</p>
          </div>
          <div>
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <h3 className="font-bold mb-2">Compra Segura</h3>
            <p className="text-sm text-muted-foreground">Seus dados estão protegidos em todo o processo.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
