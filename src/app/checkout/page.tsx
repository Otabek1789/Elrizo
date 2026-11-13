import type { Metadata } from 'next';
import { Checkout } from '@/views/Checkout';

export const metadata: Metadata = {
  title: "Buyurtmani rasmiylashtirish — 0-0-12 Halol Nasiya | ELRIZO",
  description: "ELRIZO online do'konida xaridlarni 0% boshlang'ich to'lov va 0% ustama bilan qulay rasmiylashtiring.",
};

export default function Page() {
  return <Checkout />;
}
