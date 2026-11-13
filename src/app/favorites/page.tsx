import type { Metadata } from 'next';
import { FavoritesPage } from '@/views/FavoritesPage';

export const metadata: Metadata = {
  title: "Sevimlilar ro'yxati | ELRIZO",
  description: "Siz saqlab qo'ygan sevimli mahsulotlar to'plami va narxlari.",
};

export default function Page() {
  return <FavoritesPage />;
}
