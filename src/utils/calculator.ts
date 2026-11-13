import { InstallmentCalculationResult, InstallmentPlan, InstallmentScheduleItem } from '../types';

/**
 * ELRIZO 0-0-12 Halol Nasiya Savdo tarif rejalari:
 * 0% Boshlang'ich to'lov | 0% Ustama (foizsiz) | 12 oygacha
 */
export const INSTALLMENT_PLANS: InstallmentPlan[] = [
  { months: 3, markupPercent: 0, label: '3 oy (0%)', isZeroPercent: true },
  { months: 6, markupPercent: 0, label: '6 oy (0%)', isZeroPercent: true },
  { months: 12, markupPercent: 0, label: '12 oy (0% — 0-0-12)', isZeroPercent: true },
  { months: 24, markupPercent: 0, label: '24 oy (0%)', isZeroPercent: true },
];

/**
 * Ko'p tilli tarif rejalarini olish (UZ / RU)
 * Mahsulot 0-0-12 shartida bo'lsa (default) — 0% ustama bilan hisoblanadi
 */
export const getInstallmentPlans = (lang: string = 'uz', hasZeroDown: boolean = true): InstallmentPlan[] => {
  const monthWord = lang === 'ru' ? 'мес' : 'oy';
  const noMarkupWord = lang === 'ru' ? '0% без переплат' : '0% ustamasiz';

  if (hasZeroDown) {
    return [
      { months: 3, markupPercent: 0, label: `3 ${monthWord} (${noMarkupWord})`, isZeroPercent: true },
      { months: 6, markupPercent: 0, label: `6 ${monthWord} (${noMarkupWord})`, isZeroPercent: true },
      { months: 12, markupPercent: 0, label: `12 ${monthWord} (0-0-12 Halol)`, isZeroPercent: true },
      { months: 24, markupPercent: 0, label: `24 ${monthWord} (${noMarkupWord})`, isZeroPercent: true },
    ];
  }

  // Agar mahsulotda 0-0-12 aksiyasi mavjud bo'lmasa (standart shartlar)
  return [
    { months: 3, markupPercent: 0, label: `3 ${monthWord} (0%)`, isZeroPercent: true },
    { months: 6, markupPercent: 8, label: `6 ${monthWord} (+8%)` },
    { months: 12, markupPercent: 16, label: `12 ${monthWord} (+16%)` },
    { months: 24, markupPercent: 24, label: `24 ${monthWord} (+24%)` },
  ];
};

/**
 * Narxni ko'p tilli formatga o'tkazish (UZ: "so'm", RU: "сум")
 * Masalan: 1250000 -> "1 250 000 so'm" / "1 250 000 сум"
 * Null, undefined yoki NaN qiymatlarni 0 deb xavfsiz qabul qiladi
 */
export const formatPrice = (amount: number | null | undefined, includeCurrency = true, customLang?: string): string => {
  const safeAmount = (amount === null || amount === undefined || isNaN(amount)) ? 0 : amount;
  const rounded = Math.round(safeAmount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (!includeCurrency) return formatted;
  const currentLang = customLang || (typeof document !== 'undefined' ? document.documentElement.lang : 'uz') || 'uz';
  const currencyUnit = currentLang === 'ru' ? 'сум' : "so'm";
  return `${formatted} ${currencyUnit}`;
};

/**
 * Standart eng kichik oylik to'lovni aniq va xatosiz tez hisoblash (kartochkalar va yorliqlar uchun)
 * 0-0-12 Halol shartida: price / months (0% ustama)
 */
export const calculateMonthlyPaymentQuick = (
  price: number | null | undefined, 
  months: 3 | 6 | 12 | 24 = 12,
  hasZeroDown: boolean = true
): number => {
  const safePrice = Math.max(0, Number(price) || 0);
  const safeMonths = Math.max(1, Number(months) || 12);
  const plans = getInstallmentPlans('uz', hasZeroDown);
  const plan = plans.find(p => p.months === safeMonths) || plans[2] || { markupPercent: 0 };
  const totalWithMarkup = safePrice * (1 + plan.markupPercent / 100);
  return Math.round(totalWithMarkup / safeMonths);
};

/**
 * Sanaga oylar qo'shish va "DD.MM.YYYY" formatida qaytarish
 * 31-kun yoki fevral oylarida sananing sakrab ketishi xatosi to'liq bartaraf etilgan
 */
export const addMonthsToDate = (baseDate: Date, monthsToAdd: number): string => {
  const date = new Date(baseDate);
  const targetDay = date.getDate();
  // 1-kun qilib olib, oy qo'shamiz (overflow bo'lmasligi uchun)
  date.setDate(1);
  date.setMonth(date.getMonth() + monthsToAdd);
  // Maqsadli oyning oxirgi kunini aniqlaymiz
  const daysInTargetMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(targetDay, daysInTargetMonth));
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * To'liq nasiya hisob-kitobi va to'lov grafigini (amortizatsiya jadvali) 100% aniqlikda shakllantirish
 * 
 * @param productPrice - mahsulotning naqd narxi
 * @param months - tanlangan muddat (3, 6, 12, 24)
 * @param downPayment - dastlabki to'lov (so'mda)
 * @param startDate - birinchi to'lov muddati (default: joriy sana)
 * @param hasZeroDown - 0-0-12 aksiyasi mavjudligi (default: true)
 */
export const calculateInstallment = (
  productPrice: number | null | undefined,
  months: 3 | 6 | 12 | 24 = 12,
  downPayment: number = 0,
  startDate: Date = new Date(),
  hasZeroDown: boolean = true
): InstallmentCalculationResult => {
  const safePrice = Math.max(0, Number(productPrice) || 0);
  const safeMonths = (months === 3 || months === 6 || months === 12 || months === 24) ? months : 12;

  // Dastlabki to'lov mahsulot narxining 90% idan oshmasligi kerak
  const safeDownPayment = Math.max(0, Math.min(Number(downPayment) || 0, Math.round(safePrice * 0.9)));
  const financedAmount = Math.max(0, safePrice - safeDownPayment);

  const plans = getInstallmentPlans('uz', hasZeroDown);
  const plan = plans.find(p => p.months === safeMonths) || plans[2] || { markupPercent: 0 };
  const markupPercent = plan.markupPercent;

  // Foiz / ustama summasi
  const markupAmount = Math.round((financedAmount * markupPercent) / 100);
  const totalInstallmentDebt = financedAmount + markupAmount;
  const totalAmount = safeDownPayment + totalInstallmentDebt;

  // Har oylik to'lov
  const monthlyPayment = safeMonths > 0 ? Math.round(totalInstallmentDebt / safeMonths) : 0;

  // Aniq to'lov jadvali (amortizatsiya)
  const schedule: InstallmentScheduleItem[] = [];
  let currentBalance = totalInstallmentDebt;
  let cumulativePrincipal = 0;
  let cumulativeMarkup = 0;

  const basePrincipalPerMonth = Math.round(financedAmount / safeMonths);
  const baseMarkupPerMonth = Math.round(markupAmount / safeMonths);

  for (let i = 1; i <= safeMonths; i++) {
    const isLastMonth = i === safeMonths;
    const actualMonthlyPayment = isLastMonth ? currentBalance : monthlyPayment;
    const dueDate = addMonthsToDate(startDate, i);

    // Asosiy qarz va ustamani har bir oyga aniq taqsimlash (tayinli qoldiqsiz)
    const principalForThisMonth = isLastMonth
      ? Math.max(0, financedAmount - cumulativePrincipal)
      : Math.min(basePrincipalPerMonth, Math.max(0, financedAmount - cumulativePrincipal));
    cumulativePrincipal += principalForThisMonth;

    const markupForThisMonth = isLastMonth
      ? Math.max(0, markupAmount - cumulativeMarkup)
      : Math.min(baseMarkupPerMonth, Math.max(0, markupAmount - cumulativeMarkup));
    cumulativeMarkup += markupForThisMonth;

    currentBalance = Math.max(0, currentBalance - actualMonthlyPayment);

    schedule.push({
      monthIndex: i,
      dueDate,
      monthlyAmount: actualMonthlyPayment,
      principalAmount: principalForThisMonth,
      markupAmount: markupForThisMonth,
      remainingBalance: currentBalance,
    });
  }

  return {
    totalAmount,
    monthlyPayment,
    markupAmount,
    markupPercent,
    months: safeMonths,
    downPayment: safeDownPayment,
    financedAmount,
    schedule,
  };
};
