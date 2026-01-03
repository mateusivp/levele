import { Metadata } from 'next';

export const siteConfig = {
  name: 'Loja Levele',
  description: 'A melhor loja virtual com pagamento na entrega. Produtos de qualidade e entrega rápida.',
  url: 'https://levele.com.br',
  ogImage: 'https://levele.com.br/og.jpg',
  links: {
    twitter: 'https://twitter.com/levele',
    github: 'https://github.com/levele',
  },
};

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: [
      'loja virtual',
      'pagamento na entrega',
      'ecommerce',
      'produtos importados',
      'entrega rápida',
    ],
    authors: [
      {
        name: 'Levele',
      },
    ],
    creator: 'Levele',
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: siteConfig.url,
      title,
      description,
      siteName: title,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@levele',
    },
    icons: {
      icon: '/favicon.ico',
    },
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
