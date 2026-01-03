"use client";

import { useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, MapPin, Phone, User, Calendar, Tag, Plus, ShoppingCart, Percent, ShieldCheck } from "lucide-react";
import { Product } from "@/types";

const checkoutSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  phone: z.string().min(10, "Telefone inválido"),
  cep: z.string().min(8, "CEP inválido").max(9),
  street: z.string().min(3, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 caracteres"),
  deliveryDate: z.string().min(1, "Data de entrega é obrigatória"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Função para gerar as datas de entrega disponíveis
function getAvailableDeliveryDates() {
  const dates: { value: string; label: string }[] = [];
  const now = new Date();
  const currentHour = now.getHours();
  
  // Regra: se for depois das 17h, pula o dia de hoje e o de amanhã (considerando entrega no próximo dia útil)
  // Na verdade, a regra diz: pedidos até as 17h são entregues no dia seguinte.
  // Pedidos após as 17h não contam para o dia seguinte, pula um dia.
  // Então:
  // Se <= 17h: Primeira data disponível é amanhã (se for dia útil).
  // Se > 17h: Primeira data disponível é depois de amanhã (se for dia útil).
  
  let startDate = new Date(now);
  if (currentHour >= 17) {
    startDate.setDate(startDate.getDate() + 2); // Pula hoje e amanhã
  } else {
    startDate.setDate(startDate.getDate() + 1); // Pula hoje (entrega amanhã)
  }

  let count = 0;
  let checkDate = new Date(startDate);

  while (count < 5) {
    const dayOfWeek = checkDate.getDay();
    // 0 = Domingo, 6 = Sábado
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const value = checkDate.toISOString().split('T')[0];
      const label = checkDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
      dates.push({ 
        value, 
        label: label.charAt(0).toUpperCase() + label.slice(1) 
      });
      count++;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }

  return dates;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const upsellId = searchParams.get("upsell");
  const variationId = searchParams.get("variation");
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [upsellProduct, setUpsellProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPostPurchaseUpsell, setShowPostPurchaseUpsell] = useState(false);
  const [postPurchaseProduct, setPostPurchaseProduct] = useState<Product | null>(null);
  const [isAddingUpsell, setIsAddingUpsell] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [availableDates] = useState(getAvailableDeliveryDates());
  const [orderBumpProduct, setOrderBumpProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isBumpSelected, setIsBumpSelected] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [dbCoupons, setDbCoupons] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
          const data = await res.json();
          setDbCoupons(data);
        }
      } catch (error) {
        console.error("Erro ao buscar cupons", error);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = () => {
    setCouponError("");
    const coupon = dbCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) {
      setCouponError("Cupom inválido");
      return;
    }
    
    let amount = 0;
    const currentPrice = selectedVariation ? selectedVariation.price : (product?.price || 0);
    const currentTotal = currentPrice + (isBumpSelected ? (orderBumpProduct?.price || 0) : 0);
    
    if (coupon.discountType === 'percentage') {
      amount = currentTotal * (coupon.value / 100);
    } else {
      amount = coupon.value;
    }
    
    setAppliedCoupon({ code: coupon.code, amount });
  };

  useEffect(() => {
    if (product?.orderBumpId) {
      fetch("/api/products")
        .then(res => res.json())
        .then((products: Product[]) => {
          const bump = products.find(p => p.id === product.orderBumpId);
          if (bump) setOrderBumpProduct(bump);
        });
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setIsLoadingProduct(false);
        return;
      }

      try {
        console.log(`[Checkout] Buscando produto para checkout: ${productId}`);
        const res = await fetch("/api/products");
        const products: Product[] = await res.json();
        setAllProducts(products);
        const found = products.find((p) => p.id === productId);
        setProduct(found || null);

        if (found && variationId) {
          const v = found.variations?.find(v => v.id === variationId);
          if (v) setSelectedVariation(v);
        }

        if (upsellId) {
          const foundUpsell = products.find((p) => p.id === upsellId);
          setUpsellProduct(foundUpsell || null);
        }
      } catch (error) {
        console.error("Erro ao buscar produto para checkout", error);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryDate: availableDates[0]?.value,
    }
  });

  const cep = watch("cep");
  const name = watch("name");
  const phone = watch("phone");

  // Captura de carrinho abandonado
  useEffect(() => {
    if (name?.length >= 3 && phone?.length >= 10 && product) {
      const timer = setTimeout(async () => {
        try {
          await fetch("/api/abandoned", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              productName: product.name,
              variationId: selectedVariation?.id,
              variationName: selectedVariation?.name,
              name,
              phone,
              total: ((selectedVariation?.price || product?.price || 0) + (upsellProduct?.price || 0) + (isBumpSelected ? (orderBumpProduct?.price || 0) : 0)) - (appliedCoupon?.amount || 0)
            }),
          });
        } catch (error) {
          console.error("Erro ao capturar carrinho abandonado", error);
        }
      }, 2000); // Debounce de 2 segundos
      return () => clearTimeout(timer);
    }
  }, [name, phone, product, upsellProduct, isBumpSelected, orderBumpProduct, appliedCoupon]);

  useEffect(() => {
    if (cep?.length === 8 || cep?.length === 9) {
      const cleanCep = cep.replace(/\D/g, "");
      if (cleanCep.length === 8) {
        handleCepLookup(cleanCep);
      }
    }
  }, [cep]);

  const handleCepLookup = async (cleanCep: string) => {
    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue("street", data.logradouro);
        setValue("neighborhood", data.bairro);
        setValue("city", data.localidade);
        setValue("state", data.uf);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const [lastOrderData, setLastOrderData] = useState<any>(null);

  const handleSendWhatsApp = (orderData: any, product: Product) => {
    if (!orderData || !orderData.customer) return;
    const phone = orderData.customer.phone.replace(/\D/g, '');
    const message = `Olá ${orderData.customer.name.split(' ')[0]}, seu pedido do ${product.name} foi confirmado! Entraremos em contato para agendar a entrega.`;
    window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      console.log(`[Checkout] Iniciando envio do pedido para ${product?.name}`);
      
      const items = [{
        productId: product?.id,
        productName: product?.name,
        variationId: selectedVariation?.id,
        variationName: selectedVariation?.name,
        quantity: 1,
        price: selectedVariation ? selectedVariation.price : (product?.price || 0),
      }];

      if (upsellProduct) {
        items.push({
          productId: upsellProduct.id,
          productName: upsellProduct.name,
          quantity: 1,
          price: upsellProduct.price,
        } as any);
      }

      if (isBumpSelected && orderBumpProduct) {
        items.push({
          productId: orderBumpProduct.id,
          productName: orderBumpProduct.name,
          quantity: 1,
          price: orderBumpProduct.price,
          isBump: true,
        } as any);
      }

      const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      const orderData = {
        items,
        customer: {
          name: data.name,
          phone: data.phone,
          address: {
            cep: data.cep,
            street: data.street,
            number: data.number,
            complement: data.complement,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
          }
        },
        deliveryDate: data.deliveryDate,
        total,
        discount: appliedCoupon || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const orderRes = await res.json();
        setLastOrderId(orderRes.id);
        setLastOrderData(orderRes);

        // Verificar se o produto principal tem Upsell Pós-Compra configurado
        if (product?.postPurchaseUpsell?.active && product.postPurchaseUpsell.productId) {
          const upProduct = allProducts.find(p => p.id === product.postPurchaseUpsell?.productId);
          if (upProduct) {
            setPostPurchaseProduct(upProduct);
            setShowPostPurchaseUpsell(true);
            return; // Interrompe para mostrar o Upsell
          }
        }
        
        if (product) handleSendWhatsApp(orderRes, product);
        }
  
        setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao processar pedido:", error);
      alert("Houve um erro ao processar seu pedido. Por favor, tente novamente.");
    }
  };

  const handleAddPostPurchaseUpsell = async () => {
    if (!lastOrderId || !postPurchaseProduct || !product?.postPurchaseUpsell) return;
    
    setIsAddingUpsell(true);
    try {
      const upsellData = {
        orderId: lastOrderId,
        productId: postPurchaseProduct.id,
        productName: postPurchaseProduct.name,
        price: product.postPurchaseUpsell.price || postPurchaseProduct.price,
        quantity: product.postPurchaseUpsell.quantity || 1
      };

      const res = await fetch("/api/orders/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(upsellData),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setLastOrderData(updatedOrder);
        setShowPostPurchaseUpsell(false);
        setIsSuccess(true);
        if (product) handleSendWhatsApp(updatedOrder, product);
      }
    } catch (error) {
      console.error("Erro ao adicionar upsell:", error);
      setShowPostPurchaseUpsell(false);
      setIsSuccess(true);
    } finally {
      setIsAddingUpsell(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando informações do produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Nenhum produto selecionado</h1>
        <a href="/" className="text-primary hover:underline">Voltar para a loja</a>
      </div>
    );
  }

  if (showPostPurchaseUpsell && postPurchaseProduct && product?.postPurchaseUpsell) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-background max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <div className="bg-primary p-6 text-center text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tight">
              {product.postPurchaseUpsell.title || "OFERTA EXCLUSIVA PARA VOCÊ!"}
            </h2>
            <p className="text-primary-foreground/90 font-medium">
              Não feche esta página! Esta é uma oportunidade única.
            </p>
          </div>
          
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
              <div className="relative h-48 w-48 md:h-56 md:w-56 rounded-2xl overflow-hidden border-2 border-primary/20 bg-white flex-shrink-0">
                <Image 
                  src={postPurchaseProduct.image} 
                  alt={postPurchaseProduct.name}
                  fill
                  className="object-contain p-4"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-3">{postPurchaseProduct.name}</h3>
                <p className="text-muted-foreground mb-4">
                  {product.postPurchaseUpsell.description || "Adicione este item ao seu pedido agora com um desconto especial de agradecimento."}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="text-muted-foreground line-through text-lg">
                    {formatPrice(postPurchaseProduct.price)}
                  </span>
                  <span className="text-3xl font-black text-primary">
                    {formatPrice(product.postPurchaseUpsell.price || postPurchaseProduct.price)}
                  </span>
                </div>
                <p className="text-xs text-primary font-bold mt-2">
                  * Oferta válida apenas por tempo limitado.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddPostPurchaseUpsell}
                disabled={isAddingUpsell}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl font-black text-xl md:text-2xl shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isAddingUpsell ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="h-8 w-8" />
                    SIM! ADICIONAR AO MEU PEDIDO
                  </>
                )}
              </button>
              
              <button
                onClick={() => { 
                  setShowPostPurchaseUpsell(false); 
                  setIsSuccess(true); 
                  if (lastOrderData && product) handleSendWhatsApp(lastOrderData, product);
                }}
                className="w-full py-4 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm underline underline-offset-4"
              >
                Não, obrigado. Quero apenas o meu pedido original.
              </button>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 text-center border-t">
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              Sua compra principal já foi garantida. Esta é uma oferta adicional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Pedido Realizado com Sucesso!</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Obrigado, {watch("name")}! Seu pedido do {product?.name} foi recebido. 
          Entraremos em contato via WhatsApp para confirmar a entrega.
        </p>
        <a href="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Voltar para o Início
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border">
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dados Pessoais
              </h2>
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <input
                  {...register("name")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Seu nome aqui"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp / Telefone</label>
                <input
                  {...register("phone")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Data de Entrega
                </label>
                <select
                  {...register("deliveryDate")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                >
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
                {errors.deliveryDate && <p className="text-destructive text-xs mt-1">{errors.deliveryDate.message}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  * Pedidos após as 17h são processados para entrega a partir do próximo dia útil.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço de Entrega
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">CEP</label>
                  <div className="relative">
                    <input
                      {...register("cep")}
                      className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="00000-000"
                    />
                    {isLoadingCep && <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                  {errors.cep && <p className="text-destructive text-xs mt-1">{errors.cep.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rua / Logradouro</label>
                <input
                  {...register("street")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                {errors.street && <p className="text-destructive text-xs mt-1">{errors.street.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número</label>
                  <input
                    {...register("number")}
                    className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                  {errors.number && <p className="text-destructive text-xs mt-1">{errors.number.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Complemento</label>
                  <input
                    {...register("complement")}
                    className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Ex: Apto 12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bairro</label>
                <input
                  {...register("neighborhood")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                {errors.neighborhood && <p className="text-destructive text-xs mt-1">{errors.neighborhood.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input
                    {...register("city")}
                    className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                  {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">UF</label>
                  <input
                    {...register("state")}
                    className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                    maxLength={2}
                  />
                  {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground h-14 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  PROCESSANDO...
                </>
              ) : (
                "FINALIZAR E PAGAR NA ENTREGA"
              )}
            </button>
          </form>
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          {/* Order Bump Section */}
          {orderBumpProduct && (
            <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${isBumpSelected ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' : 'border-dashed border-primary/30 bg-muted/20'}`}>
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border bg-white">
                  <Image 
                    src={orderBumpProduct.image} 
                    alt={orderBumpProduct.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                      OFERTA ÚNICA
                    </span>
                  </div>
                  <h4 className="font-bold text-sm leading-tight">{orderBumpProduct.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Adicione ao seu pedido por apenas <span className="text-primary font-bold">R$ {orderBumpProduct.price.toFixed(2)}</span></p>
                  
                  <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-primary rounded transition-all group-hover:scale-110">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={isBumpSelected}
                        onChange={(e) => setIsBumpSelected(e.target.checked)}
                      />
                      {isBumpSelected && <Plus className="h-4 w-4 text-primary font-black" />}
                    </div>
                    <span className="text-sm font-bold text-primary group-hover:underline">SIM, EU QUERO ESSA OFERTA!</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Cupom de Desconto */}
          <div className="bg-card p-6 rounded-2xl border">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Cupom de Desconto
            </h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Insira seu cupom"
                  className="w-full bg-background border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                {appliedCoupon && (
                  <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                )}
              </div>
              <button 
                type="button"
                onClick={handleApplyCoupon}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Aplicar
              </button>
            </div>
            {couponError && <p className="text-xs text-destructive mt-2 font-medium">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Cupom "{appliedCoupon.code}" aplicado com sucesso!
              </p>
            )}
          </div>

          <div className="bg-muted/30 p-6 md:p-8 rounded-2xl border shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Resumo do Pedido
            </h2>
            <div className="flex gap-4 mb-6 pb-6 border-b">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-white">
                <Image
                  src={product?.image || ""}
                  alt={product?.name || ""}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm leading-tight">{product?.name}</h3>
                {selectedVariation && (
                  <p className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold w-fit mt-1">
                    {selectedVariation.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">1x {formatPrice(selectedVariation ? selectedVariation.price : (product?.price || 0))}</p>
              </div>
            </div>

            {upsellProduct && (
              <div className="flex gap-4 mb-6 pb-6 border-b animate-in slide-in-from-top-2 duration-300">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-white">
                  <Image
                    src={upsellProduct.image}
                    alt={upsellProduct.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                    {upsellProduct.name}
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Combo</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">1x {formatPrice(upsellProduct.price)}</p>
                </div>
              </div>
            )}

            {isBumpSelected && orderBumpProduct && (
              <div className="flex gap-4 mb-6 pb-6 border-b animate-in slide-in-from-top-2 duration-300">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border bg-white">
                  <Image
                    src={orderBumpProduct.image}
                    alt={orderBumpProduct.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                    {orderBumpProduct.name}
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold">Bump</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">1x {formatPrice(orderBumpProduct.price)}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice((selectedVariation ? selectedVariation.price : (product?.price || 0)) + (upsellProduct?.price || 0) + (isBumpSelected ? (orderBumpProduct?.price || 0) : 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span className="text-green-600 font-bold uppercase text-[10px] bg-green-100 px-2 py-1 rounded-full">GRÁTIS</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Desconto ({appliedCoupon.code})</span>
                  <span>- {formatPrice(appliedCoupon.amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black pt-4 border-t border-primary/20 text-primary">
                <span>Total</span>
                <span>{formatPrice(((selectedVariation ? selectedVariation.price : (product?.price || 0)) + (upsellProduct?.price || 0) + (isBumpSelected ? (orderBumpProduct?.price || 0) : 0)) - (appliedCoupon?.amount || 0))}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-white/50 p-3 rounded-xl border border-border/30">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Pagamento seguro e criptografado</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground bg-white/50 p-3 rounded-xl border border-border/30">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Garantia de satisfação de 7 dias</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
