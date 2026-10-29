'use client';
import React from 'react';
import { useNavigate, Link } from '@/lib/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ProductCard } from '../components/ProductCard';
import { useTranslation } from '../utils/translations';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, products } = useStore();
  const { t } = useTranslation();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-24 md:pb-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>{t('favorites')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('favoritesSubtitle')}
          </p>
        </div>
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200/80 dark:border-slate-800">
          {favoriteProducts.length} {t('itemsUnit')}
        </span>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('favoritesEmptyTitle')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('favoritesEmptyDesc')}
          </p>
          <Link
            to="/"
            className="mt-2 inline-block px-6 py-2.5 bg-uzum-primary text-white font-bold text-xs rounded-xl hover:bg-uzum-hover transition-colors shadow-sm no-underline"
          >
            {t('exploreProducts')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
