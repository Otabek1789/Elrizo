import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, CreditCard, Tag, Check, Sparkles, Send, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { useTranslation } from '../utils/translations';
import { sendCartToTelegram } from '../utils/telegramBot';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartMonthlyTotal,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    getFinalTotal,
    getFinalMonthlyTotal,
    user,
    openLoginRequiredModal,
    addToast,
  } = useStore();
  const { t, language } = useTranslation();

  const [isSendingTg, setIsSendingTg] = useState(false);

  const handleSendCartToTelegram = async () => {
    setIsSendingTg(true);
    const res = await sendCartToTelegram(cart, finalTotal, user);
    setIsSendingTg(false);
    if (res.success) {
      addToast("Savatdagi barcha tovarlar Telegram botga yuborildi! @elrizo_bot ni tekshiring", 'success');
    } else {
      addToast(res.message, 'error');
    }
  };

  if (!isCartOpen) return null;

  const total = getCartTotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  const finalMonthlyTotal = getFinalMonthlyTotal();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (res.success) {
      setPromoInput('');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      closeCart();
      openLoginRequiredModal();
      return;
    }
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col justify-between text-gray-900 dark:text-gray-100 transition-colors">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-uzum-primary dark:text-purple-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('cart')}</h2>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">({cart.length} {t('itemsUnit')})</span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/50 text-uzum-primary dark:text-purple-300 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">{t('cartEmpty')}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                  {t('emptyCartNotice')}
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 px-5 py-2 bg-uzum-primary text-white text-xs font-bold rounded-xl hover:bg-uzum-hover transition-colors shadow-sm"
                >
                  {t('startShopping')}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const itemMonthly = calculateMonthlyPaymentQuick(item.product.price, item.selectedInstallmentMonths || 12);
                return (
                  <div
                    key={item.product.id}
                    className="p-3 bg-gray-50/80 dark:bg-slate-900/80 rounded-2xl border border-gray-100 dark:border-slate-800 flex gap-3 relative group"
                  >
                    <Link
                      to={`/product/${item.product.id}`}
                      onClick={closeCart}
                      className="shrink-0"
                    >
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}
                        alt={item.product.title}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'; }}
                        className="w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="pr-6">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="hover:text-uzum-primary dark:hover:text-purple-400 transition-colors block"
                        >
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                            {item.product.title}
                          </h4>
                        </Link>
                        <div className="text-xs font-extrabold text-uzum-primary dark:text-purple-400 mt-1">
                          {formatPrice(item.product.price, true, language)}
                        </div>
                        <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold bg-purple-100/70 dark:bg-purple-950/60 px-1.5 py-0.5 rounded w-fit mt-0.5">
                          {t('monthlyLabel')} {formatPrice(itemMonthly, true, language)} {t('perMonth')}
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60 dark:border-slate-800">
                        <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-gray-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                          title={t('clearCartBtn')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/60 space-y-3.5">
              {/* Promo Code Input or Applied Badge */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/80 dark:border-slate-700/70 shadow-xs space-y-2">
                {appliedPromoCode ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-emerald-800 dark:text-emerald-300 uppercase">
                            {appliedPromoCode.code}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-200/70 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100">
                            {appliedPromoCode.discountType === 'percentage'
                              ? `-${appliedPromoCode.discountValue}%`
                              : `-${formatPrice(appliedPromoCode.discountValue, true, language)}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                          {appliedPromoCode.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
                      title={t('removePromoBtn')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-200">{t('promoCodeTitle')}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="WELCOME10, ELRIZO15"
                        className="flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:border-uzum-primary focus:ring-1 focus:ring-purple-300 dark:focus:ring-purple-900"
                      />
                      <button
                        type="submit"
                        disabled={!promoInput.trim()}
                        className="px-3.5 py-1.5 bg-uzum-primary hover:bg-uzum-hover disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0"
                      >
                        {t('applyPromoBtn')}
                      </button>
                    </div>

                    {/* Quick clickable chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">{t('availablePromosHint')}</span>
                      <button
                        type="button"
                        onClick={() => applyPromoCode('WELCOME10')}
                        className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                      >
                        WELCOME10 (-10%)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPromoCode('ELRIZO15')}
                        className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors"
                      >
                        ELRIZO15 (-15%)
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>{t('totalProducts')}</span>
                  <span className={`font-semibold ${discountAmount > 0 ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-white'}`}>
                    {formatPrice(total, true, language)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('promoDiscount')} ({appliedPromoCode?.code}):
                    </span>
                    <span>-{formatPrice(discountAmount, true, language)}</span>
                  </div>
                )}

                <div className="flex justify-between text-uzum-primary dark:text-purple-300 font-bold text-sm bg-purple-50 dark:bg-purple-950/60 p-2.5 rounded-xl border border-purple-100 dark:border-purple-900/40">
                  <span>{t('installmentMonthly')}</span>
                  <span>{formatPrice(finalMonthlyTotal, true, language)} {t('perMonth')}</span>
                </div>
              </div>

              <button
                id="cart-checkout-btn"
                onClick={handleCheckout}
                className="w-full py-3.5 bg-gradient-to-r from-uzum-primary to-purple-700 hover:from-uzum-hover hover:to-purple-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>{t('proceedToCheckoutBtn')} ({formatPrice(finalTotal, true, language)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="cart-send-telegram-btn"
                type="button"
                disabled={isSendingTg}
                onClick={handleSendCartToTelegram}
                className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold text-xs rounded-xl transition-all border border-sky-200 dark:border-sky-800 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSendingTg ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Telegram botga yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 -rotate-12" />
                    <span>Savatdagi tovarlarni Telegram botga yuborish</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
