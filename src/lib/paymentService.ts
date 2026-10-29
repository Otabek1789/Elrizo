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
  qrCodeUrl?: string;
  isTestMode: boolean;
}

const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`] as string;
    if (process.env[key]) return process.env[key] as string;
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`] as string;
  }
  return fallback;
};

// Configurable Merchant IDs (Fallback to official demo/sandbox accounts)
const PAYME_MERCHANT_ID = getEnv('PAYME_MERCHANT_ID', '64a938c1a938c10001');
const CLICK_MERCHANT_ID = getEnv('CLICK_MERCHANT_ID', '24560');
const CLICK_SERVICE_ID = getEnv('CLICK_SERVICE_ID', '31289');

export const createPaymeInvoiceUrl = (params: PaymentInvoiceParams): string => {
  // Payme expects amount in Tiyin (1 UZS = 100 Tiyin)
  const amountInTiyin = params.amount * 100;
  const rawParams = `m=${PAYME_MERCHANT_ID};ac.order_id=${params.contractNumber};a=${amountInTiyin}`;
  
  // Safe Base64 encoding for browser
  const encoded = typeof btoa !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(rawParams)))
    : Buffer.from(rawParams).toString('base64');
  return `https://checkout.paycom.uz/${encoded}`;
};

export const createClickInvoiceUrl = (params: PaymentInvoiceParams): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://elrizonasiya.vercel.app';
  const returnUrl = encodeURIComponent(params.returnUrl || origin + '/checkout?payment=success');
  return `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${params.amount}&transaction_param=${encodeURIComponent(params.contractNumber)}&return_url=${returnUrl}`;
};

export const createUzumPayInvoiceUrl = (params: PaymentInvoiceParams): string => {
  return `https://uzumpay.uz/pay?order_id=${encodeURIComponent(params.contractNumber)}&amount=${params.amount}`;
};

export const generatePaymentLink = (
  provider: 'payme' | 'click' | 'uzumpay',
  params: PaymentInvoiceParams
): PaymentGatewayResult => {
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

  return {
    provider,
    paymentUrl: url,
    isTestMode: !Boolean(getEnv('PAYME_MERCHANT_ID', '')),
  };
};
