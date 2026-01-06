import { constructMetadata } from "@/lib/seo";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">Levele</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Produtos
              </Link>
              <Link href="/categorias" className="text-sm font-medium hover:text-primary transition-colors">
                Categorias
              </Link>
              <Link href="/finalizar" className="relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  0
                </span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t bg-muted/50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Levele</h3>
                <p className="text-sm text-muted-foreground">
                  A melhor loja com pagamento na entrega. Segurança e praticidade para você.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Links Úteis</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/" className="hover:text-primary">Início</Link></li>
                  <li><Link href="/finalizar" className="hover:text-primary">Carrinho</Link></li>
                  <li><Link href="#" className="hover:text-primary">Sobre Nós</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Contato</h3>
                <p className="text-sm text-muted-foreground">
                  Email: contato@levele.com.br<br />
                  WhatsApp: (11) 99999-9999
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Levele. Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
