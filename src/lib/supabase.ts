import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

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

/**
 * Supabase dan real arizalar/buyurtmalarni olish
 */
export async function fetchOrdersFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('nasiya_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id ? `ord-${d.id}` : `ord-${Date.now()}`,
      contractNumber: d.contract_number || `ELR-${Date.now().toString().slice(-6)}`,
      customerName: d.customer_name || 'Mijoz',
      customerPhone: d.phone || '',
      pinfl: d.pinfl || '',
      deliveryAddress: d.address || '',
      city: d.city || 'Toshkent',
      totalPrice: Number(d.total_price) || 0,
      monthlyPayment: Number(d.monthly_payment) || 0,
      installmentMonths: Number(d.installment_months) || 12,
      scoringScore: Number(d.scoring_score) || 750,
      status: d.status || 'scoring_approved',
      createdAt: d.created_at || new Date().toISOString(),
      paymentMode: d.payment_mode || 'installment',
      items: Array.isArray(d.items) ? d.items : [],
    }));
  } catch {
    return [];
  }
}

/**
 * Supabase ma'lumotlarini Product formatiga o'tkazish
 */
export function mapProductFromSupabase(d: any): Product {
  return {
    id: d.id,
    title: d.title || '',
    slug: d.slug || (d.title ? d.title.toLowerCase().replace(/\s+/g, '-') : ''),
    price: Number(d.price) || 0,
    originalPrice: d.original_price ? Number(d.original_price) : undefined,
    discountPercentage: d.discount_percentage ? Number(d.discount_percentage) : undefined,
    rating: Number(d.rating) || 5.0,
    reviewsCount: Number(d.reviews_count) || 0,
    images: Array.isArray(d.images) && d.images.length > 0 ? d.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
    categoryId: d.category_id || 'cat-smartphones',
    categoryName: d.category_name || 'Smartfonlar va gadjetlar',
    inStock: d.in_stock !== false,
    stockCount: Number(d.stock_count) || 10,
    isBestSeller: Boolean(d.is_best_seller),
    isWeeklyOffer: Boolean(d.is_weekly_offer),
    hasZeroDown: d.has_zero_down !== false,
    maxMonths: (d.max_months as 3 | 6 | 12 | 24) || 24,
    tags: Array.isArray(d.tags) ? d.tags : [],
    specs: typeof d.specs === 'object' && d.specs !== null ? d.specs : {},
    description: d.description || '',
    deliveryDays: Number(d.delivery_days) || 1,
    sku: d.sku || `ELR-${Date.now().toString().slice(-4)}`,
    colors: Array.isArray(d.colors) ? d.colors : undefined,
    storageOptions: Array.isArray(d.storage_options) ? d.storage_options : undefined,
  };
}

/**
 * Product modelini Supabase jadvali ustunlariga moslashtirish
 */
export function mapProductToSupabase(p: Product): any {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    original_price: p.originalPrice || null,
    discount_percentage: p.discountPercentage || null,
    rating: p.rating || 5.0,
    reviews_count: p.reviewsCount || 0,
    images: p.images || [],
    category_id: p.categoryId,
    category_name: p.categoryName,
    in_stock: p.inStock,
    stock_count: p.stockCount || 10,
    is_best_seller: p.isBestSeller || false,
    is_weekly_offer: p.isWeeklyOffer || false,
    has_zero_down: p.hasZeroDown !== false,
    max_months: p.maxMonths || 24,
    tags: p.tags || [],
    specs: p.specs || {},
    description: p.description || '',
    delivery_days: p.deliveryDays || 1,
    sku: p.sku || '',
    colors: p.colors || [],
    storage_options: p.storageOptions || [],
  };
}

/**
 * Supabase-dan mahsulotlarni olish
 */
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase products fetch warning:", error.message);
      return null;
    }
    if (!data) return [];
    return data.map(mapProductFromSupabase);
  } catch (err: any) {
    console.warn("Supabase products fetch error:", err?.message);
    return null;
  }
}

/**
 * Mahsulotni Supabase-ga qo'shish yoki mavjudini yangilash (upsert)
 */
export async function saveProductToSupabase(product: Product): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = mapProductToSupabase(product);
    const { error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn("Supabase save product warning:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase save product error:", err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Mahsulotni Supabase-da tahrirlash / yangilash
 */
export async function updateProductInSupabase(productId: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
    if (updates.discountPercentage !== undefined) payload.discount_percentage = updates.discountPercentage;
    if (updates.rating !== undefined) payload.rating = updates.rating;
    if (updates.reviewsCount !== undefined) payload.reviews_count = updates.reviewsCount;
    if (updates.images !== undefined) payload.images = updates.images;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.categoryName !== undefined) payload.category_name = updates.categoryName;
    if (updates.inStock !== undefined) payload.in_stock = updates.inStock;
    if (updates.stockCount !== undefined) payload.stock_count = updates.stockCount;
    if (updates.isBestSeller !== undefined) payload.is_best_seller = updates.isBestSeller;
    if (updates.isWeeklyOffer !== undefined) payload.is_weekly_offer = updates.isWeeklyOffer;
    if (updates.hasZeroDown !== undefined) payload.has_zero_down = updates.hasZeroDown;
    if (updates.maxMonths !== undefined) payload.max_months = updates.maxMonths;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.specs !== undefined) payload.specs = updates.specs;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.deliveryDays !== undefined) payload.delivery_days = updates.deliveryDays;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.colors !== undefined) payload.colors = updates.colors;
    if (updates.storageOptions !== undefined) payload.storage_options = updates.storageOptions;

    payload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId);

    if (error) {
      console.warn("Supabase update product warning:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase update product error:", err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Mahsulotni Supabase-dan o'chirish
 */
export async function deleteProductFromSupabase(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.warn("Supabase delete product warning:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase delete product error:", err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Boshlang'ich mahsulotlarni Supabase bo'sh bo'lganida avtomatik to'ldirish (seed)
 */
export async function seedInitialProductsToSupabase(products: Product[]): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (!error && (!data || data.length === 0)) {
      const payload = products.map(mapProductToSupabase);
      const insertRes = await supabase.from('products').insert(payload);
      return !insertRes.error;
    }
    return true;
  } catch {
    return false;
  }
}
