/**
 * Uzbekistan Payment Gateway Service (Payme, Click, Uzum Pay)
 * Provides official URL generation for checkout and real payment processing.
 */

export interface PaymentInvoiceParams {
  orderId: string;
  contractNumber: string;
  amount: number; // in UZS (so'm)
  customerPhone?: string;
  description?: string;
  returnUrl?: string;
}

export interface PaymentGatewayResult {
  provider: 'payme' | 'click' | 'uzumpay';
  paymentUrl: string;
  isTestMode: boolean;
}

export interface PaymentMerchantConfig {
  paymeMerchantId: string;
  paymeKey?: string;
  clickServiceId: string;
  clickMerchantId: string;
  clickSecretKey?: string;
  isLive: boolean;
}

const STORAGE_KEY = 'elrizo_payment_merchant_config';

const getEnv = (key: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`] as string;
    if (process.env[key]) return process.env[key] as string;
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`] as string;
  }
  return fallback;
};

// Retrieve configured merchant details from localStorage or environment variables
export const getPaymentMerchantConfig = (): PaymentMerchantConfig => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            paymeMerchantId: parsed.paymeMerchantId || getEnv('PAYME_MERCHANT_ID', ''),
            paymeKey: parsed.paymeKey || getEnv('PAYME_KEY', ''),
            clickServiceId: parsed.clickServiceId || getEnv('CLICK_SERVICE_ID', ''),
            clickMerchantId: parsed.clickMerchantId || getEnv('CLICK_MERCHANT_ID', ''),
            clickSecretKey: parsed.clickSecretKey || getEnv('CLICK_SECRET_KEY', ''),
            isLive: Boolean(parsed.paymeMerchantId || getEnv('PAYME_MERCHANT_ID', '')),
          };
        }
      }
    } catch {}
  }

  const paymeMerchantId = getEnv('PAYME_MERCHANT_ID', '');
  const clickServiceId = getEnv('CLICK_SERVICE_ID', '');
  const clickMerchantId = getEnv('CLICK_MERCHANT_ID', '');

  return {
    paymeMerchantId,
    paymeKey: getEnv('PAYME_KEY', ''),
    clickServiceId,
    clickMerchantId,
    clickSecretKey: getEnv('CLICK_SECRET_KEY', ''),
    isLive: Boolean(paymeMerchantId || clickServiceId),
  };
};

export const savePaymentMerchantConfig = (config: Partial<PaymentMerchantConfig>): void => {
  if (typeof window !== 'undefined') {
    try {
      const current = getPaymentMerchantConfig();
      const updated = { ...current, ...config };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save payment merchant config:', err);
    }
  }
};

/**
 * Payme rasmiy to'lov havolasini shakllantirish
 * Format: https://checkout.paycom.uz/{base64(m=...;ac.order_id=...;a=...;c=...)}
 */
export const createPaymeInvoiceUrl = (params: PaymentInvoiceParams): string => {
  const config = getPaymentMerchantConfig();
  // Agar merchant ID kiritilgan bo'lsa o'sha ishlatiladi, aks holda demo
  const merchantId = config.paymeMerchantId || '64a938c1a938c10001';

  // Payme expects amount in Tiyin (1 UZS = 100 Tiyin)
  const amountInTiyin = Math.round(params.amount * 100);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://elrizonasiya.vercel.app';
  const returnUrl = params.returnUrl || `${origin}/checkout?payment=success&orderId=${params.contractNumber}`;

  const rawParams = `m=${merchantId};ac.order_id=${params.contractNumber};a=${amountInTiyin};c=${returnUrl}`;

  // Safe Base64 encoding for browser & server
  const encoded = typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(rawParams)))
    : Buffer.from(rawParams).toString('base64');

  return `https://checkout.paycom.uz/${encoded}`;
};

/**
 * Click rasmiy to'lov havolasini shakllantirish
 * Format: https://my.click.uz/services/pay?service_id=...&merchant_id=...&amount=...&transaction_param=...&return_url=...
 */
export const createClickInvoiceUrl = (params: PaymentInvoiceParams): string => {
  const config = getPaymentMerchantConfig();
  const serviceId = config.clickServiceId || '31289';
  const merchantId = config.clickMerchantId || '24560';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://elrizonasiya.vercel.app';
  const returnUrl = encodeURIComponent(params.returnUrl || `${origin}/checkout?payment=success&orderId=${params.contractNumber}`);

  return `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${params.amount}&transaction_param=${encodeURIComponent(params.contractNumber)}&return_url=${returnUrl}`;
};

/**
 * Uzum Pay rasmiy to'lov havolasi
 */
export const createUzumPayInvoiceUrl = (params: PaymentInvoiceParams): string => {
  return `https://uzumpay.uz/pay?order_id=${encodeURIComponent(params.contractNumber)}&amount=${params.amount}`;
};

export const generatePaymentLink = (
  provider: 'payme' | 'click' | 'uzumpay',
  params: PaymentInvoiceParams
): PaymentGatewayResult => {
  const config = getPaymentMerchantConfig();
  let url = '';
  switch (provider) {
    case 'payme':
      url = createPaymeInvoiceUrl(params);
      break;
    case 'click':
      url = createClickInvoiceUrl(params);
      break;
    case 'uzumpay':
      url = createUzumPayInvoiceUrl(params);
      break;
  }

  const isTestMode = provider === 'payme'
    ? !Boolean(config.paymeMerchantId)
    : provider === 'click'
    ? !Boolean(config.clickServiceId)
    : true;

  return {
    provider,
    paymentUrl: url,
    isTestMode,
  };
};

/**
 * Har qanday platformada (Telegram Mini App, Mobile, Desktop brauzer)
 * to'lov sahifasini to'g'ri va xavfsiz ochish
 */
export const openPaymentCheckout = (paymentUrl: string): void => {
  if (typeof window === 'undefined') return;

  // 1. Agar Telegram Mini App ichida ochilgan bo'lsa:
  const tg = (window as any).Telegram?.WebApp;
  if (tg && typeof tg.openLink === 'function') {
    tg.openLink(paymentUrl);
    return;
  }

  // 2. Oddiy brauzerda:
  // window.open popuplari mobil brauzerlar tomonidan bloklanishi mumkinligi sababli,
  // to'g'ridan-to'g'ri o'sha oynada to'lov shlyuziga yo'naltirish eng ishonchli usuldir
  window.location.href = paymentUrl;
};
