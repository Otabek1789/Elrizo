import Link from 'next/link';
import { Home, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-800/80 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <span className="text-4xl font-black text-uzum-primary dark:text-purple-400">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Sahifa topilmadi
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Kechirasiz, siz qidirayotgan sahifa o&apos;chirilgan, nomi o&apos;zgargan yoki vaqtincha mavjud emas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-uzum-primary hover:bg-uzum-primaryHover active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>

          <Link
            href="/catalog"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-slate-700 hover:border-uzum-primary text-gray-700 dark:text-slate-200 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-slate-800 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Katalogni ko&apos;rish</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
