import { NextResponse } from "next/server";
import { dbProducts } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, rating, comment, image } = body;

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const productIndex = dbProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const newReview = {
      id: Math.random().toString(36).substring(2, 11),
      userName: String(userName),
      rating: Number(rating),
      comment: String(comment).substring(0, 180),
      image: image ? String(image) : undefined,
      status: 'pendente' as const,
      date: new Date().toISOString()
    };

    if (!dbProducts[productIndex].reviews) {
      dbProducts[productIndex].reviews = [];
    }

    dbProducts[productIndex].reviews!.push(newReview);

    // Persistir no banco de dados "fixo" se necessário (embora dbProducts seja volátil em dev, isso ajuda a manter a referência)
    console.log(`[API] Nova avaliação pendente para o produto ${productId}:`, newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("[API] Erro ao enviar avaliação:", error);
    return NextResponse.json({ error: "Erro ao processar avaliação" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, reviewId, status } = body;

    if (!productId || !reviewId || !status) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const productIndex = dbProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const reviewIndex = dbProducts[productIndex].reviews?.findIndex(r => r.id === reviewId);
    if (reviewIndex === undefined || reviewIndex === -1) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    if (dbProducts[productIndex].reviews) {
      dbProducts[productIndex].reviews[reviewIndex].status = status as 'pendente' | 'aprovada' | 'rejeitada';
    }

    console.log(`[API] Avaliação ${reviewId} atualizada para status: ${status}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Erro ao atualizar avaliação:", error);
    return NextResponse.json({ error: "Erro ao atualizar avaliação" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const reviewId = searchParams.get("reviewId");

    if (!productId || !reviewId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const productIndex = dbProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const reviewIndex = dbProducts[productIndex].reviews?.findIndex(r => r.id === reviewId);
    if (reviewIndex === undefined || reviewIndex === -1) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    dbProducts[productIndex].reviews?.splice(reviewIndex, 1);

    console.log(`[API] Avaliação ${reviewId} deletada do produto ${productId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Erro ao deletar avaliação:", error);
    return NextResponse.json({ error: "Erro ao deletar avaliação" }, { status: 500 });
  }
}
