import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Percent,
  SlidersHorizontal,
  ArrowRight,
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { BannerSlider } from '../components/BannerSlider';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';
import { formatPrice } from '../utils/calculator';

export const HomePage: React.FC = () => {
  const { products, promoCodes, applyPromoCode, openCart, addToast } = useStore();
  const { t, language } = useTranslation();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    addToast(`${code} ${language === 'ru' ? 'промокод скопирован!' : language === 'en' ? 'promo code copied!' : 'promokodi nusxalandi!'}`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyDirect = (code: string) => {
    const res = applyPromoCode(code);
    if (res.success) {
      addToast(res.message || `${code} promokodi qo'llandi!`, 'success');
      openCart();
    } else {
      addToast(res.message || 'Xatolik', 'error');
    }
  };

  const weeklyOffers = products.filter((p) => p.isWeeklyOffer);
  const zeroDownProducts = products.filter((p) => p.hasZeroDown);
  const bestSellers = products.filter((p) => p.isBestSeller);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-10 animate-in fade-in duration-300">
      {/* 1. Asosiy Promo Bannerlar Slayderi */}
      <BannerSlider />

      {/* 2. Toifalar Karuseli / Ro'yxati */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t('popularCategories')}</span>
          </h2>
          <Link
            to="/catalog"
            className="text-xs sm:text-sm font-bold text-uzum-primary hover:text-uzum-hover flex items-center gap-1 group"
          >
            <span>{t('allCategories')}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <CategoryList />
      </div>

      {/* 3. ELRIZO Ishonch va FinTech Afzalliklari Bloki */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: Zap,
            title: t('trust1Title'),
            desc: t('trust1Desc'),
            bg: "bg-purple-50/80 dark:bg-slate-800/80 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-slate-800",
          },
          {
            icon: Percent,
            title: t('trust2Title'),
            desc: t('trust2Desc'),
            bg: "bg-emerald-50/80 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-slate-800",
          },
          {
            icon: Truck,
            title: t('trust3Title'),
            desc: t('trust3Desc'),
            bg: "bg-blue-50/80 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-slate-800",
          },
          {
            icon: ShieldCheck,
            title: t('trust4Title'),
            desc: t('trust4Desc'),
            bg: "bg-amber-50/80 dark:bg-slate-800/80 text-amber-800 dark:text-amber-300 border-amber-200/50 dark:border-slate-800",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className={`p-4 rounded-2xl border ${item.bg} flex items-start gap-3 shadow-xs`}
          >
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-700/80 shadow-xs shrink-0">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="font-black text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                {item.title}
              </div>
              <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {item.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3.5. ELRIZO Rasmiy Chegirma Promokodlari Bloki */}
      <section className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white/10 backdrop-blur-md text-amber-300">
                <Tag className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                {language === 'ru' ? 'Специальные купоны' : language === 'en' ? 'Special Coupons' : 'Maxsus Aksiya Kuponlari'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {language === 'ru' ? 'Активируйте промокод и экономьте до 20%' : language === 'en' ? 'Apply promo codes and save up to 20%' : "Promokodni faollashtiring va 20% gacha tejang!"}
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-xl">
              {language === 'ru' ? 'Скопируйте нужный промокод в один клик и примените его в корзине или при оформлении заказа.' : language === 'en' ? 'Copy your preferred promo code with one click and apply it in your cart or checkout.' : "Bir marta bosish bilan promokodni nusxalang va savatchada yoki buyurtma berishda darhol chegirmaga ega bo'ling."}
            </p>
          </div>
        </div>

        {/* Promokodlar gridi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          {promoCodes.filter(p => p.isActive).map((promo) => {
            const isCopied = copiedCode === promo.code;
            const discountLabel = promo.discountType === 'percentage' 
              ? `-${promo.discountValue}%` 
              : `-${formatPrice(promo.discountValue, false, language)} so'm`;

            return (
              <motion.div
                key={promo.id}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-black tracking-widest font-mono text-amber-300">
                      {promo.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                      {discountLabel}
                    </span>
                  </div>
                  <p className="text-xs text-purple-100/80 mt-1.5 leading-relaxed line-clamp-2">
                    {promo.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    title="Nusxa olish"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-black">{language === 'ru' ? 'Скопировано!' : language === 'en' ? 'Copied!' : 'Nusxalandi!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'ru' ? 'Копировать' : language === 'en' ? 'Copy' : 'Nusxalash'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleApplyDirect(promo.code)}
                    className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs font-black transition-all shadow-md active:scale-95 shrink-0"
                    title="Savatda qo'llash"
                  >
                    {language === 'ru' ? 'В корзину' : language === 'en' ? 'Apply' : "Qo'llash"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Hafta Takliflari (Hot Weekly Offers) */}
      {weeklyOffers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Flame className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {t('weeklyOffers')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('weeklyOffersDesc')}</p>
              </div>
            </div>

            <Link
              to="/catalog"
              className="text-xs sm:text-sm font-bold text-uzum-primary hover:underline flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {weeklyOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. 0-0-12 Nasiya Savdo Saralangan Tovar To'plami */}
      {zeroDownProducts.length > 0 && (
        <section className="space-y-4 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 dark:from-slate-900/90 dark:via-slate-800 dark:to-slate-900/90 p-5 sm:p-7 rounded-3xl border border-purple-100/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-uzum-primary text-white shadow-sm">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    {t('zeroDownTitle')}
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                    {t('zeroDownBadge')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('zeroDownDesc')}</p>
              </div>
            </div>

            <Link
              to="/catalog"
              className="px-4 py-2 rounded-xl bg-uzum-primary text-white font-bold text-xs hover:bg-uzum-hover transition-colors shadow-sm w-fit flex items-center gap-1.5"
            >
              <span>{t('viewInCatalog')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {zeroDownProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Ommabop Mahsulotlar (Barcha tovarlar) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-uzum-primary dark:text-purple-300">
              <Sparkles className="w-5 h-5 fill-uzum-primary dark:fill-purple-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {t('popularProducts')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('popularProductsDesc')}</p>
            </div>
          </div>

          <Link
            to="/catalog"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-uzum-primary dark:text-purple-300 hover:underline bg-purple-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-purple-200/50 dark:border-slate-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('filtersAndAll')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Katta Taklif Banneri (Katalog & Filtrlash sahifasiga yo'naltiruvchi) */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#640199] via-[#7C3AED] to-[#4F46E5] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            {t('bottomBannerBadge')}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('bottomBannerTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-purple-100">
            {t('bottomBannerDesc')}
          </p>
        </div>

        <Link
          to="/catalog"
          className="z-10 px-6 py-3.5 rounded-2xl bg-white text-gray-900 hover:bg-yellow-300 hover:text-black font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 shrink-0 active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4 text-purple-700" />
          <span>{t('bottomBannerBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Ambient background blur */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};
