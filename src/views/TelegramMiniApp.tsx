'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Product, Order, CartItem } from '../types';
import {
  initTelegramWebApp,
  getTelegramWebAppUser,
  tgHaptic,
  isInsideTelegram
} from '../utils/telegramWebApp';
import { sendOrderNotificationToTelegram } from '../utils/telegramBot';
import {
  Search,
  ShoppingCart,
  Heart,
  Home,
  Grid,
  User as UserIcon,
  X,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  Phone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  Package,
  Trash2,
  Percent,
  CheckCircle2,
  Moon,
  Sun,
  Globe,
  SlidersHorizontal,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';
import { BannerSlider } from '../components/BannerSlider';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/mockData';
import { useTranslation, getCategoryTitle } from '../utils/translations';

const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Farg'ona viloyati",
  "Andijon viloyati",
  "Namangan viloyati",
  "Buxoro viloyati",
  "Xorazm viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Navoiy viloyati",
  "Qoraqalpog'iston Respublikasi"
];

const CATEGORY_CHIPS = [
  { id: 'all', label: 'Barchasi', icon: Grid },
  { id: 'zero_nasiya', label: '0-0-12 Nasiya', icon: Percent },
  { id: 'smartphones', label: 'Smartfonlar', icon: Sparkles },
  { id: 'appliances', label: 'Maishiy texnika', icon: Package },
  { id: 'computers', label: 'Noutbuklar', icon: SlidersHorizontal },
  { id: 'discounts', label: 'Chegirmalar', icon: Percent },
];

export const TelegramMiniApp: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    favorites,
    toggleFavorite,
    isFavorite,
    orders,
    addOrder,
    theme,
    toggleTheme,
    language,
    setLanguage
  } = useStore();
  const { t } = useTranslation();

  // Telegram User & Context
  const [tgUser, setTgUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'favorites' | 'cart' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12 | 24>(12);

  const weeklyOffers = useMemo(() => products.filter((p) => p.isWeeklyOffer), [products]);
  const zeroDownProducts = useMemo(() => products.filter((p) => p.hasZeroDown), [products]);

  // Fast Checkout Modal / Drawer State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutProduct, setDirectCheckoutProduct] = useState<Product | null>(null);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('+998 ');
  const [checkoutRegion, setCheckoutRegion] = useState(REGIONS[0]);
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPaymentMode, setCheckoutPaymentMode] = useState<'installment' | 'full'>('installment');
  const [checkoutMonths, setCheckoutMonths] = useState<3 | 6 | 12 | 24>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<Order | null>(null);

  // Initialize Telegram WebApp SDK
  useEffect(() => {
    initTelegramWebApp();
    const user = getTelegramWebAppUser();
    if (user) {
      setTgUser(user);
      if (user.first_name) {
        setCheckoutName(
          `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`.trim()
        );
      }
    }
  }, []);

  // Filter Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Category / Quick chips filter
    if (selectedCategory === 'zero_nasiya') {
      list = list.filter(p => p.hasZeroDown || p.maxMonths >= 12);
    } else if (selectedCategory === 'smartphones') {
      list = list.filter(p => p.categoryId.includes('smartphones') || p.categoryName.toLowerCase().includes('smartfon'));
    } else if (selectedCategory === 'appliances') {
      list = list.filter(p => p.categoryId.includes('appliances') || p.categoryName.toLowerCase().includes('maishiy') || p.categoryName.toLowerCase().includes('televizor'));
    } else if (selectedCategory === 'computers') {
      list = list.filter(p => p.categoryId.includes('computers') || p.categoryName.toLowerCase().includes('noutbuk'));
    } else if (selectedCategory === 'beauty') {
      list = list.filter(p => p.categoryId.includes('beauty') || p.categoryName.toLowerCase().includes('parvarish'));
    } else if (selectedCategory === 'auto') {
      list = list.filter(p => p.categoryId.includes('auto') || p.categoryName.toLowerCase().includes('avto'));
    } else if (selectedCategory === 'home-goods' || selectedCategory === 'home') {
      list = list.filter(p => p.categoryId.includes('home') || p.categoryName.toLowerCase().includes('uy-ro') || p.categoryName.toLowerCase().includes('ro‘zg‘or'));
    } else if (selectedCategory === 'discounts') {
      list = list.filter(p => (p.discountPercentage && p.discountPercentage > 0) || (p.originalPrice && p.originalPrice > p.price));
    } else if (selectedCategory !== 'all') {
      const cleanSlug = selectedCategory.replace('cat-', '').toLowerCase();
      list = list.filter(p => 
        p.categoryId.toLowerCase().includes(cleanSlug) ||
        p.categoryName.toLowerCase().includes(cleanSlug)
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory]);

  // Cart total calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartMonthly = useMemo(() => {
    return Math.round(cartTotal / 12);
  }, [cartTotal]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Handle open product details
  const handleOpenProduct = (product: Product) => {
    tgHaptic('light');
    setSelectedProduct(product);
    setSelectedMonths(12);
    setIsDetailOpen(true);
  };

  // Toggle favorite with haptic
  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    tgHaptic('medium');
    toggleFavorite(productId);
  };

  // Cart quantity controls with haptic
  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    tgHaptic('medium');
    addToCart(product, 12, 'installment');
  };

  const handleAddDirect = (product: Product) => {
    tgHaptic('medium');
    addToCart(product, 12, 'installment');
  };

  const handleIncrement = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    tgHaptic('light');
    const item = cart.find(c => c.product.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    tgHaptic('light');
    const item = cart.find(c => c.product.id === productId);
    if (item) {
      if (item.quantity <= 1) {
        removeFromCart(productId);
      } else {
        updateQuantity(productId, item.quantity - 1);
      }
    }
  };

  // Direct checkout for 1 product
  const handleBuyNow = (product: Product) => {
    tgHaptic('heavy');
    setDirectCheckoutProduct(product);
    setCheckoutMonths(12);
    setIsDetailOpen(false);
    setIsCheckoutOpen(true);
  };

  // Open checkout from cart
  const handleCheckoutFromCart = () => {
    if (cart.length === 0) return;
    tgHaptic('heavy');
    setDirectCheckoutProduct(null);
    setIsCheckoutOpen(true);
  };

  // Submit Order / Nasiya Application
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!checkoutPhone.trim() || checkoutPhone.trim().length < 9) {
      alert("Iltimos, to'liq telefon raqamingizni kiriting!");
      return;
    }

    setIsSubmitting(true);
    tgHaptic('medium');

    try {
      const isDirect = !!directCheckoutProduct;
      const orderItems = isDirect
        ? [
            {
              productId: directCheckoutProduct.id,
              title: directCheckoutProduct.title,
              price: directCheckoutProduct.price,
              quantity: 1,
              monthlyPayment: Math.round(directCheckoutProduct.price / checkoutMonths)
            }
          ]
        : cart.map(item => ({
            productId: item.product.id,
            title: item.product.title,
            price: item.product.price,
            quantity: item.quantity,
            monthlyPayment: Math.round(item.product.price / 12)
          }));

      const orderTotal = isDirect
        ? directCheckoutProduct.price
        : cartTotal;

      const monthlyPay = checkoutPaymentMode === 'installment'
        ? Math.round(orderTotal / checkoutMonths)
        : 0;

      const contractId = `ELR-TG-${Date.now().toString().slice(-6)}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        contractNumber: contractId,
        customerName: checkoutName.trim() || (tgUser?.first_name ? `${tgUser.first_name}` : 'Mijoz'),
        customerPhone: checkoutPhone.trim(),
        totalPrice: orderTotal,
        paymentMode: checkoutPaymentMode,
        installmentMonths: checkoutMonths,
        monthlyPayment: monthlyPay,
        status: 'pending',
        deliveryAddress: `${checkoutRegion}, ${checkoutAddress.trim() || 'Markaziy tuman'}`,
        createdAt: new Date().toISOString(),
        items: orderItems,
      };

      // 1. Add to store (persisted & synced with Supabase)
      await addOrder(newOrder);

      // 2. Send instant Telegram alert to admin
      await sendOrderNotificationToTelegram(newOrder);

      // 3. Clear cart if cart checkout
      if (!isDirect) {
        clearCart();
      }

      tgHaptic('success');
      setOrderSuccessData(newOrder);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      console.error("Order submission error:", err);
      tgHaptic('error');
      alert("Buyurtma yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F4F6F8] dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans select-none pb-28 relative">
      {/* 1. TOP MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#640199] via-[#7B0FB5] to-[#50007A] text-white px-4 pt-3 pb-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-amber-300 text-sm shadow-inner shrink-0">
              E
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight truncate">
                  {tgUser?.first_name ? `Salom, ${tgUser.first_name}` : "ELRIZO Market"}
                </span>
                <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Rasmiy
                </span>
              </div>
              <p className="text-[11px] text-purple-200/90 truncate">0-0-12 Halol Nasiya Savdo</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Toggle */}
            <button
              onClick={() => {
                tgHaptic('light');
                setLanguage(language === 'uz' ? 'ru' : 'uz');
              }}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold flex items-center gap-1 transition-all"
              title="Tilni o'zgartirish"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => {
                tgHaptic('light');
                toggleTheme();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
              title="Mavzuni o'zgartirish"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-purple-200 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Smartfon, noutbuk, maishiy texnika qidirish..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/15 backdrop-blur-md text-white placeholder-purple-200/80 text-xs border border-white/20 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                tgHaptic('light');
                setSearchQuery('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-purple-200 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN BODY ACCORDING TO ACTIVE TAB */}
      {activeTab === 'home' && (
        <main className="flex-1 px-3 pt-3 space-y-4">
          {/* A. Search Active View */}
          {searchQuery.trim() ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>"{searchQuery}" {language === 'ru' ? 'результаты' : 'bo\'yicha natijalar'}</span>
                  <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                    {filteredProducts.length} {language === 'ru' ? 'товаров' : 'ta'}
                  </span>
                </h3>
                <button
                  onClick={() => {
                    tgHaptic('light');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Tozalash
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-14 text-center space-y-2">
                  <Package className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Mahsulot topilmadi</p>
                  <p className="text-xs text-gray-500">Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleOpenProduct}
                      onInstallmentClick={handleBuyNow}
                      onAddToCart={handleAddDirect}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : selectedCategory !== 'all' ? (
            /* B. Category Filtered Active View */
            <div className="space-y-3">
              {/* Quick Categories Bar (Scrollable chips) */}
              <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
                {CATEGORY_CHIPS.map(chip => {
                  const Icon = chip.icon;
                  const isActive = selectedCategory === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => {
                        tgHaptic('light');
                        setSelectedCategory(chip.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#640199] to-[#7B0FB5] text-white shadow-md shadow-purple-500/25 scale-105'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-purple-600 dark:text-purple-400'}`} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>{getCategoryTitle(selectedCategory, language)}</span>
                  <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                    {filteredProducts.length} {language === 'ru' ? 'товаров' : 'ta'}
                  </span>
                </h3>
                <button
                  onClick={() => {
                    tgHaptic('light');
                    setSelectedCategory('all');
                  }}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Barcha tovarlar
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-14 text-center space-y-2">
                  <Package className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="font-semibold text-sm text-gray-700 dark:text-gray-300">Bu toifada tovar mavjud emas</p>
                  <button
                    onClick={() => {
                      tgHaptic('light');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#640199] text-white font-semibold text-xs shadow-md mt-2"
                  >
                    Barcha tovarlarga qaytish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleOpenProduct}
                      onInstallmentClick={handleBuyNow}
                      onAddToCart={handleAddDirect}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* C. FULL DEFAULT HOMEPAGE (Identical to main website sections!) */
            <div className="space-y-6">
              {/* 1. Asosiy Promo Bannerlar Slayderi */}
              <BannerSlider
                onBannerAction={(targetCat) => {
                  tgHaptic('light');
                  if (targetCat) {
                    setSelectedCategory(targetCat.replace('cat-', ''));
                  } else {
                    setActiveTab('catalog');
                  }
                }}
              />

              {/* 2. Ommabop Toifalar Karuseli / Ro'yxati */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <span>{t('popularCategories')}</span>
                  </h2>
                  <button
                    onClick={() => {
                      tgHaptic('light');
                      setActiveTab('catalog');
                    }}
                    className="text-xs font-bold text-uzum-primary hover:text-uzum-hover flex items-center gap-1 group"
                  >
                    <span>{t('allCategories')}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                <CategoryList
                  onSelectCategory={(slug) => {
                    tgHaptic('light');
                    setSelectedCategory(slug);
                  }}
                />
              </div>

              {/* 3. ELRIZO Ishonch va FinTech Afzalliklari Bloki */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    icon: Zap,
                    title: t('trust1Title'),
                    desc: t('trust1Desc'),
                    bg: "bg-purple-50/80 dark:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-gray-800",
                  },
                  {
                    icon: Percent,
                    title: t('trust2Title'),
                    desc: t('trust2Desc'),
                    bg: "bg-emerald-50/80 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-gray-800",
                  },
                  {
                    icon: Truck,
                    title: t('trust3Title'),
                    desc: t('trust3Desc'),
                    bg: "bg-blue-50/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-gray-800",
                  },
                  {
                    icon: ShieldCheck,
                    title: t('trust4Title'),
                    desc: t('trust4Desc'),
                    bg: "bg-amber-50/80 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-200/50 dark:border-gray-800",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl border ${item.bg} flex items-start gap-2 shadow-xs`}
                  >
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-xs shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-black text-xs text-gray-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-tight">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 4. Hafta Takliflari (Hot Weekly Offers) */}
              {weeklyOffers.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                        <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                          {t('weeklyOffers')}
                        </h2>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('weeklyOffersDesc')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        tgHaptic('light');
                        setSelectedCategory('discounts');
                      }}
                      className="text-xs font-bold text-uzum-primary hover:underline flex items-center gap-0.5"
                    >
                      <span>{t('viewAll')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {weeklyOffers.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={handleOpenProduct}
                        onInstallmentClick={handleBuyNow}
                        onAddToCart={handleAddDirect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 5. 0-0-12 Nasiya Savdo Saralangan Tovar To'plami */}
              {zeroDownProducts.length > 0 && (
                <section className="space-y-3 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-3.5 rounded-2xl border border-purple-100/80 dark:border-slate-700 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-[#640199] text-white shadow-sm">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                            {t('zeroDownTitle')}
                          </h2>
                          <span className="text-[9px] font-black uppercase text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-1.5 py-0.2 rounded-full">
                            {t('zeroDownBadge')}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('zeroDownDesc')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        tgHaptic('light');
                        setSelectedCategory('zero_nasiya');
                      }}
                      className="text-xs font-bold text-uzum-primary hover:underline flex items-center gap-0.5"
                    >
                      <span>{t('viewAll')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {zeroDownProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={handleOpenProduct}
                        onInstallmentClick={handleBuyNow}
                        onAddToCart={handleAddDirect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 6. Ommabop Mahsulotlar (Barcha tovarlar) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#640199] dark:text-purple-300">
                      <Sparkles className="w-4 h-4 fill-[#640199] dark:fill-purple-300" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                        {t('popularProducts')}
                      </h2>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('popularProductsDesc')}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      tgHaptic('light');
                      setActiveTab('catalog');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-uzum-primary dark:text-purple-300 bg-purple-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-purple-200/50 dark:border-gray-700"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{t('filtersAndAll')}</span>
                  </button>
                </div>

                {/* Quick category switcher pills */}
                <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-0.5">
                  {CATEGORY_CHIPS.map(chip => {
                    const Icon = chip.icon;
                    const isActive = selectedCategory === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => {
                          tgHaptic('light');
                          setSelectedCategory(chip.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#640199] to-[#7B0FB5] text-white shadow-md shadow-purple-500/25 scale-105'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-purple-600 dark:text-purple-400'}`} />
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={handleOpenProduct}
                      onInstallmentClick={handleBuyNow}
                      onAddToCart={handleAddDirect}
                    />
                  ))}
                </div>
              </section>

              {/* 7. Katta Taklif Banneri (Bottom Banner) */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-[#640199] via-[#7C3AED] to-[#4F46E5] text-white flex flex-col items-center justify-between gap-3 shadow-lg relative overflow-hidden text-center">
                <div className="space-y-1.5 z-10">
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>{t('bottomBannerBadge')}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {t('bottomBannerTitle')}
                  </h3>
                  <p className="text-[11px] text-purple-100 max-w-xs">
                    {t('bottomBannerDesc')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    tgHaptic('medium');
                    setActiveTab('catalog');
                  }}
                  className="z-10 px-5 py-2.5 rounded-xl bg-white text-gray-900 hover:bg-yellow-300 hover:text-black font-black text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700" />
                  <span>{t('bottomBannerBtn')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Ambient glow */}
                <div className="absolute -right-16 -top-16 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>
          )}
        </main>
      )}

      {/* 3. CATALOG TAB (Category view with all real categories) */}
      {activeTab === 'catalog' && (
        <main className="flex-1 px-3 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-[#640199] dark:text-purple-400" />
              <span>{t('allCategories')} ({CATEGORIES.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {CATEGORIES.map(cat => {
              const catTitle = getCategoryTitle(cat.slug, language);
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    tgHaptic('light');
                    setSelectedCategory(cat.slug);
                    setActiveTab('home');
                  }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 shadow-sm active:scale-[0.99] cursor-pointer hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 p-1 shrink-0 overflow-hidden border border-purple-200/50 dark:border-purple-800/50 flex items-center justify-center">
                        <img src={cat.image} alt={catTitle} className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {catTitle}
                        </h4>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                          {cat.itemCount}+ {t('itemsUnit')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>

                  {/* Subcategories pill tags */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800/60">
                      {cat.subcategories.slice(0, 4).map(sub => (
                        <span
                          key={sub.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            tgHaptic('light');
                            setSearchQuery(sub.name);
                            setActiveTab('home');
                          }}
                          className="text-[10px] bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 4. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <main className="flex-1 px-3 pt-3 space-y-3">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Sevimlilar ({favorites.length})</span>
          </h3>

          {favorites.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Hozircha sevimlilar yo'q</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Sizga yoqqan tovarlarning yurakchasini bosib, ularni bu yerda saqlab qo'yishingiz mumkin.
              </p>
              <button
                onClick={() => {
                  tgHaptic('light');
                  setActiveTab('home');
                }}
                className="px-4 py-2 rounded-xl bg-[#640199] text-white font-semibold text-xs shadow-md"
              >
                Katalogga o'tish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {products
                .filter(p => favorites.includes(p.id))
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={handleOpenProduct}
                    onInstallmentClick={handleBuyNow}
                    onAddToCart={handleAddDirect}
                  />
                ))}
            </div>
          )}
        </main>
      )}

      {/* 5. CART TAB */}
      {activeTab === 'cart' && (
        <main className="flex-1 px-3 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-[#640199] dark:text-purple-400" />
              <span>Savat ({cartCount} dona)</span>
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  tgHaptic('light');
                  if (confirm("Savatni tozalashni xohlaysizmi?")) {
                    clearCart();
                  }
                }}
                className="text-xs text-rose-500 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3 h-3" /> Tozalash
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#640199] dark:text-purple-300 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Savatingiz hozircha bo'sh</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Do'konimizdan o'zingizga yoqqan tovarlarni tanlang va 0-0-12 nasiyaga oling!
              </p>
              <button
                onClick={() => {
                  tgHaptic('light');
                  setActiveTab('home');
                }}
                className="px-4 py-2 rounded-xl bg-[#640199] text-white font-semibold text-xs shadow-md"
              >
                Xaridni boshlash
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Items List */}
              <div className="space-y-2">
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-14 h-14 object-contain rounded-xl bg-gray-50 dark:bg-gray-800 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {item.product.title}
                      </h4>
                      <div className="text-xs font-bold text-[#640199] dark:text-purple-300">
                        {item.product.price.toLocaleString('uz-UZ')} so'm
                      </div>
                      <div className="text-[10px] text-gray-400">
                        ⚡ {Math.round(item.product.price / 12).toLocaleString('uz-UZ')} so'm/oy (12 oy)
                      </div>
                    </div>
                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 p-1 rounded-xl shrink-0">
                      <button
                        onClick={(e) => handleDecrement(e, item.product.id)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={(e) => handleIncrement(e, item.product.id)}
                        className="w-6 h-6 rounded-lg bg-[#640199] text-white flex items-center justify-center shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span>Mahsulotlar jami:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {cartTotal.toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span>Yetkazib berish (24 soat):</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 so'm (Bepul)</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span>Nasiyaga (12 oy bo'yicha):</span>
                  <span className="font-bold text-[#640199] dark:text-purple-300">
                    ⚡ {cartMonthly.toLocaleString('uz-UZ')} so'm/oy
                  </span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex items-center justify-between font-extrabold text-sm">
                  <span>Jami to'lov:</span>
                  <span className="text-gray-950 dark:text-white">
                    {cartTotal.toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handleCheckoutFromCart}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#640199] to-[#7B0FB5] hover:opacity-95 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all"
              >
                <Percent className="w-4 h-4 text-amber-300" />
                <span>⚡ 0-0-12 Nasiyaga Ariza Berish</span>
              </button>
            </div>
          )}
        </main>
      )}

      {/* 6. PROFILE TAB */}
      {activeTab === 'profile' && (
        <main className="flex-1 px-3 pt-3 space-y-3.5">
          {/* User Card */}
          <div className="bg-gradient-to-br from-[#640199] to-[#4A0072] rounded-2xl p-4 text-white shadow-lg space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-black text-amber-300 text-lg shadow-inner">
                {tgUser?.first_name ? tgUser.first_name[0].toUpperCase() : 'E'}
              </div>
              <div>
                <h4 className="font-extrabold text-sm">
                  {tgUser?.first_name ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}` : 'ELRIZO Mijozi'}
                </h4>
                <p className="text-[11px] text-purple-200">
                  {tgUser?.username ? `@${tgUser.username}` : 'Telegram WebApp orqali'}
                </p>
                {tgUser?.id && (
                  <p className="text-[10px] text-purple-300/80">ID: {tgUser.id}</p>
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-purple-200">Nasiya limiti:</span>
              <span className="font-bold text-amber-300">⚡ 25 000 000 so'mgacha</span>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#640199] dark:text-purple-400" />
              <span>Buyurtmalarim ({orders.length})</span>
            </h4>

            {orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center text-xs text-gray-500 border border-gray-100 dark:border-gray-800">
                Sizda hali faol buyurtmalar mavjud emas.
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map(ord => (
                  <div
                    key={ord.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#640199] dark:text-purple-300">
                        № {ord.contractNumber || ord.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : ord.status === 'scoring_approved' || ord.status === 'processing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {ord.status === 'delivered' ? 'Yetkazildi' : ord.status === 'scoring_approved' || ord.status === 'processing' ? 'Tasdiqlangan' : 'Kutilmoqda'}
                      </span>
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {ord.items?.length || 1} ta tovar • {ord.totalPrice.toLocaleString('uz-UZ')} so'm
                    </div>
                    {ord.monthlyPayment && (
                      <div className="text-[10px] font-medium text-purple-600 dark:text-purple-400">
                        Oylik to'lov: {ord.monthlyPayment.toLocaleString('uz-UZ')} so'm / oy ({ord.installmentMonths || 12} oy)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Support / Contact */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-800 space-y-2.5">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#640199] dark:text-purple-400" />
              <span>ELRIZO NASIYA SAVDO — Rasmiy ma'lumotlar</span>
            </h4>
            <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1 leading-relaxed">
              <p>☎️ <b>Telefon:</b> <a href="tel:+998943335522" className="text-purple-600 dark:text-purple-400 font-bold">+998 94 333 55 22</a></p>
              <p>💬 <b>Telegram admin:</b> <a href="https://t.me/yahyo0526" target="_blank" rel="noreferrer" className="text-purple-600 dark:text-purple-400 font-bold">@yahyo0526</a></p>
              <p>⏰ <b>Ish vaqti:</b> Har kuni 09:00 dan 21:00 gacha (dam olishsiz)</p>
              <p>📍 <b>Manzil:</b> Namangan shahri, Yangiqo'rg'on tumani</p>
              <p>🌐 <b>Rasmiy sayt:</b> <a href="https://elrizonasiya.vercel.app" target="_blank" rel="noreferrer" className="text-purple-600 dark:text-purple-400 font-bold underline">elrizonasiya.vercel.app</a></p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="https://t.me/yahyo0526"
                target="_blank"
                rel="noreferrer"
                onClick={() => tgHaptic('light')}
                className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#640199] dark:text-purple-300 font-semibold text-xs flex items-center justify-center gap-1 border border-purple-200/60 dark:border-purple-800/60"
              >
                <span>Telegram Admin</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="tel:+998943335522"
                onClick={() => tgHaptic('light')}
                className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60"
              >
                <Phone className="w-3 h-3" />
                <span>Qo'ng'iroq qilish</span>
              </a>
            </div>
          </div>
        </main>
      )}

      {/* 7. PRODUCT DETAIL BOTTOM SHEET */}
      {isDetailOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Close */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto" />
              <button
                onClick={() => {
                  tgHaptic('light');
                  setIsDetailOpen(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Content Scrollable */}
            <div className="overflow-y-auto p-4 space-y-3.5 flex-1">
              {/* Product Image */}
              <div className="w-full aspect-video bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3 flex items-center justify-center">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="max-h-full object-contain"
                />
              </div>

              {/* Title & Price */}
              <div>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {selectedProduct.categoryName}
                </span>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mt-0.5">
                  {selectedProduct.title}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-black text-gray-950 dark:text-white">
                    {selectedProduct.price.toLocaleString('uz-UZ')} so'm
                  </span>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="text-xs text-gray-400 line-through">
                      {selectedProduct.originalPrice.toLocaleString('uz-UZ')} so'm
                    </span>
                  )}
                </div>
              </div>

              {/* 0-0-12 Halol Nasiya Term Calculator */}
              <div className="bg-purple-50 dark:bg-purple-950/40 rounded-2xl p-3 border border-purple-200/60 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#640199] dark:text-purple-300">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" /> 0-0-12 Halol Nasiya Hisobi:
                  </span>
                  <span>0% Boshlang'ich</span>
                </div>

                {/* Month Selector Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {([3, 6, 12, 24] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        tgHaptic('light');
                        setSelectedMonths(m);
                      }}
                      className={`py-1.5 rounded-xl font-bold text-xs transition-all ${
                        selectedMonths === m
                          ? 'bg-[#640199] text-white shadow'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-purple-200/60 dark:border-gray-700'
                      }`}
                    >
                      {m} oy
                    </button>
                  ))}
                </div>

                {/* Installment breakdown */}
                <div className="pt-1 text-[11px] space-y-1">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Oylik to'lov:</span>
                    <span className="font-extrabold text-[#640199] dark:text-purple-300">
                      {Math.round(selectedProduct.price / selectedMonths).toLocaleString('uz-UZ')} so'm / oy
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Boshlang'ich to'lov:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 so'm (0%)</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Ustama (ortiqcha to'lov):</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 so'm (0%)</span>
                  </div>
                </div>
              </div>

              {/* Specs Table */}
              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">Texnik xususiyatlari:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-2.5 space-y-1 text-xs">
                    {Object.entries(selectedProduct.specs).slice(0, 6).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-gray-600 dark:text-gray-300 text-[11px]">
                        <span className="text-gray-400">{k}:</span>
                        <span className="font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProduct.description && (
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-gray-900 dark:text-white">Tavsif:</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </div>

            {/* Sticky Sheet Action Bar */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  handleAdd(e, selectedProduct);
                  setIsDetailOpen(false);
                }}
                className="py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Savatga</span>
              </button>
              <button
                onClick={() => handleBuyNow(selectedProduct)}
                className="py-2.5 rounded-xl bg-gradient-to-r from-[#640199] to-[#7B0FB5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
              >
                <Percent className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ Nasiyaga Olish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. FAST CHECKOUT / NASIYA MODAL (1-Step Order) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900 dark:text-white">
                <Percent className="w-4 h-4 text-[#640199] dark:text-purple-400" />
                <span>0-0-12 Nasiya Rasmiylashtirish</span>
              </div>
              <button
                onClick={() => {
                  tgHaptic('light');
                  setIsCheckoutOpen(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-4 space-y-3 flex-1 text-xs">
              {/* Order Items Preview */}
              <div className="bg-purple-50 dark:bg-purple-950/40 rounded-xl p-3 border border-purple-200/50 dark:border-purple-800/50 space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>Buyurtma summasi:</span>
                  <span className="text-[#640199] dark:text-purple-300">
                    {(directCheckoutProduct ? directCheckoutProduct.price : cartTotal).toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
                {checkoutPaymentMode === 'installment' && (
                  <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-300">
                    <span>Oylik to'lov ({checkoutMonths} oy):</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {Math.round((directCheckoutProduct ? directCheckoutProduct.price : cartTotal) / checkoutMonths).toLocaleString('uz-UZ')} so'm/oy
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">To'lov usuli:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      tgHaptic('light');
                      setCheckoutPaymentMode('installment');
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all ${
                      checkoutPaymentMode === 'installment'
                        ? 'bg-[#640199] text-white shadow'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    ⚡ 0-0-12 Halol Nasiya
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      tgHaptic('light');
                      setCheckoutPaymentMode('full');
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all ${
                      checkoutPaymentMode === 'full'
                        ? 'bg-[#640199] text-white shadow'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    💳 Naqd / Karta
                  </button>
                </div>
              </div>

              {/* Installment Tenure (if Nasiya) */}
              {checkoutPaymentMode === 'installment' && (
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">Nasiya muddati:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([3, 6, 12, 24] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          tgHaptic('light');
                          setCheckoutMonths(m);
                        }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all ${
                          checkoutMonths === m
                            ? 'bg-[#640199] text-white shadow'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {m} oy
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Ism va familiyangiz:</label>
                <input
                  type="text"
                  required
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder="Masalan: Sardor Aliyev"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Telefon raqamingiz:</label>
                <input
                  type="tel"
                  required
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-600 text-xs font-mono"
                />
              </div>

              {/* Region */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Viloyat / Hudud:</label>
                <select
                  value={checkoutRegion}
                  onChange={(e) => setCheckoutRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-600 text-xs"
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">Manzil (tuman, ko'cha, uy raqami):</label>
                <input
                  type="text"
                  required
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder="Masalan: Chilonzor tumani, 9-mavze, 12-uy"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-600 text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#640199] to-[#7B0FB5] hover:opacity-95 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Rasmiylashtirilmoqda...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>⚡ Buyurtmani Tasdiqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. ORDER SUCCESS MODAL */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-5 text-center space-y-3.5 shadow-2xl border border-purple-500/30 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Buyurtmangiz qabul qilindi! 🎉
              </h3>
              <p className="text-xs text-gray-500">
                Shartnoma raqami: <span className="font-mono font-bold text-[#640199] dark:text-purple-300">{orderSuccessData.contractNumber}</span>
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Xaridor:</span>
                <span className="font-bold">{orderSuccessData.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Telefon:</span>
                <span className="font-mono">{orderSuccessData.customerPhone}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Jami summa:</span>
                <span className="font-bold">{orderSuccessData.totalPrice.toLocaleString('uz-UZ')} so'm</span>
              </div>
              {orderSuccessData.monthlyPayment && (
                <div className="flex justify-between text-purple-600 dark:text-purple-400 font-semibold">
                  <span>Oylik to'lov:</span>
                  <span>{orderSuccessData.monthlyPayment.toLocaleString('uz-UZ')} so'm/oy</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Operatorimiz 10 daqiqa ichida siz bilan bog'lanib, bepul yetkazib berish vaqtini tasdiqlaydi.
            </p>

            <button
              onClick={() => {
                tgHaptic('light');
                setOrderSuccessData(null);
                setActiveTab('profile');
              }}
              className="w-full py-2.5 rounded-xl bg-[#640199] text-white font-bold text-xs shadow-md"
            >
              Buyurtmalarimga o'tish
            </button>
          </div>
        </div>
      )}

      {/* 10. FIXED NATIVE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 py-2 px-3 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {[
            { id: 'home', label: 'Asosiy', icon: Home },
            { id: 'catalog', label: 'Katalog', icon: Grid },
            { id: 'favorites', label: 'Sevimlilar', icon: Heart, badge: favorites.length },
            { id: 'cart', label: 'Savat', icon: ShoppingCart, badge: cartCount },
            { id: 'profile', label: 'Profil', icon: UserIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  tgHaptic('light');
                  setActiveTab(tab.id as any);
                }}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-[#640199] dark:text-purple-400 font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
export default TelegramMiniApp;
