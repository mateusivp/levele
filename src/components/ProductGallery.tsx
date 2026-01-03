"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  mainImage: string;
  images?: string[];
  name: string;
}

export default function ProductGallery({ mainImage, images = [], name }: ProductGalleryProps) {
  const allImages = [mainImage, ...images].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(0);

  if (allImages.length <= 1) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden border bg-white">
        <Image
          src={allImages[0] || mainImage}
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
      <div className="relative aspect-square rounded-2xl overflow-hidden border bg-white">
        <Image
          src={allImages[selectedImage]}
          alt={name}
          fill
          className="object-cover transition-all duration-300"
          priority
        />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
              selectedImage === idx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image
              src={img}
              alt={`${name} - imagem ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
