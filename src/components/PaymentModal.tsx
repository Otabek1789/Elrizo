'use client';
import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { generatePaymentLink, PaymentInvoiceParams } from '../lib/paymentService';
import { useTranslation } from '../utils/translations';
import { formatPrice } from '../utils/calculator';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderParams: PaymentInvoiceParams;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderParams,
  onPaymentSuccess
}) => {
  const { t, language } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<'click' | 'payme' | 'uzumpay'>('click');
  const [hasOpenedLink, setHasOpenedLink] = useState(false);

  if (!isOpen) return null;

  const paymentData = generatePaymentLink(selectedProvider, orderParams);

  const handlePayNow = () => {
    // Open real payment gateway in new window
    window.open(paymentData.paymentUrl, '_blank', 'noopener,noreferrer');
    setHasOpenedLink(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-primary-50/20 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('paymentModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('paymentModalSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order amount pill */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('paymentModalAmount')}</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatPrice(orderParams.amount, true, language)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">{t('paymentModalOrderNumber')}</span>
              <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-md">
                {orderParams.contractNumber}
              </span>
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
              {t('paymentModalSelectProvider')}
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* Click */}
              <button
                type="button"
                onClick={() => setSelectedProvider('click')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  selectedProvider === 'click'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
                  CLICK
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click Up
                </span>
                <span className="text-[10px] text-slate-400">{t('paymentModalZeroFee')}</span>
              </button>

              {/* Payme */}
              <button
                type="button"
                onClick={() => setSelectedProvider('payme')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  selectedProvider === 'payme'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md ring-2 ring-teal-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white font-black text-xs flex items-center justify-center shadow">
                  payme
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Payme
                </span>
                <span className="text-[10px] text-slate-400">{t('paymentModalCardsList')}</span>
              </button>

              {/* Uzum Pay */}
              <button
                type="button"
                onClick={() => setSelectedProvider('uzumpay')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  selectedProvider === 'uzumpay'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow">
                  uzum
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Uzum Pay
                </span>
                <span className="text-[10px] text-slate-400">{t('paymentModalZeroFee')}</span>
              </button>
            </div>
          </div>

          {/* Redirect / Gateway Callout */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              {t('paymentModalDisclaimer')}
            </div>
          </div>

          {/* Action button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handlePayNow}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
                selectedProvider === 'click'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                  : selectedProvider === 'payme'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-teal-500/25'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/25'
              }`}
            >
              <span>{selectedProvider.toUpperCase()} {t('paymentModalPayVia')}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {hasOpenedLink && (
              <button
                type="button"
                onClick={() => {
                  if (onPaymentSuccess) onPaymentSuccess();
                  onClose();
                }}
                className="w-full py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('paymentModalCompletedSuccess')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            {t('paymentModalSecuredNotice')}
          </p>
        </div>
      </div>
    </div>
  );
};
