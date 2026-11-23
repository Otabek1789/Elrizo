'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingBag, ArrowRight, X, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { useTranslation } from '../utils/translations';
import { useNavigate } from '@/lib/navigation';

export const AbandonedCartModal: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isAbandonedCartOpen, openAbandonedCart, closeAbandonedCart, activePage, language } = useStore();
  const { t } = useTranslation();
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);

  useEffect(() => {
    // Agar savat bo'sh bo'lsa yoki allaqachon checkout/admin sahifasida bo'lsa ko'rsatmaslik
    if (cart.length === 0 || activePage === 'checkout' || activePage === 'admin') {
      return;
    }

    // 45 soniya harakatsizlikdan so'ng bir marta avtomatik eslatish
    const timer = setTimeout(() => {
      const alreadyShown = sessionStorage.getItem('elrizo_abandoned_cart_shown');
      if (!alreadyShown && cart.length > 0) {
        openAbandonedCart();
        sessionStorage.setItem('elrizo_abandoned_cart_shown', 'true');
      }
    }, 45000);

    // Exit intent: foydalanuvchi kursorini brauzer yuqorisiga olib borganda
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !hasTriggeredExitIntent) {
        const alreadyShown = sessionStorage.getItem('elrizo_abandoned_cart_shown');
        if (!alreadyShown && cart.length > 0) {
          setHasTriggeredExitIntent(true);
          openAbandonedCart();
          sessionStorage.setItem('elrizo_abandoned_cart_shown', 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cart, activePage, hasTriggeredExitIntent, openAbandonedCart]);

  if (!isAbandonedCartOpen || cart.length === 0 || activePage === 'checkout') {
    return null;
  }

  const firstItem = cart[0]?.product;
  const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const monthlyEstimate = calculateMonthlyPaymentQuick(totalAmount, 12);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative animate-in zoom-in-95 border border-purple-100">
        <button
          type="button"
          onClick={closeAbandonedCart}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-uzum-primary flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Maxsus Taklif
          </span>
          <h3 className="text-xl font-black text-gray-900 mt-2.5">
            {t('abandonedCartTitle')}
          </h3>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
            {t('abandonedCartSubtitle')}
          </p>
        </div>

        {/* Savatdagi asosiy tovar ko'rinishi */}
        {firstItem && (
          <div className="bg-gray-50 rounded-2xl p-3.5 flex items-center gap-3 text-left border border-gray-200">
            <img
              src={firstItem.images[0]}
              alt={firstItem.title}
              className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">{firstItem.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-uzum-primary font-mono">
                  {formatPrice(monthlyEstimate, true, language)} / oy
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  0-0-12
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              closeAbandonedCart();
              navigate('/checkout');
            }}
            className="w-full py-3.5 bg-gradient-to-r from-uzum-primary to-purple-800 hover:from-purple-800 hover:to-indigo-900 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('abandonedCartCheckoutBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={closeAbandonedCart}
            className="w-full py-2.5 text-gray-500 hover:text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {t('abandonedCartContinueBtn')}
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Halol muddatli to'lov • Boshlang'ich to'lov 0%</span>
        </div>
      </div>
    </div>
  );
};
