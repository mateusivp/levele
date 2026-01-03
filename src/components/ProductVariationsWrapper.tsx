"use client";

import { useState } from "react";
import { Product } from "@/types";
import ProductVariations from "./ProductVariations";
import Link from "next/link";

interface ProductVariationsWrapperProps {
  product: Product;
}

export default function ProductVariationsWrapper({ product }: ProductVariationsWrapperProps) {
  const [selectedVariation, setSelectedVariation] = useState(
    product.variations && product.variations.length > 0 
      ? product.variations[0] 
      : null
  );

  const checkoutUrl = selectedVariation 
    ? `/finalizar?product=${product.id}&variation=${selectedVariation.id}`
    : `/finalizar?product=${product.id}`;

  return (
    <>
      <ProductVariations 
        product={product} 
        selectedVariationId={selectedVariation?.id}
        onSelect={setSelectedVariation}
      />

      <Link
        href={checkoutUrl}
        className="block w-full bg-primary text-primary-foreground text-center py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors mb-6 shadow-xl shadow-primary/20 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        COMPRAR AGORA - PAGAR NA ENTREGA
      </Link>
    </>
  );
}
