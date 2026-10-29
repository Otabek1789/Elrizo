// Next.js Route Handler: ELRIZO Rasmiy Telegram Bot Webhook Handler

const BOT_TOKEN = '8969024175:AAEzzmDhUJJaq9mtMM2EbCceL5QRalqra1U';
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

function getOfficialWelcomeCard(firstName: string = 'Hurmatli mijoz'): string {
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

const officialInlineKeyboard = [
  [
    { text: "🛍️ ELRIZO Mini App (Do'konni ochish)", web_app: { url: WEBAPP_URL } }
  ],
  [
    { text: "💬 Telegram Admin (@yahyo0526)", url: "https://t.me/yahyo0526" },
    { text: "🌐 Rasmiy saytga o'tish", url: SITE_URL }
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
  return Response.json(
    {
      ok: true,
      message: 'ELRIZO Telegram Bot Webhook endpoint active',
      bot: '@elrizo_bot',
      web_app_url: WEBAPP_URL,
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
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const safeFirstName = msg.from?.first_name || 'Hurmatli mijoz';

      if (!chatId) {
        return Response.json({ ok: true }, { headers: corsHeaders });
      }

      await sendTelegram('sendMessage', {
        chat_id: chatId,
        text: getOfficialWelcomeCard(safeFirstName),
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: officialInlineKeyboard,
        },
      });

      return Response.json({ ok: true }, { headers: corsHeaders });
    }

    // 2. Callback query (tugma bosilganda)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const safeFirstName = cb.from?.first_name || 'Hurmatli mijoz';

      if (chatId) {
        await sendTelegram('sendMessage', {
          chat_id: chatId,
          text: getOfficialWelcomeCard(safeFirstName),
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: officialInlineKeyboard,
          },
        });
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

