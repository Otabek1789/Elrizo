import type { Metadata } from 'next';
import { LoginPage } from '@/views/LoginPage';

export const metadata: Metadata = {
  title: "Kirish va Ro'yxatdan o'tish | ELRIZO",
  description: "ELRIZO tizimiga Telegram, Google yoki hisobingiz orqali xavfsiz va tezkor kiring.",
};

export default function Page() {
  return <LoginPage />;
}
