"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Check, Info } from "lucide-react";

interface ProductVariationsProps {
  product: Product;
  selectedVariationId?: string;
  onSelect: (variation: NonNullable<Product['variations']>[number]) => void;
}

export default function ProductVariations({ product, selectedVariationId, onSelect }: ProductVariationsProps) {
  const variations = product.variations || [];
  
  // Se não houver variações, não renderiza nada
  if (variations.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Selecione a Opção
        </h3>
        {variations.length > 1 && (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
            Melhor Oferta
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {variations.map((variation) => {
          const isSelected = selectedVariationId === variation.id;
          
          return (
            <button
              key={variation.id}
              onClick={() => onSelect(variation)}
              className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                isSelected 
                  ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                  : "border-border hover:border-primary/30 bg-card"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}>
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
                
                <div>
                  <p className={`font-bold transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {variation.name}
                  </p>
                  {variation.stock <= 5 && variation.stock > 0 && (
                    <p className="text-[10px] text-orange-600 font-medium">
                      Restam apenas {variation.stock} unidades!
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xl font-black ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {formatPrice(variation.price)}
                </p>
                {product.variations && variation.id !== product.variations[0].id && (
                  <p className="text-[10px] text-green-600 font-bold uppercase">
                    Economia Garantida
                  </p>
                )}
              </div>

              {/* Tag de destaque para o kit com mais unidades */}
              {variation === variations[variations.length - 1] && variations.length > 1 && (
                <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                  MAIS VENDIDO
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl text-[11px] text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>Aproveite os descontos progressivos nos kits acima. Quanto mais você compra, maior o desconto por unidade.</p>
      </div>
    </div>
  );
}
