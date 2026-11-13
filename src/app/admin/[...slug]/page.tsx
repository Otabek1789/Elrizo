import type { Metadata } from 'next';
import { AdminPanel } from '@/views/AdminPanel';

export const metadata: Metadata = {
  title: "Boshqaruv paneli — Admin | ELRIZO",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminPanel />;
}
