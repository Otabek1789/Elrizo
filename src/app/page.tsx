import type { Metadata } from 'next';
import { HomePage } from '@/views/HomePage';

export const metadata: Metadata = {
  title: "ELRIZO - Siz rozi — biz rozi! | 0-0-12 Halol Nasiya Savdo",
  description: "ELRIZO NASIYA SAVDO — O'zbekiston bo'ylab 0% boshlang'ich to'lov, 0% ustama bilan 12 oygacha halol nasiya savdo do'koni. 24 soatda bepul yetkazib berish.",
  openGraph: {
    title: "ELRIZO - Siz rozi — biz rozi! | 0-0-12 Halol Nasiya Savdo",
    description: "0% Boshlang'ich to'lov, 0% ustama, 12 oygacha halol nasiya savdo. Barcha smartfonlar va maishiy texnika.",
    url: "https://elrizonasiya.vercel.app",
    siteName: "ELRIZO Nasiya Savdo",
    images: [
      {
        url: "/elrizo-brand.png",
        width: 1200,
        height: 630,
        alt: "ELRIZO Nasiya Savdo",
      },
    ],
    locale: "uz_UZ",
    type: "website",
  },
};

export default function Page() {
  return <HomePage />;
}
