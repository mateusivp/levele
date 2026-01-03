"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { useEffect } from "react";

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
  image: z.string().min(1, "Imagem é obrigatória"),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  category: z.string().min(2, "Categoria é obrigatória"),
  customCategory: z.string().optional(),
  stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  seoTitle: z.string().min(5, "Título SEO deve ser relevante"),
  seoDescription: z.string().min(10, "Descrição SEO deve ser detalhada"),
  upsellProductId: z.string().optional(),
  orderBumpId: z.string().optional(),
  variations: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Nome da variação é obrigatório"),
    price: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
    stock: z.coerce.number().min(0, "Estoque não pode ser negativo"),
  })).optional(),
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

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      stock: 10,
      variations: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });

  const imageUrl = watch("image");
  const additionalImages = watch("images") || [];
  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const products = await res.json();
        setAllProducts(products);
      } catch (error) {
        console.error("Erro ao buscar produtos", error);
      }
    };
    fetchProducts();
    console.log("[Novo Produto] Página de cadastro carregada.");
  }, []);

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

  const addImageField = () => {
    const currentImages = watch("images") || [];
    setValue("images", [...currentImages, ""]);
  };

  const removeImageField = (index: number) => {
    const currentImages = watch("images") || [];
    setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const category = data.category === "Outra" ? data.customCategory || "Geral" : data.category;
      
      const productData = {
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
        variations: data.variations && data.variations.length > 0 ? data.variations : undefined,
        postPurchaseUpsell: data.postPurchaseUpsell?.productId ? data.postPurchaseUpsell : undefined,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        console.log(`[Novo Produto] Produto "${data.name}" cadastrado com sucesso.`);
        alert("Produto cadastrado com sucesso! (Simulação)");
        router.push("/admin");
      }
    } catch (error) {
      console.error("Erro ao cadastrar produto", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin?tab=produtos" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Gerenciar Produtos
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Novo Produto</h1>
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
                <label className="block text-sm font-medium mb-1">Estoque Inicial</label>
                <input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                />
                {errors.stock && <p className="text-destructive text-xs mt-1">{errors.stock?.message?.toString()}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Produto para Upsell (Compre Junto)</label>
                <select
                  {...register("upsellProductId")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Nenhum</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Exibido na página do produto para incentivar a compra de um segundo item.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Produto para Order Bump (Oferta no Checkout)</label>
                <select
                  {...register("orderBumpId")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Nenhum</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price})</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Exibido como uma oferta rápida de um clique no checkout.</p>
              </div>
            </div>

            {/* Variações e Kits */}
            <div className="bg-card p-6 rounded-xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold">Variações e Kits</h2>
                <button
                  type="button"
                  onClick={() => append({ id: Math.random().toString(36).substring(2, 9), name: "", price: 0, stock: 10 })}
                  className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Kit/Variação
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Use variações para vender kits (ex: "Kit 3 Unidades - 20% OFF") ou diferentes versões do mesmo produto.</p>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-muted/30 rounded-lg border border-dashed space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 p-1.5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Nome da Variação/Kit</label>
                        <input
                          {...register(`variations.${index}.name` as const)}
                          placeholder="Ex: Pague 2 Leve 3"
                          className="w-full h-9 px-3 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Preço (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`variations.${index}.price` as const, { valueAsNumber: true })}
                            className="w-full h-9 px-3 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Estoque</label>
                          <input
                            type="number"
                            {...register(`variations.${index}.stock` as const, { valueAsNumber: true })}
                            className="w-full h-9 px-3 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">Nenhuma variação cadastrada.</p>
                  </div>
                )}
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  {...register("category")}
                  className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Selecione...</option>
                  <option value="Calçados">Calçados</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Vestuário">Vestuário</option>
                  <option value="Outra">Outra (Criar Nova)</option>
                </select>
                {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
              </div>

              {selectedCategory === "Outra" && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-sm font-medium mb-1">Nome da Nova Categoria</label>
                  <input
                    {...register("customCategory")}
                    className="w-full h-11 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Fitness, Decoração..."
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Essa categoria será criada e otimizada para SEO automaticamente.</p>
                </div>
              )}

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

            <div className="bg-card p-6 rounded-xl border space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Multimídia</h2>
              
              {/* Imagem Principal */}
              <div>
                <label className="block text-sm font-medium mb-1">Imagem Principal (Thumbnail)</label>
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
                {imageUrl && (
                  <div className="aspect-video rounded-lg border overflow-hidden bg-muted/50 mb-4">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Imagens Adicionais */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium">Imagens Adicionais (Galeria)</label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold hover:bg-primary/20"
                  >
                    + Add Imagem
                  </button>
                </div>
                
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex gap-2">
                      <input
                        value={img}
                        onChange={(e) => {
                          const newImgs = [...additionalImages];
                          newImgs[idx] = e.target.value;
                          setValue("images", newImgs);
                        }}
                        className="flex-1 h-9 px-3 text-sm rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none"
                        placeholder="URL da imagem adicional"
                      />
                      <label className="h-9 px-3 bg-white border rounded-md flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "images", idx)} />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        className="h-9 px-3 text-destructive hover:bg-destructive/10 rounded-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {img && (
                      <div className="h-20 w-20 rounded border overflow-hidden bg-white">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-contain" />
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
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-[10px] text-muted-foreground mt-1">O vídeo será exibido na descrição do produto.</p>
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
                  CADASTRAR PRODUTO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
