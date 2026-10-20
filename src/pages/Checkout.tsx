import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Smartphone, 
  UserCheck, 
  AlertCircle, 
  FileText, 
  Check, 
  Loader2, 
  Building2, 
  Sparkles,
  ShoppingBag,
  Tag,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, calculateMonthlyPaymentQuick, calculateInstallment } from '../utils/calculator';
import { PaymentMode, ScoringResult, Order } from '../types';
import { useTranslation } from '../utils/translations';
import { sendVerificationSms } from '../lib/smsService';
import { CustomSelect } from '../components/CustomSelect';
import { UZBEKISTAN_REGIONS } from '../data/regions';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    user,
    getCartTotal,
    getCartMonthlyTotal,
    clearCart,
    setActivePage,
    addToast,
    addOrder,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    getDiscountAmount,
    getFinalTotal,
    getFinalMonthlyTotal,
    openLoginRequiredModal,
    selectedCity,
  } = useStore();
  const { t, language } = useTranslation();

  // Akkauntga kirmagan bo'lsa, xarid qilishga ruxsat bermaslik
  useEffect(() => {
    if (!user) {
      openLoginRequiredModal();
      navigate('/');
    }
  }, [user, navigate, openLoginRequiredModal]);

  const totalAmount = getCartTotal();
  const monthlyTotal = getCartMonthlyTotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getFinalTotal();
  const finalMonthlyTotal = getFinalMonthlyTotal();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Rejim: to'liq to'lash yoki nasiyaga rasmiylashtirish
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('installment');
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12 | 24>(12);

  // Nasiya bosqichlari: 1: Shaxsiy ma'lumotlar, 2: SMS OTP, 3: Skoring va Karta, 4: Muvaffaqiyat
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form maydonlari
  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'Bobur Mirzayev',
    pinfl: user?.passportOrPinfl || '31204956780012',
    passportSeries: 'AB 1234567',
    phone: user?.phone || '+998 90 123 45 67',
    city: selectedCity ? `${selectedCity}` : 'Toshkent shahri',
    address: 'Chilonzor tumani, 9-mavze, 24-uy',
    deliveryNotes: 'Eshik oldida qoldiring',
    cardNumber: '8600 1425 8890 1234',
    cardExpiry: '08/28',
    otpCode: '',
  });

  // Skoring simulyatsiya holati
  const [isScoringChecking, setIsScoringChecking] = useState<boolean>(false);
  const [scoringProgressText, setScoringProgressText] = useState<string>('');
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  // SMS OTP xolati
  const [serverOtpCode, setServerOtpCode] = useState<string>('7777');
  const [isSendingSms, setIsSendingSms] = useState<boolean>(false);
  const [isRealSmsDelivered, setIsRealSmsDelivered] = useState<boolean>(false);

  // Agar savat bo'sh bo'lsa
  if (cart.length === 0 && currentStep !== 4) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/50 text-uzum-primary dark:text-purple-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('checkoutEmptyTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('checkoutEmptyDesc')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2.5 bg-uzum-primary text-white font-bold rounded-xl hover:bg-uzum-hover transition-colors shadow-md"
        >
          {t('checkoutBackToCatalog')}
        </button>
      </div>
    );
  }

  // SMS yuborish (Haqiqiy provayder va avtomatik kod bilan)
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.pinfl || !formData.phone) {
      addToast(t('checkoutFillRequired'), 'warning');
      return;
    }

    setIsSendingSms(true);
    const smsRes = await sendVerificationSms(formData.phone);
    setIsSendingSms(false);

    setServerOtpCode(smsRes.code);
    setIsRealSmsDelivered(smsRes.isRealSmsSent);
    setCurrentStep(2);

    if (smsRes.isRealSmsSent) {
      addToast(`${formData.phone} raqamiga haqiqiy SMS yuborildi!`, 'success');
    } else {
      addToast(`${formData.phone} raqamiga tasdiqlash kodi: ${smsRes.code}`, 'info');
    }
  };

  // SMS tekshirish
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = formData.otpCode.trim();
    if (cleanOtp !== serverOtpCode && cleanOtp !== '7777') {
      addToast(
        language === 'ru'
          ? `Неверный код. Введите ${serverOtpCode}`
          : language === 'en'
          ? `Invalid SMS code. Enter ${serverOtpCode}`
          : `Noto'g'ri SMS kod. Tasdiqlash kodi: ${serverOtpCode}`,
        'error'
      );
      return;
    }
    setCurrentStep(3);
    addToast(t('checkoutSmsVerified'), 'success');
  };

  // 3-Bosqich: Skoring tekshirish (Simulyatsiya)
  const handleStartScoring = () => {
    setIsScoringChecking(true);
    setScoringProgressText(t('checkoutScoringStep1'));

    setTimeout(() => {
      setScoringProgressText(t('checkoutScoringStep2'));
    }, 1300);

    setTimeout(() => {
      setScoringProgressText(t('checkoutScoringStep3'));
    }, 2600);

    setTimeout(() => {
      setIsScoringChecking(false);
      const contractNumber = `ELR-${Math.floor(100000 + Math.random() * 900000)}`;

      setScoringResult({
        status: 'approved',
        score: 795,
        approvedLimit: 25000000,
        decisionMessage: t('checkoutScoringApproved'),
        contractNumber,
      });

      // Buyurtmani LocalStorage va Supabase-ga saqlash
      const newInstallmentOrder: Order = {
        id: `ord-${Date.now()}`,
        contractNumber,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        pinfl: formData.pinfl,
        deliveryAddress: `${formData.city}, ${formData.address}`,
        totalPrice: finalTotal,
        monthlyPayment: finalMonthlyTotal,
        paymentMode: 'installment',
        installmentMonths: selectedMonths,
        scoringScore: 795,
        status: 'scoring_approved',
        createdAt: new Date().toISOString(),
        appliedPromoCode: appliedPromoCode?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        items: cart.map((c) => ({
          productId: c.product.id,
          title: c.product.title,
          price: c.product.price,
          quantity: c.quantity,
          monthlyPayment: calculateMonthlyPaymentQuick(c.product.price, selectedMonths),
        })),
      };

      addOrder(newInstallmentOrder);

      setCurrentStep(4);
      clearCart();
    }, 3800);
  };

  // To'liq naqd to'lash buyurtmasi
  const handleFullPaymentOrder = () => {
    const contractNumber = `ELR-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const newFullOrder: Order = {
      id: `ord-${Date.now()}`,
      contractNumber,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      deliveryAddress: `${formData.city}, ${formData.address}`,
      totalPrice: finalTotal,
      paymentMode: 'full',
      status: 'processing',
      createdAt: new Date().toISOString(),
      appliedPromoCode: appliedPromoCode?.code,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      items: cart.map((c) => ({
        productId: c.product.id,
        title: c.product.title,
        price: c.product.price,
        quantity: c.quantity,
      })),
    };

    addOrder(newFullOrder);

    addToast(t('checkoutOrderSuccessToast'), 'success');
    setCurrentStep(4);
    clearCart();
  };

  const handleApplyPromo = (codeToApply?: string) => {
    const code = (codeToApply || promoInput).trim();
    if (!code) return;
    setPromoError('');
    const res = applyPromoCode(code);
    if (!res.success) {
      const msg = res.message || 'Promokod topilmadi yoki muddati o\'tgan';
      setPromoError(msg);
      addToast(msg, 'error');
    } else {
      setPromoInput('');
      addToast(res.message || 'Promokod muvaffaqiyatli qo\'llandi', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('checkoutTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('checkoutSubtitle')}
        </p>
      </div>

      {/* Agar buyurtma yakunlangan bo'lsa (Step 4 Success) */}
      {currentStep === 4 ? (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700/60 p-8 text-center space-y-6 shadow-card">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              {paymentMode === 'installment' ? t('checkoutSuccessInstallmentBadge') : t('checkoutSuccessFullBadge')}
            </span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-3">
              {t('checkoutSuccessTitle')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
              {t('checkoutContractNumberLabel')} <strong className="text-uzum-primary dark:text-purple-400">{scoringResult?.contractNumber || 'ELR-748291'}</strong>
            </p>
          </div>

          {paymentMode === 'installment' && (
            <div className="bg-purple-50 dark:bg-purple-950/40 rounded-2xl p-4 text-left border border-purple-100 dark:border-purple-800/50 space-y-2 text-xs">
              <div className="flex justify-between text-gray-700 dark:text-slate-300">
                <span>{t('checkoutScoringResultLabel')}</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{t('checkoutScoringExcellent')}</strong>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-slate-300">
                <span>{t('checkoutApprovedLimitLabel')}</span>
                <strong className="text-uzum-primary dark:text-purple-300 font-bold">{formatPrice(25000000, true, language)}</strong>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-slate-300">
                <span>{t('checkoutFirstPaymentDateLabel')}</span>
                <strong className="text-gray-900 dark:text-white">15.11.2026</strong>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-slate-300">
                <span>{t('checkoutDeliveryAddressLabel')}</span>
                <strong className="text-gray-900 dark:text-white">{formData.city}, {formData.address}</strong>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-2xl text-xs text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-800">
            {t('checkoutCourierNotice')}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="py-3 px-6 bg-uzum-primary hover:bg-uzum-hover text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-purple-500/20"
            >
              {t('checkoutBackToHomeBtn')}
            </button>
            <button
              onClick={() => addToast(t('checkoutContractDownloadedToast'), 'info')}
              className="py-3 px-6 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('checkoutDownloadContractBtn')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chap Tomon: Formalar va Qadamlar (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. To'lov Rejimini Tanlash (Tabs) */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 shadow-sm">
              <button
                type="button"
                onClick={() => setPaymentMode('installment')}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMode === 'installment'
                    ? 'bg-uzum-primary text-white shadow-md shadow-purple-500/25'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('checkoutTabInstallment')}</span>
                <span className="text-[10px] bg-amber-400 text-purple-950 px-1.5 py-0.5 rounded font-black hidden sm:inline">
                  0-0-12
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('full')}
                className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  paymentMode === 'full'
                    ? 'bg-uzum-primary text-white shadow-md shadow-purple-500/25'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{t('checkoutTabFull')}</span>
              </button>
            </div>

            {/* Agar Nasiya tanlangan bo'lsa: 3-bosqichli Step Wizard */}
            {paymentMode === 'installment' ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/60 p-6 space-y-6 shadow-sm">
                {/* Step indicator header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/60 pb-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentStep >= 1 ? 'bg-uzum-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                    }`}>
                      1
                    </div>
                    <span className={`text-xs font-bold hidden sm:inline ${currentStep >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                      {t('checkoutStep1')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-700" />

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentStep >= 2 ? 'bg-uzum-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                    }`}>
                      2
                    </div>
                    <span className={`text-xs font-bold hidden sm:inline ${currentStep >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                      {t('checkoutStep2')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-700" />

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentStep >= 3 ? 'bg-uzum-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                    }`}>
                      3
                    </div>
                    <span className={`text-xs font-bold hidden sm:inline ${currentStep >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                      {t('checkoutStep3')}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-uzum-primary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-md">
                    {t('checkoutStepBadge')} {currentStep} / 3
                  </span>
                </div>

                {/* BOSQICH 1: Shaxsiy ma'lumotlar */}
                {currentStep === 1 && (
                  <form onSubmit={handleProceedToOtp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {t('checkoutFullNameLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 outline-none"
                          placeholder={t('checkoutFullNamePlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {t('checkoutPinflLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={14}
                          value={formData.pinfl}
                          onChange={(e) => setFormData({ ...formData, pinfl: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-mono focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 outline-none"
                          placeholder="31204956780012"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {t('checkoutPassportLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.passportSeries}
                          onChange={(e) => setFormData({ ...formData, passportSeries: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm uppercase focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 outline-none"
                          placeholder="AA 1234567"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {t('checkoutPhoneLabel')}
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-mono focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 outline-none"
                          placeholder="+998 90 123 45 67"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {t('checkoutCityLabel')}
                        </label>
                        <CustomSelect
                          value={formData.city}
                          onChange={(val) => setFormData({ ...formData, city: val as string })}
                          buttonClassName="!py-2.5 !px-3.5 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                          options={UZBEKISTAN_REGIONS.map((r) => ({
                            value: r.shortUz,
                            label: language === 'ru' ? r.nameRu : language === 'en' ? r.nameEn : r.nameUz,
                            badge: r.popular ? 'Tezkor' : undefined,
                          }))}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {t('checkoutAddressLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 outline-none"
                          placeholder={t('checkoutAddressPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2 border border-purple-100 dark:border-purple-800/50">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        {t('checkoutSecurityNotice')}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingSms}
                      className="w-full py-3.5 bg-uzum-primary hover:bg-uzum-hover text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                      {isSendingSms ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>SMS kod yuborilmoqda...</span>
                        </>
                      ) : (
                        <>
                          <span>{t('checkoutNextSmsBtn')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* BOSQICH 2: SMS OTP tasdiqlash */}
                {currentStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5 max-w-md mx-auto text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center mx-auto">
                      <Smartphone className="w-7 h-7" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('checkoutSmsTitle')}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {t('checkoutSmsSubtitle')} <strong className="text-gray-800 dark:text-slate-200">{formData.phone}</strong>
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        maxLength={4}
                        autoFocus
                        value={formData.otpCode}
                        onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                        placeholder={serverOtpCode}
                        className="w-44 mx-auto text-center tracking-[12px] text-2xl font-black py-2.5 rounded-xl border-2 border-uzum-primary bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none"
                      />
                      <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-2 flex items-center justify-center gap-1.5">
                        {isRealSmsDelivered ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Telefoningizga haqiqiy SMS xabar yuborildi</span>
                          </>
                        ) : (
                          <span>Tasdiqlash kodi: <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{serverOtpCode}</strong></span>
                        )}
                      </div>

                      <div className="mt-2">
                        <button
                          type="button"
                          disabled={isSendingSms}
                          onClick={async () => {
                            setIsSendingSms(true);
                            const smsRes = await sendVerificationSms(formData.phone);
                            setIsSendingSms(false);
                            setServerOtpCode(smsRes.code);
                            setIsRealSmsDelivered(smsRes.isRealSmsSent);
                            if (smsRes.isRealSmsSent) {
                              addToast(`${formData.phone} raqamiga haqiqiy SMS yuborildi!`, 'success');
                            } else {
                              addToast(`Yangi SMS kod: ${smsRes.code}`, 'info');
                            }
                          }}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-bold"
                        >
                          {isSendingSms ? "SMS yuborilmoqda..." : "Kodni qayta yuborish"}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {t('checkoutBackBtn')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-uzum-primary hover:bg-uzum-hover text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-purple-500/20"
                      >
                        {t('checkoutVerifyBtn')}
                      </button>
                    </div>
                  </form>
                )}

                {/* BOSQICH 3: Karta orqali skoring tekshiruvi (Simulyatsiya) */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {t('checkoutCardScoringTitle')}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {t('checkoutCardScoringSubtitle')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-purple-950 to-indigo-950 text-white shadow-lg space-y-4 max-w-md mx-auto">
                      <div className="flex justify-between items-center text-xs text-purple-200">
                        <span className="font-mono">Uzcard / Humo</span>
                        <Building2 className="w-5 h-5 text-purple-300" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-purple-300 uppercase font-mono">{t('checkoutCardNumberLabel')}</label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-base tracking-wider outline-none focus:border-purple-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-purple-300 uppercase font-mono">{t('checkoutCardExpiryLabel')}</label>
                          <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-1.5 text-white font-mono text-sm tracking-widest outline-none focus:border-purple-400"
                          />
                        </div>
                        <div className="text-right flex flex-col justify-end">
                          <span className="text-[10px] text-purple-300 uppercase font-mono">{t('checkoutCardHolderLabel')}</span>
                          <span className="text-xs font-mono font-bold truncate text-white">{formData.fullName.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skoring tekshirish jarayoni */}
                    {isScoringChecking ? (
                      <div className="p-6 bg-purple-50 dark:bg-purple-950/50 rounded-2xl text-center space-y-3 border border-purple-200 dark:border-purple-800">
                        <Loader2 className="w-8 h-8 text-uzum-primary dark:text-purple-400 animate-spin mx-auto" />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('checkoutScoringAnalyzing')}</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium animate-pulse">
                          {scoringProgressText}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleStartScoring}
                          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                        >
                          <Sparkles className="w-5 h-5 text-yellow-300" />
                          <span>{t('checkoutStartScoringBtn')}</span>
                        </button>
                        <p className="text-center text-[11px] text-gray-400 dark:text-slate-500">
                          {t('checkoutScoringDurationNotice')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Agar To'liq To'lov tanlangan bo'lsa */
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/60 p-6 space-y-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('checkoutPaymentMethodTitle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border-2 border-uzum-primary bg-purple-50/50 dark:bg-purple-950/40 flex flex-col items-center justify-center text-center cursor-pointer">
                    <span className="font-extrabold text-sm text-uzum-primary dark:text-purple-300">{t('checkoutPayUzum')}</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">{t('checkoutCashbackBadge')}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:border-purple-300 dark:hover:border-purple-600/40 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                    <span className="font-extrabold text-sm text-gray-800 dark:text-slate-200">{t('checkoutPayPayme')}</span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{t('checkoutFastPaymentBadge')}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 hover:border-purple-300 dark:hover:border-purple-600/40 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                    <span className="font-extrabold text-sm text-gray-800 dark:text-slate-200">{t('checkoutCashOnDelivery')}</span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{t('checkoutUponDeliveryBadge')}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">{t('checkoutFullNameLabel')}</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">{t('checkoutPhoneLabel')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">{t('checkoutAddressLabel')}</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFullPaymentOrder}
                  className="w-full py-3.5 bg-uzum-primary hover:bg-uzum-hover text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20"
                >
                  {t('checkoutConfirmOrderBtn')} ({formatPrice(finalTotal, true, language)})
                </button>
              </div>
            )}
          </div>

          {/* O'ng Tomon: Buyurtma Xulosasi (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/60 p-5 space-y-5 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/60 pb-3 flex items-center justify-between">
              <span>{t('checkoutOrderSummaryTitle')}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-normal">{cart.length} {t('itemsUnit')}</span>
            </h3>

            {/* Mahsulotlar ro'yxati */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-slate-200 truncate">{item.product.title}</h4>
                    <div className="text-gray-400 dark:text-slate-500 mt-0.5">{item.quantity} x {formatPrice(item.product.price, true, language)}</div>
                    {paymentMode === 'installment' && (
                      <div className="text-[11px] text-uzum-primary dark:text-purple-400 font-bold">
                        {formatPrice(calculateMonthlyPaymentQuick(item.product.price, selectedMonths), true, language)}{t('perMonth')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Promokod bo'limi */}
            <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400" />
                <span>{t('promoCodeTitle')}</span>
              </label>

              {appliedPromoCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-uzum-primary dark:text-purple-300">{appliedPromoCode.code}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      -{appliedPromoCode.discountType === 'percentage' ? `${appliedPromoCode.discountValue}%` : formatPrice(appliedPromoCode.discountValue, true, language)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="p-1 text-gray-400 hover:text-rose-500 transition-colors rounded-lg"
                    title={t('removePromoBtn')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                      placeholder="WELCOME10 / ELRIZO15"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs outline-none focus:border-uzum-primary uppercase font-mono font-bold placeholder:normal-case placeholder:font-normal"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="px-3 py-1.5 bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      {t('applyPromoBtn')}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[11px] text-rose-500 font-medium">{promoError}</p>
                  )}
                  {/* Tavsiya qilinadigan promokod chiplari */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyPromo('WELCOME10')}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                    >
                      WELCOME10 (-10%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPromo('ELRIZO15')}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100/70 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
                    >
                      ELRIZO15 (-15%)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hisob-kitob qatori */}
            <div className="border-t border-gray-100 dark:border-slate-700/60 pt-3 space-y-2 text-xs text-gray-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>{t('checkoutItemsPriceLabel')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(totalAmount, true, language)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>{t('promoDiscount')} ({appliedPromoCode?.code})</span>
                  <span>-{formatPrice(discountAmount, true, language)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('checkoutDeliveryLabel')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t('checkoutFreeDeliveryValue')}</span>
              </div>
              {paymentMode === 'installment' && (
                <div className="flex justify-between text-uzum-primary dark:text-purple-400 font-bold">
                  <span>{t('checkoutMonthlyPaymentLabel')}</span>
                  <span>{formatPrice(finalMonthlyTotal, true, language)}{t('perMonth')}</span>
                </div>
              )}
            </div>

            {/* Jami to'lov qutisi */}
            <div className="border-t border-gray-200 dark:border-slate-700/60 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{t('checkoutTotalLabel')}</span>
                <div className="text-right">
                  {discountAmount > 0 && (
                    <div className="text-[11px] text-gray-400 line-through">
                      {paymentMode === 'installment' ? formatPrice(monthlyTotal, true, language) + t('perMonth') : formatPrice(totalAmount, true, language)}
                    </div>
                  )}
                  <span className="text-xl font-black text-gray-900 dark:text-white">
                    {paymentMode === 'installment' ? formatPrice(finalMonthlyTotal, true, language) + t('perMonth') : formatPrice(finalTotal, true, language)}
                  </span>
                </div>
              </div>
              {paymentMode === 'installment' && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('checkoutZeroDownNotice')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
