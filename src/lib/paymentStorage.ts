import { supabase, updateOrderStatusInSupabase } from './supabase';

export interface PaymentTransaction {
  id: string; // Internal ID or provider transaction ID
  provider: 'payme' | 'click' | 'uzumpay';
  providerTransId: string;
  orderId: string;
  contractNumber: string;
  amount: number; // in UZS (so'm)
  state: number; // Provider specific state
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  createdAt: number;
  performedAt?: number;
  cancelledAt?: number;
  reason?: number | string;
}

// In-memory fallback cache for fast serverless transaction tracking
const transactionCache = new Map<string, PaymentTransaction>();

export async function saveTransaction(tx: PaymentTransaction): Promise<void> {
  transactionCache.set(tx.providerTransId, tx);
  transactionCache.set(`order_${tx.contractNumber}`, tx);

  try {
    // Try to record in Supabase nasiya_orders table or payment_transactions
    if (tx.status === 'completed') {
      await updateOrderStatusInSupabase(tx.contractNumber, 'paid');
    }
  } catch (err) {
    console.warn('Failed to save transaction to Supabase:', err);
  }
}

export async function findTransactionByProviderId(
  providerTransId: string
): Promise<PaymentTransaction | null> {
  const cached = transactionCache.get(providerTransId);
  if (cached) return cached;
  return null;
}

export async function findTransactionByContractNumber(
  contractNumber: string
): Promise<PaymentTransaction | null> {
  const cached = transactionCache.get(`order_${contractNumber}`);
  if (cached) return cached;
  return null;
}

export async function findOrderByContract(contractNumber: string): Promise<{
  exists: boolean;
  contractNumber: string;
  amount: number;
  customerName?: string;
  phone?: string;
  status?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('nasiya_orders')
      .select('*')
      .eq('contract_number', contractNumber)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      // Check cache fallback
      const cachedTx = transactionCache.get(`order_${contractNumber}`);
      if (cachedTx) {
        return {
          exists: true,
          contractNumber,
          amount: cachedTx.amount,
          status: cachedTx.status,
        };
      }
      return null;
    }

    return {
      exists: true,
      contractNumber: data.contract_number,
      amount: Number(data.total_price) || 0,
      customerName: data.customer_name,
      phone: data.phone,
      status: data.status,
    };
  } catch {
    return null;
  }
}

/**
 * Send Payment notification to Telegram Admin Bot (@elrizo_bot)
 */
export async function sendTelegramPaymentNotification(params: {
  provider: 'Payme' | 'Click' | 'Uzum Pay';
  contractNumber: string;
  amount: number;
  customerName?: string;
  phone?: string;
}): Promise<void> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
  const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '7373118052';

  const formattedAmount = params.amount.toLocaleString('uz-UZ') + " so'm";
  const text = `💰 <b>YANGI TO'LOV QABUL QILINDI!</b> ⚡

💳 <b>To'lov tizimi:</b> ${params.provider}
📦 <b>Buyurtma / Shartnoma:</b> <code>${params.contractNumber}</code>
💵 <b>To'langan summa:</b> <b>${formattedAmount}</b>
👤 <b>Mijoz:</b> ${params.customerName || 'Hurmatli mijoz'}
📞 <b>Telefon:</b> ${params.phone || 'Noma\'lum'}
⏰ <b>Vaqti:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
✅ <b>Holati:</b> TO'LANDI (Muvaffaqiyatli)`;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📊 Admin panelga o'tish", url: "https://elrizonasiya.vercel.app/admin" }
            ]
          ]
        }
      }),
    });
  } catch (err) {
    console.error('Telegram payment notification error:', err);
  }
}
