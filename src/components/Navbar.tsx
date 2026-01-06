"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Package } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Levele</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Produtos
            </Link>
            <Link href="/categorias" className="text-sm font-medium hover:text-primary transition-colors">
              Categorias
            </Link>
            <Link href="/finalizar" className="relative group p-2">
              <ShoppingCart className="h-6 w-6 group-hover:text-primary transition-colors" />
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                0
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link href="/finalizar" className="relative p-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t bg-background animate-in slide-in-from-top duration-300">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-4 text-lg font-medium hover:bg-muted rounded-xl transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              Produtos
            </Link>
            <Link 
              href="/categorias" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-4 text-lg font-medium hover:bg-muted rounded-xl transition-colors"
            >
              <Package className="h-5 w-5 text-primary" />
              Categorias
            </Link>
            <Link 
              href="/finalizar" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-4 text-lg font-medium hover:bg-muted rounded-xl transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              Finalizar Pedido
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
