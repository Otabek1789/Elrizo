'use client';
import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function NotFound() {
  const language = useStore((s) => s.language);
  const isRu = language === 'ru';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <span className="text-4xl font-black text-uzum-primary">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {isRu ? 'Страница не найдена' : 'Sahifa topilmadi'}
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            {isRu
              ? 'К сожалению, запрашиваемая страница удалена, переименована или временно недоступна.'
              : 'Kechirasiz, siz qidirayotgan sahifa o\'chirilgan, nomi o\'zgargan yoki vaqtincha mavjud emas.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-uzum-primary hover:bg-uzum-hover active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>{isRu ? 'На главную' : 'Bosh sahifaga qaytish'}</span>
          </Link>

          <Link
            href="/catalog"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-uzum-primary text-gray-700 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isRu ? 'В каталог' : 'Katalogni ko\'rish'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
