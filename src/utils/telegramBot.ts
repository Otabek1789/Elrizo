import { Order } from '../types';

export const TELEGRAM_BOT_TOKEN = '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
export const TELEGRAM_ADMIN_CHAT_ID = '7373118052';
export const TELEGRAM_BOT_USERNAME = 'elrizo_bot';

/**
 * HTML matnidagi maxsus belgilarni tozalash (Telegram parse_mode=HTML xatolik bermasligi uchun)
 */
function escapeHtml(text: string = ''): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Telegram Bot API orqali xabar yuborish
 */
export async function sendTelegramMessage(text: string, chatId = TELEGRAM_ADMIN_CHAT_ID): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.warn("Telegram API error:", data);
      return { 
        success: false, 
        error: data.description || "Telegramga yuborishda xatolik yuz berdi" 
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Telegram fetch exception:", err);
    return { success: false, error: err.message || "Tarmoq xatosi" };
  }
}

/**
 * Saytdan yangi buyurtma yoki Nasiya arizasi rasmiylashtirilganda Telegramga batafsil hisobot yuborish
 */
export async function sendOrderNotificationToTelegram(order: Order): Promise<boolean> {
  const isInstallment = order.paymentMode === 'installment';
  const contractId = order.contractNumber || order.id;

  const itemsList = (order.items || [])
    .map((item, idx) => {
      const title = escapeHtml(item.title || (item as any).product?.title || 'Mahsulot');
      const qty = item.quantity || 1;
      const price = ((item.price || (item as any).product?.price || 0) * qty).toLocaleString('uz-UZ');
      return `  <b>${idx + 1}.</b> ${title} — <i>${qty} dona</i> (${price} so'm)`;
    })
    .join('\n');

  const paymentText = isInstallment
    ? `📊 <b>To'lov turi:</b> Nasiya savdo (${order.installmentMonths || 12} oy muddatga)`
    : `💳 <b>To'lov turi:</b> To'liq to'lov (${escapeHtml(order.paymentMode || 'Online')})`;

  const monthlyText = isInstallment && order.monthlyPayment
    ? `\n📅 <b>Oylik to'lov:</b> <code>${order.monthlyPayment.toLocaleString('uz-UZ')} so'm/oy</code>`
    : '';

  const pinflText = order.pinfl
    ? `\n🪪 <b>JShShIR (PINFL):</b> <code>${escapeHtml(order.pinfl)}</code>`
    : '';

  const addressText = order.deliveryAddress
    ? `\n📍 <b>Manzil:</b> ${escapeHtml(order.deliveryAddress)}`
    : '';

  const scoringText = order.scoringScore !== undefined
    ? `\n🎯 <b>Skoring balli:</b> <b>${order.scoringScore}/100</b> (Tasdiqlangan)`
    : '';

  const now = new Date().toLocaleString('uz-UZ', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  const message = `🛍️ <b>YANGI BUYURTMA QABUL QILINDI!</b>
━━━━━━━━━━━━━━━━━━━━
📄 <b>Shartnoma №:</b> <code>${escapeHtml(contractId)}</code>
👤 <b>Xaridor:</b> <b>${escapeHtml(order.customerName)}</b>
📞 <b>Telefon:</b> <code>${escapeHtml(order.customerPhone)}</code>${pinflText}${addressText}

${paymentText}${monthlyText}
💰 <b>Umumiy summa:</b> <b>${(order.totalPrice || 0).toLocaleString('uz-UZ')} so'm</b>${scoringText}
━━━━━━━━━━━━━━━━━━━━
📦 <b>Buyurtma tarkibi (${order.items?.length || 0} ta tovar):</b>
${itemsList || "  <i>(Tovarlar ro'yxati biriktirilmagan)</i>"}
━━━━━━━━━━━━━━━━━━━━
⏰ <b>Sana va vaqt:</b> ${now}
🌐 <b>Manba:</b> ELRIZO.UZ Online Market`;

  const res = await sendTelegramMessage(message);
  return res.success;
}

/**
 * Tezkor qo'ng'iroq / konsultatsiya so'rovi bildirishnomasi
 */
export async function sendCallbackNotificationToTelegram(data: { name: string; phone: string; message?: string }): Promise<boolean> {
  const now = new Date().toLocaleString('uz-UZ');
  const text = `📞 <b>YANGI QO'NG'IROQ / KONSULTATSIYA SO'ROVI</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> ${escapeHtml(data.name)}
📞 <b>Telefon:</b> <code>${escapeHtml(data.phone)}</code>
${data.message ? `💬 <b>Xabar:</b> ${escapeHtml(data.message)}\n` : ''}━━━━━━━━━━━━━━━━━━━━
⏰ <b>Vaqt:</b> ${now}`;

  const res = await sendTelegramMessage(text);
  return res.success;
}

/**
 * Telegram bot ulanishini sinovdan o'tkazish
 */
export async function testTelegramBotConnection(): Promise<{ success: boolean; message: string }> {
  const now = new Date().toLocaleString('uz-UZ');
  const testMsg = `🔔 <b>ELRIZO BOT TEST BILDIRISHNOMASI</b>
━━━━━━━━━━━━━━━━━━━━
✅ Telegram bot saytga muvaffaqiyatli ulandi!
🤖 <b>Bot:</b> @${TELEGRAM_BOT_USERNAME}
👤 <b>Admin Chat ID:</b> <code>${TELEGRAM_ADMIN_CHAT_ID}</code>
⏰ <b>Vaqt:</b> ${now}

<i>Barcha yangi buyurtmalar va arizalar endi avtomatik ravishda ushbu chatga keladi.</i>`;

  const res = await sendTelegramMessage(testMsg);
  if (res.success) {
    return {
      success: true,
      message: "Telegramga test xabar muvaffaqiyatli yuborildi! @elrizo_bot chattingizni tekshiring.",
    };
  } else {
    return {
      success: false,
      message: res.error || "Xatolik: ehtimol @elrizo_bot ga kirib Start tugmasini bosmagansiz.",
    };
  }
}
