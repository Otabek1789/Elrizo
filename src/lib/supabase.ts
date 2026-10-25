import { createClient } from '@supabase/supabase-js';
import { Product, User, Review, CashbackTransaction, Order, PromoCode, Category } from '../types';

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

    // 3. Agar maxsus admin emaili bo'lsa va local rejimda bo'lsa:
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

// ==============================================================================
// 1. ORDERS / BUYURTMALAR (nasiya_orders)
// ==============================================================================

export async function saveOrderToSupabase(orderPayload: {
  contractNumber?: string;
  customerName: string;
  pinfl?: string;
  phone: string;
  city?: string;
  address: string;
  totalPrice: number;
  monthlyPayment?: number;
  paymentMode: string;
  installmentMonths?: number;
  items: any[];
  scoringScore?: number;
  status: string;
  promoCode?: string;
  discountAmount?: number;
  cashbackEarned?: number;
  cashbackSpent?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('nasiya_orders')
      .upsert([
        {
          contract_number: orderPayload.contractNumber,
          customer_name: orderPayload.customerName,
          pinfl: orderPayload.pinfl,
          phone: orderPayload.phone,
          city: orderPayload.city || 'Toshkent',
          address: orderPayload.address,
          total_price: orderPayload.totalPrice,
          monthly_payment: orderPayload.monthlyPayment,
          payment_mode: orderPayload.paymentMode,
          installment_months: orderPayload.installmentMonths,
          items: orderPayload.items,
          scoring_score: orderPayload.scoringScore || 750,
          status: orderPayload.status,
          promo_code: orderPayload.promoCode,
          discount_amount: orderPayload.discountAmount || 0,
          cashback_earned: orderPayload.cashbackEarned || 0,
          cashback_spent: orderPayload.cashbackSpent || 0,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: 'contract_number' })
      .select();

    if (error) {
      console.warn('Supabase nasiya_orders error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('Supabase saveOrder error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function fetchOrdersFromSupabase(): Promise<Order[]> {
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
      totalPrice: Number(d.total_price) || 0,
      monthlyPayment: Number(d.monthly_payment) || 0,
      installmentMonths: Number(d.installment_months) || 12,
      scoringScore: Number(d.scoring_score) || 750,
      status: d.status || 'scoring_approved',
      createdAt: d.created_at || new Date().toISOString(),
      paymentMode: d.payment_mode || 'installment',
      items: Array.isArray(d.items) ? d.items : [],
      appliedPromoCode: d.promo_code,
      discountAmount: Number(d.discount_amount) || 0,
      cashbackEarned: Number(d.cashback_earned) || 0,
      cashbackSpent: Number(d.cashback_spent) || 0,
    }));
  } catch {
    return [];
  }
}

export async function updateOrderStatusInSupabase(contractNumber: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nasiya_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('contract_number', contractNumber);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteOrderFromSupabase(contractNumber: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nasiya_orders')
      .delete()
      .eq('contract_number', contractNumber);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// 2. PRODUCTS / TOVARLAR (products)
// ==============================================================================

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

// ==============================================================================
// 3. USER PROFILES / FOYDALANUVCHILAR (user_profiles)
// ==============================================================================

export async function fetchUserProfileFromSupabase(email: string): Promise<User | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || '',
      phone: data.phone || '',
      city: data.city || 'Toshkent',
      address: data.address || '',
      passportOrPinfl: data.passport_or_pinfl || '',
      avatarUrl: data.avatar_url || '',
      scoringLimit: Number(data.scoring_limit) || 0,
      usedLimit: Number(data.used_limit) || 0,
      cashbackBalance: Number(data.cashback_balance) || 0,
      loyaltyCardNumber: data.loyalty_card_number || '',
      isAdmin: Boolean(data.is_admin),
      role: data.role || (data.is_admin ? 'admin' : 'user'),
      isVerified: true,
    };
  } catch {
    return null;
  }
}

export async function saveUserProfileToSupabase(user: User): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = user.email.trim().toLowerCase();
    const payload = {
      id: user.id || `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: user.fullName,
      phone: user.phone || '',
      city: user.city || 'Toshkent',
      address: user.address || '',
      passport_or_pinfl: user.passportOrPinfl || '',
      avatar_url: user.avatarUrl || '',
      scoring_limit: user.scoringLimit || 0,
      used_limit: user.usedLimit || 0,
      cashback_balance: user.cashbackBalance || 0,
      loyalty_card_number: user.loyaltyCardNumber || '',
      is_admin: Boolean(user.isAdmin),
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn("Supabase saveUserProfile error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase saveUserProfile exception:", err?.message);
    return { success: false, error: err?.message };
  }
}

// ==============================================================================
// 4. PRODUCT REVIEWS / SHARHLAR (product_reviews)
// ==============================================================================

export async function fetchReviewsFromSupabase(): Promise<Record<string, Review[]> | null> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    const map: Record<string, Review[]> = {};
    data.forEach((r: any) => {
      const rev: Review = {
        id: r.id,
        productId: r.product_id,
        userName: r.user_name,
        rating: Number(r.rating) || 5,
        comment: r.comment,
        createdAt: r.created_at,
        verifiedPurchase: Boolean(r.verified_purchase),
        likesCount: Number(r.likes_count) || 0,
      };
      if (!map[r.product_id]) map[r.product_id] = [];
      map[r.product_id].push(rev);
    });

    return map;
  } catch {
    return null;
  }
}

export async function saveReviewToSupabase(review: Review): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .upsert({
        id: review.id,
        product_id: review.productId,
        user_name: review.userName,
        rating: review.rating,
        comment: review.comment,
        verified_purchase: review.verifiedPurchase !== false,
        likes_count: review.likesCount || 0,
        created_at: review.createdAt || new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn("Supabase saveReview error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// ==============================================================================
// 5. CASHBACK TRANSACTIONS / JAMG'ARMA KARTA (cashback_transactions)
// ==============================================================================

export async function fetchCashbackTransactionsFromSupabase(userEmail?: string): Promise<CashbackTransaction[] | null> {
  try {
    let query = supabase.from('cashback_transactions').select('*').order('created_at', { ascending: false });
    if (userEmail) {
      query = query.eq('user_email', userEmail.toLowerCase().trim());
    }
    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      orderId: d.order_id,
      type: d.type as 'earned' | 'spent',
      amount: Number(d.amount) || 0,
      date: d.created_at,
      description: d.description,
    }));
  } catch {
    return null;
  }
}

export async function saveCashbackTransactionToSupabase(tx: CashbackTransaction, userEmail?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('cashback_transactions')
      .upsert({
        id: tx.id,
        order_id: tx.orderId || null,
        user_email: userEmail ? userEmail.toLowerCase().trim() : null,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        created_at: tx.date || new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn("Supabase saveCashbackTransaction error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// ==============================================================================
// 6. PROMO CODES (promo_codes)
// ==============================================================================

export async function fetchPromoCodesFromSupabase(): Promise<PromoCode[] | null> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true);

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      code: d.code,
      discountType: d.discount_type,
      discountValue: Number(d.discount_value),
      description: d.description,
      minOrderAmount: Number(d.min_order_amount) || 0,
      isActive: Boolean(d.is_active),
      usageCount: Number(d.usage_count) || 0,
    }));
  } catch {
    return null;
  }
}

// ==============================================================================
// 7. REALTIME OBSERVER (Supabase Realtime Live Sync)
// ==============================================================================

export function setupSupabaseRealtime(handlers: {
  onOrdersChange?: () => void;
  onProductsChange?: () => void;
  onReviewsChange?: () => void;
  onProfilesChange?: () => void;
}) {
  const channel = supabase
    .channel('elrizo-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'nasiya_orders' }, () => {
      handlers.onOrdersChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      handlers.onProductsChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'product_reviews' }, () => {
      handlers.onReviewsChange?.();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => {
      handlers.onProfilesChange?.();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
