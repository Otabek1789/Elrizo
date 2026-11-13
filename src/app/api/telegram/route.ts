// Next.js Route Handler: ELRIZO Rasmiy Telegram Bot Webhook Handler
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdpmekcxbfeydodkyrbn.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcG1la2N4YmZleWRvZGt5cmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjI1NzcsImV4cCI6MjEwNzYzODU3N30.Ykj64EUX08JYpb0YMQFtjeVhtiyJU3pEnxqkA4tOt9E';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
const SITE_URL = 'https://elrizonasiya.vercel.app';
const WEBAPP_URL = `${SITE_URL}/tg`;

/**
 * Bot bilan muloqot qilgan / start bosgan foydalanuvchini ro'yxatga olib qo'yish
 * (Saytda Telegram orqali 4 xonali kod bilan kirish uchun)
 */
async function saveBotUserRecord(chatId: string | number, username?: string, firstName?: string) {
  try {
    const cleanU = (username || '').toLowerCase().replace(/^@/, '').trim();
    const cId = String(chatId);
    if (!cleanU && !cId) return;

    const contract = cleanU ? `tg_user_${cleanU}` : `tg_user_${cId}`;
    const { data: existing } = await supabase
      .from('nasiya_orders')
      .select('id')
      .eq('contract_number', contract)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('nasiya_orders')
        .update({
          phone: cId,
          address: `chat_id:${cId}`,
          customer_name: cleanU || cId,
          updated_at: new Date().toISOString(),
          items: [{ first_name: firstName || '', username: cleanU }]
        })
        .eq('contract_number', contract);
    } else {
      await supabase
        .from('nasiya_orders')
        .insert([{
          contract_number: contract,
          customer_name: cleanU || cId,
          phone: cId,
          address: `chat_id:${cId}`,
          total_price: 0,
          payment_mode: 'telegram_bot_user',
          status: 'active',
          installment_months: 12,
          scoring_score: 0,
          items: [{ first_name: firstName || '', username: cleanU }]
        }]);
    }
  } catch (err) {
    console.warn('saveBotUserRecord error:', err);
  }
}

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

// Language selection prompt (Aynan foydalanuvchi skrinshotidagidek)
function getLanguagePromptText(): string {
  return "🌐 Tilni tanlang:";
}

function getLanguageKeyboard(currentLang: 'uz' | 'ru' | 'en' = 'uz') {
  return [
    [
      {
        text: currentLang === 'uz' ? "• 🇺🇿 O'zbekcha" : "🇺🇿 O'zbekcha",
        callback_data: `lang_uz_${currentLang}`
      }
    ],
    [
      {
        text: currentLang === 'ru' ? "• 🇷🇺 Русский" : "🇷🇺 Русский",
        callback_data: `lang_ru_${currentLang}`
      }
    ],
    [
      {
        text: currentLang === 'en' ? "• 🇬🇧 English" : "🇬🇧 English",
        callback_data: `lang_en_${currentLang}`
      }
    ],
    [
      {
        text: "⬅️ Menyu",
        callback_data: `menu_${currentLang}`
      }
    ]
  ];
}

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
    { text: "🌐 Tilni tanlash", callback_data: "choose_lang_uz" }
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
    { text: "🌐 Сменить язык", callback_data: "choose_lang_ru" }
  ]
];

// Inglizcha rasmiy kartochka
function getWelcomeCardEn(firstName: string = 'Dear customer'): string {
  return `Hello, <b>${escapeHtml(firstName)}</b>! 👋

🌟 Welcome to the official <b>ELRIZO NASIYA SAVDO</b> Telegram store — 0-0-12 Halal Installment!

Shop comfortably and safely with us:
⚡ <b>0% Down payment</b> — pay nothing upfront
⚡ <b>0% Markup (interest-free)</b> — convenient terms up to 12 months
🚚 <b>Free 24-hour delivery</b> across Uzbekistan
🛡️ <b>1-year official warranty</b> on all products

🏢 <b>Store details:</b>
☎️ <b>Phone:</b> +998 94 333 55 22
💬 <b>Telegram admin:</b> @yahyo0526
⏰ <b>Working hours:</b> Daily 09:00 to 21:00 (no days off)
📍 <b>Address:</b> Namangan region, Yangikurgan district
🌐 <b>Official website:</b> https://elrizonasiya.vercel.app

👇 <b>Click the button below to open the store:</b>`;
}

const keyboardEn = [
  [
    { text: "🛍️ Open Store (Mini App)", web_app: { url: `${WEBAPP_URL}?lang=en` } }
  ],
  [
    { text: "💬 Telegram Admin (@yahyo0526)", url: "https://t.me/yahyo0526" },
    { text: "🌐 Visit Website", url: SITE_URL }
  ],
  [
    { text: "🌐 Change language", callback_data: "choose_lang_en" }
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // 1. Saytdan botga start berilganini real vaqtda tekshirish (Deep Link sessiyasi bo'yicha)
  const checkAuth = searchParams.get('check_auth');
  if (checkAuth) {
    const cleanToken = checkAuth.trim();
    const sessionContract = cleanToken.startsWith('tg_session_') ? cleanToken : `tg_session_${cleanToken}`;
    try {
      const { data, error } = await supabase
        .from('nasiya_orders')
        .select('phone, customer_name, promo_code, items, status')
        .eq('contract_number', sessionContract)
        .limit(1);

      if (!error && data && data.length > 0 && data[0]?.status === 'started') {
        const item = data[0];
        const itemDetails = (item.items && item.items[0]) || {};
        return Response.json(
          {
            ok: true,
            started: true,
            chatId: String(item.phone),
            username: itemDetails.username || (item.customer_name && !item.customer_name.startsWith('tg_') ? item.customer_name : ''),
            firstName: itemDetails.first_name || '',
            code: item.promo_code || itemDetails.code || '',
          },
          { headers: corsHeaders }
        );
      }
    } catch (e) {
      console.warn('check_auth lookup error:', e);
    }

    return Response.json(
      {
        ok: true,
        started: false,
        message: 'Foydalanuvchi hali botga start bosmagan',
      },
      { headers: corsHeaders }
    );
  }

  // 2. Foydalanuvchi username bo'yicha botga start berganmi yoki yo'qligini tekshirish
  const checkUsername = searchParams.get('check_username');
  if (checkUsername) {
    const cleanU = checkUsername.trim().replace(/^@/, '').toLowerCase();

    // Taniqli administratorlar uchun darhol ruxsat
    if (cleanU === 'otabek1789' || cleanU === 'otabek' || cleanU === 'yahyo0526') {
      return Response.json(
        {
          ok: true,
          inBot: true,
          chatId: '7373118052',
          username: cleanU,
          firstName: cleanU,
        },
        { headers: corsHeaders }
      );
    }

    try {
      const contract = `tg_user_${cleanU}`;
      const { data } = await supabase
        .from('nasiya_orders')
        .select('phone, customer_name, items')
        .eq('contract_number', contract)
        .limit(1);

      if (data && data.length > 0 && data[0]?.phone) {
        const itemDetails = (data[0].items && data[0].items[0]) || {};
        return Response.json(
          {
            ok: true,
            inBot: true,
            chatId: String(data[0].phone),
            username: cleanU,
            firstName: itemDetails.first_name || cleanU,
          },
          { headers: corsHeaders }
        );
      }
    } catch (e) {
      console.warn('check_username lookup error:', e);
    }

    return Response.json(
      {
        ok: true,
        inBot: false,
        message: `Ushbu @${cleanU} Telegram hisobi hali botimizga start bermagan`,
      },
      { headers: corsHeaders }
    );
  }

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

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function POST(req: Request) {
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
    // 1. Foydalanuvchi xabar yozganda (/start yoki ixtiyoriy matn)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || '').trim();
      const username = msg.from?.username || '';
      const firstName = msg.from?.first_name || '';

      if (!chatId) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      // Saytda Telegram bilan kirish uchun foydalanuvchini ro'yxatga olish
      saveBotUserRecord(chatId, username, firstName).catch(() => {});

      // Maxsus sessiya tokeni bilan start berilganmi? (masalan /start auth_abc123)
      const startAuthMatch = text.match(/^\/start\s+(auth_[a-zA-Z0-9_-]+)/i);
      if (startAuthMatch || text.startsWith('/start auth_')) {
        const authToken = startAuthMatch ? startAuthMatch[1] : text.replace('/start ', '').trim();
        const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        const sessionContract = `tg_session_${authToken}`;

        // Supabase bazasida ushbu sessiyaga start berilganini qayd etamiz
        try {
          await supabase.from('nasiya_orders').upsert([{
            contract_number: sessionContract,
            customer_name: username || String(chatId),
            phone: String(chatId),
            address: `chat_id:${chatId}`,
            total_price: 0,
            payment_mode: 'telegram_auth_session',
            status: 'started',
            promo_code: generatedCode,
            installment_months: 12,
            scoring_score: 0,
            items: [{
              first_name: firstName,
              username: username,
              chat_id: String(chatId),
              code: generatedCode,
              started_at: new Date().toISOString(),
            }]
          }], { onConflict: 'contract_number' });
        } catch (sessErr) {
          console.warn('save auth session error:', sessErr);
        }

        // Foydalanuvchiga Telegramda tezkor 4 xonali kirish kodini yuboramiz
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: `🔐 <b>ELRIZO ONLINE MARKET — KIRISH KODI</b>\n━━━━━━━━━━━━━━━━━━━━\nAssalomu alaykum${firstName ? ', <b>' + escapeHtml(firstName) + '</b>' : ''}!\n\nSaytga kirish uchun 4 xonali tasdiqlash kodingiz:\n\n👉 <code><b>${generatedCode}</b></code> 👈\n\n⚠️ <i>Ushbu bir martalik kodni saytdagi oynaga kiriting. Kod 5 daqiqa davomida amal qiladi.</i>\n━━━━━━━━━━━━━━━━━━━━\n⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n🌐 https://elrizonasiya.vercel.app`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🛍️ ELRIZO Mini App (Do'kon)", web_app: { url: `${WEBAPP_URL}?lang=uz` } }
              ],
              [
                { text: "🌐 Rasmiy saytga qaytish", url: SITE_URL }
              ]
            ]
          }
        });

        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      // Standart /start yoki boshqa xabarlar uchun til tanlash menyusi
      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: getLanguagePromptText(),
        reply_markup: {
          inline_keyboard: getLanguageKeyboard('uz'),
        },
      });

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    // 2. Callback query (til tanlanganda yoki tugma bosilganda)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const data = String(cb.data || '');
      const safeFirstName = cb.from?.first_name || 'Hurmatli mijoz';

      if (chatId) {
        // Saytda Telegram bilan kirish uchun foydalanuvchini ro'yxatga olish
        saveBotUserRecord(chatId, cb.from?.username, cb.from?.first_name).catch(() => {});
        // A) Til tanlashda o'zgarish (radio button kabi nuqta o'zgaradi va toast chiqadi)
        if (data === 'lang_uz_uz' || data === 'set_lang_uz') {
          // O'zbek tili allaqachon tanlangan edi yoki bosildi -> Menyu ochiladi
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getWelcomeCardUz(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardUz },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getWelcomeCardUz(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardUz },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', {
              callback_query_id: cb.id,
              text: "🇺🇿 O'zbek tili tanlandi",
            }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'lang_uz_ru' || data === 'lang_uz_en') {
          // Ruscha yoki inglizchadan o'zbekchaga o'tkazish
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getLanguagePromptText(),
                reply_markup: { inline_keyboard: getLanguageKeyboard('uz') },
              })
            : Promise.resolve();

          await Promise.all([
            sendTelegram('answerCallbackQuery', {
              callback_query_id: cb.id,
              text: "🇺🇿 O'zbek tili tanlandi. ⬅️ Menyu tugmasini bosing",
            }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'lang_ru_ru' || data === 'set_lang_ru') {
          // Rus tili allaqachon tanlangan edi yoki bosildi -> Menyu ochiladi
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getWelcomeCardRu(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardRu },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getWelcomeCardRu(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardRu },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', {
              callback_query_id: cb.id,
              text: "🇷🇺 Выбран русский язык",
            }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'lang_ru_uz' || data === 'lang_ru_en') {
          // O'zbekcha yoki inglizchadan ruschaga o'tkazish
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getLanguagePromptText(),
                reply_markup: { inline_keyboard: getLanguageKeyboard('ru') },
              })
            : Promise.resolve();

          await Promise.all([
            sendTelegram('answerCallbackQuery', {
              callback_query_id: cb.id,
              text: "🇷🇺 Выбран русский язык. Нажмите «⬅️ Menyu»",
            }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'lang_en_en' || data === 'set_lang_en') {
          // Ingliz tili allaqachon tanlangan edi yoki bosildi -> Menyu ochiladi
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getWelcomeCardEn(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardEn },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getWelcomeCardEn(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardEn },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', {
              callback_query_id: cb.id,
              text: "🇬🇧 English selected",
            }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'lang_en_uz' || data === 'lang_en_ru') {
          // O'zbekcha yoki ruschadan inglizchaga o'tkazish
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getLanguagePromptText(),
                reply_markup: { inline_keyboard: getLanguageKeyboard('en') },
              })
            : Promise.resolve();

          await Promise.all([
            sendTelegram('answerCallbackQuery', {
              callback_query_id: cb.id,
              text: "🇬🇧 English selected. Press «⬅️ Menyu»",
            }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        // B) Menyu tugmasi bosilganda (⬅️ Menyu)
        if (data === 'menu_uz' || data === 'open_menu') {
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getWelcomeCardUz(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardUz },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getWelcomeCardUz(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardUz },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', { callback_query_id: cb.id }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'menu_ru') {
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getWelcomeCardRu(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardRu },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getWelcomeCardRu(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardRu },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', { callback_query_id: cb.id }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        if (data === 'menu_en') {
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getWelcomeCardEn(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardEn },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getWelcomeCardEn(safeFirstName),
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: keyboardEn },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', { callback_query_id: cb.id }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
        }

        // C) Tilni o'zgartirish tugmasi bosilganda (Main menudan qaytish)
        if (data.startsWith('choose_lang') || data === 'choose_language') {
          const lang = data.includes('_ru') ? 'ru' : data.includes('_en') ? 'en' : 'uz';
          const editTask = messageId
            ? sendTelegram('editMessageText', {
                chat_id: chatId,
                message_id: messageId,
                text: getLanguagePromptText(),
                reply_markup: { inline_keyboard: getLanguageKeyboard(lang) },
              })
            : sendTelegram('sendMessage', {
                chat_id: chatId,
                text: getLanguagePromptText(),
                reply_markup: { inline_keyboard: getLanguageKeyboard(lang) },
              });

          await Promise.all([
            sendTelegram('answerCallbackQuery', { callback_query_id: cb.id }),
            editTask,
          ]);
          return Response.json({ ok: true }, { headers: corsHeaders });
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

