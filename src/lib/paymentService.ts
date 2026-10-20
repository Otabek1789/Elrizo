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

// Configurable Merchant IDs (Fallback to official demo/sandbox accounts)
const PAYME_MERCHANT_ID = (import.meta as any).env?.VITE_PAYME_MERCHANT_ID || '64a938c1a938c10001';
const CLICK_MERCHANT_ID = (import.meta as any).env?.VITE_CLICK_MERCHANT_ID || '24560';
const CLICK_SERVICE_ID = (import.meta as any).env?.VITE_CLICK_SERVICE_ID || '31289';

export const createPaymeInvoiceUrl = (params: PaymentInvoiceParams): string => {
  // Payme expects amount in Tiyin (1 UZS = 100 Tiyin)
  const amountInTiyin = params.amount * 100;
  const rawParams = `m=${PAYME_MERCHANT_ID};ac.order_id=${params.contractNumber};a=${amountInTiyin}`;
  
  // Safe Base64 encoding for browser
  const encoded = btoa(unescape(encodeURIComponent(rawParams)));
  return `https://checkout.paycom.uz/${encoded}`;
};

export const createClickInvoiceUrl = (params: PaymentInvoiceParams): string => {
  const returnUrl = encodeURIComponent(params.returnUrl || window.location.origin + '/checkout?payment=success');
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
    isTestMode: !Boolean((import.meta as any).env?.VITE_PAYME_MERCHANT_ID),
  };
};
