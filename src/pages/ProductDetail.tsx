import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Scale,
  ThumbsUp,
  Send,
  CheckCircle2,
  HardDrive,
  Palette
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { InstallmentCalculator } from '../components/InstallmentCalculator';
import { ProductCard } from '../components/ProductCard';
import { useTranslation, getCategoryTitle } from '../utils/translations';
import { DEFAULT_PRODUCT_COLORS, DEFAULT_STORAGE_OPTIONS } from '../data/mockReviews';

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
    user,
    openLoginRequiredModal,
    comparisonList,
    addToComparison,
    removeFromComparison,
    openComparisonModal,
    reviews,
    addReview,
  } = useStore();
  const { t, language } = useTranslation();

  const product = products.find((p) => p.id === id || p.id === selectedProductId) || products[0];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews'>('specs');

  // Colors & Storage Variants State
  const availableColors = product.colors && product.colors.length > 0 ? product.colors : DEFAULT_PRODUCT_COLORS;
  const availableStorage = product.storageOptions && product.storageOptions.length > 0 ? product.storageOptions : DEFAULT_STORAGE_OPTIONS;

  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [selectedStorage, setSelectedStorage] = useState(availableStorage[0]);

  // Dynamic price based on selected storage
  const effectivePrice = product.price + (selectedStorage?.priceOffset || 0);
  const effectiveOriginalPrice = product.originalPrice ? product.originalPrice + (selectedStorage?.priceOffset || 0) : undefined;
  const monthlyPayment = calculateMonthlyPaymentQuick(effectivePrice, 12);

  const favorite = isFavorite(product.id);
  const isCompared = comparisonList.includes(product.id);

  // Reviews state for this product
  const productReviews = reviews[product.id] || [];
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewAuthor, setNewReviewAuthor] = useState(user?.fullName || '');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!user) {
      openLoginRequiredModal();
      return;
    }
    const configuredProduct = {
      ...product,
      price: effectivePrice,
      originalPrice: effectiveOriginalPrice,
      title: `${product.title} (${selectedStorage.size}, ${selectedColor.name})`,
    };
    for (let i = 0; i < quantity; i++) {
      addToCart(configuredProduct, 12, 'full');
    }
  };

  const handleBuyInstallment = () => {
    if (!user) {
      openLoginRequiredModal();
      return;
    }
    const configuredProduct = {
      ...product,
      price: effectivePrice,
      originalPrice: effectiveOriginalPrice,
      title: `${product.title} (${selectedStorage.size}, ${selectedColor.name})`,
    };
    addToCart(configuredProduct, 12, 'installment');
    navigate('/checkout');
  };

  const handleToggleComparison = () => {
    if (isCompared) {
      removeFromComparison(product.id);
      addToast("Taqqoslashdan olib tashlandi", 'info');
    } else {
      addToComparison(product.id);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast(t('linkCopied'), 'info');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      addToast("Iltimos, sharh matnini kiriting", 'warning');
      return;
    }
    setIsSubmittingReview(true);
    setTimeout(() => {
      addReview(product.id, {
        userName: newReviewAuthor.trim() || 'Mijoz',
        rating: newReviewRating,
        comment: newReviewComment.trim(),
      });
      setNewReviewComment('');
      setIsSubmittingReview(false);
      addToast("Sharhingiz qabul qilindi va chop etildi!", 'success');
    }, 400);
  };

  const toggleReviewLike = (reviewId: string) => {
    setLikedReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
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

            {/* Top Right Actions: Compare, Favorite & Share */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {/* Compare Button */}
              <button
                onClick={handleToggleComparison}
                className={`p-2.5 rounded-full shadow-sm border transition-all ${
                  isCompared
                    ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-300'
                    : 'bg-white/90 dark:bg-slate-700/90 hover:bg-white text-gray-500 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 border-gray-200/60 dark:border-slate-700'
                }`}
                title={isCompared ? "Taqqoslashdan o'chirish" : "Taqqoslashga qo'shish"}
              >
                <Scale className="w-4 h-4" />
              </button>

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
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="hover:underline text-primary-600 dark:text-primary-400 font-medium"
                >
                  ({productReviews.length || product.reviewsCount} {t('reviewsCount')})
                </button>
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

          {/* Color Selection Swatches */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Palette className="w-4 h-4 text-primary-500" />
                <span>Rangni tanlang:</span>
              </div>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                {selectedColor.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {availableColors.map((color, idx) => {
                const isSelected = selectedColor.name === color.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`group relative flex items-center gap-2 p-1.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg shadow-inner border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 pr-1.5">
                      {color.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage / Memory Selection Chips */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                <span>Xotira hajmi:</span>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedStorage.size}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {availableStorage.map((opt, idx) => {
                const isSelected = selectedStorage.size === opt.size;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedStorage(opt)}
                    className={`py-2 px-3 rounded-xl border-2 text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-sm font-bold">{opt.size}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {(opt.priceOffset || 0) === 0 ? "Boshlang'ich" : `+${((opt.priceOffset || 0) / 1000000).toFixed(1)} mln`}
                    </div>
                  </button>
                );
              })}
            </div>
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
                {formatPrice(effectivePrice, true, language)}
              </span>
              {effectiveOriginalPrice && (
                <span className="text-sm text-gray-400 dark:text-slate-500 line-through">
                  {formatPrice(effectiveOriginalPrice, true, language)}
                </span>
              )}
              {product.discountPercentage && effectiveOriginalPrice && (
                <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold px-2 py-0.5 rounded-md">
                  {t('yourSaving')} {formatPrice(effectiveOriginalPrice - effectivePrice, true, language)}
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

            {/* 1% Nakapitelniy Keshbek Card Promo */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  1%
                </div>
                <div>
                  <div className="font-bold text-amber-950 dark:text-amber-200">
                    1% Nakapitelniy Keshbek Karta
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    Xariddan so'ng kartangizga <strong className="font-black text-amber-900 dark:text-amber-200">+{formatPrice(Math.round(effectivePrice * quantity * 0.01), false, language)}</strong> tushadi
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-1 rounded-md">
                Yig'ish / Ishlatish
              </span>
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
                onClick={handleBuyInstallment}
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
        <InstallmentCalculator product={{ ...product, price: effectivePrice }} />
      </div>

      {/* Product Details Tabs (Specs, Description, Real Customer Reviews) */}
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
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-uzum-primary text-uzum-primary dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <span>{t('reviewsTab')}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold">
              {productReviews.length || product.reviewsCount}
            </span>
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

        {/* Feature 1: Real Customer Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 max-w-4xl">
            {/* Overall Rating & Breakdown Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              {/* Score summary */}
              <div className="text-center md:border-r border-slate-200 dark:border-slate-800 md:pr-6 flex flex-col justify-center items-center">
                <div className="text-5xl font-black text-slate-900 dark:text-white">
                  {product.rating}
                </div>
                <div className="flex text-amber-400 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(product.rating) ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {productReviews.length || product.reviewsCount} ta tasdiqlangan baholash
                </p>
                <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>98% xaridorlar tavsiya qiladi</span>
                </div>
              </div>

              {/* Star distribution bars */}
              <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                {[
                  { star: 5, pct: 88, count: 24 },
                  { star: 4, pct: 9, count: 3 },
                  { star: 3, pct: 3, count: 1 },
                  { star: 2, pct: 0, count: 0 },
                  { star: 1, pct: 0, count: 0 },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-3 text-xs">
                    <span className="w-6 font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      {row.star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-mono">
                      {row.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave a Review Form */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Mahsulot haqida fikringizni qoldiring</span>
              </h4>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rating Stars Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Bahoingizni bering:
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReviewRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              s <= newReviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                        {newReviewRating === 5 ? 'Ajoyib' : newReviewRating === 4 ? 'Yaxshi' : newReviewRating === 3 ? "O'rtacha" : 'Qoniqarsiz'}
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Ismingiz:
                    </label>
                    <input
                      type="text"
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder="Ism va familiyangiz"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Sharh matni:
                  </label>
                  <textarea
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Mahsulot sifati, yetkazib berish tezligi va foydalanish taassurotlaringiz haqida yozing..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? "Chop etilmoqda..." : "Sharhni chop etish"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Mijozlar sharhlari ({productReviews.length})
              </h4>

              {productReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Bu tovar bo'yicha hali yangi sharhlar yo'q. Birinchi bo'lib sharh qoldiring!
                </div>
              ) : (
                productReviews.map((rev) => {
                  const isLiked = likedReviews[rev.id];
                  const likes = (rev.likesCount || 0) + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar Initials */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {rev.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {rev.userName}
                              </span>
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Xarid tasdiqlangan
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-600'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Yaqinda'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Like button */}
                        <button
                          type="button"
                          onClick={() => toggleReviewLike(rev.id)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            isLiked
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{likes}</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-12">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })
              )}
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
