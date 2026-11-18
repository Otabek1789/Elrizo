'use client';

import React, { useState } from 'react';
import { useNavigate, Link } from '@/lib/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Tag, 
  Check, 
  Send, 
  Heart, 
  RotateCcw, 
  ChevronRight,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { useTranslation } from '../utils/translations';
import { sendCartToTelegram } from '../utils/telegramBot';
import { ProductCard } from '../components/ProductCard';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartMonthlyTotal,
    getDiscountAmount,
    getFinalTotal,
    getFinalMonthlyTotal,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    isPromoCodeUsedByUser,
    favorites,
    toggleFavorite,
    user,
    openLoginRequiredModal,
    addToast,
    products,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [isSendingTg, setIsSendingTg] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const total = getCartTotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  const finalMonthlyTotal = getFinalMonthlyTotal();

  // Promokodni faollashtirish
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    if (isPromoCodeUsedByUser(clean, user?.phone)) {
      addToast(t('promoAlreadyUsedToast'), 'warning');
      return;
    }

    const res = applyPromoCode(clean, user?.phone);
    if (res.success) {
      setPromoInput('');
    }
  };

  // Promokod chipini bosganda avtomatik qo'llash
  const handleApplyQuickPromo = (code: string) => {
    if (isPromoCodeUsedByUser(code, user?.phone)) {
      addToast(t('promoAlreadyUsedToast'), 'warning');
      return;
    }
    applyPromoCode(code, user?.phone);
  };

  // Buyurtmani rasmiylashtirishga o'tish
  const handleProceedToCheckout = () => {
    if (!user) {
      openLoginRequiredModal();
      return;
    }
    navigate('/checkout');
  };

  // Telegram orqali yuborish
  const handleSendToTelegram = async () => {
    setIsSendingTg(true);
    const res = await sendCartToTelegram(cart, finalTotal, user);
    setIsSendingTg(false);
    if (res.success) {
      addToast(t('telegramSentSuccess'), 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  // Savatni tozalash
  const handleClearCart = () => {
    clearCart();
    setIsClearingCart(false);
    addToast(language === 'ru' ? 'Корзина очищена' : 'Savat tozalandi', 'info');
  };

  // Tavsiya etiladigan mahsulotlar (savatda bo'lmaganlari)
  const cartProductIds = new Set(cart.map((item) => item.product.id));
  const recommendedProducts = products
    .filter((p) => !cartProductIds.has(p.id))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-slate-950 py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-uzum-primary dark:hover:text-purple-400 transition-colors">
            {language === 'ru' ? 'Главная' : 'Bosh sahifa'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 dark:text-white font-bold">
            {language === 'ru' ? 'Корзина' : 'Savat'}
          </span>
        </nav>

        {/* Sahifa sarlavhasi */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-uzum-primary dark:text-purple-300 flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ru' ? 'Ваша корзина' : 'Sizning savatingiz'}</span>
                {cart.length > 0 && (
                  <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                    ({cart.length} {t('itemsUnit')})
                  </span>
                )}
              </h1>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              {isClearingCart ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {language === 'ru' ? 'Очистить корзину?' : 'Savatni tozalaysizmi?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
                  >
                    {language === 'ru' ? 'Да' : 'Ha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsClearingCart(false)}
                    className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    {language === 'ru' ? 'Отмена' : 'Yo\'q'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsClearingCart(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'ru' ? 'Очистить корзину' : 'Savatni tozalash'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 1. SAVAT BO'SH BO'LSA */}
        {cart.length === 0 ? (
          <div className="space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
              <div className="w-20 h-20 rounded-full bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {t('cartEmpty')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                {t('cartEmptyDesc')}
              </p>
              <div className="pt-2">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-uzum-primary hover:bg-uzum-hover text-white text-sm font-extrabold shadow-lg shadow-purple-500/25 transition-all transform active:scale-98"
                >
                  <span>{t('startShopping')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tavsiya etiladigan tovarlar */}
            {recommendedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {language === 'ru' ? 'Популярные предложения' : 'Ommabop takliflar'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {recommendedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2. SAVATDA MAHSULOTLAR BO'LSA */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Chap tomondagi tovarlar ro'yxati (8 ustun) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Afzalliklar baneri */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-purple-100 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold">
                  <Truck className="w-4 h-4 text-uzum-primary dark:text-purple-400 shrink-0" />
                  <span>{language === 'ru' ? 'Бесплатная доставка за 24 часа по всему Узбекистану' : '24 soat ichida butun O\'zbekiston bo\'ylab bepul yetkazib berish'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{language === 'ru' ? '0-0-12 Рассрочка без переплат' : '0-0-12 Halol Nasiya'}</span>
                </div>
              </div>

              {/* Tovar kartochkalari */}
              <div className="space-y-3">
                {cart.map((item) => {
                  const months = item.selectedInstallmentMonths || 12;
                  const itemMonthly = calculateMonthlyPaymentQuick(item.product.price, months);
                  const isFav = favorites.includes(item.product.id);

                  return (
                    <div
                      key={item.product.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between transition-all hover:border-purple-200 dark:hover:border-purple-900/60"
                    >
                      {/* Chap: Rasm va Asosiy matn */}
                      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2 shrink-0 flex items-center justify-center overflow-hidden group"
                        >
                          <img
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}
                            alt={item.product.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
                            }}
                          />
                        </Link>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              {item.product.categoryName || 'ELRIZO'}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{language === 'ru' ? 'В наличии' : 'Sotuvda mavjud'}</span>
                            </span>
                          </div>

                          <Link
                            to={`/product/${item.product.id}`}
                            className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white hover:text-uzum-primary dark:hover:text-purple-400 transition-colors line-clamp-2 block leading-snug"
                          >
                            {item.product.title}
                          </Link>

                          {/* Narx va Nasiya oylik to'lov chiplari */}
                          <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                            <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                              {formatPrice(item.product.price * item.quantity, true, language)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-xs text-gray-400">
                                ({formatPrice(item.product.price, true, language)} / {language === 'ru' ? 'шт' : 'dona'})
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-purple-100 dark:bg-purple-950/80 text-uzum-primary dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {formatPrice(itemMonthly * item.quantity, true, language)} / {language === 'ru' ? 'мес' : 'oyiga'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* O'ng: Soni va Tugmalar */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800 shrink-0">
                        {/* Miqdor hisoblagichi (Qty counter) */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors shadow-xs"
                            title={language === 'ru' ? 'Уменьшить' : 'Kamaytirish'}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors shadow-xs"
                            title={language === 'ru' ? 'Увеличить' : 'Ko\'paytirish'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Amallar: Sevimlilar va O'chirish */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              toggleFavorite(item.product.id);
                              addToast(
                                isFav
                                  ? (language === 'ru' ? 'Удалено из избранного' : 'Sevimlilardan o\'chirildi')
                                  : (language === 'ru' ? 'Добавлено в избранное' : 'Sevimlilarga qo\'shildi'),
                                'info'
                              );
                            }}
                            className={`p-2 rounded-xl border transition-colors ${
                              isFav
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-500'
                                : 'border-gray-200 dark:border-slate-700 text-gray-400 hover:text-rose-500 hover:border-rose-200'
                            }`}
                            title={language === 'ru' ? 'В избранное' : 'Sevimlilarga'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeFromCart(item.product.id);
                              addToast(
                                language === 'ru' ? 'Товар удален из корзины' : 'Mahsulot savatdan o\'chirildi',
                                'info'
                              );
                            }}
                            className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-400 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors"
                            title={language === 'ru' ? 'Удалить' : 'O\'chirish'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* O'ng tomondagi buyurtma xulosasi (4 ustun, Sticky) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
                  {language === 'ru' ? 'Итого к оплате' : 'Buyurtma xulosasi'}
                </h3>

                {/* Narxlar tafsiloti */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-slate-400">
                    <span>{language === 'ru' ? 'Товары:' : 'Tovarlar narxi:'}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatPrice(total, true, language)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{language === 'ru' ? 'Скидка по промокоду:' : 'Promokod chegirmasi:'}</span>
                      <span>-{formatPrice(discountAmount, true, language)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 dark:text-slate-400">
                    <span>{language === 'ru' ? 'Доставка:' : 'Yetkazib berish:'}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {language === 'ru' ? 'Бесплатно' : 'Bepul (0 so\'m)'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {language === 'ru' ? 'Общая сумма:' : 'Jami to\'lov:'}
                      </span>
                      <span className="text-xl font-black text-gray-900 dark:text-white">
                        {formatPrice(finalTotal, true, language)}
                      </span>
                    </div>

                    {/* Nasiya 0-0-12 Oylik to'lovi */}
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/60 mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-900 dark:text-purple-200">
                        {language === 'ru' ? 'В рассрочку 0-0-12:' : '0-0-12 Nasiya bilan:'}
                      </span>
                      <span className="font-black text-uzum-primary dark:text-purple-300 text-sm">
                        {formatPrice(finalMonthlyTotal, true, language)} / {language === 'ru' ? 'мес' : 'oyiga'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promokod kiritish */}
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    {language === 'ru' ? 'Промокод на скидку' : 'Chegirma promokodi'}
                  </span>

                  {appliedPromoCode ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                        <Check className="w-4 h-4" />
                        <span>
                          {appliedPromoCode.code} (-{appliedPromoCode.discountType === 'percentage' ? `${appliedPromoCode.discountValue}%` : formatPrice(appliedPromoCode.discountValue, true, language)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-gray-400 hover:text-rose-600 transition-colors font-bold text-xs"
                      >
                        {language === 'ru' ? 'Отменить' : 'Bekor qilish'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="ELRIZO2026"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-gray-900 dark:text-white font-mono uppercase outline-none focus:border-uzum-primary"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold hover:bg-uzum-primary dark:hover:bg-purple-300 transition-colors"
                      >
                        {language === 'ru' ? 'Применить' : 'Qo\'llash'}
                      </button>
                    </form>
                  )}

                  {/* Tezkor promokod chiplari */}
                  {!appliedPromoCode && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {language === 'ru' ? 'Акции:' : 'Aksiyalar:'}
                      </span>
                      {['ELRIZO2026', 'BAHOR', 'NASIYA0'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleApplyQuickPromo(code)}
                          className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-uzum-primary dark:text-purple-300 text-[10px] font-mono font-bold hover:bg-purple-100 transition-colors border border-purple-100 dark:border-purple-800/50"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tugmalar */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-uzum-primary to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  >
                    <span>{language === 'ru' ? 'Перейти к оформлению' : 'Rasmiylashtirishga o\'tish'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToTelegram}
                    disabled={isSendingTg}
                    className="w-full py-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSendingTg 
                        ? (language === 'ru' ? 'Отправка...' : 'Yuborilmoqda...') 
                        : (language === 'ru' ? 'Отправить заказ в Telegram' : 'Telegram orqali buyurtma yuborish')}
                    </span>
                  </button>
                </div>

                {/* Ishonch va xavfsizlik kafolatlari */}
                <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 text-[11px] text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{language === 'ru' ? '100% Халяльная рассрочка без скрытых комиссий' : '100% Halol Nasiya shartnomasi va kafolati'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 shrink-0" />
                    <span>{language === 'ru' ? 'Быстрая и надежная доставка курьером' : 'Kuryer orqali xonadoningizgacha tezkor yetkazib berish'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{language === 'ru' ? 'Оплата картой, Payme, Click или при получении' : 'Payme, Click, Uzum Pay yoki qabul qilganda to\'lov'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
