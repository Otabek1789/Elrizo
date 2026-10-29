'use client';
import React from 'react';
import { Link } from '@/lib/navigation';
import { CATEGORIES } from '../data/mockData';
import { useStore } from '../store/useStore';
import { useTranslation, getCategoryTitle } from '../utils/translations';

interface CategoryListProps {
  onSelectCategory?: (slug: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
  const { selectedCategorySlug, navigateToCategory } = useStore();
  const { t, language } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          const translatedName = getCategoryTitle(cat.slug, language);

          if (onSelectCategory) {
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`group flex flex-col items-center text-center p-2.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-uzum-primary dark:border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-200 dark:ring-purple-900'
                    : 'border-gray-200/70 dark:border-gray-800/80 hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-card-hover'
                }`}
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800/60 mb-2 p-1 border border-gray-200/60 dark:border-gray-800/80 group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image}
                    alt={translatedName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className={`text-[11px] sm:text-sm font-semibold line-clamp-2 leading-tight transition-colors ${
                  isSelected ? 'text-uzum-primary dark:text-purple-300 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-uzum-primary dark:group-hover:text-purple-400'
                }`}>
                  {translatedName}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">
                  {cat.itemCount}+ {t('itemsUnit')}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              onClick={() => navigateToCategory(cat.slug)}
              className={`group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 border cursor-pointer transition-all duration-300 no-underline ${
                isSelected
                  ? 'border-uzum-primary dark:border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-200 dark:ring-purple-900'
                  : 'border-gray-200/70 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-card-hover'
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-slate-900/60 mb-2.5 p-1 border border-gray-200/60 dark:border-slate-800/80 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={translatedName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className={`text-xs sm:text-sm font-semibold line-clamp-2 leading-tight transition-colors ${
                isSelected ? 'text-uzum-primary dark:text-purple-300 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-uzum-primary dark:group-hover:text-purple-400'
              }`}>
                {translatedName}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {cat.itemCount}+ {t('itemsUnit')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
