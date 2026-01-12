"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

interface ProductGalleryProps {
  mainImage: string;
  images?: string[];
  name: string;
}

export default function ProductGallery({ mainImage, images = [], name }: ProductGalleryProps) {
  const allImages = [mainImage, ...images].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Distância mínima para considerar um swipe
  const minSwipeDistance = 50;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden border bg-muted flex items-center justify-center">
        <Package className="h-20 w-20 text-muted-foreground/20" />
      </div>
    );
  }

  if (allImages.length === 1) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden border bg-white">
        <Image
          src={allImages[0]}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="relative aspect-square rounded-2xl overflow-hidden border bg-white group touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Imagem Principal */}
        <div className="relative w-full h-full">
          {allImages.map((img, idx) => (
            <div
              key={idx}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-in-out",
                selectedImage === idx ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <Image
                src={img}
                alt={`${name} - ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Áreas de clique (Navegação) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="flex h-full w-full">
            <button 
              type="button"
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                prevImage(); 
              }}
              className="w-1/2 h-full cursor-w-resize group/nav flex items-center justify-start p-2 md:p-4 pointer-events-auto"
              aria-label="Imagem anterior"
            >
              <div className="bg-white/30 backdrop-blur-md p-1.5 md:p-2 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity border border-white/50 shadow-sm">
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </div>
            </button>
            <button 
              type="button"
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation(); 
                nextImage(); 
              }}
              className="w-1/2 h-full cursor-e-resize group/nav flex items-center justify-end p-2 md:p-4 pointer-events-auto"
              aria-label="Próxima imagem"
            >
              <div className="bg-white/30 backdrop-blur-md p-1.5 md:p-2 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity border border-white/50 shadow-sm">
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-black" />
              </div>
            </button>
          </div>
        </div>

        {/* Indicadores (Dots) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
          {allImages.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 transition-all duration-300 rounded-full",
                selectedImage === idx ? "w-6 bg-primary" : "w-1.5 bg-black/20"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Miniaturas */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={cn(
              "relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              selectedImage === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={img}
              alt={`${name} - miniatura ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
