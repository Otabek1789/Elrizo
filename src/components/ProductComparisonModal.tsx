import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ShoppingBag, Trash2, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { useTranslation } from '../utils/translations';
import { Link } from 'react-router-dom';

export const ProductComparisonModal: React.FC = () => {
  const {
    comparisonList,
    removeFromComparison,
    clearComparison,
    isComparisonModalOpen,
    closeComparisonModal,
    products,
    addToCart,
    openLoginRequiredModal,
    user
  } = useStore();
  const { t, language } = useTranslation();

  if (!isComparisonModalOpen) return null;

  const comparedProducts = products.filter((p) => comparisonList.includes(p.id));

  // Extract all unique spec keys across compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) => Object.keys(p.specs || {}))
    )
  );

  const handleAddToCart = (product: any) => {
    if (!user) {
      closeComparisonModal();
      openLoginRequiredModal();
      return;
    }
    addToCart(product, 12, 'installment');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <div
          onClick={closeComparisonModal}
          className="fixed inset-0"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/60 shadow-xs">
                <Scale className="w-5 h-5 text-uzum-primary dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                  Tovarlarni o'zaro taqqoslash ({comparedProducts.length})
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-400">
                  Parametrlar, oylik to'lov va narxlarni yonma-yon solishtiring
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comparedProducts.length > 0 && (
                <button
                  onClick={clearComparison}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tozalash</span>
                </button>
              )}
              <button
                onClick={closeComparisonModal}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Table / Columns */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {comparedProducts.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 mx-auto flex items-center justify-center">
                  <Scale className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800 dark:text-white">
                  Taqqoslash ro'yxati bo'sh
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Istalgan tovar kartochkasidagi tarozi belgisini bosib, tovarlarni taqqoslashga qo'shishingiz mumkin.
                </p>
              </div>
            ) : (
              <div className="min-w-[650px]">
                {/* Product Headers Row */}
                <div className="grid grid-cols-5 gap-4 pb-6 border-b border-gray-100 dark:border-slate-800 items-start">
                  <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wider pt-8">
                    Mahsulotlar
                  </div>

                  {comparedProducts.map((p) => {
                    const monthly = calculateMonthlyPaymentQuick(p.price, 12);
                    return (
                      <div key={p.id} className="relative space-y-3 text-center bg-gray-50/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-700/60">
                        <button
                          onClick={() => removeFromComparison(p.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                          title="Taqqoslashdan o'chirish"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-2 flex items-center justify-center">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="max-h-full object-contain"
                          />
                        </div>

                        <div>
                          <Link
                            to={`/product/${p.id}`}
                            onClick={closeComparisonModal}
                            className="text-xs font-black text-gray-900 dark:text-white hover:text-uzum-primary line-clamp-2 leading-tight"
                          >
                            {p.title}
                          </Link>
                          <div className="mt-1 text-sm font-black text-uzum-primary dark:text-purple-300">
                            {formatPrice(p.price, true, language)}
                          </div>
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(monthly, true, language)} / oy (12 oy)
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(p)}
                          className="w-full py-2 px-3 rounded-xl bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Savatga</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Specs rows */}
                <div className="divide-y divide-gray-100 dark:divide-slate-800/60 text-xs">
                  {/* Category */}
                  <div className="grid grid-cols-5 gap-4 py-3 items-center">
                    <span className="font-bold text-gray-400">Toifasi</span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-gray-800 dark:text-slate-200 font-semibold text-center truncate">
                        {p.categoryName}
                      </span>
                    ))}
                  </div>

                  {/* Nasiya 0-0-12 */}
                  <div className="grid grid-cols-5 gap-4 py-3 items-center">
                    <span className="font-bold text-gray-400">0% Boshlang'ich to'lov</span>
                    {comparedProducts.map((p) => (
                      <div key={p.id} className="flex justify-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          Mavjud (0-0-12)
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stock */}
                  <div className="grid grid-cols-5 gap-4 py-3 items-center">
                    <span className="font-bold text-gray-400">Omborda</span>
                    {comparedProducts.map((p) => (
                      <span key={p.id} className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {p.inStock ? 'Mavjud' : 'Tugagan'}
                      </span>
                    ))}
                  </div>

                  {/* Dynamic specs */}
                  {allSpecKeys.map((key) => (
                    <div key={key} className="grid grid-cols-5 gap-4 py-3 items-center hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors rounded-xl px-1">
                      <span className="font-bold text-gray-500 dark:text-slate-400">
                        {key}
                      </span>
                      {comparedProducts.map((p) => (
                        <span key={p.id} className="text-center font-semibold text-gray-800 dark:text-slate-200">
                          {p.specs?.[key] || '—'}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
