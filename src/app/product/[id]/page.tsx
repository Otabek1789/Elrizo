import type { Metadata } from 'next';
import { ProductDetail } from '@/views/ProductDetail';
import { PRODUCTS } from '@/data/mockData';

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = PRODUCTS.find((p) => p.id === params.id);
  if (!product) {
    return {
      title: "Mahsulot topilmadi | ELRIZO Nasiya Savdo",
      description: "Qidirilgan mahsulot mavjud emas yoki o'chirilgan.",
    };
  }

  const priceText = product.price.toLocaleString('uz-UZ') + " so'm";
  const monthlyText = Math.round(product.price / 12).toLocaleString('uz-UZ') + " so'm/oy";

  return {
    title: `${product.title} — 0-0-12 Halol Nasiya | ELRIZO`,
    description: `${product.title} eng qulay narxda: ${priceText} (oyiga ${monthlyText}). 0% Boshlang'ich to'lov, 0% ustama. 24 soatda bepul yetkazib berish.`,
    openGraph: {
      title: `${product.title} — 0-0-12 Nasiya | ELRIZO`,
      description: `${product.title} — oyiga ${monthlyText}. 1 yillik kafolat va butun O'zbekiston bo'ylab bepul yetkazib berish.`,
      images: [
        {
          url: product.images?.[0] || '/elrizo-brand.png',
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
  };
}

export default function Page() {
  return <ProductDetail />;
}
