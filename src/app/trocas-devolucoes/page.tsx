import Image from "next/image";
import Link from "next/link";
import { Truck, ArrowLeftRight, CreditCard, ShieldCheck, FileText, Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Trocas e Devoluções | Loja Levele",
  description: "Conheça as políticas de trocas e devoluções da Loja Levele.",
};

export default function TrocasDevolucoesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop" 
          alt="Trocas e Devoluções" 
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            TROCAS E DEVOLUÇÕES
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
            Conheça nossas políticas de troca e devolução
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
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">1. Garantia de Satisfação</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A Loja Levele oferece uma garantia de satisfação de 7 dias para todos os produtos vendidos. Se você não estiver satisfeito com o produto recebido, pode solicitar troca ou devolução dentro deste prazo.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Para que a solicitação seja aceita, o produto deve estar em sua embalagem original, sem sinais de uso e com todos os acessórios e documentos inclusos.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowLeftRight className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">2. Condições para Troca</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Você pode solicitar troca do produto por:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Outra cor ou tamanho do mesmo produto (se disponível em estoque)</li>
                  <li>Outro produto de valor igual ou superior (você pagará a diferença)</li>
                  <li>Outro produto de valor inferior (você receberá o reembolso da diferença)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  A troca é gratuita para produtos com defeito de fabricação. Para trocas por preferência do cliente, o custo de envio da devolução é por conta do cliente.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">3. Condições para Devolução</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Você pode solicitar devolução do produto em casos de:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Produto com defeito de fabricação</li>
                  <li>Produto diferente do solicitado (erro de envio)</li>
                  <li>Insatisfação com o produto (dentro do prazo de 7 dias)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Para devoluções por defeito ou erro de envio, o custo de envio é por conta da Empresa. Para devoluções por insatisfação, o custo de envio é por conta do cliente.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">4. Como Solicitar Troca ou Devolução</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Para solicitar troca ou devolução, siga os passos abaixo:
                </p>
                <ol className="space-y-3 pl-6 list-decimal text-muted-foreground">
                  <li>Entre em contato com nosso atendimento ao cliente pelo e-mail <Link href="mailto:suporte@levele.com.br" className="text-primary hover:underline">suporte@levele.com.br</Link> ou telefone (11) 99999-9999</li>
                  <li>Informe o número do pedido e o motivo da solicitação</li>
                  <li>Anexe fotos do produto (se houver defeito)</li>
                  <li>Aguarde a aprovação da solicitação por nossa equipe</li>
                  <li>Receba o código de autorização e instruções de envio</li>
                  <li>Envie o produto para o endereço indicado</li>
                </ol>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">5. Prazo para Processamento</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Após receber o produto devolvido, nossa equipe verificará o estado do mesmo e processará a troca ou devolução dentro de 3 a 5 dias úteis.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Para trocas: O novo produto será enviado assim que a verificação for concluída.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-1">
                  Para devoluções: O reembolso será feito pelo mesmo método de pagamento utilizado na compra, dentro de 7 a 10 dias úteis, dependendo do banco ou operadora.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">6. Instruções de Envio</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ao enviar o produto devolvido, certifique-se de:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Utilizar embalagem resistente para proteger o produto</li>
                  <li>Incluir todos os acessórios, documentos e etiquetas originais</li>
                  <li>Colocar o código de autorização na embalagem ou no recibo</li>
                  <li>Registrar o envio para acompanhar a entrega</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  A Empresa não se responsabiliza por produtos perdidos ou danificados durante o transporte de devolução, a menos que o envio seja feito pelo serviço indicado pela Empresa.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">7. Exceções</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  As políticas de troca e devolução não se aplicam a:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Produtos personalizados ou feitos sob medida</li>
                  <li>Produtos perecíveis ou com data de validade curta</li>
                  <li>Produtos de higiene pessoal (roupas íntimas, cosméticos abertos)</li>
                  <li>Produtos danificados pelo cliente ou por uso inadequado</li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRight className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">8. Contato</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Se você tiver dúvidas ou precisar de ajuda com sua solicitação de troca ou devolução, entre em contato conosco:
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  E-mail: <Link href="mailto:suporte@levele.com.br" className="text-primary hover:underline">suporte@levele.com.br</Link>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Telefone: (11) 99999-9999
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Horário de atendimento: Segunda a Sexta, das 9h às 18h
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Compre com Confiança</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
            Nossa política de troca e devolução garante sua satisfação com cada compra.
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
