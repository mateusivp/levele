"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Eye, Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  image: z.string().min(1, "URL da imagem principal inválida"),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().url("URL de vídeo inválida").optional().or(z.literal("")),
  category: z.string().min(2, "Categoria é obrigatória"),
  customCategory: z.string().optional(),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
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
            stock: product.stock,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image" | "images", index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === "image") {
          setValue("image", reader.result as string);
        } else if (fieldName === "images" && index !== undefined) {
          const currentImages = [...(watch("images") || [])];
          currentImages[index] = reader.result as string;
          setValue("images", currentImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
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
        stock: data.stock,
        seo: {
          title: data.seoTitle,
          description: data.seoDescription,
          keywords: data.name.split(" ").map(k => k.toLowerCase()),
        },
        upsellProductId: data.upsellProductId,
        orderBumpId: data.orderBumpId,
        postPurchaseUpsell: data.postPurchaseUpsell?.productId ? data.postPurchaseUpsell : undefined,
      };

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (res.ok) {
        console.log(`[Editar Produto] Produto "${data.name}" atualizado com sucesso.`);
        alert("Produto atualizado com sucesso!");
        router.push("/admin");
      }
    } catch (error) {
      console.error("Erro ao atualizar produto", error);
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
            {/* Preço e Estoque */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Vendas</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                />
                {errors.price && <p className="text-destructive text-xs mt-1">{errors.price?.message?.toString()}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estoque</label>
                <input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                />
                {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock?.message?.toString()}</p>}
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
              <div>
                <label className="block text-sm font-medium mb-2">Imagens Adicionais (Galeria)</label>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="aspect-square relative rounded-lg border overflow-hidden bg-muted/50">
                        {watch(`images.${idx}`) ? (
                          <img src={watch(`images.${idx}`)} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-muted transition-colors">
                            <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">Upload</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, "images", idx)} 
                            />
                          </label>
                        )}
                      </div>
                      <input
                        {...register(`images.${idx}`)}
                        className="w-full h-8 px-2 text-[10px] rounded border bg-background outline-none"
                        placeholder="URL ou Upload acima"
                      />
                    </div>
                  ))}
                </div>
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
