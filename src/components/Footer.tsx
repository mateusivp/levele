"use client";

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ShieldCheck, CreditCard, Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Sobre */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tighter">Levele.</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Sua loja de confiança com produtos selecionados e a comodidade do pagamento na entrega. Qualidade e segurança em primeiro lugar.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="hover:text-primary transition-colors bg-zinc-900 p-2 rounded-lg hover:bg-zinc-800">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors bg-zinc-900 p-2 rounded-lg hover:bg-zinc-800">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors bg-zinc-900 p-2 rounded-lg hover:bg-zinc-800">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-white font-bold mb-6">Institucional</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/sobre-nos" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidade" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-uso" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/trocas-devolucoes" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-white font-bold mb-6">Atendimento</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-white shrink-0" />
                <span>contato@levele.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-white shrink-0" />
                <span>43 9 9824-5853</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-white shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </li>
              <li className="text-xs text-zinc-500 pt-2">
                Segunda a Sexta: 9h às 18h<br />
                Sábado: 9h às 13h
              </li>
            </ul>
          </div>

          {/* Newsletter (Simulada) */}
          <div>
            <h3 className="text-white font-bold mb-6">Fique por dentro</h3>
            <p className="text-sm mb-4">Receba ofertas exclusivas e novidades.</p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors">
                INSCREVER-SE
              </button>
            </form>
          </div>
        </div>

        {/* Pagamento e Segurança */}
        <div className="border-t border-zinc-800 pt-10 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Formas de Pagamento</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {/* Visa */}
                <div className="bg-white p-2 rounded h-10 w-16 flex items-center justify-center">
                  <svg viewBox="0 0 48 48" className="h-full w-auto">
                    <path fill="#1434CB" d="M19.9,7.5h6.6l4.1,25.6h-6.6L19.9,7.5z"/>
                    <path fill="#1434CB" d="M12.6,7.5l-6.2,31.4H0.7L8.6,7.5H12.6z"/>
                    <path fill="#1434CB" d="M47.8,7.5h-5.9c-2.3,0-4,0.7-5,3.3l-10,24.1h6.9l1.4-3.8h8.4l0.8,3.8h6.1L47.8,7.5z M36.8,25.6l2.3-10.9l1.3,6.5c0.3,1.5,0.6,3,0.9,4.4H36.8z"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="bg-white p-2 rounded h-10 w-16 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-full w-auto">
                    <circle cx="7" cy="12" r="7" fill="#EB001B"/>
                    <circle cx="17" cy="12" r="7" fill="#F79E1B"/>
                    <path d="M12,16.2c-1.6,0-3-0.5-4.2-1.4c0.8-1.5,1.2-3.2,1.2-4.9c0-1.7-0.4-3.4-1.2-4.9c1.1-0.9,2.5-1.4,4.2-1.4c1.6,0,3,0.5,4.2,1.4c-0.8,1.5-1.2,3.2-1.2,4.9c0,1.7,0.4,3.4,1.2,4.9C15,15.7,13.6,16.2,12,16.2z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* Pix */}
                <div className="bg-white p-2 rounded h-10 w-16 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-full w-auto">
                    <path fill="#32BCAD" d="M12,2.5c-5.2,0-9.5,4.3-9.5,9.5s4.3,9.5,9.5,9.5s9.5-4.3,9.5-9.5S17.2,2.5,12,2.5z M16.3,15.4l-3.5,3.5c-0.4,0.4-1.1,0.4-1.5,0l-3.5-3.5c-0.4-0.4-0.4-1.1,0-1.5l3.5-3.5c0.4-0.4,1.1-0.4,1.5,0l3.5,3.5C16.8,14.4,16.8,15,16.3,15.4z"/>
                  </svg>
                </div>
                {/* Boleto */}
                <div className="bg-white p-2 rounded h-10 w-16 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-full w-auto">
                    <path d="M2,6h2v12H2V6z M5,6h2v12H5V6z M8,6h1v12H8V6z M11,6h2v12h-2V6z M14,6h3v12h-3V6z M18,6h1v12h-1V6z M20,6h2v12h-2V6z" fill="#333"/>
                  </svg>
                </div>
                {/* Hipercard */}
                <div className="bg-white p-2 rounded h-10 w-16 flex items-center justify-center">
                  <span className="font-bold text-red-600 text-xs italic">Hipercard</span>
                </div>
                {/* Elo */}
                <div className="bg-white p-2 rounded h-10 w-16 flex items-center justify-center">
                   <div className="flex flex-col items-center leading-none">
                     <div className="flex gap-0.5">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div>
                       <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                     </div>
                     <span className="font-bold text-black text-xs mt-0.5">Elo</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Segurança</h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {/* SSL Secure */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-zinc-200">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-600 leading-none">SITE SEGURO</span>
                    <span className="text-sm font-black text-zinc-800 leading-none">SSL</span>
                    <span className="text-[9px] text-zinc-500 leading-none mt-0.5">256 BITS</span>
                  </div>
                </div>
                {/* Google Safe Browsing */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-zinc-200">
                  <div className="relative">
                    <div className="h-8 w-7 bg-green-500 rounded-b-full rounded-t-sm flex items-center justify-center">
                      <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-zinc-800 leading-none">Google</span>
                    <span className="text-[10px] text-zinc-600 leading-none mt-0.5">Safe Browsing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Levele. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <span>Desenvolvido com ❤️</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
