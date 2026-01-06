import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Tênis Esportivo Performance Pro',
    description: 'O Tênis Esportivo Performance Pro é ideal para quem busca conforto e alta performance em suas corridas e treinos. Com tecnologia de amortecimento avançada e design ergonômico.',
    price: 299.90,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
    slug: 'tenis-esportivo-performance-pro',
    category: 'Calçados',
    active: true,
    seo: {
      title: 'Tênis Esportivo Performance Pro - Conforto e Performance | Loja Levele',
      description: 'Compre o Tênis Esportivo Performance Pro na Loja Levele. Amortecimento de ponta para sua corrida. Entrega rápida e pagamento na entrega.',
      keywords: ['tênis esportivo', 'corrida', 'performance', 'calçados masculinos', 'loja de esportes'],
    },
    variations: [
      { id: '1-1', name: '1 Unidade', price: 299.90 },
      { id: '1-2', name: 'Kit 2 Unidades (Pague 1 e Meio)', price: 449.85 },
      { id: '1-3', name: 'Kit 3 Unidades (Leve 3 Pague 2)', price: 599.80 }
    ]
  },
  {
    id: '2',
    name: 'Smartwatch TechVibe X',
    description: 'Monitore sua saúde e receba notificações em tempo real com o novo Smartwatch TechVibe X. Resistente à água e com bateria de longa duração.',
    price: 459.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop',
    slug: 'smartwatch-techvibe-x',
    category: 'Eletrônicos',
    active: true,
    seo: {
      title: 'Smartwatch TechVibe X - Monitor de Saúde e Notificações | Loja Levele',
      description: 'O Smartwatch TechVibe X é o parceiro ideal para o seu dia a dia. Monitore batimentos, passos e sono. Peça agora e pague na entrega.',
      keywords: ['smartwatch', 'relógio inteligente', 'tecnologia', 'saúde', 'gadgets'],
    },
    variations: [
      { id: '2-1', name: '1 Unidade', price: 459.00 },
      { id: '2-2', name: 'Kit Casal (2 Unidades)', price: 799.00 }
    ]
  },
  {
    id: '3',
    name: 'Mochila Urban Explorer',
    description: 'A Mochila Urban Explorer combina estilo e funcionalidade para o seu cotidiano urbano. Espaço para notebook e diversos compartimentos organizadores.',
    price: 189.90,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1887&auto=format&fit=crop',
    slug: 'mochila-urban-explorer',
    category: 'Acessórios',
    active: true,
    seo: {
      title: 'Mochila Urban Explorer - Resistente e Moderna | Loja Levele',
      description: 'Leve tudo o que você precisa com a Mochila Urban Explorer. Design moderno e compartimento para notebook. Pagamento no ato da entrega.',
      keywords: ['mochila', 'urban explorer', 'mochila notebook', 'acessórios', 'estilo urbano'],
    },
  },
];
