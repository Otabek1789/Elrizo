// ELRIZO SMS Gateway Service (Eskiz.uz & SMS Providers)

let eskizToken: string | null = null;
let eskizTokenExpiresAt: number = 0;

/**
 * Telefon raqamini toza 998901234567 formatga keltiradi
 */
export const cleanPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) {
    return digits;
  }
  if (digits.length === 9) {
    return `998${digits}`;
  }
  return digits;
};

/**
 * 4 xonali tasodifiy haqiqiy SMS kod generatsiya qilish (masalan: 5824)
 */
export const generateOtpCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Eskiz.uz dan avtorizatsiya tokenini olish
 */
const getEskizToken = async (): Promise<string | null> => {
  const email = import.meta.env.VITE_ESKIZ_EMAIL;
  const password = import.meta.env.VITE_ESKIZ_PASSWORD;
  const directToken = import.meta.env.VITE_ESKIZ_TOKEN;

  if (directToken) {
    return directToken;
  }

  if (!email || !password) {
    return null;
  }

  // Mavjud token hali amal qilsa qaytarish
  if (eskizToken && Date.now() < eskizTokenExpiresAt) {
    return eskizToken;
  }

  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const res = await fetch('https://notify.eskiz.uz/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.warn('Eskiz.uz auth failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    if (data?.data?.token) {
      eskizToken = data.data.token;
      // Token odatda 30 kun amal qiladi, biz 25 kunga keshlaymiz
      eskizTokenExpiresAt = Date.now() + 25 * 24 * 60 * 60 * 1000;
      return eskizToken;
    }
    return null;
  } catch (err) {
    console.error('Eskiz auth network error:', err);
    return null;
  }
};

export interface SendSmsResult {
  success: boolean;
  code: string;
  isRealSmsSent: boolean;
  provider: 'eskiz' | 'simulation';
  message: string;
}

/**
 * Foydalanuvchi telefon raqamiga haqiqiy SMS yuborish funksiyasi
 */
export const sendVerificationSms = async (
  phone: string, 
  forcedCode?: string
): Promise<SendSmsResult> => {
  const code = forcedCode || generateOtpCode();
  const rawPhone = cleanPhoneNumber(phone);
  const smsText = `ELRIZO Nasiya Savdo: Tasdiqlash kodingiz: ${code}. Xavfsizlik uchun kodni hech kimga bermang!`;

  const token = await getEskizToken();

  // Agar Eskiz provayderi sozlangan bo'lsa haqiqiy SMS jo'natish
  if (token) {
    try {
      const formData = new FormData();
      formData.append('mobile_phone', rawPhone);
      formData.append('message', smsText);
      formData.append('from', '4546');

      const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && (data.status === 'waiting' || data.status === 'success' || data.message === 'Waiting for SMS service')) {
        return {
          success: true,
          code,
          isRealSmsSent: true,
          provider: 'eskiz',
          message: `Haqiqiy SMS ${phone} raqamiga muvaffaqiyatli jo'natildi!`,
        };
      } else {
        console.warn('Eskiz send response:', data);
      }
    } catch (err) {
      console.error('Eskiz send error:', err);
    }
  }

  // Eskiz ulanmagan bo'lsa yoki API kalit berilmagan bo'lsa (Fallback)
  return {
    success: true,
    code,
    isRealSmsSent: false,
    provider: 'simulation',
    message: `SMS kod: ${code} (${phone} raqamiga yuborildi)`,
  };
};
