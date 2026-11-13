import type { Metadata } from 'next';
import { ProfilePage } from '@/views/ProfilePage';

export const metadata: Metadata = {
  title: "Mening profilim | ELRIZO",
  description: "Shaxsiy kabinet, buyurtmalar tarixi, nasiya to'lovlari va cashback balansi.",
};

export default function Page() {
  return <ProfilePage />;
}
