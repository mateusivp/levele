import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, FileText, User, Lock, Eye, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade | Loja Levele",
  description: "Conheça como a Loja Levele trata e protege seus dados pessoais.",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
          alt="Proteção de Dados" 
          fill
          className="object-cover brightness-[0.4]"
          priority
        />
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            POLÍTICA DE PRIVACIDADE
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
            Como tratamos e protegemos seus dados pessoais
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
                  <h2 className="text-2xl font-bold">1. Introdução</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A Loja Levele (doravante denominada "Empresa") está comprometida com a proteção da privacidade dos seus clientes e visitantes do site. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos os dados pessoais que você nos fornece.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Ao acessar o nosso site e usar nossos serviços, você concorda com os termos desta Política de Privacidade.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">2. Quais Dados Coletamos</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Coletamos os seguintes tipos de dados pessoais:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Dados de identificação: nome, e-mail, telefone, CPF/CNPJ</li>
                  <li>Dados de endereço: rua, número, bairro, cidade, estado, CEP</li>
                  <li>Dados de pagamento: informações de cartão de crédito (processadas por terceiros seguros)</li>
                  <li>Dados de navegação: IP, navegador, dispositivo, páginas acessadas</li>
                  <li>Dados de preferências: produtos visualizados, compras realizadas</li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">3. Como Usamos Seus Dados</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Utilizamos seus dados pessoais para os seguintes fins:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Processar e entregar seus pedidos</li>
                  <li>Enviar confirmações e atualizações de pedidos</li>
                  <li>Atender a suas solicitações de suporte</li>
                  <li>Enviar informações sobre produtos, promoções e ofertas (se você concordar)</li>
                  <li>Melhorar nosso site e serviços</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                </ul>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">4. Segurança dos Dados</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL (Secure Socket Layer) para proteger as transações online e armazenamos os dados em servidores seguros.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">5. Compartilhamento de Dados</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Não vendemos seus dados pessoais a terceiros. Compartilhamos seus dados apenas com:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Fornecedores de serviços essenciais (entregas, pagamentos, suporte)</li>
                  <li>Autoridades competentes, quando exigido por lei</li>
                  <li>Parceiros que auxiliam na operação do nosso site (análise, marketing)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Todos os nossos parceiros estão obrigados a manter a confidencialidade dos seus dados e a usá-los apenas para os fins acordados.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">6. Seus Direitos</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Você tem direito a:
                </p>
                <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados inexatos ou incompletos</li>
                  <li>Excluir seus dados pessoais</li>
                  <li>Limitar o processamento dos seus dados</li>
                  <li>Retirar seu consentimento a qualquer momento</li>
                  <li>Portar seus dados para outro provedor</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Para exercer esses direitos, entre em contato conosco pelo e-mail: <Link href="mailto:privacidade@levele.com.br" className="text-primary hover:underline">privacidade@levele.com.br</Link>
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">7. Alterações nesta Política</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A Empresa reserva-se o direito de atualizar esta Política de Privacidade periodicamente. As alterações serão publicadas no site e entrarão em vigor imediatamente. Recomendamos que você revise esta página regularmente.
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRight className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">8. Contato</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade, entre em contato conosco:
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  E-mail: <Link href="mailto:privacidade@levele.com.br" className="text-primary hover:underline">privacidade@levele.com.br</Link>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Telefone: 43 9 9824-5853
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">Tem mais dúvidas?</h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto font-light">
            Nossa equipe está pronta para ajudar você com qualquer questão sobre sua privacidade.
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
