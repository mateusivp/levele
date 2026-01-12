import { NextResponse } from "next/server";
import { getProductById, saveProductToDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, rating, comment, image } = body;

    if (!productId || !userName || !rating || !comment) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const newReview = {
      id: Math.random().toString(36).substring(2, 11),
      userName: String(userName),
      rating: Number(rating),
      date: new Date().toISOString(),
      comment: String(comment).substring(0, 180),
      image: image ? String(image) : undefined,
      status: 'pendente' as const
    };

    if (!product.reviews) {
      product.reviews = [];
    }

    product.reviews.push(newReview);

    // Persistir no banco de dados (que também atualiza a memória interna)
    await saveProductToDb(product);

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

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const reviewIndex = product.reviews?.findIndex(r => r.id === reviewId);
    if (reviewIndex === undefined || reviewIndex === -1) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    if (product.reviews) {
      product.reviews[reviewIndex].status = status as 'pendente' | 'aprovada' | 'rejeitada';
    }

    await saveProductToDb(product);

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

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const reviewIndex = product.reviews?.findIndex(r => r.id === reviewId);
    if (reviewIndex === undefined || reviewIndex === -1) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    product.reviews?.splice(reviewIndex, 1);

    await saveProductToDb(product);

    console.log(`[API] Avaliação ${reviewId} deletada do produto ${productId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Erro ao deletar avaliação:", error);
    return NextResponse.json({ error: "Erro ao deletar avaliação" }, { status: 500 });
  }
}
