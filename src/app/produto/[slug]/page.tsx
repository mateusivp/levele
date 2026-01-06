import { formatPrice, slugify } from "@/lib/utils";
import { constructMetadata } from "@/lib/seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Star, ChevronRight, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import ReviewSection from "@/components/ReviewSection";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ProductVariationsWrapper from "@/components/ProductVariationsWrapper";
import ProductGallery from "@/components/ProductGallery";
import { getProductsFromDb } from "@/lib/db";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper para buscar o produto diretamente do banco ou fallback
async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProductsFromDb();
  const product = products.find((p) => p.slug === slug);
  return product || null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return constructMetadata();

  return constructMetadata({
    title: product.seo.title,
    description: product.seo.description,
    image: product.image,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProductsFromDb();
  const upsellProduct = product?.upsellProductId ? allProducts.find(p => p.id === product.upsellProductId) : null;

  // Avaliações do produto
  const displayReviews = product.reviews || [];

  // Helper para formatar o link do vídeo para embed
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    
    return url;
  };

  const videoEmbedUrl = getEmbedUrl(product.videoUrl || "");

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://levele.com.br/produto/${product.slug}`,
      "priceCurrency": "BRL",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Levele"
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <AnalyticsTracker />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Imagem do Produto */}
        <ProductGallery 
          mainImage={product.image} 
          images={product.images} 
          name={product.name} 
        />

        {/* Detalhes do Produto */}
        <div className="flex flex-col">
          <nav className="flex mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Início</Link>
            <span className="mx-2">/</span>
            <Link 
              href={`/categoria/${slugify(product.category)}`}
              className="hover:text-primary transition-colors font-medium"
            >
              {product.category}
            </Link>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              Pagamento na Entrega
            </span>
          </div>

          <div className="text-muted-foreground leading-relaxed mb-8 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />

          {videoEmbedUrl && (
            <div className="mb-8 aspect-video rounded-2xl overflow-hidden border bg-black shadow-lg">
              <iframe
                src={videoEmbedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <ProductVariationsWrapper product={product} />

          <div className="space-y-4 mb-8">
          
          <p className="text-center text-xs text-muted-foreground">
            Compra 100% segura. Seus dados estão protegidos.
          </p>
          </div>
        </div>
      </div>

      {/* Upsell / Compre Junto Section */}
      {upsellProduct && (
        <section className="mt-16 bg-primary/5 rounded-3xl p-8 border border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <span className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-2 block">OFERTA ESPECIAL</span>
              <h2 className="text-3xl font-black mb-4">Compre Junto e Economize</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Adicione o <strong>{upsellProduct.name}</strong> ao seu pedido agora e aproveite esta oferta exclusiva.
              </p>
              
              <div className="flex items-center gap-4 md:gap-8">
                {/* Produto 1 */}
                <div className="relative group">
                  <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
                    <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                    Item 1
                  </div>
                </div>

                {/* Plus Sign */}
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-sm border text-primary">
                  <Plus className="h-6 w-6" />
                </div>

                {/* Produto 2 */}
                <div className="relative group">
                  <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md bg-white">
                    <Image src={upsellProduct.image} alt={upsellProduct.name} fill className="object-contain p-2" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                    Item 2
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-80">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{product.name}</span>
                    <span className="font-bold">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{upsellProduct.name}</span>
                    <span className="font-bold">{formatPrice(upsellProduct.price)}</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-bold text-lg text-primary">Total do Combo</span>
                    <span className="font-black text-2xl text-primary">{formatPrice(product.price + upsellProduct.price)}</span>
                  </div>
                </div>
                
                <Link
                  href={`/finalizar?product=${product.id}&upsell=${upsellProduct.id}`}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                >
                  <ShoppingCart className="h-6 w-6" />
                  LEVAR OS DOIS AGORA
                </Link>
                <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Pague somente ao receber em casa
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Avaliações do Produto */}
      <ReviewSection productId={product.id} initialReviews={product.reviews || []} />

      {/* Seção Adicional para SEO */}
      <section className="mt-20 border-t pt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Por que comprar na Levele?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-xl border">
            <h3 className="font-bold mb-2 text-primary">Zero Risco</h3>
            <p className="text-sm text-muted-foreground">
              Você não precisa passar cartão ou fazer PIX antes de ver o produto. Pague na entrega.
            </p>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <h3 className="font-bold mb-2 text-primary">Qualidade Garantida</h3>
            <p className="text-sm text-muted-foreground">
              Trabalhamos apenas com fornecedores selecionados para garantir a melhor experiência.
            </p>
          </div>
          <div className="bg-card p-6 rounded-xl border">
            <h3 className="font-bold mb-2 text-primary">Suporte via WhatsApp</h3>
            <p className="text-sm text-muted-foreground">
              Dúvidas sobre o produto? Nosso time está pronto para te atender via WhatsApp a qualquer momento.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
