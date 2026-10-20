import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Heart, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  ShoppingBag, 
  CreditCard, 
  ChevronRight, 
  Clock, 
  PackageCheck,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { InstallmentCalculator } from '../components/InstallmentCalculator';
import { ProductCard } from '../components/ProductCard';
import { useTranslation, getCategoryTitle } from '../utils/translations';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    selectedProductId,
    products,
    navigateToCategory,
    toggleFavorite,
    isFavorite,
    addToCart,
    addToast,
  } = useStore();
  const { t, language } = useTranslation();

  const product = products.find((p) => p.id === id || p.id === selectedProductId) || products[0];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews'>('specs');

  const favorite = isFavorite(product.id);
  const monthlyPayment = calculateMonthlyPaymentQuick(product.price, 12);

  // O'xshash mahsulotlar
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, 12, 'full');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast(t('linkCopied'), 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto pb-1 no-scrollbar">
        <Link
          to="/"
          className="hover:text-uzum-primary dark:hover:text-purple-400 transition-colors shrink-0"
        >
          {t('home')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-600" />
        <button
          onClick={() => navigateToCategory(product.categoryId)}
          className="hover:text-uzum-primary dark:hover:text-purple-400 transition-colors shrink-0"
        >
          {getCategoryTitle(product.categoryId, language)}
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-600" />
        <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[480px] no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white dark:bg-slate-800 p-1 ${
                  selectedImageIndex === idx
                    ? 'border-uzum-primary shadow-sm ring-2 ring-purple-100 dark:ring-purple-900/50'
                    : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 opacity-80'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>

          {/* Main Big Image */}
          <div className="flex-1 relative aspect-square bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shadow-sm">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
              {product.hasZeroDown && (
                <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm w-fit">
                  0-0-12 {t('zeroDownBadge')}
                </span>
              )}
              {product.discountPercentage && (
                <span className="inline-flex items-center justify-center bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm w-fit">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            {/* Favorite & Share */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 dark:bg-slate-700/90 hover:bg-white text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white shadow-sm border border-gray-200/60 dark:border-slate-700 transition-colors"
                title={t('shareBtn')}
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className="p-2.5 rounded-full bg-white/90 dark:bg-slate-700/90 hover:bg-white text-gray-400 hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400 shadow-sm border border-gray-200/60 dark:border-slate-700 transition-colors"
                title={t('addToFavoritesTitle')}
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Center / Right Column: Product Info & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {/* Rating and SKU */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-800 dark:text-slate-200 ml-1">{product.rating}</span>
                </div>
                <span>({product.reviewsCount} {t('reviewsCount')})</span>
                <span className="text-gray-300 dark:text-slate-700">•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {t('inStock')} {product.stockCount} {t('stockLeft')}
                </span>
              </div>
              <span className="text-gray-400 dark:text-slate-500">{t('skuLabel')} {product.sku}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Special Nasiya Highlight Card */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                {t('elrizoBenefit')}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                {formatPrice(monthlyPayment, true, language)}
                <span className="text-sm font-normal text-purple-200">{t('perMonth')}</span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                {t('elrizoBenefitDesc')}
              </p>
            </div>
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center">
              <span className="text-[10px] text-purple-200 block uppercase">{t('maxMonths')}</span>
              <strong className="text-base text-amber-300 font-extrabold">{product.maxMonths} {t('monthsUnit')}</strong>
            </div>
          </div>

          {/* Pricing & Quantity Section */}
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {formatPrice(product.price, true, language)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 dark:text-slate-500 line-through">
                  {formatPrice(product.originalPrice, true, language)}
                </span>
              )}
              {product.discountPercentage && (
                <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold px-2 py-0.5 rounded-md">
                  {t('yourSaving')} {formatPrice(product.originalPrice! - product.price, true, language)}
                </span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600 dark:text-slate-300">{t('quantityLabel')}</span>
              <div className="flex items-center border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-gray-800 dark:text-white bg-white dark:bg-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="px-3 py-1.5 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs: Savatga qo'shish & Nasiyaga olish */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="detail-btn-cart"
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-xl border-2 border-uzum-primary text-uzum-primary hover:bg-purple-50 dark:hover:bg-purple-950/30 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('addToCartFull')}</span>
              </button>

              <button
                id="detail-btn-installment"
                onClick={() => {
                  addToCart(product, 12, 'installment');
                  navigate('/checkout');
                }}
                className="py-3.5 px-4 rounded-xl bg-uzum-primary hover:bg-uzum-hover text-white font-extrabold text-sm shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>{t('buyOnInstallmentFull')}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-800 flex items-center gap-3">
              <Truck className="w-5 h-5 text-uzum-primary shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block">{t('fastDeliveryTitle')}</span>
                <span className="text-gray-500 dark:text-slate-400">{t('fastDeliveryDesc')}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-800 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block">{t('officialWarrantyTitle')}</span>
                <span className="text-gray-500 dark:text-slate-400">{t('officialWarrantyDesc')}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-slate-800 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white block">{t('easyReturnTitle')}</span>
                <span className="text-gray-500 dark:text-slate-400">{t('easyReturnDesc')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Dynamic Installment Calculator Component */}
      <div className="mt-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>{t('installmentScheduleTitle')}</span>
        </h2>
        <InstallmentCalculator product={product} />
      </div>

      {/* Product Details Tabs (Specs, Description) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 space-y-6">
        <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-uzum-primary text-uzum-primary dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {t('specsTab')}
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'description'
                ? 'border-uzum-primary text-uzum-primary dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {t('descTab')}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-uzum-primary text-uzum-primary dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {t('reviewsTab')} ({product.reviewsCount})
          </button>
        </div>

        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="py-3 flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">{key}</span>
                  <span className="text-gray-900 dark:text-white font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'description' && (
          <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed max-w-3xl space-y-3">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900 dark:text-white">{product.rating}</div>
                <div className="flex text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {t('reviewsRecommendNotice')}
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 border border-gray-100 dark:border-slate-800 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-bold text-gray-800 dark:text-slate-200">
                  <span>Akmal Sh.</span>
                  <span className="text-gray-400 dark:text-slate-500 font-normal">{t('yesterday')}</span>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-slate-300">
                  {language === 'ru' ? '100% оригинал и очень быстрая доставка!' : language === 'en' ? '100% genuine and super fast delivery!' : '100% original va juda tez yetkazib berildi!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {t('similarProducts')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
