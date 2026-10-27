// Vercel Serverless Function: ELRIZO Rasmiy Telegram Bot Webhook Handler

const BOT_TOKEN = '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
const ADMIN_CHAT_ID = '7373118052';
const SITE_URL = 'https://elrizo.uz';

async function sendTelegram(method: string, body: Record<string, any>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API ${method} error:`, err);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'ELRIZO Telegram Bot Webhook endpoint active' });
  }

  const update = req.body;
  if (!update) {
    return res.status(200).json({ ok: true });
  }

  try {
    // 1. Foydalanuvchi xabar yozganda
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();
      const firstName = msg.from?.first_name || 'Hurmatli mijoz';

      // /start komandasi
      if (text.startsWith('/start')) {
        const welcomeText = `Assalomu alaykum, <b>${firstName}</b>! 👋

🌟 <b>ELRIZO Online Market</b> — 0-0-12 Halol Nasiya Savdo rasmiy botiga xush kelibsiz!

Bizning do'konda:
⚡ <b>0% boshlang'ich to'lov</b> bilan smartfon va barcha maishiy texnikalarni muddatli to'lovga olishingiz mumkin.
🚚 Butun O'zbekiston bo'ylab <b>24 soatda bepul yetkazib berish</b>!
🛡️ <b>1 yillik rasmiy kafolat</b>.

Quyidagi tugmalar orqali xarid qiling yoki ma'lumot oling:`;

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: welcomeText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🛍️ Internet Do'konni Ochish", web_app: { url: SITE_URL } }
              ],
              [
                { text: "⚡ 0-0-12 Nasiya shartlari", callback_data: "info_installment" },
                { text: "📱 Smartfonlar", callback_data: "cat_smartphones" }
              ],
              [
                { text: "📺 Maishiy texnika", callback_data: "cat_appliances" },
                { text: "💻 Noutbuklar", callback_data: "cat_computers" }
              ],
              [
                { text: "📞 Operator bilan bog'lanish", callback_data: "info_contact" }
              ]
            ]
          }
        });

        return res.status(200).json({ ok: true });
      }

      // /nasiya komandasi
      if (text === '/nasiya') {
        const installmentText = `⚡ <b>ELRIZO 0-0-12 HALOL NASIYA SHARTLARI:</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>0% Boshlang'ich to'lov</b> — oldindan hech narsa to'lamaysiz!
✅ <b>0% Ortiqcha to'lov</b> — tanlangan tovarlarda 12 oygacha foizsiz va ustamasiz!
✅ <b>12 oygacha qulay muddat</b>.
✅ Hech qanday garov va kafilsiz!

Kerakli hujjatlar:
🪪 Pasport yoki ID-karta (JShShIR)
💳 Plastik karta (Uzcard / Humo)

Skoring tekshiruvi saytimizda 2 daqiqada avtomatik amalga oshiriladi.`;

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: installmentText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🛍️ Nasiyaga xarid qilish", web_app: { url: SITE_URL } }]
            ]
          }
        });

        return res.status(200).json({ ok: true });
      }

      // Oddiy xabar yuborsa, adminga yetkazish
      if (text && !text.startsWith('/')) {
        const notifyAdmin = `📩 <b>BOTDAN YANGI FOYDALANUVCHI XABARI:</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Kimdan:</b> ${firstName} (@${msg.from?.username || 'username_yoq'})
🆔 <b>Chat ID:</b> <code>${chatId}</code>
💬 <b>Xabar:</b> ${text}`;

        await sendTelegram('sendMessage', {
          chat_id: ADMIN_CHAT_ID,
          text: notifyAdmin,
          parse_mode: 'HTML'
        });

        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `Rahmat, <b>${firstName}</b>! Xabaringiz ELRIZO operatorlariga yetkazildi. Tez orada siz bilan bog'lanamiz.`,
          parse_mode: 'HTML'
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
          text: `⚡ <b>ELRIZO 0-0-12 HALOL NASIYA SHARTLARI:</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>0% Boshlang'ich to'lov</b>
✅ <b>0% Ortiqcha to'lov</b> (12 oygacha belgilangan tovarlarga)
✅ <b>Hujjatsiz:</b> faqat Pasport / ID va plastik karta kerak
✅ <b>Muddat:</b> 3, 6, 12 oy`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🛍️ Katalogga o'tish", web_app: { url: SITE_URL } }]
            ]
          }
        });
      } else if (data === 'info_contact') {
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `📞 <b>ELRIZO BOG'LANISH MARKAZI:</b>
━━━━━━━━━━━━━━━━━━━━
☎️ <b>Aloqa telefoni:</b> +998 71 200 00 00 / +998 90 123 45 67
⏰ <b>Ish vaqti:</b> Har kuni 09:00 dan 21:00 gacha
📍 <b>Bosh ofis:</b> Toshkent shahri
🌐 <b>Rasmiy sayt:</b> https://elrizo.uz`,
          parse_mode: 'HTML'
        });
      } else if (data?.startsWith('cat_')) {
        const cat = data.replace('cat_', '');
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `📦 Tanlangan toifadagi tovarlarni ko'rish uchun quyidagi tugmani bosing:`,
          reply_markup: {
            inline_keyboard: [
              [{ text: "📱 Tovarlarni ochish", web_app: { url: `${SITE_URL}/catalog?category=${cat}` } }]
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
    console.error("Handler error:", err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
