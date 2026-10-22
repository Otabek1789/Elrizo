import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  X,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { calculateInstallment, formatPrice, INSTALLMENT_PLANS } from '../utils/calculator';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';

interface InstallmentCalculatorProps {
  product: Product;
  isModal?: boolean;
  onClose?: () => void;
  onSelectPlan?: (months: 3 | 6 | 12 | 24, downPayment: number) => void;
}

export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  product,
  isModal = false,
  onClose,
  onSelectPlan,
}) => {
  const navigate = useNavigate();
  const { addToCart, user, openLoginRequiredModal } = useStore();
  const { t, language } = useTranslation();

  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12 | 24>(12);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(0); // 0%, 10%, 20%, 30%
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);

  // Dastlabki to'lov summasi
  const downPaymentAmount = useMemo(() => {
    return Math.round((product.price * downPaymentPercent) / 100);
  }, [product.price, downPaymentPercent]);

  // Hisob-kitob natijasi
  const calculation = useMemo(() => {
    return calculateInstallment(product.price, selectedMonths, downPaymentAmount);
  }, [product.price, selectedMonths, downPaymentAmount]);

  const handleApplyOrder = () => {
    if (!user) {
      if (onClose) {
        onClose();
      }
      openLoginRequiredModal();
      return;
    }
    addToCart(product, selectedMonths, 'installment');
    if (onSelectPlan) {
      onSelectPlan(selectedMonths, downPaymentAmount);
    }
    if (onClose) {
      onClose();
    }
    navigate('/checkout');
  };

  // Kalkulyatorning asosiy formasi (Har ikkala holat uchun bir xil toza dizayn)
  const renderCalculatorForm = () => (
    <>
      {/* 1-QADAM: Muddat tanlash (Badge overlap xatosi to'liq tuzatildi) */}
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
          {t('stepTenure')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {INSTALLMENT_PLANS.map((plan) => {
            const isSelected = selectedMonths === plan.months;
            return (
              <button
                key={plan.months}
                type="button"
                onClick={() => setSelectedMonths(plan.months)}
                className={`relative pt-4 pb-2.5 px-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-uzum-primary bg-purple-50/80 dark:bg-purple-950/60 ring-2 ring-purple-200 dark:ring-purple-900 text-uzum-primary dark:text-purple-300 shadow-sm'
                    : 'border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-purple-300 dark:hover:border-purple-600/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                {plan.isZeroPercent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow z-10 whitespace-nowrap">
                    0% {t('markupLabel')}
                  </span>
                )}
                <div className="text-xs sm:text-sm font-bold">{plan.months} {t('monthsUnit')}</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  {plan.markupPercent === 0 ? t('zeroMarkup') : `+${plan.markupPercent}% ${t('markupLabel')}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-QADAM: Dastlabki to'lov tanlash (Barcha tugmalar bir xil balandlikda) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {t('stepDownPayment')}
          </label>
          <span className="text-xs font-bold text-uzum-primary dark:text-purple-400">
            {formatPrice(downPaymentAmount, true, language)} ({downPaymentPercent}%)
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[0, 10, 20, 30].map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => setDownPaymentPercent(percent)}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center text-center leading-tight ${
                downPaymentPercent === percent
                  ? 'bg-uzum-primary text-white border-uzum-primary shadow-xs'
                  : 'bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              {percent === 0 ? t('zeroDownText') : `${percent}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Dinamik Xulosa Paneli */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden border border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-purple-200">{t('monthlyPayLabel')}</span>
            <div className="text-xl sm:text-3xl font-black text-amber-300 tracking-tight mt-0.5">
              {formatPrice(calculation.monthlyPayment, true, language)}
              <span className="text-xs font-normal text-purple-200 ml-1">{t('perMonth')}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-xl border border-white/10 text-xs space-y-1">
            <div className="flex justify-between gap-4 text-purple-200 text-[11px]">
              <span>{t('tenureSummary')}</span>
              <strong className="text-white">{calculation.months} {t('monthsUnit')}</strong>
            </div>
            <div className="flex justify-between gap-4 text-purple-200 text-[11px]">
              <span>{t('markupRate')}</span>
              <strong className="text-emerald-300">
                {calculation.markupPercent === 0 ? t('freeMarkup') : `${calculation.markupPercent}%`}
              </strong>
            </div>
          </div>
        </div>

        {/* Hisob-kitob tafsilotlari */}
        <div className="pt-3 text-[11px] sm:text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-purple-100/90">
          <div>
            <span className="text-purple-300 block text-[10px]">{t('productPriceLabel')}</span>
            <span className="font-semibold">{formatPrice(product.price, true, language)}</span>
          </div>
          <div>
            <span className="text-purple-300 block text-[10px]">{t('downPaymentLabel')}</span>
            <span className="font-semibold">{formatPrice(calculation.downPayment, true, language)}</span>
          </div>
          <div>
            <span className="text-purple-300 block text-[10px]">{t('totalMarkupLabel')}</span>
            <span className="font-semibold text-amber-300">+{formatPrice(calculation.markupAmount, true, language)}</span>
          </div>
          <div>
            <span className="text-purple-300 block text-[10px]">{t('totalPaymentLabel')}</span>
            <span className="font-bold text-white">{formatPrice(calculation.totalAmount, true, language)}</span>
          </div>
        </div>
      </div>

      {/* Accordion: To'liq To'lov Jadvali */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFullSchedule(!showFullSchedule)}
          className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-uzum-primary dark:text-purple-400" />
            <span>{t('viewSchedule')} ({calculation.schedule.length} {t('paymentsCount')})</span>
          </div>
          {showFullSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFullSchedule && (
          <div className="p-3 bg-white dark:bg-slate-900 overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-400 font-semibold">
                  <th className="py-2 px-2">{t('thMonth')}</th>
                  <th className="py-2 px-2">{t('thDate')}</th>
                  <th className="py-2 px-2">{t('thMonthly')}</th>
                  <th className="py-2 px-2">{t('thPrincipal')}</th>
                  <th className="py-2 px-2">{t('thInterest')}</th>
                  <th className="py-2 px-2">{t('thBalance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
                {calculation.schedule.map((item) => (
                  <tr key={item.monthIndex} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/30">
                    <td className="py-2 px-2 font-bold text-uzum-primary dark:text-purple-400">{item.monthIndex}-{t('monthsUnit')}</td>
                    <td className="py-2 px-2">{item.dueDate}</td>
                    <td className="py-2 px-2 font-bold text-gray-900 dark:text-white">{formatPrice(item.monthlyAmount, true, language)}</td>
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{formatPrice(item.principalAmount, true, language)}</td>
                    <td className="py-2 px-2 text-amber-600 dark:text-amber-400">{formatPrice(item.markupAmount, true, language)}</td>
                    <td className="py-2 px-2 text-gray-400 dark:text-gray-500">{formatPrice(item.remainingBalance, true, language)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Talablar eslatmasi */}
      <div className="bg-purple-50/60 dark:bg-purple-950/40 rounded-xl p-3 border border-purple-100 dark:border-purple-900/50 flex items-start gap-2 text-[11px] text-purple-900 dark:text-purple-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          {t('calcRequirements')}
        </div>
      </div>
    </>
  );

  // 1. MODAL HOLATI (Balandlik ekranga to'liq sig'adi, tugma hech qachon kesilmaydi)
  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50/80 via-white to-purple-50/30 dark:from-slate-900 dark:to-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">
                  {t('calculatorTitle')}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                  {t('calcSubtitle')}
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
            {/* Tanlangan Mahsulot Qisqacha Ma'lumoti */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {product.title}
                </h4>
                <div className="text-xs font-bold text-uzum-primary dark:text-purple-400 mt-0.5">
                  {formatPrice(product.price, true, language)}
                </div>
              </div>
            </div>

            {renderCalculatorForm()}
          </div>

          {/* Sticky Modal Footer: Har qanday ekranda to'liq ko'rinadi va qulay bosiladi */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <button
              id="btn-confirm-installment"
              type="button"
              onClick={handleApplyOrder}
              className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-uzum-primary to-purple-700 hover:from-uzum-hover hover:to-purple-800 text-white font-extrabold text-sm rounded-xl shadow-md shadow-purple-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>{t('confirmInstallmentBtn')}</span>
              <ArrowRight className="w-4 h-4 text-white ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SAHIFA ICHIGA O'RNATILGAN INLINE KARTA HOLATI
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-6 transition-colors">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {t('calculatorTitle')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('calcSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {renderCalculatorForm()}

      <button
        id="btn-confirm-installment-inline"
        type="button"
        onClick={handleApplyOrder}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-uzum-primary to-purple-700 hover:from-uzum-hover hover:to-purple-800 text-white font-extrabold text-sm rounded-xl shadow-md shadow-purple-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <CreditCard className="w-4 h-4 text-amber-300" />
        <span>{t('confirmInstallmentBtn')}</span>
        <ArrowRight className="w-4 h-4 text-white ml-0.5" />
      </button>
    </div>
  );
};
