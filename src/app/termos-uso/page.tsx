import Image from "next/image";
import Link from "next/link";
import { FileText, CheckCircle2, ShoppingCart, CreditCard, Truck, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | Loja Levele",
  description: "Conheça os termos e condições de uso da Loja Levele.",
};

export default function TermosUsoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1563406082264-112e0300302e?q=80&w=2070&auto=format&fit=crop" 
          alt="Termos de Uso" 
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            TERMOS DE USO
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
            Condições de uso da Loja Levele
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">1. Introdução</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Bem-vindo à Loja Levele! Estes Termos de Uso (doravante denominados "Termos") regem o uso do nosso site, aplicativos e serviços (doravante denominados "Plataforma"). Ao acessar ou usar a Plataforma, você concorda em cumprir e ficar vinculado por estes Termos.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">2. Aceitação dos Termos</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Ao acessar ou usar a Plataforma, você declara que tem idade legal para contratar e concorda com estes Termos. Se você não concordar com qualquer parte destes Termos, não deve acessar ou usar a Plataforma.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">3. Cadastro e Conta</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Para fazer compras ou acessar certas funcionalidades da Plataforma, você pode precisar criar uma conta. Você concorda em:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Fornecer informações verdadeiras, precisas e completas durante o cadastro</li>
                  <li>Mantener suas informações de conta atualizadas</li>
                  <li>Proteger sua senha e não compartilhá-la com terceiros</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">4. Pedidos e Compras</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ao fazer um pedido na Plataforma, você está fazendo uma oferta para comprar os produtos selecionados. A Empresa reserva-se o direito de aceitar ou rejeitar seu pedido, por qualquer motivo, incluindo:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Estoque insuficiente</li>
                  <li>Preços incorretos ou erros na descrição do produto</li>
                  <li>Suspeita de fraude ou atividade irregular</li>
                  <li>Restrições geográficas</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  A compra é concluída quando você receber um e-mail de confirmação do pedido da Empresa.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">5. Pagamento</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Aceitamos os seguintes métodos de pagamento:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Cartões de crédito (Visa, Mastercard, American Express)</li>
                  <li>Pagamento na Entrega (disponível em determinadas regiões)</li>
                  <li>Boleto bancário</li>
                  <li>Transferência bancária</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  O pagamento deve ser realizado de acordo com as instruções fornecidas na Plataforma. A Empresa se reserva o direito de cancelar o pedido se o pagamento não for confirmado.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">6. Entrega</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A entrega é realizada de acordo com as opções disponíveis na Plataforma e na região de entrega. Os prazos de entrega são estimativos e podem variar devido a circunstâncias fora do controle da Empresa, como clima, trânsito ou problemas logísticos.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Você é responsável por receber o pedido no endereço fornecido. Se não houver ninguém para receber o pedido, o entregador pode deixar uma notificação ou tentar a entrega em outro dia.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">7. Direitos de Propriedade Intelectual</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Todos os conteúdos da Plataforma, incluindo textos, imagens, gráficos, logos, ícones, vídeos, áudios, softwares e outros materiais, são de propriedade da Empresa ou de seus licenciadores e estão protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Você não pode reproduzir, modificar, distribuir, vender, alugar, licenciar ou usar qualquer conteúdo da Plataforma sem a autorização prévia por escrito da Empresa.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">8. Limitação de Responsabilidade</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A Empresa não será responsável por quaisquer danos diretos, indiretos, incidentais, consequenciais, especiais ou exemplares decorrentes do uso ou da incapacidade de usar a Plataforma, incluindo:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Perda de dados ou lucros</li>
                  <li>Interrupção do negócio</li>
                  <li>Danos por negligência</li>
                  <li>Problemas técnicos ou de segurança</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  A responsabilidade total da Empresa em relação a qualquer transação ou uso da Plataforma não excederá o valor pago pela compra em questão.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">9. Alterações nos Termos</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A Empresa reserva-se o direito de modificar estes Termos a qualquer momento, sem aviso prévio. As alterações entrarão em vigor imediatamente após serem publicadas na Plataforma. O uso continuado da Plataforma após a publicação das alterações constitui aceitação dos novos Termos.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">10. Lei Aplicável e Jurisdição</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Estes Termos são regidos pelas leis do Brasil, independentemente das escolhas de lei. Qualquer disputa decorrente ou relacionada a estes Termos será submetida à jurisdição exclusiva dos tribunais da cidade de São Paulo, SP.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRight className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">11. Contato</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Se você tiver dúvidas ou preocupações sobre estes Termos, entre em contato conosco:
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  E-mail: <Link href="mailto:suporte@levele.com.br" className="text-primary hover:underline">suporte@levele.com.br</Link>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Telefone: (11) 99999-9999
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Conheça nossos produtos</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
            Explore nossa variedade de produtos de qualidade e faça sua compra com segurança.
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
