import { Order, Product, CartItem, User } from '../types';

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
 * Telegram Bot API orqali rasm va uning tavsifini yuborish
 */
export async function sendTelegramPhoto(photoUrl: string, caption: string, chatId = TELEGRAM_ADMIN_CHAT_ID): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.warn("Telegram sendPhoto API warning, fallback to sendMessage:", data);
      // Rasm yuborishda xatolik bo'lsa (masalan rasm URL o'lik bo'lsa), oddiy matn sifatida yuboramiz
      return sendTelegramMessage(caption, chatId);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Telegram sendPhoto exception:", err);
    return sendTelegramMessage(caption, chatId);
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

export interface SendProductToTelegramOptions {
  color?: string;
  storage?: string;
  price?: number;
  monthlyPayment?: number;
  user?: User | null;
  quantity?: number;
  chatId?: string;
  customNote?: string;
  isMarketingPost?: boolean;
}

/**
 * Saytdagi tovar kartasidan yoki Admin paneldan tovarni to'g'ridan-to'g'ri Telegram bot / kanalga yuborish
 */
export async function sendProductToTelegram(
  product: Product,
  options?: SendProductToTelegramOptions
): Promise<{ success: boolean; message: string }> {
  const price = options?.price || product.price;
  const qty = options?.quantity || 1;
  const totalPrice = price * qty;
  const monthly = options?.monthlyPayment || Math.round((totalPrice * 1.24) / 12);
  const photo = product.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
  const targetChat = options?.chatId || TELEGRAM_ADMIN_CHAT_ID;

  const now = new Date().toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let caption = '';

  if (options?.isMarketingPost) {
    caption = `🔥 <b>ELRIZO ONLINE MARKET — MAXSUS TAKLIF</b>
━━━━━━━━━━━━━━━━━━━━
📱 <b>${escapeHtml(product.title)}</b>

💰 <b>Narxi:</b> <b>${totalPrice.toLocaleString('uz-UZ')} so'm</b>
⚡ <b>Muddatli to'lov:</b> <code>${monthly.toLocaleString('uz-UZ')} so'm / oy</code> (12 oy)
${product.hasZeroDown ? '✅ <b>Aksiya: 0-0-12 Boshlang\'ich to\'lovsiz Nasiya!</b>\n' : ''}${options?.color ? `🎨 <b>Rangi:</b> ${escapeHtml(options.color)}\n` : ''}${options?.storage ? `💾 <b>Xotirasi:</b> ${escapeHtml(options.storage)}\n` : ''}${options?.customNote ? `\n📝 <i>${escapeHtml(options.customNote)}</i>\n` : ''}━━━━━━━━━━━━━━━━━━━━
🚚 <b>Yetkazib berish:</b> Butun O'zbekiston bo'ylab 1 kunda!
🛡️ <b>Kafolat:</b> 1 yil rasmiy kafolat
🌐 <b>Saytda xarid qilish:</b> https://elrizo.uz/product/${product.id}
⏰ <b>Vaqt:</b> ${now}`;
  } else {
    caption = `🛍️ <b>ELRIZO — MAHSULOT SO'ROVI</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Mahsulot:</b> <b>${escapeHtml(product.title)}</b>
💰 <b>Narxi:</b> <b>${totalPrice.toLocaleString('uz-UZ')} so'm</b> ${qty > 1 ? `(${qty} dona)` : ''}
📅 <b>Nasiyaga (12 oy):</b> <code>${monthly.toLocaleString('uz-UZ')} so'm/oy</code>
${options?.color ? `🎨 <b>Rangi:</b> ${escapeHtml(options.color)}\n` : ''}${options?.storage ? `💾 <b>Xotirasi:</b> ${escapeHtml(options.storage)}\n` : ''}${product.hasZeroDown ? '⚡ <b>Aksiya: 0-0-12 Boshlang\'ich to\'lovsiz</b>\n' : ''}━━━━━━━━━━━━━━━━━━━━
${options?.user ? `👤 <b>Mijoz:</b> <b>${escapeHtml(options.user.fullName)}</b>\n📞 <b>Telefon:</b> <code>${escapeHtml(options.user.phone || 'Kiritilmagan')}</code>\n` : '👤 <b>Mijoz:</b> Sayt foydalanuvchisi\n'}⏰ <b>Vaqt:</b> ${now}
🌐 <b>Sayt havolasi:</b> https://elrizo.uz/product/${product.id}`;
  }

  const res = await sendTelegramPhoto(photo, caption, targetChat);
  if (res.success) {
    return {
      success: true,
      message: `«${product.title}» Telegramga muvaffaqiyatli tashlandi!`,
    };
  } else {
    return {
      success: false,
      message: res.error || "Telegramga yuborishda xatolik yuz berdi",
    };
  }
}

/**
 * Savatdagi barcha tovarlarni Telegram botga hisobot qilib yuborish
 */
export async function sendCartToTelegram(
  items: CartItem[],
  totalPrice: number,
  user?: User | null
): Promise<{ success: boolean; message: string }> {
  if (!items || items.length === 0) {
    return { success: false, message: "Savat bo'sh!" };
  }

  const now = new Date().toLocaleString('uz-UZ');
  const itemsText = items
    .map((item, idx) => {
      const p = item.product;
      const itemTotal = p.price * item.quantity;
      return `  <b>${idx + 1}.</b> ${escapeHtml(p.title)} x ${item.quantity} dona (${itemTotal.toLocaleString('uz-UZ')} so'm)`;
    })
    .join('\n');

  const text = `🛒 <b>SAVATDAGI TOVARLAR SO'ROVI</b>
━━━━━━━━━━━━━━━━━━━━
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💰 <b>Jami summa:</b> <b>${totalPrice.toLocaleString('uz-UZ')} so'm</b>
${user ? `👤 <b>Xaridor:</b> ${escapeHtml(user.fullName)}\n📞 <b>Telefon:</b> <code>${escapeHtml(user.phone || '')}</code>\n` : ''}⏰ <b>Vaqt:</b> ${now}
🌐 <b>ELRIZO.UZ Online Market</b>`;

  const res = await sendTelegramMessage(text);
  if (res.success) {
    return {
      success: true,
      message: "Savatdagi barcha tovarlar Telegram botga yuborildi!",
    };
  } else {
    return {
      success: false,
      message: res.error || "Telegram botga yuborishda xatolik yuz berdi",
    };
  }
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
