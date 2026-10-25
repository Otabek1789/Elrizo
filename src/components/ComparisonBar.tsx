import React from 'react';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';

export const ComparisonBar: React.FC = () => {
  const { 
    comparisonList, 
    products, 
    removeFromComparison, 
    clearComparison, 
    openComparisonModal 
  } = useStore();
  const { t, language } = useTranslation();

  if (comparisonList.length === 0) return null;

  const comparedProducts = comparisonList
    .map(id => products.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between gap-3">
        {/* Left: Info & items preview */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500/20 text-primary-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {comparedProducts.map(product => (
              <div 
                key={product.id}
                className="relative group shrink-0 w-11 h-11 rounded-lg bg-slate-800 dark:bg-slate-700 border border-slate-700 p-1 flex items-center justify-center"
              >
                <img 
                  src={product.images[0]} 
                  alt={product.title} 
                  className="w-full h-full object-contain rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromComparison(product.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] shadow"
                  title={language === 'ru' ? "Удалить" : language === 'en' ? "Remove" : "O'chirish"}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 4 - comparedProducts.length) }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="w-11 h-11 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500 shrink-0"
              >
                +
              </div>
            ))}
          </div>

          <div className="hidden sm:block text-xs text-slate-300 shrink-0">
            <span className="font-semibold text-white">{comparedProducts.length}</span>/4 {language === 'ru' ? 'товара' : language === 'en' ? 'items' : 'tovar'}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearComparison}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title={language === 'ru' ? "Очистить все" : language === 'en' ? "Clear all" : "Hammasini tozalash"}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline text-xs">{t('clearAll')}</span>
          </button>

          <button
            type="button"
            onClick={openComparisonModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-primary-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{t('headerComparison')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
