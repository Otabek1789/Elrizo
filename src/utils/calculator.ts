import { InstallmentCalculationResult, InstallmentPlan, InstallmentScheduleItem } from '../types';

export const INSTALLMENT_PLANS: InstallmentPlan[] = [
  { months: 3, markupPercent: 0, label: '3 oy (0%)', isZeroPercent: true },
  { months: 6, markupPercent: 12, label: '6 oy (12%)' },
  { months: 12, markupPercent: 24, label: '12 oy (24%)' },
  { months: 24, markupPercent: 38, label: '24 oy (38%)' },
];

export const getInstallmentPlans = (lang: string = 'uz'): InstallmentPlan[] => {
  const monthWord = lang === 'ru' ? 'мес' : 'oy';
  return [
    { months: 3, markupPercent: 0, label: `3 ${monthWord} (0%)`, isZeroPercent: true },
    { months: 6, markupPercent: 12, label: `6 ${monthWord} (12%)` },
    { months: 12, markupPercent: 24, label: `12 ${monthWord} (24%)` },
    { months: 24, markupPercent: 38, label: `24 ${monthWord} (38%)` },
  ];
};

/**
 * Narxni ko'p tilli formatga o'tkazish (UZ: "so'm", RU: "сум")
 * Masalan: 1250000 -> "1 250 000 so'm" / "1 250 000 сум"
 */
export const formatPrice = (amount: number, includeCurrency = true, customLang?: string): string => {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (!includeCurrency) return formatted;
  const currentLang = customLang || (typeof document !== 'undefined' ? document.documentElement.lang : 'uz') || 'uz';
  const currencyUnit = currentLang === 'ru' ? 'сум' : "so'm";
  return `${formatted} ${currencyUnit}`;
};

/**
 * 12 oylik standart eng kichik oylik to'lovni tez hisoblash (kartochkalar va yorliqlar uchun)
 */
export const calculateMonthlyPaymentQuick = (price: number, months: 3 | 6 | 12 | 24 = 12): number => {
  const plan = INSTALLMENT_PLANS.find(p => p.months === months) || INSTALLMENT_PLANS[2];
  const totalWithMarkup = price * (1 + plan.markupPercent / 100);
  return Math.round(totalWithMarkup / months);
};

/**
 * Sanaga oylar qo'shish va "DD.MM.YYYY" formatida qaytarish
 */
export const addMonthsToDate = (baseDate: Date, monthsToAdd: number): string => {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + monthsToAdd);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * To'liq nasiya hisob-kitobi va to'lov grafigini (amortizatsiya jadvali) shakllantirish
 * 
 * @param productPrice - mahsulotning naqd narxi
 * @param months - tanlangan muddat (3, 6, 12, 24)
 * @param downPayment - dastlabki to'lov (so'mda)
 * @param startDate - birinchi to'lov muddati (default: joriy sana)
 */
export const calculateInstallment = (
  productPrice: number,
  months: 3 | 6 | 12 | 24,
  downPayment: number = 0,
  startDate: Date = new Date()
): InstallmentCalculationResult => {
  // Dastlabki to'lov mahsulot narxidan oshmasligi kerak
  const safeDownPayment = Math.max(0, Math.min(downPayment, productPrice * 0.9));
  const financedAmount = Math.max(0, productPrice - safeDownPayment);

  const plan = INSTALLMENT_PLANS.find(p => p.months === months) || INSTALLMENT_PLANS[2];
  const markupPercent = plan.markupPercent;

  // Foiz / ustama summasi
  const markupAmount = Math.round((financedAmount * markupPercent) / 100);
  const totalInstallmentDebt = financedAmount + markupAmount;
  const totalAmount = safeDownPayment + totalInstallmentDebt;

  // Har oylik to'lov
  const monthlyPayment = Math.round(totalInstallmentDebt / months);

  // Jadvalni tuzish
  const schedule: InstallmentScheduleItem[] = [];
  let currentBalance = totalInstallmentDebt;

  const basePrincipalPerMonth = Math.round(financedAmount / months);
  const baseMarkupPerMonth = Math.round(markupAmount / months);

  for (let i = 1; i <= months; i++) {
    const isLastMonth = i === months;
    const actualMonthlyPayment = isLastMonth ? currentBalance : monthlyPayment;
    const dueDate = addMonthsToDate(startDate, i);

    currentBalance = Math.max(0, currentBalance - actualMonthlyPayment);

    schedule.push({
      monthIndex: i,
      dueDate,
      monthlyAmount: actualMonthlyPayment,
      principalAmount: isLastMonth ? financedAmount - (basePrincipalPerMonth * (months - 1)) : basePrincipalPerMonth,
      markupAmount: isLastMonth ? markupAmount - (baseMarkupPerMonth * (months - 1)) : baseMarkupPerMonth,
      remainingBalance: currentBalance,
    });
  }

  return {
    totalAmount,
    monthlyPayment,
    markupAmount,
    markupPercent,
    months,
    downPayment: safeDownPayment,
    financedAmount,
    schedule,
  };
};
