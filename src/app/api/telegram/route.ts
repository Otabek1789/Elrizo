// Next.js Route Handler: ELRIZO Rasmiy Telegram Bot Webhook Handler

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
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

// Language selection prompt (Bot ochilganda birinchi bo'lib tilni so'rash)
function getLanguagePromptCard(): string {
  return `Assalomu alaykum! / Здравствуйте! 👋

🌟 <b>ELRIZO NASIYA SAVDO</b> rasmiy Telegram do'koniga xush kelibsiz!
🌟 Добро пожаловать в официальный Telegram-магазин <b>ELRIZO НАРИЯ САВДО</b>!

👇 <b>Iltimos, muloqot tilini tanlang:</b>
👇 <b>Пожалуйста, выберите язык обслуживания:</b>`;
}

const languageSelectKeyboard = [
  [
    { text: "🇺🇿 O'zbekcha", callback_data: "set_lang_uz" },
    { text: "🇷🇺 Русский", callback_data: "set_lang_ru" }
  ]
];

// O'zbekcha rasmiy kartochka
function getWelcomeCardUz(firstName: string = 'Hurmatli mijoz'): string {
  return `Assalomu alaykum, <b>${escapeHtml(firstName)}</b>! 👋

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
}

const keyboardUz = [
  [
    { text: "🛍️ ELRIZO Mini App (Do'konni ochish)", web_app: { url: `${WEBAPP_URL}?lang=uz` } }
  ],
  [
    { text: "💬 Telegram Admin (@yahyo0526)", url: "https://t.me/yahyo0526" },
    { text: "🌐 Rasmiy saytga o'tish", url: SITE_URL }
  ],
  [
    { text: "🔄 Tilni o'zgartirish / Сменить язык", callback_data: "choose_language" }
  ]
];

// Ruscha rasmiy kartochka
function getWelcomeCardRu(firstName: string = 'Уважаемый клиент'): string {
  return `Здравствуйте, <b>${escapeHtml(firstName)}</b>! 👋

🌟 Добро пожаловать в официальный Telegram-магазин <b>ELRIZO НАРИЯ САВДО</b> — рассрочка 0-0-12!

Покупайте удобно и безопасно:
⚡ <b>0% Первый взнос</b> — ничего не платите заранее
⚡ <b>0% Переплата (без наценок)</b> — удобный срок до 12 месяцев
🚚 <b>Бесплатная доставка за 24 часа</b> по всему Узбекистану
🛡️ <b>1 год официальной гарантии</b> на все товары

🏢 <b>Информация о магазине:</b>
☎️ <b>Телефон:</b> +998 94 333 55 22
💬 <b>Telegram админ:</b> @yahyo0526
⏰ <b>Время работы:</b> Ежедневно с 09:00 до 21:00 (без выходных)
📍 <b>Адрес:</b> г. Наманган, Янгикурганский район
🌐 <b>Официальный сайт:</b> https://elrizonasiya.vercel.app

👇 <b>Нажмите кнопку ниже, чтобы открыть магазин:</b>`;
}

const keyboardRu = [
  [
    { text: "🛍️ Открыть магазин (Mini App)", web_app: { url: `${WEBAPP_URL}?lang=ru` } }
  ],
  [
    { text: "💬 Telegram Админ (@yahyo0526)", url: "https://t.me/yahyo0526" },
    { text: "🌐 Перейти на сайт", url: SITE_URL }
  ],
  [
    { text: "🔄 Сменить язык / Tilni o'zgartirish", callback_data: "choose_language" }
  ]
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  const webhookUrl = `${SITE_URL}/api/telegram`;
  let reconnected = false;
  try {
    const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = await infoRes.json();
    if (info.ok && info.result?.url !== webhookUrl) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(
          webhookUrl
        )}&drop_pending_updates=true`
      );
      reconnected = true;
    }
  } catch (e) {
    // Tarmoq xatosi bo'lsa e'tiborsiz qoldirish
  }

  return Response.json(
    {
      ok: true,
      message: 'ELRIZO Telegram Bot Webhook endpoint active',
      bot: '@elrizo_bot',
      web_app_url: WEBAPP_URL,
      reconnected,
    },
    { headers: corsHeaders }
  );
}

export async function POST(req: Request) {
  // Webhookni tashqi xizmatlar buzib qo'yishidan doimiy himoya qilish:
  try {
    const webhookUrl = `${SITE_URL}/api/telegram`;
    const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const info = await infoRes.json();
    if (info.ok && info.result?.url !== webhookUrl) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(
          webhookUrl
        )}&drop_pending_updates=true`
      );
    }
  } catch (e) {
    // Tarmoq xatosi bo'lsa davom etish
  }

  let update: any;
  try {
    update = await req.json();
  } catch (e) {
    console.error('Failed to parse body JSON:', e);
    return Response.json({ ok: true }, { headers: corsHeaders });
  }

  if (!update) {
    return Response.json({ ok: true }, { headers: corsHeaders });
  }

  try {
    // 1. Foydalanuvchi xabar yozganda (har qanday xabar: /start, matn yoki savol)
    // Bot ochilganda yoki xabar kelganda birinchi bo'lib tilni so'raymiz!
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;

      if (!chatId) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      // Begona xizmatlar qoldirgan pin xabarlarni tozalash:
      try {
        await sendTelegram('unpinAllChatMessages', { chat_id: chatId });
      } catch (e) {}

      // Oldin tilni tanlash kartochkasi yuboriladi
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: getLanguagePromptCard(),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: languageSelectKeyboard,
        },
      });

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    // 2. Callback query (til tanlanganda yoki tugma bosilganda)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const data = cb.data;
      const safeFirstName = cb.from?.first_name || 'Hurmatli mijoz';

      if (chatId) {
        if (data === 'set_lang_uz') {
          // Foydalanuvchi O'zbek tilini tanladi
          let res: any = null;
          if (messageId) {
            res = await sendTelegram('editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: getWelcomeCardUz(safeFirstName),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: keyboardUz,
              },
            });
          }
          if (!res?.ok) {
            await sendTelegram('sendMessage', {
              chat_id: chatId,
              text: getWelcomeCardUz(safeFirstName),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: keyboardUz,
              },
            });
          }
        } else if (data === 'set_lang_ru') {
          // Foydalanuvchi Rus tilini tanladi
          let res: any = null;
          if (messageId) {
            res = await sendTelegram('editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: getWelcomeCardRu(safeFirstName),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: keyboardRu,
              },
            });
          }
          if (!res?.ok) {
            await sendTelegram('sendMessage', {
              chat_id: chatId,
              text: getWelcomeCardRu(safeFirstName),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: keyboardRu,
              },
            });
          }
        } else if (data === 'choose_language') {
          // Foydalanuvchi tilni o'zgartirishni xohladi
          let res: any = null;
          if (messageId) {
            res = await sendTelegram('editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: getLanguagePromptCard(),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: languageSelectKeyboard,
              },
            });
          }
          if (!res?.ok) {
            await sendTelegram('sendMessage', {
              chat_id: chatId,
              text: getLanguagePromptCard(),
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: languageSelectKeyboard,
              },
            });
          }
        } else {
          // Boshqa har qanday noma'lum callback bo'lsa til tanlashga qaytarish
          await sendTelegram('sendMessage', {
            chat_id: chatId,
            text: getLanguagePromptCard(),
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: languageSelectKeyboard,
            },
          });
        }
      }

      await sendTelegram('answerCallbackQuery', {
        callback_query_id: cb.id,
      });

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Telegram handler error:', err);
    return Response.json(
      { ok: false, error: err.message },
      { headers: corsHeaders }
    );
  }
}

