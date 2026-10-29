'use client';
import React, { useState } from 'react';
import { useNavigate, Link } from '@/lib/navigation';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Calculator, Zap, Scale, Send } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { calculateMonthlyPaymentQuick, formatPrice } from '../utils/calculator';
import { useTranslation } from '../utils/translations';
import { sendProductToTelegram } from '../utils/telegramBot';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onInstallmentClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onInstallmentClick,
  onAddToCart,
}) => {
  const navigate = useNavigate();
  const {
    toggleFavorite,
    isFavorite,
    addToCart,
    openCalculator,
    comparisonList,
    addToComparison,
    removeFromComparison,
    user,
    addToast,
  } = useStore();
  const { t, language } = useTranslation();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const favorite = isFavorite(product.id);
  const isCompared = comparisonList.includes(product.id);

  // 12 oylik nasiya to'lovi
  const monthlyPayment = calculateMonthlyPaymentQuick(product.price, 12);

  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    addToCart(product, 12, 'installment');
  };

  const handleBuyOnInstallment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInstallmentClick) {
      onInstallmentClick(product);
      return;
    }
    openCalculator(product);
  };

  const [isSendingTg, setIsSendingTg] = useState(false);

  const handleSendProductToTelegram = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSendingTg(true);
    const res = await sendProductToTelegram(product, { user });
    setIsSendingTg(false);
    if (res.success) {
      addToast(`«${product.title}» ${t('telegramProductSent')}`, 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
    }
  };

  const [imageError, setImageError] = useState(false);
  const fallbackImg = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
  const currentImg = !imageError && product.images && product.images.length > 0
    ? (product.images[activeImageIndex] || product.images[0] || fallbackImg)
    : fallbackImg;

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-gray-200/70 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-500/40 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Top Image Section */}
      <div 
        className="relative w-full aspect-[4/4.2] overflow-hidden bg-gray-50 dark:bg-slate-900/60 flex items-center justify-center"
        onMouseEnter={() => {
          if (product.images && product.images.length > 1) setActiveImageIndex(1);
        }}
        onMouseLeave={() => {
          setActiveImageIndex(0);
        }}
      >
        <motion.img
          src={currentImg}
          alt={product.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Action Buttons: Favorite, Compare & Telegram */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleToggleFavorite}
            className="p-2 rounded-full bg-white/85 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 backdrop-blur-md text-gray-400 dark:text-gray-300 hover:text-rose-500 transition-colors shadow-sm"
            title={t('addToFavoritesTitle')}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? 'fill-rose-500 text-rose-500 animate-pulse' : ''
              }`}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleToggleComparison}
            className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
              isCompared
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                : 'bg-white/85 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-300 hover:text-primary-600'
            }`}
            title={isCompared ? t('productCompareRemoveTooltip') : t('productCompareAddTooltip')}
          >
            <Scale className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleSendProductToTelegram}
            disabled={isSendingTg}
            className="p-2 rounded-full bg-white/85 hover:bg-sky-50 dark:bg-slate-800/80 dark:hover:bg-sky-950/40 backdrop-blur-md text-sky-500 hover:text-sky-600 transition-colors shadow-sm cursor-pointer"
            title={`${t('telegramSendProduct')} (@elrizo_bot)`}
          >
            <Send className={`w-4 h-4 -rotate-12 ${isSendingTg ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {product.hasZeroDown && (
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm w-fit tracking-wide"
            >
              <Zap className="w-2.5 h-2.5 fill-white" />
              <span>0-0-12</span>
            </motion.span>
          )}
          {product.discountPercentage && (
            <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm w-fit">
              -{product.discountPercentage}%
            </span>
          )}
          {product.isWeeklyOffer && (
            <span className="inline-flex items-center justify-center bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm w-fit">
              {t('weeklyOfferBadge')}
            </span>
          )}
        </div>

        {/* Quick Calculator Trigger on Image Hover */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyOnInstallment}
            className="w-full py-2 bg-black/80 hover:bg-black text-white text-xs font-bold rounded-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors shadow-lg"
          >
            <Calculator className="w-3.5 h-3.5 text-yellow-400" />
            <span>{t('calculatorTitle')}</span>
          </motion.button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
        <div>
          {/* Title */}
          {onClick ? (
            <div
              onClick={handleCardClick}
              className="block group-hover:text-uzum-primary dark:group-hover:text-purple-400 transition-colors cursor-pointer"
            >
              <h3 
                className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug"
                title={product.title}
              >
                {product.title}
              </h3>
            </div>
          ) : (
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block group-hover:text-uzum-primary dark:group-hover:text-purple-400 transition-colors no-underline"
            >
              <h3 
                className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug"
                title={product.title}
              >
                {product.title}
              </h3>
            </Link>
          )}

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 ml-1">{product.rating}</span>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-400 font-medium">({product.reviewsCount} {t('reviewsCount')})</span>
          </div>
        </div>

        {/* Pricing Block */}
        <div className="space-y-1.5">
          {/* Oylik to'lov - Uzum uslubidagi ajralib turuvchi binafsharang fonli yorliq */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-purple-100/90 dark:bg-purple-950/50 text-uzum-dark dark:text-purple-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl flex items-center justify-between border border-purple-200/60 dark:border-purple-900/40 shadow-xs"
          >
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 dark:text-purple-300">{t('monthlyLabel')}</span>
            <span className="text-xs sm:text-sm font-black text-uzum-primary dark:text-purple-200 tracking-tight">
              {formatPrice(monthlyPayment, true, language)}{t('perMonth')}
            </span>
          </motion.div>

          {/* Original and Current Total Price */}
          <div className="pt-0.5">
            {product.originalPrice && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 line-through mr-1.5 sm:mr-2 font-medium">
                {formatPrice(product.originalPrice, true, language)}
              </span>
            )}
            <div className="text-xs sm:text-base font-black text-gray-900 dark:text-white leading-tight">
              {formatPrice(product.price, true, language)}
            </div>
          </div>
        </div>

        {/* Action Buttons: Savatga qo'shish & Muddatli to'lovga olish */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
          <motion.button
            id={`btn-add-cart-${product.id}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1 py-2 px-1 sm:px-2 rounded-xl bg-purple-50 dark:bg-slate-800/80 hover:bg-purple-100 dark:hover:bg-slate-700 text-uzum-primary dark:text-purple-300 text-[11px] sm:text-xs font-bold transition-colors border border-purple-200/60 dark:border-slate-800"
            title={t('toCartBtn')}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('toCartBtn')}</span>
          </motion.button>

          <motion.button
            id={`btn-installment-${product.id}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleBuyOnInstallment}
            className="flex items-center justify-center py-2 px-1 sm:px-2 rounded-xl bg-uzum-primary hover:bg-uzum-hover text-white text-[11px] sm:text-xs font-black transition-colors shadow-sm shadow-purple-500/25"
            title={t('toInstallmentBtn')}
          >
            <span className="truncate">{t('toInstallmentBtn')}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
