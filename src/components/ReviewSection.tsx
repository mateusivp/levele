"use client";

import { useState } from "react";
import { Star, MessageCircle, X, Upload, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  image?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  date: string;
}

interface ReviewSectionProps {
  productId: string;
  initialReviews: Review[];
}

export default function ReviewSection({ productId, initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userName: "",
    comment: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.comment) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userName: formData.userName,
          rating,
          comment: formData.comment,
          image: imagePreview || undefined,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({ userName: "", comment: "" });
        setRating(5);
        setImagePreview(null);
        setTimeout(() => {
          setIsSuccess(false);
          setIsFormOpen(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      alert("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar apenas avaliações aprovadas para exibir
  const approvedReviews = reviews.filter(r => r.status === 'aprovada');
  
  // Se não houver avaliações aprovadas, podemos mostrar as iniciais (se forem aprovadas ou se for mock)
  // No caso real, a API só retornaria as aprovadas para o front público.
  
  return (
    <section className="mt-20 border-t pt-16">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black mb-2">Avaliações de Clientes</h2>
          <div className="flex items-center gap-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-current" />
              ))}
            </div>
            <span className="text-lg font-bold">
              {approvedReviews.length > 0 
                ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
                : "5.0"}
              /5 
              <span className="text-muted-foreground font-normal text-sm ml-1">
                ({approvedReviews.length} avaliações)
              </span>
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          Deixar uma avaliação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {approvedReviews.length > 0 ? (
          approvedReviews.map((review) => (
            <div key={review.id} className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  {review.image && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border">
                      <Image src={review.image} alt={review.userName} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{review.userName}</p>
                    <div className="flex text-yellow-400 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground col-span-2 text-center py-10 bg-muted/20 rounded-2xl border-2 border-dashed">
            Seja o primeiro a avaliar este produto!
          </p>
        )}
      </div>

      {/* Modal do Formulário */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Nova Avaliação</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-12 text-center">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h4 className="text-xl font-bold mb-2">Avaliação Enviada!</h4>
                <p className="text-muted-foreground">Obrigado por compartilhar sua experiência. Sua avaliação será revisada por nossa equipe.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Seu Nome</label>
                  <input
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sua Nota</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sua Foto (Opcional)</label>
                  <div className="flex items-center gap-4">
                    <label className="h-20 w-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden relative">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1 text-center">Subir Foto</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {imagePreview && (
                      <button 
                        type="button" 
                        onClick={() => setImagePreview(null)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Seu Comentário</label>
                    <span className="text-[10px] text-muted-foreground">{formData.comment.length}/180</span>
                  </div>
                  <textarea
                    required
                    maxLength={180}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={4}
                    className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Conte o que você achou do produto..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "ENVIAR AVALIAÇÃO"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
