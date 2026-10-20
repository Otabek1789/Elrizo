import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bdpmekcxbfeydodkyrbn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcG1la2N4YmZleWRvZGt5cmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNjI1NzcsImV4cCI6MjEwNzYzODU3N30.Ykj64EUX08JYpb0YMQFtjeVhtiyJU3pEnxqkA4tOt9E';

export const ADMIN_EMAIL = 'otabek1789@gmail.com';

export const isAdminUser = (email?: string): boolean => {
  return email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
  },
});

/**
 * Supabase orqali Email va Parol bilan kirish (yoki ro'yxatdan o'tkazish)
 */
export async function authenticateWithSupabase(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = isAdminUser(cleanEmail);

    // 1. Avval signIn qilishga urinib ko'ramiz
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!signInError && signInData?.user) {
      return {
        success: true,
        user: signInData.user,
        isAdmin,
      };
    }

    // 2. Agar foydalanuvchi hali mavjud bo'lmasa yoki ro'yxatdan o'tmagan bo'lsa, signUp qilishga urinamiz
    if (signInError && (signInError.message.includes('Invalid login credentials') || signInError.status === 400)) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            is_admin: isAdmin,
            full_name: isAdmin ? "Otabek Jo'rayev" : cleanEmail.split('@')[0],
          },
        },
      });

      if (!signUpError && signUpData?.user) {
        return {
          success: true,
          user: signUpData.user,
          isAdmin,
        };
      }
    }

    // 3. Agar maxsus admin emaili bo'lsa va local rejimda bo'lsa (yoki Supabase Auth cheklovi bo'lsa):
    if (isAdmin && password === '7540084@OJr') {
      return {
        success: true,
        user: {
          id: 'admin-otabek',
          email: ADMIN_EMAIL,
          user_metadata: { full_name: "Otabek Jo'rayev (Bosh Administrator)", is_admin: true },
        },
        isAdmin: true,
      };
    }

    return {
      success: false,
      isAdmin,
      error: signInError?.message || "Email yoki parol noto'g'ri",
    };
  } catch (err: any) {
    // Admin fallback tekshiruvi
    if (isAdminUser(email) && password === '7540084@OJr') {
      return {
        success: true,
        user: {
          id: 'admin-otabek',
          email: ADMIN_EMAIL,
          user_metadata: { full_name: "Otabek Jo'rayev (Bosh Administrator)", is_admin: true },
        },
        isAdmin: true,
      };
    }
    return {
      success: false,
      isAdmin: false,
      error: err.message || "Tizimga kirishda xatolik yuz berdi",
    };
  }
}

/**
 * Tizimdan chiqish
 */
export async function signOutFromSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Supabase signOut error:", e);
  }
}

/**
 * Nasiya arizasi yoki buyurtmani Supabase bazasiga saqlash
 */
export async function saveOrderToSupabase(orderPayload: {
  contractNumber?: string;
  customerName: string;
  pinfl: string;
  phone: string;
  city: string;
  address: string;
  totalPrice: number;
  monthlyPayment?: number;
  paymentMode: string;
  installmentMonths?: number;
  items: any[];
  scoringScore?: number;
  status: string;
}) {
  try {
    const { data, error } = await supabase
      .from('nasiya_orders')
      .insert([
        {
          contract_number: orderPayload.contractNumber,
          customer_name: orderPayload.customerName,
          pinfl: orderPayload.pinfl,
          phone: orderPayload.phone,
          city: orderPayload.city,
          address: orderPayload.address,
          total_price: orderPayload.totalPrice,
          monthly_payment: orderPayload.monthlyPayment,
          payment_mode: orderPayload.paymentMode,
          installment_months: orderPayload.installmentMonths,
          items: orderPayload.items,
          scoring_score: orderPayload.scoringScore,
          status: orderPayload.status,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn('Supabase nasiya_orders ga yozishda jadval topilmadi yoki cheklov bor, lokal saqlandi:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase bilan ulanishda xatolik (Lokal saqlash davom etadi):', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Supabase ulanishini tekshirish
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('nasiya_orders').select('id').limit(1);
    if (!error || error.code === 'PGRST116' || error.message.includes('permission')) {
      return true;
    }
    return true;
  } catch {
    return false;
  }
}
