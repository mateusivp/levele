export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // Imagem principal
  images?: string[]; // Múltiplas imagens adicionais
  videoUrl?: string; // Link para vídeo (YouTube, Vimeo, etc)
  slug: string;
  category: string;
  active: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  upsellProductId?: string; // ID do produto sugerido como upsell
  orderBumpId?: string; // Mantido para compatibilidade legado
  orderBumpIds?: string[]; // IDs dos produtos sugeridos como order bump (até 3)
  postPurchaseUpsell?: {
    productId: string;
    price: number;
    quantity: number;
    title: string;
    description: string;
    active: boolean;
  };
  reviews?: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    image?: string; // Foto opcional da avaliação
    status: 'pendente' | 'aprovada' | 'rejeitada';
    date: string;
  }[];
  variations?: {
    id: string;
    name: string; // Ex: "1 Unidade", "Kit 3 Unidades (Pague 2 Leve 3)"
    price: number;
    image?: string;
  }[];
}

export interface Order {
  id: string;
  items: {
    productId: string;
    productName: string;
    variationId?: string;
    variationName?: string;
    quantity: number;
    price: number;
    isBump?: boolean; // Identifica se o item foi um order bump
    isUpsell?: boolean; // Identifica se o item foi um upsell pós-compra
  }[];
  customer: {
    name: string;
    email?: string;
    phone: string;
    cpf?: string;
    address: {
      cep: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  };
  total: number;
  status: 'Novo' | 'Enviado' | 'Entregue' | 'Expedição';
  deliveryDate: string;
  createdAt: string;
  discount?: {
    code: string;
    amount: number;
  };
  statusHistory: {
    status: 'Novo' | 'Enviado' | 'Entregue' | 'Expedição';
    date: string;
  }[];
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
}

export interface AbandonedCart {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationName?: string;
  customer: {
    name: string;
    phone: string;
  };
  total: number;
  status: 'Pendente' | 'Recuperado';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}
