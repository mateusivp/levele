"use client";

import { useState } from "react";
import { Product } from "@/types";
import ProductVariations from "./ProductVariations";
import Link from "next/link";
import { Lock, Bike } from "lucide-react";

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
        className="block w-full bg-green-600 text-white text-center py-4 rounded-xl font-black text-xl hover:bg-green-700 transition-all mb-3 shadow-xl shadow-green-600/20 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 animate-pulse"
      >
        <Lock className="h-6 w-6" />
        COMPRAR AGORA
      </Link>
      
      <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 mb-6 bg-emerald-50 py-2 rounded-lg border border-emerald-100">
        <Bike className="h-5 w-5" />
        <span>Pagar na entrega • Entrega Rápida</span>
      </div>
    </>
  );
}
