// Vercel Serverless Function: ELRIZO Rasmiy Telegram Bot Webhook Handler

const BOT_TOKEN = '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
const ADMIN_CHAT_ID = '7373118052';
// Doimiy ishlaydigan Vercel domeni:
const SITE_URL = 'https://elrizonasiya.vercel.app';
const WEBAPP_URL = `${SITE_URL}/tg`;

function escapeHtml(str: string = ''): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendTelegram(method: string, body: Record<string, any>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn(`Telegram API error for ${method}:`, data);
      // Agar HTML parse xatosi yuz bersa, parse_mode ni olib tashlab qayta yuboramiz
      if (body.parse_mode && data.description?.toLowerCase().includes('entity')) {
        const plainBody = { ...body };
        delete plainBody.parse_mode;
        plainBody.text = plainBody.text?.replace(/<[^>]*>/g, '');
        const retryRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(plainBody),
        });
        return await retryRes.json();
      }
    }
    return data;
  } catch (err) {
    console.error(`Telegram API ${method} fetch error:`, err);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // CORS sarlavhalari
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    let reconnected = false;
    try {
      const webhookUrl = `${SITE_URL}/api/telegram`;
      const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
      const info = await infoRes.json();
      if (info.ok && info.result?.url !== webhookUrl) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`);
        reconnected = true;
      }
    } catch (e) {
      // Ignore network errors in status check
    }

    return res.status(200).json({
      ok: true,
      message: 'ELRIZO Telegram Bot Webhook endpoint active',
      bot: '@elrizo_bot',
      web_app_url: WEBAPP_URL,
      reconnected
    });
  }

  let update = req.body;
  if (typeof update === 'string') {
    try {
      update = JSON.parse(update);
    } catch (e) {
      console.error("Failed to parse body string:", e);
    }
  }

  if (!update) {
    return res.status(200).json({ ok: true });
  }

  try {
    // 1. Foydalanuvchi xabar yozganda (Message)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const rawText = (msg.text || msg.caption || '').trim();
      const text = rawText.toLowerCase();
      const safeFirstName = escapeHtml(msg.from?.first_name || 'Hurmatli mijoz');
      const username = msg.from?.username ? `@${escapeHtml(msg.from.username)}` : 'username_yoq';

      if (!chatId) {
        return res.status(200).json({ ok: true });
      }

      // /start yoki start buyrug'i (har qanday parametrlar bilan: /start, /start app, /start@elrizo_bot)
      if (text.startsWith('/start') || text === 'start' || text === 'boshlash' || text === 'menu') {
        const welcomeText = `Assalomu alaykum, <b>${safeFirstName}</b>! 👋

🌟 <b>ELRIZO NASIYA SAVDO</b> — 0-0-12 Halol Nasiya Savdo rasmiy Telegram do'koniga xush kelibsiz!

Biz bilan qulay va xavfsiz xarid qiling:
⚡ <b>0% Boshlang'ich to'lov</b> — oldindan hech narsa to'lamaysiz
⚡ <b>0% Ustama (foizsiz)</b> — 12 oygacha qulay muddat
🚚 Butun O'zbekiston bo'ylab <b>24 soatda bepul yetkazib berish</b>
🛡️ <b>1 yillik rasmiy kafolat</b> barcha tovarlarga

🏢 <b>Do'konimiz ma'lumotlari:</b>
☎️ <b>Telefon:</b> +998 94 333 55 22
💬 <b>Telegram admin:</b> @yahyo0526
⏰ <b>Ish vaqti:</b> Har kuni 09:00 dan 21:00 gacha (dam olishsiz)
📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani
🌐 <b>Rasmiy sayt:</b> https://elrizonasiya.vercel.app

👇 <b>Do'konni ochish uchun quyidagi tugmani bosing:</b>`;

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: welcomeText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🛍️ ELRIZO Mini App (Do'konni ochish)", web_app: { url: WEBAPP_URL } }
              ],
              [
                { text: "⚡ 0-0-12 Nasiya shartlari", callback_data: "info_installment" },
                { text: "🏢 Do'kon haqida ma'lumot", callback_data: "info_about" }
              ],
              [
                { text: "📱 Smartfonlar", web_app: { url: `${WEBAPP_URL}?cat=smartphones` } },
                { text: "📺 Maishiy texnika", web_app: { url: `${WEBAPP_URL}?cat=appliances` } }
              ],
              [
                { text: "💬 Telegram Admin (@yahyo0526)", url: "https://t.me/yahyo0526" },
                { text: "☎️ Aloqa va Manzil", callback_data: "info_contact" }
              ]
            ]
          }
        });

        // Shuningdek doimiy Reply Keyboard ham yuboramiz (foydalanuvchi doim 1 bosishda ochishi uchun)
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `📱 Do'konga istalgan vaqtda quyidagi menyu orqali kirishingiz mumkin:`,
          reply_markup: {
            keyboard: [
              [
                { text: "🛍️ Do'konni ochish", web_app: { url: WEBAPP_URL } }
              ],
              [
                { text: "⚡ 0-0-12 Nasiya shartlari" },
                { text: "🏢 Do'kon ma'lumotlari va Manzil" }
              ],
              [
                { text: "☎️ Operator bilan bog'lanish" }
              ]
            ],
            resize_keyboard: true,
            is_persistent: true
          }
        });

        return res.status(200).json({ ok: true });
      }

      // /nasiya yoki nasiya shartlari haqida
      if (text.startsWith('/nasiya') || text.includes('nasiya') || text.includes('shartlar')) {
        const installmentText = `⚡ <b>ELRIZO 0-0-12 HALOL NASIYA SHARTLARI:</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>0% Boshlang'ich to'lov:</b> xarid kuni bir so'm ham to'lamaysiz!
✅ <b>0% Ortiqcha to'lov:</b> 12 oygacha ortiqcha foizsiz teng bo'lib to'laysiz!
✅ <b>Hech qanday garov va kafilsiz!</b>
✅ <b>2 daqiqada onlayn skoring!</b>

📋 <b>Kerakli hujjatlar:</b>
🪪 Pasport yoki ID-karta (JShShIR)
💳 Plastik karta (Uzcard yoki Humo)

☎️ <b>Telefon:</b> +998 94 333 55 22
💬 <b>Admin:</b> @yahyo0526
📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani

Tovarlarni tanlash va 2 daqiqada nasiya rasmiylashtirish uchun pastdagi tugmani bosing:`;

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: installmentText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🛍️ Nasiyaga tovarlarni tanlash", web_app: { url: WEBAPP_URL } }],
              [{ text: "💬 Telegramda adminga yozish", url: "https://t.me/yahyo0526" }]
            ]
          }
        });

        return res.status(200).json({ ok: true });
      }

      // /info, /haqida, /manzil, /aloqa yoki operator so'rovi
      if (
        text.startsWith('/aloqa') ||
        text.startsWith('/contact') ||
        text.startsWith('/info') ||
        text.startsWith('/haqida') ||
        text.startsWith('/about') ||
        text.startsWith('/manzil') ||
        text.includes('operator') ||
        text.includes('bog\'lanish') ||
        text.includes('aloqa') ||
        text.includes('manzil') ||
        text.includes('haqida') ||
        text.includes('malumot') ||
        text.includes('ma\'lumot') ||
        text.includes('telefon') ||
        text.includes('nomer') ||
        text.includes('admin')
      ) {
        const contactText = `🏢 <b>ELRIZO NASIYA SAVDO</b>
━━━━━━━━━━━━━━━━━━━━
☎️ <b>Telefon:</b> +998 94 333 55 22
💬 <b>Telegram admin:</b> @yahyo0526
⏰ <b>Ish vaqti:</b> Har kuni 09:00 dan 21:00 gacha (dam olishsiz)
📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani
🌐 <b>Rasmiy sayt:</b> https://elrizonasiya.vercel.app`;

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: contactText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "💬 Telegramda adminga yozish", url: "https://t.me/yahyo0526" }],
              [{ text: "🛍️ Do'konni ochish (Mini App)", web_app: { url: WEBAPP_URL } }],
              [{ text: "🌐 Rasmiy saytga o'tish", url: "https://elrizonasiya.vercel.app" }]
            ]
          }
        });

        return res.status(200).json({ ok: true });
      }

      // Oddiy savol yoki xabar yozsa: adminga forward qilib, mijozga javob berish
      if (text && !text.startsWith('/')) {
        const notifyAdmin = `📩 <b>BOTDAN YANGI FOYDALANUVCHI XABARI:</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Kimdan:</b> ${safeFirstName} (${username})
🆔 <b>Chat ID:</b> <code>${chatId}</code>
💬 <b>Xabar:</b> ${escapeHtml(rawText)}`;

        await sendTelegram('sendMessage', {
          chat_id: ADMIN_CHAT_ID,
          text: notifyAdmin,
          parse_mode: 'HTML'
        });

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `Rahmat, <b>${safeFirstName}</b>! Xabaringiz qabul qilindi va ELRIZO administratoriga yetkazildi. Tez orada javob beramiz.

☎️ <b>Telefon:</b> +998 94 333 55 22
💬 <b>Admin:</b> @yahyo0526
📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani

Shuningdek, tovarlarni ko'rish va xarid qilish uchun Mini App do'konimizdan foydalanishingiz mumkin:`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🛍️ Do'konni ochish (Mini App)", web_app: { url: WEBAPP_URL } }],
              [{ text: "💬 Adminga to'g'ridan-to'g'ri yozish", url: "https://t.me/yahyo0526" }]
            ]
          }
        });

        return res.status(200).json({ ok: true });
      }
    }

    // 2. Tugma bosilganda (Callback Query)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      if (data === 'info_installment') {
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `⚡ <b>ELRIZO 0-0-12 HALOL NASIYA:</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>0% Boshlang'ich to'lov</b>
✅ <b>0% Ustama</b> (12 oygacha belgilangan tovarlarga)
✅ <b>Hujjatsiz:</b> faqat Pasport / ID va plastik karta
✅ <b>Muddat:</b> 3, 6, 12, 24 oy
☎️ <b>Telefon:</b> +998 94 333 55 22
💬 <b>Admin:</b> @yahyo0526
📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🛍️ Do'konni ochish", web_app: { url: WEBAPP_URL } }],
              [{ text: "💬 Telegramda bog'lanish", url: "https://t.me/yahyo0526" }]
            ]
          }
        });
      } else if (data === 'info_contact' || data === 'info_about') {
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `🏢 <b>ELRIZO NASIYA SAVDO</b>
━━━━━━━━━━━━━━━━━━━━
☎️ <b>Telefon:</b> +998 94 333 55 22
💬 <b>Telegram admin:</b> @yahyo0526
⏰ <b>Ish vaqti:</b> Har kuni 09:00 dan 21:00 gacha (dam olishsiz)
📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani
🌐 <b>Rasmiy sayt:</b> https://elrizonasiya.vercel.app`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "💬 Telegramda bog'lanish", url: "https://t.me/yahyo0526" }],
              [{ text: "🛍️ Do'konga kirish (Mini App)", web_app: { url: WEBAPP_URL } }],
              [{ text: "🌐 Rasmiy sayt", url: "https://elrizonasiya.vercel.app" }]
            ]
          }
        });
      }

      await sendTelegram('answerCallbackQuery', {
        callback_query_id: cb.id
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("Telegram handler error:", err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
