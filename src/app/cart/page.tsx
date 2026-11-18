import type { Metadata } from 'next';
import { CartPage } from '@/views/CartPage';

export const metadata: Metadata = {
  title: "Savat | ELRIZO",
  description: "Xaridlaringiz savati, 0-0-12 Halol nasiya hisob-kitobi va buyurtma rasmiylashtirish.",
};

export default function Page() {
  return <CartPage />;
}
