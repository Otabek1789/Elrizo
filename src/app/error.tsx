'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const language = useStore((s) => s.language);
  const isRu = language === 'ru';

  useEffect(() => {
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/10">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {isRu ? 'Произошла ошибка' : 'Xatolik yuz berdi'}
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            {isRu
              ? 'При загрузке страницы произошла непредвиденная ошибка. Попробуйте еще раз или перейдите на главную.'
              : 'Sahifani yuklashda kutilmagan xatolik sodir bo\'ldi. Qayta urinib ko\'ring yoki bosh sahifaga o\'ting.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-uzum-primary hover:bg-uzum-hover active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isRu ? 'Повторить' : 'Qayta urinish'}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-uzum-primary text-gray-700 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>{isRu ? 'Главная' : 'Bosh sahifa'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
