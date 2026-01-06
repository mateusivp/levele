"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Eye, Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { slugify, compressImage } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  image: z.string().min(1, "URL da imagem principal inválida"),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().url("URL de vídeo inválida").optional().or(z.literal("")),
  category: z.string().min(2, "Categoria é obrigatória"),
  customCategory: z.string().optional(),
  active: z.boolean().default(true),
  seoTitle: z.string().min(5, "Título SEO deve ser relevante"),
  seoDescription: z.string().min(10, "Descrição SEO deve ser detalhada"),
  upsellProductId: z.string().optional(),
  orderBumpId: z.string().optional(),
  postPurchaseUpsell: z.object({
    productId: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    quantity: z.coerce.number().min(1).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    active: z.boolean(),
  }).optional(),
  variations: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nome da variação é obrigatório"),
    price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  })).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productSlug, setProductSlug] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
  });

  const imageUrl = watch("image");

  useEffect(() => {
    const fetchProductAndList = async () => {
      try {
        const res = await fetch("/api/products");
        const products = await res.json();
        setAllProducts(products);
        const product = products.find((p: any) => p.id === id);
        
        if (product) {
          console.log(`[Editar Produto] Dados do produto "${product.name}" carregados para edição.`);
          setProductSlug(product.slug);
          const standardCategories = ["Calçados", "Eletrônicos", "Acessórios", "Vestuário"];
          const isCustomCategory = !standardCategories.includes(product.category);

          reset({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            images: product.images || ["", "", ""],
            videoUrl: product.videoUrl || "",
            category: isCustomCategory ? "Outra" : product.category,
            customCategory: isCustomCategory ? product.category : "",
            active: product.active ?? true,
            seoTitle: product.seo.title,
            seoDescription: product.seo.description,
            upsellProductId: product.upsellProductId || "",
            orderBumpId: product.orderBumpId || "",
            postPurchaseUpsell: product.postPurchaseUpsell || {
              productId: "",
              price: 0,
              quantity: 1,
              title: "",
              description: "",
              active: false
            },
          });
        } else {
          router.push("/admin");
        }
      } catch (error) {
        console.error("Erro ao buscar produto", error);
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndList();
  }, [id, reset, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image" | "images", index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        console.log(`[Upload] Imagem original: ${(base64.length / 1024).toFixed(2)} KB`);
        
        // Comprimir imagem
        const compressed = await compressImage(base64);
        console.log(`[Upload] Imagem comprimida: ${(compressed.length / 1024).toFixed(2)} KB`);

        if (fieldName === "image") {
          setValue("image", compressed);
        } else if (fieldName === "images" && index !== undefined) {
          const currentImages = [...(watch("images") || [])];
          currentImages[index] = compressed;
          setValue("images", currentImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    console.log("[Editar Produto] Iniciando atualização...");
    
    try {
      const category = data.category === "Outra" ? data.customCategory || "Geral" : data.category;
      
      const productData = {
        id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        images: data.images?.filter(img => img.length > 0),
        videoUrl: data.videoUrl,
        category: category,
        active: data.active,
        seo: {
          title: data.seoTitle,
          description: data.seoDescription,
          keywords: data.name.split(" ").map(k => k.toLowerCase()),
        },
        upsellProductId: data.upsellProductId,
        orderBumpId: data.orderBumpId,
        postPurchaseUpsell: data.postPurchaseUpsell?.productId ? data.postPurchaseUpsell : undefined,
      };

      console.log("[Editar Produto] Enviando dados para a API...", { 
        id, 
        name: data.name,
        imageSize: data.image?.length,
        additionalImagesCount: productData.images?.length 
      });

      // AbortController para timeout de 30 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log("[Editar Produto] Resposta da API recebida:", res.status);

      if (res.ok) {
        console.log(`[Editar Produto] Produto "${data.name}" atualizado com sucesso.`);
        alert("Produto atualizado com sucesso!");
        router.push("/admin?tab=produtos&t=" + Date.now());
        router.refresh();
      } else {
        const errorText = await res.text();
        console.error("[Editar Produto] Erro na resposta da API:", errorText);
        let errorData = {};
        try { errorData = JSON.parse(errorText); } catch (e) {}
        alert(`Erro ao atualizar produto: ${(errorData as any).error || res.statusText || "Erro desconhecido"}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error("[Editar Produto] A requisição excedeu o tempo limite (30s)");
        alert("O servidor demorou muito para responder. Tente usar imagens menores.");
      } else {
        console.error("[Editar Produto] Erro crítico ao atualizar produto:", error);
        alert(`Erro de rede ou no servidor: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin?tab=produtos" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Gerenciar Produtos
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Editar Produto</h1>
          {productSlug && (
            <Link 
              href={`/produto/${productSlug}`}
              target="_blank"
              className="flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors border border-primary"
            >
              <Eye className="h-4 w-4" />
              Visualizar no Site
            </Link>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Informações Básicas</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                <input
                  {...register("name")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Tênis Nike Air Max"
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <RichTextEditor 
                  content={watch("description")} 
                  onChange={(content) => setValue("description", content)}
                />
                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* SEO */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Otimização SEO (Google)</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Título SEO</label>
                <input
                  {...register("seoTitle")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Como o produto aparecerá no Google"
                />
                {errors.seoTitle && <p className="text-destructive text-xs mt-1">{errors.seoTitle.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Descrição</label>
                <textarea
                  {...register("seoDescription")}
                  rows={3}
                  className="w-full p-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                  placeholder="Breve resumo para os resultados de busca..."
                />
                {errors.seoDescription && <p className="text-destructive text-xs mt-1">{errors.seoDescription.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status e Preço */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Configurações de Venda</h2>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div>
                  <label className="block text-sm font-bold">Status do Produto</label>
                  <p className="text-[10px] text-muted-foreground">Define se o produto está visível na loja.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${watch("active") ? 'text-green-600' : 'text-destructive'}`}>
                    {watch("active") ? 'ATIVO' : 'DESATIVADO'}
                  </span>
                  <input
                    type="checkbox"
                    {...register("active")}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço Principal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                />
                {errors.price && <p className="text-destructive text-xs mt-1">{errors.price?.message?.toString()}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Produto para Upsell (Compre Junto)</label>
                <select
                  {...register("upsellProductId")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Nenhum</option>
                  {allProducts.filter(p => p.id !== id).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Exibido na página do produto para incentivar a compra de um segundo item.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Produto para Order Bump (Oferta no Checkout)</label>
                <select
                  {...register("orderBumpId")}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Nenhum</option>
                  {allProducts.filter(p => p.id !== id).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Exibido como uma oferta rápida de um clique no checkout.</p>
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  {...register("category")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none mb-2"
                >
                  <option value="">Selecione...</option>
                  <option value="Calçados">Calçados</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Vestuário">Vestuário</option>
                  <option value="Outra">Outra (Criar Nova)</option>
                </select>
                {watch("category") === "Outra" && (
                  <input
                    {...register("customCategory")}
                    className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Nome da nova categoria"
                    autoFocus
                  />
                )}
                {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
              </div>

            {/* Upsell Pós-Compra */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-bold">Upsell Pós-Compra (Página de Obrigado)</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="postPurchaseActive"
                    {...register("postPurchaseUpsell.active")}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="postPurchaseActive" className="text-sm font-medium">Ativo</label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Produto da Oferta</label>
                  <select
                    {...register("postPurchaseUpsell.productId")}
                    className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">Selecione um produto...</option>
                    {allProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Especial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("postPurchaseUpsell.price")}
                      className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Ex: 49.90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantidade</label>
                    <input
                      type="number"
                      {...register("postPurchaseUpsell.quantity")}
                      className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Ex: 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Título da Oferta</label>
                  <input
                    {...register("postPurchaseUpsell.title")}
                    className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: ESPERE! Temos uma oferta única para você..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição Curta</label>
                  <textarea
                    {...register("postPurchaseUpsell.description")}
                    rows={2}
                    className="w-full p-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Ex: Adicione mais uma unidade por apenas..."
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Esta oferta aparecerá imediatamente após o cliente finalizar o pedido principal.</p>
            </div>

            {/* Multimídia */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Multimídia</h2>
              
              {/* Imagem Principal */}
              <div>
                <label className="block text-sm font-medium mb-1">Imagem Principal (Upload ou URL)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    {...register("image")}
                    className="flex-1 h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <label className="h-11 px-4 bg-muted hover:bg-muted/80 rounded-lg flex items-center justify-center cursor-pointer transition-colors border">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "image")} />
                  </label>
                </div>
                <div className="aspect-video relative rounded-lg border overflow-hidden bg-muted/50 mb-4">
                  {watch("image") ? (
                    <img src={watch("image")} alt="Principal" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                      Sem imagem principal
                    </div>
                  )}
                </div>
              </div>

              {/* Imagens Adicionais */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Imagens Adicionais (Galeria)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentImages = watch("images") || [];
                      setValue("images", [...currentImages, ""]);
                    }}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold hover:bg-primary/20"
                  >
                    + Add Imagem
                  </button>
                </div>
                
                {(watch("images") || []).map((img, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex gap-2">
                      <input
                        {...register(`images.${idx}`)}
                        className="flex-1 h-9 px-3 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="URL da imagem adicional"
                      />
                      <label className="h-9 px-3 bg-white border rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "images", idx)} />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentImages = watch("images") || [];
                          setValue("images", currentImages.filter((_, i) => i !== idx));
                        }}
                        className="h-9 px-3 text-destructive hover:bg-destructive/10 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {watch(`images.${idx}`) && (
                      <div className="h-20 w-20 rounded border overflow-hidden bg-white">
                        <img src={watch(`images.${idx}`)} alt={`Preview ${idx}`} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Vídeo */}
              <div className="pt-2">
                <label className="block text-sm font-medium mb-1">Link do Vídeo (YouTube/Vimeo)</label>
                <input
                  {...register("videoUrl")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  O vídeo será exibido na descrição do produto.
                </p>
                {errors.videoUrl && <p className="text-destructive text-xs mt-1">{errors.videoUrl.message}</p>}
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
                  SALVANDO...
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  SALVAR ALTERAÇÕES
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
