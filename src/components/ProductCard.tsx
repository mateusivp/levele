import { formatPrice, slugify } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card">
      <Link href={`/produto/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-6">
        <div className="mb-2">
          <Link 
            href={`/categoria/${slugify(product.category)}`}
            className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
          >
            {product.category}
          </Link>
        </div>
        <Link href={`/produto/${product.slug}`}>
          <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>
        <div 
          className="text-muted-foreground text-sm line-clamp-2 mb-4" 
          dangerouslySetInnerHTML={{ __html: product.description }} 
        />
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {formatPrice(product.price)}
          </span>
          <Link 
            href={`/produto/${product.slug}`}
            className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
