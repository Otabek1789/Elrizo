import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ActivePage, CartItem, Order, Product, PromoCode, User, Review, CashbackTransaction } from '../types';
import { PRODUCTS } from '../data/mockData';
import { INITIAL_REVIEWS } from '../data/mockReviews';
import { searchProducts } from '../utils/searchHelper';
import { 
  saveOrderToSupabase, 
  checkSupabaseConnection, 
  authenticateWithSupabase, 
  signOutFromSupabase, 
  isAdminUser,
  fetchOrdersFromSupabase
} from '../lib/supabase';
import { sendOrderNotificationToTelegram } from '../utils/telegramBot';
import { Language, Theme, TranslationKey, getTranslation } from '../utils/translations';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface StoreState {
  // Navigation & Page State
  activePage: ActivePage;
  selectedProductId: string | null;
  selectedCategorySlug: string | null;
  setActivePage: (page: ActivePage) => void;
  navigateToProduct: (productId: string) => void;
  navigateToCategory: (categorySlug: string | null) => void;

  // Search State
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Products Data
  products: Product[];
  filteredProducts: () => Product[];
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Cart State (Persisted in localStorage)
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, months?: 3 | 6 | 12 | 24, purchaseType?: 'full' | 'installment') => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartMonthlyTotal: () => number;
  getCartItemsCount: () => number;

  // Favorites State (Persisted in localStorage)
  favorites: string[]; // product IDs
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Orders & BNPL Applications (Persisted in localStorage & synced with Supabase)
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;

  // User & Auth State (Persisted in localStorage)
  user: User | null;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  isLoginRequiredModalOpen: boolean;
  openLoginRequiredModal: () => void;
  closeLoginRequiredModal: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<User>) => void;

  // Supabase Status
  supabaseConnected: boolean;
  initSupabaseCheck: () => Promise<void>;

  // Global Calculator Modal
  calculatorProduct: Product | null;
  isCalculatorOpen: boolean;
  openCalculator: (product: Product) => void;
  closeCalculator: () => void;

  // Selected City & Region
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isCityModalOpen: boolean;
  openCityModal: () => void;
  closeCityModal: () => void;

  // Theme & Language (Light/Dark mode & UZ/RU/EN)
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;

  // Toast notifications
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Promo codes (WELCOME10, ELRIZO15, etc.)
  promoCodes: PromoCode[];
  appliedPromoCode: PromoCode | null;
  applyPromoCode: (code: string) => { success: boolean; message?: string };
  removePromoCode: () => void;
  addPromoCode: (promo: PromoCode) => void;
  togglePromoCode: (id: string) => void;
  deletePromoCode: (id: string) => void;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
  getFinalMonthlyTotal: () => number;

  // Product Comparison (Taqqoslash)
  comparisonList: string[]; // product IDs
  addToComparison: (productId: string) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isComparisonModalOpen: boolean;
  openComparisonModal: () => void;
  closeComparisonModal: () => void;

  // Real Customer Reviews (Sharhlar)
  reviews: Record<string, Review[]>;
  addReview: (productId: string, review: { userName: string; rating: number; comment: string }) => void;

  // Order Tracking (Buyurtmani kuzatish)
  isOrderTrackingOpen: boolean;
  openOrderTracking: () => void;
  closeOrderTracking: () => void;

  // Nakapitelniy Karta (Cashback Loyalty Program)
  cashbackTransactions: CashbackTransaction[];
  addCashback: (amount: number, description: string, orderId?: string) => void;
  spendCashback: (amount: number, description: string, orderId?: string) => boolean;
  useCashbackInCheckout: boolean;
  setUseCashbackInCheckout: (val: boolean) => void;
  toggleUseCashbackInCheckout: () => void;
  getCashbackDiscount: () => number;
  isCashbackCardModalOpen: boolean;
  openCashbackCardModal: () => void;
  closeCashbackCardModal: () => void;
}

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    description: "Yangi mijozlar uchun 10% chegirma",
    isActive: true,
    usageCount: 0,
  },
  {
    id: 'promo-elrizo15',
    code: 'ELRIZO15',
    discountType: 'percentage',
    discountValue: 15,
    description: "ELRIZO maxsus aksiyasi — 15% chegirma",
    isActive: true,
    usageCount: 0,
  },
  {
    id: 'promo-super500',
    code: 'SUPER500',
    discountType: 'fixed',
    discountValue: 500000,
    minOrderAmount: 3000000,
    description: "3 000 000 so'mdan yuqori xaridga 500 000 so'm sovg'a",
    isActive: true,
    usageCount: 0,
  },
  {
    id: 'promo-bahor20',
    code: 'BAHOR20',
    discountType: 'percentage',
    discountValue: 20,
    description: "Bahoriy katta chegirma 20%",
    isActive: true,
    usageCount: 0,
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Navigation
      activePage: 'home',
      selectedProductId: null,
      selectedCategorySlug: null,

      setActivePage: (page) => {
        set({ activePage: page });
        window.scrollTo(0, 0);
      },

      navigateToProduct: (productId) => {
        set({ selectedProductId: productId, activePage: 'product-detail' });
        window.scrollTo(0, 0);
      },

      navigateToCategory: (categorySlug) => {
        set({ selectedCategorySlug: categorySlug });
        window.scrollTo(0, 0);
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Products
      products: PRODUCTS,
      filteredProducts: () => {
        const { products, searchQuery, selectedCategorySlug } = get();
        let result = products;

        if (searchQuery.trim()) {
          result = searchProducts(result, searchQuery);
          if (selectedCategorySlug) {
            const inCategory = result.filter(
              (p) =>
                p.categoryId.toLowerCase().includes(selectedCategorySlug.toLowerCase()) ||
                p.categoryName.toLowerCase().includes(selectedCategorySlug.toLowerCase())
            );
            if (inCategory.length > 0) {
              result = inCategory;
            }
          }
          return result;
        }

        if (selectedCategorySlug) {
          result = result.filter(
            (p) =>
              p.categoryId.toLowerCase().includes(selectedCategorySlug.toLowerCase()) ||
              p.categoryName.toLowerCase().includes(selectedCategorySlug.toLowerCase())
          );
        }

        return result;
      },

      addProduct: (newProduct) => {
        set((state) => ({
          products: [newProduct, ...state.products],
        }));
        get().addToast("Yangi mahsulot muvaffaqiyatli qo'shildi", 'success');
      },

      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
        get().addToast("Mahsulot o'chirildi", 'info');
      },

      // Cart
      cart: [],
      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: (product, months = 12, purchaseType = 'installment') => {
        if (!get().user) {
          set({ isLoginRequiredModalOpen: true });
          return;
        }

        set((state) => {
          const existingIndex = state.cart.findIndex((item) => item.product.id === product.id);
          let updatedCart: CartItem[];

          if (existingIndex > -1) {
            updatedCart = [...state.cart];
            updatedCart[existingIndex].quantity += 1;
            updatedCart[existingIndex].selectedInstallmentMonths = months;
            updatedCart[existingIndex].purchaseType = purchaseType;
          } else {
            updatedCart = [
              ...state.cart,
              {
                product,
                quantity: 1,
                selectedInstallmentMonths: months,
                purchaseType,
              },
            ];
          }

          get().addToast(`"${product.title.slice(0, 30)}..." savatga qo'shildi`, 'success');
          return { cart: updatedCart, isCartOpen: true };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getCartMonthlyTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          const months = item.selectedInstallmentMonths || 12;
          const markupPercent = months === 3 ? 0 : months === 6 ? 12 : months === 12 ? 24 : 38;
          const itemTotal = item.product.price * item.quantity * (1 + markupPercent / 100);
          return total + Math.round(itemTotal / months);
        }, 0);
      },

      getCartItemsCount: () => {
        const { cart } = get();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Promo codes implementation
      promoCodes: INITIAL_PROMO_CODES,
      appliedPromoCode: null,

      applyPromoCode: (codeStr: string) => {
        const cleanCode = codeStr.trim().toUpperCase();
        if (!cleanCode) {
          const msg = get().t('promoNotFoundToast');
          get().addToast(msg, 'error');
          return { success: false, message: msg };
        }

        const current = get().appliedPromoCode;
        if (current && current.code.toUpperCase() === cleanCode) {
          const msg = get().t('promoAlreadyAppliedToast');
          get().addToast(msg, 'warning');
          return { success: false, message: msg };
        }

        const promo = get().promoCodes.find(
          (p) => p.code.toUpperCase() === cleanCode && p.isActive
        );

        if (!promo) {
          const msg = get().t('promoNotFoundToast');
          get().addToast(msg, 'error');
          return { success: false, message: msg };
        }

        const total = get().getCartTotal();
        if (promo.minOrderAmount && total < promo.minOrderAmount) {
          const msg = `${get().t('promoMinOrderToast')} ${promo.minOrderAmount.toLocaleString('uz-UZ')} so'm`;
          get().addToast(msg, 'warning');
          return { success: false, message: msg };
        }

        set({ appliedPromoCode: promo });

        // Increment usage count
        set((state) => ({
          promoCodes: state.promoCodes.map((p) =>
            p.id === promo.id ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p
          ),
        }));

        get().addToast(`${get().t('promoAppliedToast')} (${promo.code})`, 'success');
        return { success: true };
      },

      removePromoCode: () => {
        set({ appliedPromoCode: null });
        get().addToast(get().t('promoRemovedToast'), 'info');
      },

      addPromoCode: (promo: PromoCode) => {
        set((state) => ({
          promoCodes: [promo, ...state.promoCodes],
        }));
        get().addToast(`Promokod "${promo.code}" muvaffaqiyatli qo'shildi!`, 'success');
      },

      togglePromoCode: (id: string) => {
        set((state) => ({
          promoCodes: state.promoCodes.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        }));
      },

      deletePromoCode: (id: string) => {
        set((state) => ({
          promoCodes: state.promoCodes.filter((p) => p.id !== id),
          appliedPromoCode: state.appliedPromoCode?.id === id ? null : state.appliedPromoCode,
        }));
        get().addToast("Promokod o'chirildi", 'info');
      },

      getDiscountAmount: () => {
        const { appliedPromoCode } = get();
        const total = get().getCartTotal();
        if (!appliedPromoCode || total <= 0) return 0;

        if (appliedPromoCode.discountType === 'percentage') {
          return Math.round(total * (appliedPromoCode.discountValue / 100));
        } else {
          return Math.min(appliedPromoCode.discountValue, total);
        }
      },

      getFinalTotal: () => {
        const total = get().getCartTotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, total - discount);
      },

      getFinalMonthlyTotal: () => {
        const baseMonthly = get().getCartMonthlyTotal();
        const baseTotal = get().getCartTotal();
        if (baseTotal <= 0) return 0;
        const finalTotal = get().getFinalTotal();
        const ratio = finalTotal / baseTotal;
        return Math.round(baseMonthly * ratio);
      },

      // Favorites
      favorites: [],
      toggleFavorite: (productId) => {
        if (!get().user) {
          set({ isLoginRequiredModalOpen: true });
          return;
        }

        set((state) => {
          const exists = state.favorites.includes(productId);
          const updated = exists
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId];

          const product = state.products.find((p) => p.id === productId);
          if (product) {
            get().addToast(
              exists ? "Sevimlilardan o'chirildi" : "Sevimlilarga qo'shildi",
              'info'
            );
          }
          return { favorites: updated };
        });
      },

      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      },

      // Orders (Local Storage + Supabase sync)
      orders: [],
      addOrder: async (order: Order) => {
        set((state) => ({
          orders: [order, ...state.orders],
        }));

        // Telegram Bot orqali administratorga tezkor va to'liq hisobot yuborish
        try {
          sendOrderNotificationToTelegram(order).catch((err) => {
            console.warn("Telegram bot send order notification warning:", err);
          });
        } catch (tgErr) {
          console.warn("Telegram bot trigger error:", tgErr);
        }

        try {
          const res = await saveOrderToSupabase({
            contractNumber: order.contractNumber,
            customerName: order.customerName,
            pinfl: order.pinfl || '',
            phone: order.customerPhone,
            city: 'Toshkent',
            address: order.deliveryAddress,
            totalPrice: order.totalPrice,
            monthlyPayment: order.monthlyPayment,
            paymentMode: order.paymentMode,
            installmentMonths: order.installmentMonths,
            items: order.items,
            scoringScore: order.scoringScore,
            status: order.status,
          });
        } catch (e) {
          console.error("Supabase order sync error:", e);
        }
      },

      updateOrderStatus: (orderId, newStatus) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          ),
        }));
        get().addToast(`Ariza holati yangilandi: ${newStatus}`, 'info');
      },

      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }));
        get().addToast("Ariza o'chirildi", 'info');
      },

      // User & Auth (Email & Parol)
      user: null,
      isAuthOpen: false,
      openAuth: () => set({ isAuthOpen: true }),
      closeAuth: () => set({ isAuthOpen: false }),
      isLoginRequiredModalOpen: false,
      openLoginRequiredModal: () => set({ isLoginRequiredModalOpen: true }),
      closeLoginRequiredModal: () => set({ isLoginRequiredModalOpen: false }),

      loginWithEmail: async (email: string, password: string) => {
        const cleanEmail = email.trim().toLowerCase();
        const res = await authenticateWithSupabase(cleanEmail, password);

        if (res.success) {
          const isAdmin = res.isAdmin;

          // Foydalanuvchining avval saqlangan profil ma'lumotlarini yuklash
          let savedProfile: Partial<User> | null = null;
          try {
            const raw = localStorage.getItem(`elrizo_user_profile_${cleanEmail}`);
            if (raw) savedProfile = JSON.parse(raw);
          } catch (e) {}

          const userObj: User = {
            id: res.user?.id || `usr-${Date.now()}`,
            fullName: savedProfile?.fullName || (isAdmin ? "Otabek Jo'rayev" : cleanEmail.split('@')[0]),
            email: cleanEmail,
            phone: savedProfile?.phone || '+998 90 777 00 00',
            address: savedProfile?.address || '',
            city: savedProfile?.city || 'Toshkent',
            passportOrPinfl: savedProfile?.passportOrPinfl || '',
            avatarUrl: savedProfile?.avatarUrl || '',
            isVerified: true,
            scoringLimit: 0,
            usedLimit: 0,
            isAdmin,
            role: isAdmin ? 'admin' : 'user',
            cashbackBalance: 0,
          };

          set({ user: userObj, isAuthOpen: false });

          if (isAdmin) {
            get().addToast(`Xush kelibsiz Administrator Otabek Jo'rayev! Admin panel ochildi`, 'success');
            set({ activePage: 'admin' });
          } else {
            get().addToast(`Xush kelibsiz, ${userObj.fullName}!`, 'success');
          }

          return { success: true };
        } else {
          get().addToast(res.error || "Email yoki parol xato", 'error');
          return { success: false, error: res.error };
        }
      },

      logoutUser: () => {
        signOutFromSupabase();
        set({ user: null, activePage: 'home' });
        get().addToast('Tizimdan chiqildi', 'info');
      },

      updateUserProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updates };
        set({ user: updatedUser });

        // Alohida lokal zaxiraga ham ishonchli saqlash
        try {
          if (updatedUser.email) {
            localStorage.setItem(
              `elrizo_user_profile_${updatedUser.email.toLowerCase().trim()}`,
              JSON.stringify(updatedUser)
            );
          }
        } catch (e) {
          console.error("Local storage error:", e);
        }

        get().addToast("Profil ma'lumotlari muvaffaqiyatli saqlandi!", 'success');
      },

      // Supabase Connection Status & Real-time Orders Sync
      supabaseConnected: true,
      initSupabaseCheck: async () => {
        const isOk = await checkSupabaseConnection();
        set({ supabaseConnected: isOk });
        if (isOk) {
          try {
            const remoteOrders = await fetchOrdersFromSupabase();
            set({ orders: remoteOrders || [] });
          } catch (e) {
            console.warn("Orders fetch from Supabase:", e);
          }
        }
      },

      // Calculator Modal
      calculatorProduct: null,
      isCalculatorOpen: false,
      openCalculator: (product) => set({ calculatorProduct: product, isCalculatorOpen: true }),
      closeCalculator: () => set({ calculatorProduct: null, isCalculatorOpen: false }),

      // Selected City
      selectedCity: 'Toshkent',
      setSelectedCity: (city: string) => set({ selectedCity: city }),
      isCityModalOpen: false,
      openCityModal: () => set({ isCityModalOpen: true }),
      closeCityModal: () => set({ isCityModalOpen: false }),

      // Product Comparison (Taqqoslash)
      comparisonList: [],
      addToComparison: (productId: string) => {
        const { comparisonList, products } = get();
        if (comparisonList.includes(productId)) {
          get().addToast("Ushbu mahsulot allaqachon taqqoslashga qo'shilgan", 'info');
          return;
        }
        if (comparisonList.length >= 4) {
          get().addToast("Bir vaqtda ko'pi bilan 4 ta mahsulotni taqqoslash mumkin", 'warning');
          return;
        }
        const product = products.find(p => p.id === productId);
        set({ comparisonList: [...comparisonList, productId] });
        get().addToast(`"${product?.title.slice(0, 25)}..." taqqoslashga qo'shildi`, 'success');
      },
      removeFromComparison: (productId: string) => {
        set((state) => ({
          comparisonList: state.comparisonList.filter((id) => id !== productId),
        }));
      },
      clearComparison: () => set({ comparisonList: [] }),
      isComparisonModalOpen: false,
      openComparisonModal: () => set({ isComparisonModalOpen: true }),
      closeComparisonModal: () => set({ isComparisonModalOpen: false }),

      // Real Customer Reviews (Sharhlar)
      reviews: INITIAL_REVIEWS,
      addReview: (productId: string, reviewData) => {
        const newRev: Review = {
          id: `rev-${Date.now()}`,
          productId,
          userName: reviewData.userName || "Hurmatli Mijoz",
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: new Date().toISOString(),
          verifiedPurchase: true,
          likesCount: 0,
        };
        set((state) => {
          const currentList = state.reviews[productId] || [];
          return {
            reviews: {
              ...state.reviews,
              [productId]: [newRev, ...currentList],
            },
          };
        });
        get().addToast("Sharhingiz qabul qilindi va chop etildi! Rahmat!", 'success');
      },

      // Order Tracking (Buyurtmani kuzatish)
      isOrderTrackingOpen: false,
      openOrderTracking: () => set({ isOrderTrackingOpen: true }),
      closeOrderTracking: () => set({ isOrderTrackingOpen: false }),

      // Jamg'arma Karta (Cashback Loyalty Program)
      cashbackTransactions: [],
      useCashbackInCheckout: false,
      setUseCashbackInCheckout: (val: boolean) => set({ useCashbackInCheckout: val }),
      toggleUseCashbackInCheckout: () => set((state) => ({ useCashbackInCheckout: !state.useCashbackInCheckout })),
      
      getCashbackDiscount: () => {
        const { useCashbackInCheckout, user, getFinalTotal } = get();
        if (!useCashbackInCheckout || !user || !user.cashbackBalance) return 0;
        const total = getFinalTotal();
        return Math.min(user.cashbackBalance, total);
      },

      addCashback: (amount: number, description: string, orderId?: string) => {
        const currentUser = get().user;
        if (!currentUser || amount <= 0) return;
        const newTx: CashbackTransaction = {
          id: `cb-${Date.now()}`,
          orderId,
          type: 'earned',
          amount,
          date: new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
          description,
        };
        const updatedUser = {
          ...currentUser,
          cashbackBalance: (currentUser.cashbackBalance || 0) + amount,
        };
        set((state) => ({
          user: updatedUser,
          cashbackTransactions: [newTx, ...state.cashbackTransactions],
        }));
        get().addToast(`Jamg'arma kartangizga +${amount.toLocaleString()} so'm keshbek qo'shildi! 🎁`, 'success');
      },

      spendCashback: (amount: number, description: string, orderId?: string) => {
        const currentUser = get().user;
        if (!currentUser || (currentUser.cashbackBalance || 0) < amount || amount <= 0) return false;
        const newTx: CashbackTransaction = {
          id: `cb-${Date.now()}`,
          orderId,
          type: 'spent',
          amount,
          date: new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
          description,
        };
        const updatedUser = {
          ...currentUser,
          cashbackBalance: Math.max(0, (currentUser.cashbackBalance || 0) - amount),
        };
        set((state) => ({
          user: updatedUser,
          cashbackTransactions: [newTx, ...state.cashbackTransactions],
        }));
        return true;
      },

      isCashbackCardModalOpen: false,
      openCashbackCardModal: () => set({ isCashbackCardModalOpen: true }),
      closeCashbackCardModal: () => set({ isCashbackCardModalOpen: false }),

      // Toasts
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = `${Date.now()}-${Math.random()}`;
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 3500);
      },
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      // Theme (Light/Dark mode)
      theme: 'light' as Theme,
      setTheme: (theme: Theme) => {
        if (typeof document !== 'undefined') {
          // Vaqtinchalik barcha transitionlarni o'chirib, rejimni bir lahzada (bittada) o'tkazish
          const css = document.createElement('style');
          css.appendChild(
            document.createTextNode(
              `*, *::before, *::after {
                -webkit-transition: none !important;
                -moz-transition: none !important;
                -o-transition: none !important;
                -ms-transition: none !important;
                transition: none !important;
              }`
            )
          );
          document.head.appendChild(css);

          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          // Force reflow to immediately apply theme styles without delay
          void window.getComputedStyle(document.body).opacity;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (document.head.contains(css)) {
                document.head.removeChild(css);
              }
            });
          });
        }
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      // Language (UZ/RU/EN)
      language: 'uz' as Language,
      setLanguage: (lang: Language) => {
        set({ language: lang });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lang;
        }
      },
      t: (key: TranslationKey) => getTranslation(get().language, key),
    }),
    {
      name: 'elrizo_store_v3', // Yangi toza kalit (0 dan boshlash uchun)
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('elrizo_nasiya_storage');
            localStorage.removeItem('elrizo_store_v2');
          } catch (e) {}
        }
        if (state) {
          // Saytdan hali hech kim sotib olmagan: buyurtmalarni tozalaymiz
          if (state.orders && state.orders.some((o: any) => o.contractNumber === 'ELR-592970' || o.contractNumber === 'ELR-PAY-345805' || o.id === 'ord-initial-01')) {
            state.orders = [];
          }
          if (state.cashbackTransactions) {
            state.cashbackTransactions = [];
          }
          if (state.promoCodes) {
            state.promoCodes = state.promoCodes.map((p: any) => ({ ...p, usageCount: 0 }));
          }
        }
        if (state?.user) {
          state.user.scoringLimit = 0;
          state.user.usedLimit = 0;
          if (state.user.cashbackBalance === undefined || state.user.cashbackBalance === 245000) {
            state.user.cashbackBalance = 0;
          }
          if (state.user.loyaltyCardNumber) {
            delete state.user.loyaltyCardNumber;
          }
          // Saqlangan profil ma'lumotlarini tiklash
          if (state.user.email) {
            try {
              const raw = localStorage.getItem(`elrizo_user_profile_${state.user.email.toLowerCase().trim()}`);
              if (raw) {
                const saved = JSON.parse(raw);
                if (saved.fullName) state.user.fullName = saved.fullName;
                if (saved.avatarUrl) state.user.avatarUrl = saved.avatarUrl;
                if (saved.phone) state.user.phone = saved.phone;
                if (saved.address) state.user.address = saved.address;
                if (saved.city) state.user.city = saved.city;
                if (saved.passportOrPinfl) state.user.passportOrPinfl = saved.passportOrPinfl;
              }
            } catch (e) {}
          }
        }
        if (state && typeof document !== 'undefined') {
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          if (state.language) {
            document.documentElement.lang = state.language;
          }
        }
      },
      partialize: (state) => ({
        cart: state.cart,
        favorites: state.favorites,
        user: state.user,
        orders: state.orders,
        theme: state.theme,
        language: state.language,
        promoCodes: state.promoCodes,
        appliedPromoCode: state.appliedPromoCode,
        selectedCity: state.selectedCity,
        comparisonList: state.comparisonList,
        reviews: state.reviews,
        cashbackTransactions: state.cashbackTransactions,
      }),
    }
  )
);
