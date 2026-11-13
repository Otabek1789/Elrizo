import type { Metadata } from 'next';
import { TelegramMiniApp } from '@/views/TelegramMiniApp';

export const metadata: Metadata = {
  title: "ELRIZO Telegram Mini App",
  description: "ELRIZO rasmiy Telegram do'koni mini ilovasi.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <TelegramMiniApp />;
}
