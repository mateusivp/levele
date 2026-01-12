import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Users, Building2 } from "lucide-react";

export const metadata = {
  title: "Sobre Nós | Loja Levele",
  description: "Conheça a história da Levele, uma empresa familiar dedicada a trazer qualidade e confiança para o seu lar.",
};

export default function SobreNosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Store Facade */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
          alt="Fachada da Loja Levele"
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            NOSSA HISTÓRIA
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
            De uma pequena oficina familiar para a maior loja com pagamento na entrega do Brasil.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
                <Users className="h-4 w-4" />
                Empresa Familiar
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Tudo começou com um sonho do Sr. Augusto Levele, em 1988.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Em uma pequena garagem no interior de São Paulo, a família Levele iniciou sua jornada com um propósito simples: facilitar o acesso a produtos de qualidade para todas as famílias brasileiras.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                O que começou como uma pequena revenda de ferramentas e utensílios domésticos, guiada pelos valores de <strong>honestidade, transparência e respeito ao cliente</strong>, floresceu. O Sr. Augusto sempre dizia: "Se o cliente não confiar em nós, não temos nada".
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hoje, na terceira geração da família, a Levele evoluiu para o digital, mas manteve sua essência. Fomos pioneiros no sistema de <strong>Pagamento na Entrega</strong>, justamente para honrar essa confiança que está no nosso DNA desde o primeiro dia.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-2xl -rotate-2"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop" 
                  alt="Equipe Levele"
                  width={800}
                  height={1000}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Nossos Pilares</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Valores que atravessam gerações e guiam cada decisão que tomamos.
          </p>
        </div>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Heart className="h-8 w-8 text-primary" />,
              title: "Paixão pelo Cliente",
              description: "Tratamos cada cliente como parte da nossa própria família."
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-primary" />,
              title: "Confiança Inabalável",
              description: "Nosso sistema de pague na entrega é a prova do nosso compromisso com você."
            },
            {
              icon: <Building2 className="h-8 w-8 text-primary" />,
              title: "Qualidade Curada",
              description: "Selecionamos cada item do nosso catálogo com critérios rigorosos de durabilidade."
            }
          ].map((value, idx) => (
            <div key={idx} className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">FAÇA PARTE DA NOSSA HISTÓRIA</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
            Milhares de clientes já confiam na Levele para mobiliar e equipar seus lares. Descubra por que somos diferentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              VER PRODUTOS <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
