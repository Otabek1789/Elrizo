import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Crown, 
  ShieldCheck, 
  Package, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  FileText,
  LayoutDashboard,
  BarChart3,
  MapPin,
  Settings,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
  Activity,
  Globe,
  Compass,
  AlertTriangle,
  Menu,
  ChevronLeft,
  Sun,
  Moon,
  ExternalLink,
  Check,
  RefreshCw,
  Eye,
  X,
  Copy,
  Bell,
  Percent,
  Zap,
  Award,
  Tag,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/calculator';
import { ADMIN_EMAIL } from '../lib/supabase';
import { CATEGORIES } from '../data/mockData';
import { Order, Product, PromoCode } from '../types';
import { CustomSelect } from '../components/CustomSelect';

interface RegionCoordinate {
  name: string;
  lat: string;
  lng: string;
  applicationsCount: number;
  totalVolume: number;
  activeRate: string;
  share: number;
}

const BASE_REGIONS = [
  { name: 'Toshkent shahri & viloyati', match: ['toshkent', 'tashkent', 'chilonzor', 'yunusobod', 'mirzo ulug\'bek', 'sergeli', 'uchtepa'], lat: '41.2995° N', lng: '69.2401° E' },
  { name: 'Samarqand viloyati', match: ['samarqand', 'samarkand'], lat: '39.6542° N', lng: '66.9597° E' },
  { name: 'Farg\'ona vodiysi (Farg\'ona/Andijon/Namangan)', match: ['farg\'ona', 'fergana', 'andijon', 'namangan'], lat: '40.3842° N', lng: '71.7843° E' },
  { name: 'Buxoro viloyati', match: ['buxoro', 'bukhara'], lat: '39.7681° N', lng: '64.4217° E' },
  { name: 'Qashqadaryo & Surxondaryo', match: ['qashqadaryo', 'surxondaryo', 'qarshi', 'termiz'], lat: '38.8606° N', lng: '65.7891° E' },
  { name: 'Xorazm & Qoraqalpog\'iston', match: ['xorazm', 'urganch', 'nukus', 'qoraqalpog\'iston'], lat: '41.5562° N', lng: '60.6313° E' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', stiffness: 350, damping: 25 } 
  },
};

interface ChartPoint {
  month: string;
  cx: number;
  cy: number;
  volume: string;
  growth: string;
}

interface ChartDataset {
  subtitle: { uz: string; ru: string; en: string };
  growth: string;
  linePoints: string;
  areaPoints: string;
  points: {
    label: { uz: string; ru: string; en: string };
    cx: number;
    cy: number;
    volume: { uz: string; ru: string; en: string };
    growth: string;
  }[];
}

const TIMEFRAME_LABELS: Record<'1m' | '6m' | '1y', { uz: string; ru: string; en: string }> = {
  '1m': { uz: '1 Oy', ru: '1 Мес', en: '1M' },
  '6m': { uz: '6 Oy', ru: '6 Мес', en: '6M' },
  '1y': { uz: '1 Yil', ru: '1 Год', en: '1Y' },
};

const getDynamicChartDataset = (orders: Order[], timeframe: '1m' | '6m' | '1y', language: string): ChartDataset => {
  const totalVolume = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  if (orders.length === 0 || totalVolume === 0) {
    return {
      subtitle: {
        uz: "Hozircha xaridlar amalga oshirilmagan (0 so'm)",
        ru: "Покупок пока не совершено (0 сум)",
        en: "No purchases made yet (0 UZS)",
      },
      growth: "0%",
      linePoints: "50,220 240,220 440,220 650,220",
      areaPoints: "50,220 50,220 240,220 440,220 650,220 650,220",
      points: [
        { label: { uz: "1-davr", ru: "1-нед", en: "P1" }, cx: 50, cy: 220, volume: { uz: "0 so'm", ru: "0 сум", en: "0 UZS" }, growth: "0%" },
        { label: { uz: "2-davr", ru: "2-нед", en: "P2" }, cx: 240, cy: 220, volume: { uz: "0 so'm", ru: "0 сум", en: "0 UZS" }, growth: "0%" },
        { label: { uz: "3-davr", ru: "3-нед", en: "P3" }, cx: 440, cy: 220, volume: { uz: "0 so'm", ru: "0 сум", en: "0 UZS" }, growth: "0%" },
        { label: { uz: "Hozirgi", ru: "Текущий", en: "Current" }, cx: 650, cy: 220, volume: { uz: "0 so'm", ru: "0 сум", en: "0 UZS" }, growth: "0%" },
      ],
    };
  }

  const orderCount = orders.length;
  const growthRate = `+${Math.min(100, orderCount * 20)}%`;
  const formattedVol = `${(totalVolume / 1000000).toFixed(1)} mln`;
  return {
    subtitle: {
      uz: `Jami rasmiylashtirilgan ${orderCount} ta ariza (${(totalVolume / 1000000).toFixed(1)} mln so'm)`,
      ru: `Всего оформлено ${orderCount} заявок (${(totalVolume / 1000000).toFixed(1)} млн сум)`,
      en: `Total processed ${orderCount} orders (${(totalVolume / 1000000).toFixed(1)}M UZS)`,
    },
    growth: growthRate,
    linePoints: "50,200 240,160 440,110 650,60",
    areaPoints: "50,220 50,200 240,160 440,110 650,60 650,220",
    points: [
      { label: { uz: "Boshlang'ich", ru: "Старт", en: "Start" }, cx: 50, cy: 200, volume: { uz: "0 so'm", ru: "0 сум", en: "0 UZS" }, growth: "0%" },
      { label: { uz: "Arizalar", ru: "Заявки", en: "Orders" }, cx: 240, cy: 160, volume: { uz: `${Math.round(totalVolume * 0.35 / 1000000)} mln`, ru: `${Math.round(totalVolume * 0.35 / 1000000)} млн`, en: `${Math.round(totalVolume * 0.35 / 1000000)}M` }, growth: "+35%" },
      { label: { uz: "Tasdiqlangan", ru: "Одобрено", en: "Approved" }, cx: 440, cy: 110, volume: { uz: `${Math.round(totalVolume * 0.75 / 1000000)} mln`, ru: `${Math.round(totalVolume * 0.75 / 1000000)} млн`, en: `${Math.round(totalVolume * 0.75 / 1000000)}M` }, growth: "+75%" },
      { label: { uz: "Jami", ru: "Всего", en: "Total" }, cx: 650, cy: 60, volume: { uz: formattedVol, ru: formattedVol, en: formattedVol }, growth: growthRate },
    ],
  };
};

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    orders, 
    updateOrderStatus, 
    deleteOrder, 
    products, 
    addProduct, 
    deleteProduct,
    logoutUser,
    addToast,
    theme,
    toggleTheme,
    language,
    setLanguage,
    promoCodes,
    addPromoCode,
    togglePromoCode,
    deletePromoCode
  } = useStore();

  const [activeSection, setActiveSection] = useState<'dashboard' | 'applications' | 'analytics' | 'products' | 'promos' | 'coordinates' | 'customers' | 'settings'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scoring_approved' | 'processing' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);
  const [copiedRegion, setCopiedRegion] = useState<string | null>(null);
  const [activeChartPoint, setActiveChartPoint] = useState<ChartPoint | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'1m' | '6m' | '1y'>('1y');

  // Promokod qo'shish formasi
  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    description: '',
  });
  const [isAddPromoModalOpen, setIsAddPromoModalOpen] = useState(false);

  // Live real-time digital clock
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString('uz-UZ', { hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('uz-UZ', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Yangi tovar formasi
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    originalPrice: '',
    categoryId: CATEGORIES[0].id,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    hasZeroDown: true,
    maxMonths: 24 as 3 | 6 | 12 | 24,
    description: '',
  });

  // Faqat otabek1789@gmail.com uchun xavfsizlik tekshiruvi (oraliq sahifalarsiz darhol yo'naltirish)
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  // Hisob-kitoblar (Real buyurtmalar va Supabase arizalariga asoslangan)
  const totalOrdersCount = orders.length;
  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalMonthlyIncome = orders.reduce((sum, o) => sum + (o.monthlyPayment || 0), 0);
  const approvedCount = orders.filter((o) => o.status === 'scoring_approved' || o.status === 'delivered').length;

  // Muddatlar taqsimoti (Real tanlangan muddatlar foizi)
  const count12 = orders.filter((o) => o.installmentMonths === 12).length;
  const count24 = orders.filter((o) => o.installmentMonths === 24).length;
  const count6 = orders.filter((o) => o.installmentMonths === 6).length;
  const count3 = orders.filter((o) => o.installmentMonths === 3).length;

  const pct12 = totalOrdersCount > 0 ? Math.round((count12 / totalOrdersCount) * 100) : 0;
  const pct24 = totalOrdersCount > 0 ? Math.round((count24 / totalOrdersCount) * 100) : 0;
  const pct6 = totalOrdersCount > 0 ? Math.round((count6 / totalOrdersCount) * 100) : 0;
  const pct3 = totalOrdersCount > 0 ? Math.round((count3 / totalOrdersCount) * 100) : 0;

  // Skoring taqsimoti
  const highScoringCount = orders.filter((o) => (o.scoringScore || 750) >= 750).length;
  const midScoringCount = orders.filter((o) => (o.scoringScore || 750) >= 600 && (o.scoringScore || 750) < 750).length;
  const lowScoringCount = orders.filter((o) => (o.scoringScore || 750) < 600).length;

  const pctHighScoring = totalOrdersCount > 0 ? Math.round((highScoringCount / totalOrdersCount) * 100) : 0;
  const pctMidScoring = totalOrdersCount > 0 ? Math.round((midScoringCount / totalOrdersCount) * 100) : 0;
  const pctLowScoring = totalOrdersCount > 0 ? Math.round((lowScoringCount / totalOrdersCount) * 100) : 0;

  // Viloyatlar bo'yicha dinamik xaritalash
  const dynamicRegions: RegionCoordinate[] = BASE_REGIONS.map((reg) => {
    const matching = orders.filter((o) => {
      const searchStr = (o.deliveryAddress || '').toLowerCase();
      return reg.match.some((m) => searchStr.includes(m));
    });
    const count = matching.length;
    const vol = matching.reduce((sum, o) => sum + o.totalPrice, 0);
    const share = totalOrdersAmount > 0 ? Math.round((vol / totalOrdersAmount) * 100) : 0;
    return {
      name: reg.name,
      lat: reg.lat,
      lng: reg.lng,
      applicationsCount: count,
      totalVolume: vol,
      activeRate: count > 0 ? '100%' : '0%',
      share,
    };
  });

  // Dinamik grafik
  const currentChartData = getDynamicChartDataset(orders, chartTimeframe, language);

  // Filtr
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (o.contractNumber && o.contractNumber.toLowerCase().includes(searchFilter.toLowerCase())) ||
      o.customerPhone.includes(searchFilter);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    const numericPrice = parseFloat(newProduct.price.replace(/\D/g, ''));
    const numericOriginalPrice = newProduct.originalPrice ? parseFloat(newProduct.originalPrice.replace(/\D/g, '')) : undefined;
    const category = CATEGORIES.find(c => c.id === newProduct.categoryId) || CATEGORIES[0];

    const productObj: Product = {
      id: `prod-${Date.now()}`,
      sku: `ELR-${Date.now().toString().slice(-4)}`,
      title: newProduct.title,
      slug: newProduct.title.toLowerCase().replace(/\s+/g, '-'),
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      discountPercentage: numericOriginalPrice ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100) : undefined,
      rating: 5.0,
      reviewsCount: 1,
      images: [newProduct.image],
      categoryId: category.id,
      categoryName: category.name,
      inStock: true,
      stockCount: 10,
      isBestSeller: true,
      hasZeroDown: newProduct.hasZeroDown,
      maxMonths: newProduct.maxMonths,
      specs: {
        'Kafolat': '1 yil rasmiy kafolat',
        'Holati': 'Yangi, original',
      },
      description: newProduct.description || 'Elrizo Nasiya Savdo orqali 0% boshlang\'ich to\'lov bilan rasmiylashtiring.',
      deliveryDays: 1,
    };

    addProduct(productObj);
    addToast(`${newProduct.title} mahsuloti muvaffaqiyatli qo'shildi!`, 'success');
    setNewProduct({
      title: '',
      price: '',
      originalPrice: '',
      categoryId: CATEGORIES[0].id,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      hasZeroDown: true,
      maxMonths: 24,
      description: '',
    });
  };

  const handleRefreshCache = () => {
    setIsRefreshingCache(true);
    setTimeout(() => {
      setIsRefreshingCache(false);
      addToast("Kesh va Supabase sinxronizatsiyasi yangilandi!", 'success');
    }, 700);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newPromo.code.trim().toUpperCase();
    const val = Number(newPromo.discountValue);
    if (!cleanCode || !val || isNaN(val) || val <= 0) {
      addToast(language === 'ru' ? 'Заполните код и сумму скидки корректно' : language === 'en' ? 'Fill valid code and discount value' : "Promokod kodi va qiymatini to'g'ri kiriting", 'warning');
      return;
    }

    const promoObj: PromoCode = {
      id: `promo-${Date.now()}`,
      code: cleanCode,
      discountType: newPromo.discountType,
      discountValue: val,
      description: newPromo.description.trim() || `${cleanCode} maxsus aksiyasi`,
      isActive: true,
      usageCount: 0,
    };

    addPromoCode(promoObj);
    addToast(`${cleanCode} promokodi muvaffaqiyatli yaratildi!`, 'success');
    setNewPromo({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      description: '',
    });
    setIsAddPromoModalOpen(false);
  };

  const handleCopyGps = (name: string, lat: string, lng: string) => {
    navigator.clipboard?.writeText(`${lat}, ${lng}`);
    setCopiedRegion(name);
    addToast(`${name} GPS koordinatasi nusxalandi!`, 'info');
    setTimeout(() => setCopiedRegion(null), 2000);
  };

  interface NavItem {
    id: 'dashboard' | 'applications' | 'analytics' | 'products' | 'promos' | 'coordinates' | 'customers' | 'settings';
    labelUz: string;
    labelRu: string;
    labelEn: string;
    icon: any;
    count?: number;
    iconColor?: string;
  }

  interface NavSection {
    titleUz: string;
    titleRu: string;
    titleEn: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      titleUz: 'Boshqaruv',
      titleRu: 'Управление',
      titleEn: 'Management',
      items: [
        { id: 'dashboard', labelUz: 'Dashboard Overview', labelRu: 'Дашборд', labelEn: 'Dashboard', icon: LayoutDashboard },
        { id: 'applications', labelUz: 'Nasiya Arizalari', labelRu: 'Заявки', labelEn: 'Applications', icon: FileText, count: orders.length },
        { id: 'analytics', labelUz: 'Grafikalar & Tahlil', labelRu: 'Аналитика', labelEn: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      titleUz: 'Katalog & Savdo',
      titleRu: 'Каталог и продажи',
      titleEn: 'Catalog & Sales',
      items: [
        { id: 'products', labelUz: 'Mahsulotlar Bazasi', labelRu: 'Товары', labelEn: 'Products', icon: Package, count: products.length },
        { id: 'promos', labelUz: 'Promokodlar', labelRu: 'Промокоды', labelEn: 'Promo Codes', icon: Tag, count: promoCodes.length },
        { id: 'coordinates', labelUz: 'Viloyatlar & GPS', labelRu: 'Регионы (GPS)', labelEn: 'Regions (GPS)', icon: Compass, iconColor: 'text-emerald-500' },
      ],
    },
    {
      titleUz: 'Mijozlar & Tizim',
      titleRu: 'Клиенты и система',
      titleEn: 'Customers & System',
      items: [
        { id: 'customers', labelUz: 'Mijozlar CRM', labelRu: 'Клиенты CRM', labelEn: 'Customers CRM', icon: Users },
        { id: 'settings', labelUz: 'Tizim Sozlamalari', labelRu: 'Настройки', labelEn: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="h-full w-full bg-[#F8F9FA] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 flex overflow-hidden selection:bg-purple-200 selection:text-purple-900">
      {/* 1. PROFESSIONAL ENTERPRISE COLLAPSIBLE SIDEBAR */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-800 flex flex-col h-full shrink-0 relative z-30 shadow-sm dark:shadow-2xl transition-colors"
      >
        {/* Sidebar Brand Header */}
        {isSidebarCollapsed ? (
          <div className="p-3.5 flex flex-col items-center justify-center gap-2 border-b border-gray-100 dark:border-slate-800/80 shrink-0">
            <motion.div 
              whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 shadow-md shadow-amber-500/25 shrink-0 cursor-pointer"
              title="ELRIZO Admin (Kengaytirish)"
            >
              <Crown className="w-5 h-5 fill-slate-950 text-slate-950" />
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.25, x: 2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Kengaytirish"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <motion.div 
                whileHover={{ rotate: [0, -12, 12, -6, 6, 0], scale: 1.15 }}
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-900 shadow-md shadow-amber-500/25 shrink-0 cursor-pointer"
              >
                <Crown className="w-5 h-5 fill-slate-950 text-slate-950" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col truncate"
              >
                <span className="text-sm font-black text-gray-900 dark:text-white tracking-wide">ELRIZO ADMIN</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Super Administrator
                </span>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Kichraytirish"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {/* Scrollable Navigation & Quick Metrics Snapshot */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
          {navSections.map((section, sIdx) => {
            const sectionTitle = language === 'ru' ? section.titleRu : language === 'en' ? section.titleEn : section.titleUz;
            return (
              <div key={sIdx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    {sectionTitle}
                  </div>
                )}
                {isSidebarCollapsed && sIdx > 0 && (
                  <div className="my-2 border-t border-gray-100 dark:border-slate-800/80 mx-2" />
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeSection === item.id;
                    const label = language === 'ru' ? item.labelRu : language === 'en' ? item.labelEn : item.labelUz;

                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: isSidebarCollapsed ? 0 : 4, scale: isSidebarCollapsed ? 1.06 : 1.01 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveSection(item.id)}
                        title={isSidebarCollapsed ? label : undefined}
                        className={`relative w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl transition-all ${
                          isSelected
                            ? 'text-white font-black shadow-md'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800'
                        }`}
                      >
                        {/* Active sliding pill */}
                        {isSelected && (
                          <motion.div
                            layoutId="adminSidebarActivePill"
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 rounded-xl -z-10 shadow-lg shadow-purple-600/30"
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          />
                        )}

                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} relative z-10`}>
                          <motion.div
                            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Icon className={`w-4.5 h-4.5 shrink-0 ${'iconColor' in item && item.iconColor ? item.iconColor : ''}`} />
                          </motion.div>
                          {!isSidebarCollapsed && <span className="text-xs font-bold">{label}</span>}
                        </div>

                        {!isSidebarCollapsed && item.count !== undefined && (
                          <motion.span 
                            key={item.count}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold relative z-10 transition-colors ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                            }`}
                          >
                            {item.count}
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quick Metrics Snapshot */}
          {!isSidebarCollapsed && (
            <div className="pt-2">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-purple-600/10 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-purple-900/30 border border-purple-200/60 dark:border-purple-800/40 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-black text-gray-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {language === 'ru' ? 'Сводка данных' : language === 'en' ? 'Quick Snapshot' : "Tezkor ko'rsatkichlar"}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 shadow-xs">
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                      {language === 'ru' ? 'Товары' : language === 'en' ? 'Products' : 'Tovarlar'}
                    </div>
                    <div className="text-sm font-black text-purple-600 dark:text-purple-400">
                      {products.length}
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 shadow-xs">
                    <div className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                      {language === 'ru' ? 'Заявки' : language === 'en' ? 'Orders' : 'Arizalar'}
                    </div>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {orders.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-800/80 space-y-2 shrink-0 bg-white dark:bg-slate-800">
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/50 text-[11px] space-y-1"
            >
              <div className="text-gray-500 dark:text-slate-400">Tizim holati:</div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Supabase Cloud Online</span>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05, x: isSidebarCollapsed ? 0 : 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              logoutUser();
              navigate('/login', { replace: true });
            }}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 p-2.5'} text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors`}
            title={isSidebarCollapsed ? (language === 'ru' ? 'Выйти' : language === 'en' ? 'Log out' : 'Tizimdan chiqish') : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{language === 'ru' ? 'Выйти' : language === 'en' ? 'Log out' : 'Tizimdan chiqish'}</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Navbar with Language and Theme Switcher */}
        <header className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/', { replace: true });
              }}
              className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors flex items-center gap-2 text-xs font-bold border border-gray-200 dark:border-slate-700 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'ru' ? 'В магазин' : language === 'en' ? 'Back to Store' : "Do'konga qaytish"}</span>
            </button>

            {/* Animated Title */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeSection}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-base sm:text-lg font-black text-gray-900 dark:text-white"
              >
                {activeSection === 'dashboard' && (language === 'ru' ? 'Панель управления' : language === 'en' ? 'Dashboard Overview' : 'Boshqaruv Paneli & Umumiy Holat')}
                {activeSection === 'applications' && (language === 'ru' ? 'Заявки на рассрочку' : language === 'en' ? 'Installment Applications' : 'Nasiya Savdo Arizalari va Shartnomalar')}
                {activeSection === 'analytics' && (language === 'ru' ? 'Финансовая аналитика' : language === 'en' ? 'Analytics & Charts' : 'Moliyaviy Statistikalar va Dinamik Grafikalar')}
                {activeSection === 'promos' && (language === 'ru' ? 'Управление промокодами' : language === 'en' ? 'Promo Codes Management' : 'Promokodlar va Chegirmalar Boshqaruvi')}
                {activeSection === 'coordinates' && (language === 'ru' ? 'Регионы и GPS координаты' : language === 'en' ? 'Regions & GPS Coordinates' : 'Viloyatlar Geografiyasi va GPS Koordinatalari')}
                {activeSection === 'products' && (language === 'ru' ? 'Каталог товаров' : language === 'en' ? 'Products & Inventory' : "Mahsulotlar Katalogi va Yangi Tovar Qo'shish")}
                {activeSection === 'customers' && (language === 'ru' ? 'База клиентов (CRM)' : language === 'en' ? 'Customer CRM' : 'Mijozlar Portfeli va Skoring Tahlili')}
                {activeSection === 'settings' && (language === 'ru' ? 'Настройки системы' : language === 'en' ? 'System Settings' : 'Platforma va Supabase Sozlamalari')}
              </motion.h2>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Digital Clock Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-9 hidden lg:flex items-center gap-1.5 px-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono font-bold text-gray-700 dark:text-slate-300 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-spin" style={{ animationDuration: '20s' }} />
              <span>{currentTime}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </motion.div>

            {/* Notification Bell with exact square w-9 h-9 and centered icon */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="admin-bell-btn relative w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 flex items-center justify-center cursor-pointer shadow-xs transition-colors shrink-0"
              onClick={() => addToast("Yangi arizalar va tizim xabarnomalari o'z vaqtida yetkazilmoqda", 'info')}
              title={language === 'ru' ? 'Уведомления' : language === 'en' ? 'Notifications' : 'Bildirishnomalar'}
            >
              <Bell className="w-4 h-4 admin-bell-icon" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            </motion.button>

            {/* Language Switcher */}
            <div className="h-9 flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold shadow-xs">
              <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 mx-1.5" />
              {(['uz', 'ru', 'en'] as const).map((lang) => (
                <motion.button
                  key={lang}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg uppercase text-[11px] font-extrabold transition-all ${
                    language === lang
                      ? 'bg-uzum-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {lang}
                </motion.button>
              ))}
            </div>

            {/* Theme Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.15 }}
              onClick={toggleTheme}
              className="h-9 px-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs select-none"
              title={theme === 'dark' ? (language === 'ru' ? 'Светлый режим' : language === 'en' ? 'Light mode' : "Yorug' rejim") : (language === 'ru' ? 'Тёмный режим' : language === 'en' ? 'Dark mode' : 'Tungi rejim')}
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div
                    key="dark"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline text-[11px]">{language === 'ru' ? 'Светлый' : language === 'en' ? 'Light' : "Yorug'"}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="light"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <Moon className="w-4 h-4 text-uzum-primary" />
                    <span className="hidden md:inline text-[11px]">{language === 'ru' ? 'Тёмный' : language === 'en' ? 'Dark' : 'Tungi'}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-900 dark:text-white">Otabek Jo'rayev</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">otabek1789@gmail.com</div>
            </div>
            
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0 rgba(245, 158, 11, 0)', '0 0 16px rgba(245, 158, 11, 0.5)', '0 0 0 rgba(245, 158, 11, 0)']
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md select-none cursor-pointer"
            >
              <Crown className="w-5 h-5 text-slate-950" />
            </motion.div>
          </div>
        </header>

        {/* Dynamic Section Contents with AnimatePresence */}
        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* SECTION: DASHBOARD */}
            {activeSection === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Stat Cards in Staggered Grid */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.025 }}
                    className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl dark:shadow-lg transition-all group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 group-hover:h-1.5 transition-all" />
                    <div className="flex justify-between items-center text-gray-500 dark:text-slate-400 text-xs font-bold">
                      <span>{language === 'ru' ? 'ВСЕГО ЗАЯВОК' : language === 'en' ? 'TOTAL APPLICATIONS' : 'JAMI ARIZALAR'}</span>
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.25 }}
                        transition={{ duration: 0.5 }}
                        className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60"
                      >
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2 flex items-baseline gap-1">
                      <span>{orders.length}</span>
                      <span className="text-xs font-bold text-gray-400">
                        {language === 'ru' ? 'заявок' : language === 'en' ? 'applications' : 'ta ariza'}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span>100% Cloud & LocalStorage</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.025 }}
                    className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl dark:shadow-lg transition-all group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 group-hover:h-1.5 transition-all" />
                    <div className="flex justify-between items-center text-gray-500 dark:text-slate-400 text-xs font-bold">
                      <span>{language === 'ru' ? 'ПОРТФЕЛЬ РАССРОЧКИ' : language === 'en' ? 'INSTALLMENT PORTFOLIO' : 'NASIYA PORTFELI'}</span>
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.25 }}
                        transition={{ duration: 0.5 }}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60"
                      >
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    </div>
                    <div className="text-xl font-black text-gray-900 dark:text-white mt-2">{formatPrice(totalOrdersAmount, true, language)}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === 'ru' ? 'Одобренные договоры' : language === 'en' ? 'Approved contracts' : 'Tasdiqlangan shartnomalar'}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.025 }}
                    className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl dark:shadow-lg transition-all group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 group-hover:h-1.5 transition-all" />
                    <div className="flex justify-between items-center text-gray-500 dark:text-slate-400 text-xs font-bold">
                      <span>{language === 'ru' ? 'ЕЖЕМЕСЯЧНЫЙ ПОТОК' : language === 'en' ? 'MONTHLY CASHFLOW' : 'OYLIK TUSHUM'}</span>
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.25 }}
                        transition={{ duration: 0.5 }}
                        className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60"
                      >
                        <TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      </motion.div>
                    </div>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-300 mt-2">{formatPrice(totalMonthlyIncome, true, language)}/{language === 'ru' ? 'мес' : language === 'en' ? 'mo' : 'oy'}</div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{language === 'ru' ? 'График платежей' : language === 'en' ? 'Payment schedule' : 'Rejalashtirilgan oylik grafik'}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.025 }}
                    className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl dark:shadow-lg transition-all group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 group-hover:h-1.5 transition-all" />
                    <div className="flex justify-between items-center text-gray-500 dark:text-slate-400 text-xs font-bold">
                      <span>{language === 'ru' ? 'ТОВАРОВ В КАТАЛОГЕ' : language === 'en' ? 'STORE PRODUCTS' : "DO'KONDA TOVARLAR"}</span>
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.25 }}
                        transition={{ duration: 0.5 }}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60"
                      >
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                      {products.length} {language === 'ru' ? 'шт' : language === 'en' ? 'items' : 'dona'}
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{language === 'ru' ? 'С условием 0-0-12' : language === 'en' ? 'With 0-0-12 terms' : '0-0-12 sharti bilan'}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* JONLI GRAFIKALAR (Animated Charts) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* SVG Area Line Chart with Path Animation */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition-colors relative"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                          <span>{language === 'ru' ? 'Динамика рассрочки (2026)' : language === 'en' ? 'Installment Growth Dynamics (2026)' : "Nasiya Savdo O'sish Dinamikasi (2026)"}</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {currentChartData.subtitle[language as 'uz' | 'ru' | 'en'] || currentChartData.subtitle.uz}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Timeframe selector (O'zbekcha / Ruscha / Inglizcha) */}
                        <div className="flex items-center bg-gray-100 dark:bg-slate-900 p-0.5 rounded-xl border border-gray-200 dark:border-slate-700 text-[11px] font-bold">
                          {(['1m', '6m', '1y'] as const).map((tf) => (
                            <motion.button
                              key={tf}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setChartTimeframe(tf);
                                setActiveChartPoint(null);
                              }}
                              className={`px-3 py-1 rounded-lg uppercase transition-all ${
                                chartTimeframe === tf 
                                  ? 'bg-purple-600 text-white shadow-xs font-black' 
                                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              {TIMEFRAME_LABELS[tf][language as 'uz' | 'ru' | 'en'] || TIMEFRAME_LABELS[tf].uz}
                            </motion.button>
                          ))}
                        </div>

                        <motion.span 
                          key={chartTimeframe}
                          initial={{ scale: 0.9 }}
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-xs font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-500/30 shadow-xs"
                        >
                          {currentChartData.growth} {language === 'ru' ? 'Рост' : language === 'en' ? 'Growth' : "O'sish"}
                        </motion.span>
                      </div>
                    </div>

                    {/* Interactive Active Point Floating Tooltip */}
                    <AnimatePresence>
                      {activeChartPoint && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute top-20 right-8 z-20 p-3 bg-purple-900/90 text-white rounded-2xl shadow-xl backdrop-blur-md border border-purple-500/40 text-xs space-y-1"
                        >
                          <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{language === 'ru' ? `Статистика за ${activeChartPoint.month}:` : language === 'en' ? `Stats for ${activeChartPoint.month}:` : `${activeChartPoint.month} statistikasi:`}</span>
                          </div>
                          <div>{language === 'ru' ? 'Общий объем:' : language === 'en' ? 'Total volume:' : 'Umumiy hajm:'} <strong className="text-white">{activeChartPoint.volume}</strong></div>
                          <div>{language === 'ru' ? 'Темп роста:' : language === 'en' ? 'Growth rate:' : "O'sish sur'ati:"} <strong className="text-emerald-300">{activeChartPoint.growth}</strong></div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* SVG Chart with Animated Lines & Points */}
                    <div className="h-64 w-full pt-4">
                      <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7000FF" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#7000FF" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="0" y1="40" x2="700" y2="40" stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} strokeDasharray="4" />
                        <line x1="0" y1="100" x2="700" y2="100" stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} strokeDasharray="4" />
                        <line x1="0" y1="160" x2="700" y2="160" stroke={theme === 'dark' ? '#334155' : '#E2E8F0'} strokeDasharray="4" />
                        <line x1="0" y1="220" x2="700" y2="220" stroke={theme === 'dark' ? '#334155' : '#CBD5E1'} />

                        {/* Area Fill */}
                        <motion.polygon
                          key={`poly-${chartTimeframe}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6 }}
                          points={currentChartData.areaPoints}
                          fill="url(#areaGradient)"
                        />

                        {/* Animated Trend Line */}
                        <motion.polyline
                          key={`line-${chartTimeframe}`}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="4"
                          strokeLinecap="round"
                          points={currentChartData.linePoints}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9, ease: 'easeInOut' }}
                        />

                        {/* Interactive Data Points */}
                        {currentChartData.points.map((pt, idx) => {
                          const pLabel = pt.label[language as 'uz' | 'ru' | 'en'] || pt.label.uz;
                          const pVolume = pt.volume[language as 'uz' | 'ru' | 'en'] || pt.volume.uz;
                          const isHovered = activeChartPoint?.month === pLabel;
                          return (
                            <g key={`${chartTimeframe}-${idx}`}>
                              <motion.circle
                                cx={pt.cx}
                                cy={pt.cy}
                                r={isHovered ? "8" : "6"}
                                fill="#FBBF24"
                                stroke={theme === 'dark' ? '#1E293B' : '#FFFFFF'}
                                strokeWidth="2.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.08 + idx * 0.06, type: 'spring' }}
                                whileHover={{ scale: 2.2, r: 8 }}
                                onMouseEnter={() => setActiveChartPoint({
                                  month: pLabel,
                                  cx: pt.cx,
                                  cy: pt.cy,
                                  volume: pVolume,
                                  growth: pt.growth,
                                })}
                                onMouseLeave={() => setActiveChartPoint(null)}
                                className="cursor-pointer"
                              />
                              {/* Animated pulsing outer halo */}
                              <motion.circle
                                cx={pt.cx}
                                cy={pt.cy}
                                r="12"
                                fill="#8B5CF6"
                                opacity="0.25"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
                                transition={{ repeat: Infinity, duration: 2.5, delay: idx * 0.2 }}
                                className="pointer-events-none"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Bottom Period/Month Labels */}
                      <div className="flex justify-between text-[11px] text-gray-500 dark:text-slate-400 font-bold pt-2 px-2">
                        {currentChartData.points.map((p, idx) => {
                          const pLabel = p.label[language as 'uz' | 'ru' | 'en'] || p.label.uz;
                          const isSelected = activeChartPoint?.month === pLabel;
                          return (
                            <span 
                              key={`${chartTimeframe}-${idx}`}
                              onClick={() => setActiveChartPoint({
                                month: pLabel,
                                cx: p.cx,
                                cy: p.cy,
                                volume: p.volume[language as 'uz' | 'ru' | 'en'] || p.volume.uz,
                                growth: p.growth,
                              })}
                              className={`cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'text-purple-600 dark:text-purple-400 font-black scale-110' 
                                  : 'hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              {pLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Donut / Tenure Distribution with Animated Progress Bars */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{language === 'ru' ? 'Распределение сроков' : language === 'en' ? 'Tenure Distribution' : 'Muddatlar Taqsimoti'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'Сроки рассрочки, выбранные покупателями' : language === 'en' ? 'Tenures selected by customers' : 'Xaridorlar tanlagan muddatlar'}
                      </p>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <motion.div whileHover={{ x: 5 }} className="transition-transform cursor-pointer">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-700 dark:text-slate-200">
                            {language === 'ru' ? '12 мес (Популярный)' : language === 'en' ? '12 mo (Most popular)' : '12 oy (Eng ommabop)'}
                          </span>
                          <span className="text-amber-500 dark:text-amber-400 font-extrabold">{pct12}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct12}%` }}
                            transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} className="transition-transform cursor-pointer">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-700 dark:text-slate-200">
                            {language === 'ru' ? '24 мес (Бытовая техника)' : language === 'en' ? '24 mo (Appliances)' : '24 oy (Katta maishiy texnika)'}
                          </span>
                          <span className="text-purple-600 dark:text-purple-400 font-extrabold">{pct24}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct24}%` }}
                            transition={{ duration: 1.2, delay: 0.35, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} className="transition-transform cursor-pointer">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-700 dark:text-slate-200">
                            {language === 'ru' ? '6 мес (Короткий срок)' : language === 'en' ? '6 mo (Short term)' : '6 oy (Qisqa muddat)'}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{pct6}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct6}%` }}
                            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>

                      <motion.div whileHover={{ x: 5 }} className="transition-transform cursor-pointer">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-gray-700 dark:text-slate-200">
                            {language === 'ru' ? '3 мес (0% без переплат)' : language === 'en' ? '3 mo (0% without markup)' : '3 oy (0% Ustamasiz 0-0-12)'}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-extrabold">{pct3}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden shadow-inner">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct3}%` }}
                            transition={{ duration: 1.2, delay: 0.65, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-200 font-medium flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>
                        {totalOrdersCount > 0 
                          ? (language === 'ru' 
                              ? `${pct12 + pct24}% покупателей предпочитают рассрочку на 12 и 24 месяца.` 
                              : language === 'en' 
                              ? `${pct12 + pct24}% of customers choose 12 and 24 month installment plans.` 
                              : `Xaridorlarning ${pct12 + pct24}% qismi 12 va 24 oylik muddatli to'lovni afzal ko'rmoqda.`)
                          : (language === 'ru'
                              ? 'Пока нет оформленных заказов на рассрочку (0%).'
                              : language === 'en'
                              ? 'No installment orders placed yet (0%).'
                              : "Hozircha rasmiylashtirilgan nasiya arizalari mavjud emas (0%).")
                        }
                      </span>
                    </motion.div>
                  </motion.div>
                </div>

                {/* JONLI OXIRGI ARIZALAR OQIMI (Live Stream Feed) */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-sm font-black text-gray-900 dark:text-white">
                        {language === 'ru' ? 'Лента заявок (Последние заказы)' : language === 'en' ? 'Live Stream (Recent orders)' : 'Jonli Nasiya Oqimi (Oxirgi buyurtmalar)'}
                      </h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSection('applications')}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
                    >
                      <span>{language === 'ru' ? 'Смотреть все заявки' : language === 'en' ? 'View all applications' : "Barcha arizalarni ko'rish"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                      {language === 'ru' ? 'Заявок пока нет' : language === 'en' ? 'No applications yet' : "Hozircha arizalar mavjud emas"}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase text-gray-500 dark:text-slate-400">
                            <th className="py-3 px-4">{language === 'ru' ? '№ Договора' : language === 'en' ? 'Contract #' : 'Shartnoma #'}</th>
                            <th className="py-3 px-4">{language === 'ru' ? 'Клиент' : language === 'en' ? 'Customer' : 'Mijoz'}</th>
                            <th className="py-3 px-4">{language === 'ru' ? 'Срок' : language === 'en' ? 'Term' : 'Muddat'}</th>
                            <th className="py-3 px-4">{language === 'ru' ? 'Сумма' : language === 'en' ? 'Total' : 'Jami summa'}</th>
                            <th className="py-3 px-4">{language === 'ru' ? 'В месяц' : language === 'en' ? 'Monthly' : "Oylik to'lov"}</th>
                            <th className="py-3 px-4">{language === 'ru' ? 'Скоринг' : language === 'en' ? 'Scoring' : 'Skoring'}</th>
                            <th className="py-3 px-4">{language === 'ru' ? 'Статус' : language === 'en' ? 'Status' : 'Holat'}</th>
                            <th className="py-3 px-4 text-right">{language === 'ru' ? 'Действие' : language === 'en' ? 'Action' : 'Ko\'rish'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                          {orders.slice(0, 5).map((ord) => (
                            <motion.tr 
                              key={ord.id} 
                              whileHover={{ backgroundColor: theme === 'dark' ? '#1e293b50' : '#faf5ff' }}
                              onClick={() => setSelectedOrder(ord)} 
                              className="cursor-pointer transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                                {ord.contractNumber || ord.id}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                                {ord.customerName}
                              </td>
                              <td className="py-3.5 px-4 text-gray-500 dark:text-slate-400 font-medium">
                                {ord.installmentMonths || 12} {language === 'ru' ? 'мес' : language === 'en' ? 'mo' : 'oy'}
                              </td>
                              <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400">
                                {formatPrice(ord.totalPrice, true, language)}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                                {formatPrice(ord.monthlyPayment || Math.round(ord.totalPrice / (ord.installmentMonths || 12)), true, language)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                                  {ord.scoringScore || 795} {language === 'ru' ? 'баллов' : language === 'en' ? 'pts' : 'ball'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                                  {ord.status === 'scoring_approved' ? (language === 'ru' ? 'Одобрено' : language === 'en' ? 'Approved' : 'Tasdiqlangan') : ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 justify-end ml-auto">
                                  <span>{language === 'ru' ? 'Детали' : language === 'en' ? 'Details' : 'Batafsil'}</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* SECTION: VILOYATLAR & KOORDINATALAR (GEO COORDINATES) */}
            {activeSection === 'coordinates' && (
              <motion.div 
                key="coordinates"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                        <span>{language === 'ru' ? 'Координаты рассрочки по регионам Узбекистана' : language === 'en' ? 'Installment Coordinates Across Uzbekistan Regions' : "O'zbekiston Viloyatlari bo'yicha Nasiya Koordinatalari"}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'Плотность и статистика заявок на рассрочку по координатам GPS' : language === 'en' ? 'Density and statistics of installment applications by GPS coordinates' : "GPS kenglik va uzunlik koordinatalari bo'yicha Nasiya arizalari zichligi va statistikasi"}
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>
                        {totalOrdersCount > 0 
                          ? (language === 'ru' 
                              ? `${dynamicRegions.filter(r => r.applicationsCount > 0).length} активных региональных кластеров` 
                              : language === 'en' 
                              ? `${dynamicRegions.filter(r => r.applicationsCount > 0).length} active regional clusters` 
                              : `${dynamicRegions.filter(r => r.applicationsCount > 0).length} ta faol hududiy klaster`)
                          : (language === 'ru' ? '0 активных заявок' : language === 'en' ? '0 active orders' : '0 ta faol buyurtma')
                        }
                      </span>
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">{language === 'ru' ? 'Регион' : language === 'en' ? 'Region' : 'Viloyat / Hudud'}</th>
                          <th className="py-3 px-4">{language === 'ru' ? 'GPS Широта' : language === 'en' ? 'GPS Latitude' : 'GPS Kenglik'}</th>
                          <th className="py-3 px-4">{language === 'ru' ? 'GPS Долгота' : language === 'en' ? 'GPS Longitude' : 'GPS Uzunlik'}</th>
                          <th className="py-3 px-4">{language === 'ru' ? 'Заявки' : language === 'en' ? 'Applications' : 'Arizalar soni'}</th>
                          <th className="py-3 px-4">{language === 'ru' ? 'Общий объем' : language === 'en' ? 'Total volume' : 'Umumiy hajm'}</th>
                          <th className="py-3 px-4">{language === 'ru' ? 'Копия' : language === 'en' ? 'Copy' : 'Ulashish/Nusxa'}</th>
                          <th className="py-3 px-4">{language === 'ru' ? 'Дисциплина оплат' : language === 'en' ? 'Payment rate' : "To'lov intizomi"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 text-gray-700 dark:text-slate-200">
                        {dynamicRegions.map((reg, idx) => (
                          <motion.tr 
                            key={idx}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ x: 6, backgroundColor: theme === 'dark' ? '#33415530' : '#f8fafc' }}
                            className="transition-colors cursor-default"
                          >
                            <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <motion.div whileHover={{ scale: 1.3, rotate: 15 }}>
                                <MapPin className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                              </motion.div>
                              <span>{reg.name}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-purple-600 dark:text-purple-300">{reg.lat}</td>
                            <td className="py-3.5 px-4 font-mono text-purple-600 dark:text-purple-300">{reg.lng}</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                              <div className="flex items-center gap-2">
                                <span>{reg.applicationsCount} {language === 'ru' ? 'шт' : language === 'en' ? 'apps' : 'ta'}</span>
                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-emerald-500" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${reg.share}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-gray-900 dark:text-white">{formatPrice(reg.totalVolume, true, language)}</td>
                            <td className="py-3.5 px-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCopyGps(reg.name, reg.lat, reg.lng)}
                                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-600 flex items-center gap-1 font-bold text-[11px] transition-colors"
                              >
                                {copiedRegion === reg.name ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-600">{language === 'ru' ? 'Скопировано' : language === 'en' ? 'Copied' : 'Nusxalandi'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{language === 'ru' ? 'Копировать' : language === 'en' ? 'Copy' : 'Nusxalash'}</span>
                                  </>
                                )}
                              </motion.button>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                                {reg.activeRate}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: APPLICATIONS TABLE */}
            {activeSection === 'applications' && (
              <motion.div 
                key="applications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span>{language === 'ru' ? 'Договоры рассрочки' : language === 'en' ? 'Installment Contracts' : 'Nasiya Savdo Shartnomalari'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Нажмите на любую строку для просмотра полного досье' : language === 'en' ? 'Click on any row to view customer dossier' : "Mijoz ma'lumotlarini to'liq ko'rish uchun istalgan qatorni bosing"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder={language === 'ru' ? 'Имя клиента или договор...' : language === 'en' ? 'Customer name or contract...' : 'Mijoz ismi yoki shartnoma...'}
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-purple-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-all focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                      />
                      <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Animated Filter Pills */}
                    <div className="flex items-center bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold">
                      {[
                        { id: 'all', label: language === 'ru' ? 'Все' : language === 'en' ? 'All' : 'Barchasi' },
                        { id: 'scoring_approved', label: language === 'ru' ? 'Одобрено' : language === 'en' ? 'Approved' : 'Tasdiqlangan' },
                        { id: 'processing', label: language === 'ru' ? 'В обработке' : language === 'en' ? 'Processing' : 'Jarayonda' },
                        { id: 'delivered', label: language === 'ru' ? 'Доставлено' : language === 'en' ? 'Delivered' : 'Yetkazildi' }
                      ].map((tab) => (
                        <motion.button
                          key={tab.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setStatusFilter(tab.id as any)}
                          className={`relative px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                            statusFilter === tab.id 
                              ? 'text-white' 
                              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {statusFilter === tab.id && (
                            <motion.div 
                              layoutId="activeFilterPill"
                              className="absolute inset-0 bg-purple-600 rounded-lg shadow-sm -z-10"
                              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            />
                          )}
                          <span>{tab.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60 text-gray-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3">{language === 'ru' ? 'Договор №' : language === 'en' ? 'Contract №' : 'Shartnoma №'}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Клиент и ПИНФЛ' : language === 'en' ? 'Customer & PINFL' : 'Mijoz & PINFL'}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Телефон' : language === 'en' ? 'Phone' : 'Telefon'}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Срок' : language === 'en' ? 'Tenure' : 'Muddat'}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Ежемес. платеж' : language === 'en' ? 'Monthly payment' : "Oylik to'lov"}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Общая сумма' : language === 'en' ? 'Total sum' : 'Jami summa'}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Скоринг' : language === 'en' ? 'Scoring' : 'Skoring'}</th>
                        <th className="py-3 px-3">{language === 'ru' ? 'Статус' : language === 'en' ? 'Status' : 'Holat'}</th>
                        <th className="py-3 px-3 text-right">{language === 'ru' ? 'Действия' : language === 'en' ? 'Actions' : 'Amallar'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50 text-gray-700 dark:text-slate-300">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-400 dark:text-slate-500">
                            {language === 'ru' ? 'Заявок не найдено' : language === 'en' ? 'No applications found' : 'Hech qanday ariza topilmadi'}
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord, idx) => (
                          <motion.tr 
                            key={ord.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ backgroundColor: theme === 'dark' ? '#33415535' : '#f8fafc', scale: 1.002 }}
                            className="transition-colors cursor-pointer group"
                            onClick={() => setSelectedOrder(ord)}
                          >
                            <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span>{ord.contractNumber || ord.id}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{ord.customerName}</div>
                              <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{ord.pinfl || '31204956780012'}</div>
                            </td>
                            <td className="py-3 px-3 font-mono">{ord.customerPhone}</td>
                            <td className="py-3 px-3">
                              <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                {ord.installmentMonths ? `${ord.installmentMonths} ${language === 'ru' ? 'мес' : language === 'en' ? 'mo' : 'oy'}` : (language === 'ru' ? 'Наличные' : language === 'en' ? 'Cash' : 'Naqd')}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                              {formatPrice(ord.monthlyPayment || 0, true, language)}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-amber-600 dark:text-amber-300">
                              {formatPrice(ord.totalPrice, true, language)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {ord.scoringScore || 795} {language === 'ru' ? 'баллов' : language === 'en' ? 'pts' : 'ball'}
                              </span>
                            </td>
                            <td className="py-3 px-3 min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                              <CustomSelect
                                size="sm"
                                value={ord.status}
                                onChange={(val) => updateOrderStatus(ord.id, val as Order['status'])}
                                buttonClassName="!py-1 !px-2.5 text-[11px] font-bold rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs"
                                dropdownClassName="w-44 !z-50"
                                options={[
                                  { value: 'scoring_approved', label: language === 'ru' ? 'Одобрено' : language === 'en' ? 'Approved' : 'Tasdiqlangan', badge: 'Skoring' },
                                  { value: 'processing', label: language === 'ru' ? 'В обработке' : language === 'en' ? 'Processing' : 'Jarayonda' },
                                  { value: 'delivered', label: language === 'ru' ? 'Доставлено' : language === 'en' ? 'Delivered' : 'Yetkazildi' },
                                  { value: 'pending', label: language === 'ru' ? 'Ожидание' : language === 'en' ? 'Pending' : 'Kutilmoqda' },
                                ]}
                              />
                            </td>
                            <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <motion.button
                                whileHover={{ scale: 1.25, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteOrder(ord.id)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                title={language === 'ru' ? 'Удалить' : language === 'en' ? 'Delete' : "O'chirish"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SECTION: PRODUCTS */}
            {activeSection === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Form */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                  <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 pb-3">
                    <motion.div 
                      whileHover={{ rotate: 180 }}
                      className="p-1 rounded-lg bg-purple-50 dark:bg-purple-950/60"
                    >
                      <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </motion.div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {language === 'ru' ? 'Добавить товар' : language === 'en' ? 'Add Product' : "Yangi Mahsulot Qo'shish"}
                    </h3>
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                        {language === 'ru' ? 'Название товара *' : language === 'en' ? 'Product Name *' : 'Mahsulot nomi *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                        placeholder="iPhone 16 Pro Max 512GB"
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {language === 'ru' ? 'Цена (сум) *' : language === 'en' ? 'Price (UZS) *' : 'Narxi (so\'m) *'}
                        </label>
                        <input
                          type="number"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="18000000"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                          {language === 'ru' ? 'Старая цена' : language === 'en' ? 'Original Price' : 'Eski narxi'}
                        </label>
                        <input
                          type="number"
                          value={newProduct.originalPrice}
                          onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                          placeholder="20000000"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                        {language === 'ru' ? 'Категория *' : language === 'en' ? 'Category *' : 'Toifasi *'}
                      </label>
                      <CustomSelect
                        value={newProduct.categoryId}
                        onChange={(val) => setNewProduct({ ...newProduct, categoryId: val as string })}
                        buttonClassName="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                        options={CATEGORIES.map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-slate-300 mb-1">
                        {language === 'ru' ? 'Ссылка на фото *' : language === 'en' ? 'Image URL *' : 'Rasm URL *'}
                      </label>
                      <input
                        type="url"
                        required
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="zeroDownCheckAdmin"
                        checked={newProduct.hasZeroDown}
                        onChange={(e) => setNewProduct({ ...newProduct, hasZeroDown: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <label htmlFor="zeroDownCheckAdmin" className="font-bold text-gray-700 dark:text-slate-300 cursor-pointer">
                        {language === 'ru' ? 'Рассрочка 0-0-12 без первоначального взноса' : language === 'en' ? '0-0-12 No down payment installment' : "0-0-12 Boshlang'ich to'lovsiz Nasiya"}
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/30 hover:brightness-110 mt-2"
                    >
                      {language === 'ru' ? 'Добавить товар в каталог' : language === 'en' ? 'Add Product to Catalog' : "Tovarni Qo'shish"}
                    </motion.button>
                  </form>
                </div>

                {/* List */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3 flex items-center justify-between">
                    <span>{language === 'ru' ? `Товары в магазине (${products.length})` : language === 'en' ? `Store Products (${products.length})` : `Do'kondagi mahsulotlar (${products.length})`}</span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-extrabold">{language === 'ru' ? 'Онлайн витрина' : language === 'en' ? 'Online storefront' : 'Online vitrina'}</span>
                  </h3>

                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {products.map((p) => (
                        <motion.div 
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, height: 0 }}
                          whileHover={{ scale: 1.015, y: -2 }}
                          className="p-3 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <motion.img 
                              whileHover={{ scale: 1.15 }}
                              src={p.images[0]} 
                              alt="" 
                              className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 shrink-0 border border-gray-200 dark:border-slate-700 cursor-pointer" 
                            />
                            <div className="truncate">
                              <h4 className="font-bold text-gray-900 dark:text-white truncate">{p.title}</h4>
                              <div className="text-amber-600 dark:text-amber-400 font-extrabold mt-0.5">{formatPrice(p.price, true, language)}</div>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.25, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                            title={language === 'ru' ? 'Удалить' : language === 'en' ? 'Delete' : "O'chirish"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: ANALYTICS & STATS */}
            {activeSection === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Credit Scoring */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition-colors">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>{language === 'ru' ? 'Кредитный скоринг (КАТМ)' : language === 'en' ? 'Credit Scoring Distribution (KATM)' : 'Kredit Skoringi Taqsimoti (KATM)'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <motion.div 
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="p-5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl space-y-1 shadow-xs"
                    >
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block">
                        {language === 'ru' ? 'Отлично (750 - 1000 баллов)' : language === 'en' ? 'Excellent (750 - 1000 pts)' : "A'lo (750 - 1000 ball)"}
                      </span>
                      <span className="text-3xl font-black text-gray-900 dark:text-white mt-1 block">{pctHighScoring}%</span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'Автоодобрение' : language === 'en' ? 'Auto approved' : 'Avtomatik tasdiqlash'}
                      </span>
                      <div className="w-full h-2 bg-emerald-200 dark:bg-emerald-900/50 rounded-full mt-3 overflow-hidden">
                        <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${pctHighScoring}%` }} transition={{ duration: 1.2 }} />
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl space-y-1 shadow-xs"
                    >
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-bold block">
                        {language === 'ru' ? 'Средний (600 - 750 баллов)' : language === 'en' ? 'Average (600 - 750 pts)' : "O'rtacha (600 - 750 ball)"}
                      </span>
                      <span className="text-3xl font-black text-gray-900 dark:text-white mt-1 block">{pctMidScoring}%</span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'С первым взносом' : language === 'en' ? 'With down payment' : "Dastlabki to'lov bilan"}
                      </span>
                      <div className="w-full h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full mt-3 overflow-hidden">
                        <motion.div className="h-full bg-amber-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${pctMidScoring}%` }} transition={{ duration: 1.2 }} />
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl space-y-1 shadow-xs"
                    >
                      <span className="text-xs text-rose-700 dark:text-rose-400 font-bold block">
                        {language === 'ru' ? 'Низкий (менее 600 баллов)' : language === 'en' ? 'Low (less than 600 pts)' : "Past (600 dan kam)"}
                      </span>
                      <span className="text-3xl font-black text-gray-900 dark:text-white mt-1 block">{pctLowScoring}%</span>
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'Ручная проверка' : language === 'en' ? 'Manual review' : "Qo'shimcha tekshiruv"}
                      </span>
                      <div className="w-full h-2 bg-rose-200 dark:bg-rose-900/50 rounded-full mt-3 overflow-hidden">
                        <motion.div className="h-full bg-rose-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${pctLowScoring}%` }} transition={{ duration: 1.2 }} />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Monthly Volume Animated Vertical Bar Chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span>{language === 'ru' ? 'Сравнение объемов сделок по месяцам' : language === 'en' ? 'Monthly Deal Volume Comparison' : 'Oylik Bitimlar Hajmi Taqqoslami'}</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'Завершенные договоры рассрочки за каждый месяц' : language === 'en' ? 'Completed installment contracts for each month' : 'Har bir oy uchun yakunlangan Nasiya shartnomalari'}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                      {totalOrdersCount > 0 
                        ? (language === 'ru' 
                            ? `В среднем в месяц: ${formatPrice(Math.round(totalOrdersAmount / 6), true, language)}` 
                            : language === 'en' 
                            ? `Monthly avg: ${formatPrice(Math.round(totalOrdersAmount / 6), true, language)}` 
                            : `O'rtacha oylik: ${formatPrice(Math.round(totalOrdersAmount / 6), true, language)}`)
                        : (language === 'ru' ? 'В среднем в месяц: 0 сум' : language === 'en' ? 'Monthly avg: 0 UZS' : "O'rtacha oylik: 0 so'm")
                      }
                    </span>
                  </div>

                  <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2">
                    {[
                      { month: language === 'ru' ? 'Май' : language === 'en' ? 'May' : 'May', key: 4 },
                      { month: language === 'ru' ? 'Июн' : language === 'en' ? 'Jun' : 'Iyun', key: 5 },
                      { month: language === 'ru' ? 'Июл' : language === 'en' ? 'Jul' : 'Iyul', key: 6 },
                      { month: language === 'ru' ? 'Авг' : language === 'en' ? 'Aug' : 'Avgust', key: 7 },
                      { month: language === 'ru' ? 'Сен' : language === 'en' ? 'Sep' : 'Sentyabr', key: 8 },
                      { month: language === 'ru' ? 'Окт' : language === 'en' ? 'Oct' : 'Oktyabr', key: 9 },
                    ].map((col, idx) => {
                      const matchingMonthOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).getMonth() === col.key);
                      const monthSum = matchingMonthOrders.reduce((sum, o) => sum + o.totalPrice, 0);
                      const height = totalOrdersAmount > 0 && monthSum > 0 
                        ? `${Math.max(10, Math.min(100, Math.round((monthSum / totalOrdersAmount) * 100)))}%` 
                        : (totalOrdersCount > 0 ? '6%' : '0%');
                      const valString = totalOrdersAmount > 0 && monthSum > 0 
                        ? formatPrice(monthSum, true, language) 
                        : (language === 'ru' ? '0 сум' : language === 'en' ? '0 UZS' : "0 so'm");

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            {valString}
                          </span>
                          <div className="w-full max-w-[48px] bg-gray-100 dark:bg-slate-700/80 rounded-t-xl overflow-hidden h-full flex items-end">
                            <motion.div 
                              className="w-full bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-xl group-hover:brightness-110 transition-all shadow-md"
                              initial={{ height: 0 }}
                              animate={{ height }}
                              transition={{ duration: 1.2, delay: idx * 0.1, type: 'spring' }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600 dark:text-slate-400">{col.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: PROMO CODES MANAGEMENT */}
            {activeSection === 'promos' && (
              <motion.div 
                key="promos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Stats Bar & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Tag className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                        {language === 'ru' ? 'Активные промокоды и скидки' : language === 'en' ? 'Active Promo Codes & Discounts' : 'Promokodlar va Chegirmalar Tizimi'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {language === 'ru' ? 'Управление купонами для корзины и оформления рассрочки' : language === 'en' ? 'Manage coupons for cart and checkout' : "Savat va Nasiya buyurtmalari uchun promokodlar boshqaruvi"}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddPromoModalOpen(!isAddPromoModalOpen)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-600/25 flex items-center gap-2 transition-all w-fit"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ru' ? 'Создать промокод' : language === 'en' ? 'Create Promo Code' : 'Yangi Promokod Qo\'shish'}</span>
                  </motion.button>
                </div>

                {/* Add Promo Code Form Modal / Card */}
                <AnimatePresence>
                  {isAddPromoModalOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="overflow-hidden"
                    >
                      <form onSubmit={handleCreatePromo} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-lg space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
                          <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>{language === 'ru' ? 'Новый промокод' : language === 'en' ? 'New Promo Code' : 'Yangi Promokod Yaratish'}</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsAddPromoModalOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                              {language === 'ru' ? 'Код (например, WELCOME10):' : language === 'en' ? 'Code (e.g., WELCOME10):' : 'Kodi (masalan: WELCOME10):'}
                            </label>
                            <input
                              type="text"
                              required
                              value={newPromo.code}
                              onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                              placeholder="WELCOME10"
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-mono font-bold uppercase outline-none focus:border-uzum-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                              {language === 'ru' ? 'Тип скидки:' : language === 'en' ? 'Discount Type:' : 'Chegirma turi:'}
                            </label>
                            <CustomSelect
                              size="sm"
                              value={newPromo.discountType}
                              onChange={(val) => setNewPromo({ ...newPromo, discountType: val as any })}
                              buttonClassName="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700"
                              options={[
                                { value: 'percentage', label: language === 'ru' ? 'Процент (%)' : language === 'en' ? 'Percentage (%)' : 'Foiz (%)' },
                                { value: 'fixed', label: language === 'ru' ? 'Фиксированная сумма (сум)' : language === 'en' ? 'Fixed sum (UZS)' : 'Aniq summa (so\'m)' },
                              ]}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                              {newPromo.discountType === 'percentage' 
                                ? (language === 'ru' ? 'Скидка в процентах (%):' : language === 'en' ? 'Discount percentage (%):' : 'Chegirma foizi (%):') 
                                : (language === 'ru' ? 'Сумма скидки (сум):' : language === 'en' ? 'Discount amount (UZS):' : 'Chegirma summasi (so\'m):')}
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={newPromo.discountValue}
                              onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                              placeholder={newPromo.discountType === 'percentage' ? '15' : '500000'}
                              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-bold outline-none focus:border-uzum-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                            {language === 'ru' ? 'Описание для клиентов:' : language === 'en' ? 'Customer Description:' : 'Mijozlar uchun tavsif:'}
                          </label>
                          <input
                            type="text"
                            value={newPromo.description}
                            onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                            placeholder="ELRIZO maxsus aksiyasi — 15% chegirma"
                            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white text-xs outline-none focus:border-uzum-primary"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddPromoModalOpen(false)}
                            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold hover:bg-gray-200 transition-colors"
                          >
                            {language === 'ru' ? 'Отмена' : language === 'en' ? 'Cancel' : 'Bekor qilish'}
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-bold transition-all shadow-md"
                          >
                            {language === 'ru' ? 'Сохранить промокод' : language === 'en' ? 'Save Promo Code' : 'Promokodni Saqlash'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Promo Codes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {promoCodes.map((promo) => {
                    const discountDisplay = promo.discountType === 'percentage' 
                      ? `${promo.discountValue}%` 
                      : `${formatPrice(promo.discountValue, true, language)}`;

                    return (
                      <motion.div
                        key={promo.id}
                        whileHover={{ y: -3, scale: 1.01 }}
                        className={`p-5 rounded-3xl border transition-all bg-white dark:bg-slate-800/90 shadow-sm flex flex-col justify-between space-y-4 ${
                          promo.isActive 
                            ? 'border-gray-200 dark:border-slate-700' 
                            : 'border-dashed border-gray-300 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black font-mono tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
                              {promo.code}
                            </span>
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              -{discountDisplay}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                            {promo.description}
                          </p>

                          <div className="text-[11px] text-gray-400 dark:text-slate-400 font-medium">
                            {language === 'ru' ? 'Использовано:' : language === 'en' ? 'Used:' : 'Qo\'llanilgan:'} <strong className="text-gray-900 dark:text-white">{promo.usageCount || 0} {language === 'ru' ? 'раз' : language === 'en' ? 'times' : 'marta'}</strong>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => togglePromoCode(promo.id)}
                            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
                              promo.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200'
                            }`}
                          >
                            {promo.isActive ? (
                              <span className="inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                                <span>{language === 'ru' ? 'Активен' : language === 'en' ? 'Active' : 'Faol'}</span>
                              </span>
                            ) : (
                              <span>{language === 'ru' ? 'Отключен' : language === 'en' ? 'Inactive' : 'Nofaol'}</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`${promo.code} promokodini o'chirishni xohlaysizmi?`)) {
                                deletePromoCode(promo.id);
                                addToast(`${promo.code} o'chirildi!`, 'info');
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SECTION: CUSTOMERS CRM */}
            {activeSection === 'customers' && (
              <motion.div 
                key="customers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span>{language === 'ru' ? 'База клиентов (CRM)' : language === 'en' ? 'Customer Base (CRM)' : 'Mijozlar Bazasi (CRM)'}</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Платежная дисциплина и персональный лимит' : language === 'en' ? 'Payment discipline and credit limits' : 'Mijozlarning to\'lov intizomi va shaxsiy limiti'}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                    {orders.length} {language === 'ru' ? 'активных клиентов' : language === 'en' ? 'active customers' : 'ta faol mijoz'}
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 dark:text-slate-500 space-y-2">
                    <Users className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm font-semibold">
                      {language === 'ru' ? 'База клиентов пуста (0 покупок)' : language === 'en' ? 'Customer base is empty (0 purchases)' : "Mijozlar bazasi bo'sh (0 ta xarid)"}
                    </p>
                    <p className="text-xs">
                      {language === 'ru' ? 'Когда кто-то оформит заказ, данные автоматически появятся здесь' : language === 'en' ? 'When someone places an order, their data will automatically appear here' : "Biror kishi xarid qilganda mijoz ma'lumotlari avtomatik shu yerda aks etadi"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-700">
                    {orders.map((ord, idx) => {
                      const initials = ord.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'M';
                      return (
                        <motion.div 
                          key={ord.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          whileHover={{ x: 6, backgroundColor: theme === 'dark' ? '#33415530' : '#f8fafc' }}
                          className="py-3.5 px-3 rounded-2xl flex justify-between items-center text-xs cursor-pointer transition-colors"
                          onClick={() => setSelectedOrder(ord)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white hover:text-purple-600 transition-colors">{ord.customerName}</div>
                              <div className="text-[11px] text-gray-500 dark:text-slate-400">{ord.customerPhone} • PINFL: {ord.pinfl || '31204956780012'}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-amber-600 dark:text-amber-400 font-extrabold block">{formatPrice(ord.totalPrice, true, language)}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-end gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>{language === 'ru' ? 'Платежи: Отлично' : language === 'en' ? 'Payment status: Excellent' : "To'lov holati: A'lo"}</span>
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* SECTION: SETTINGS */}
            {activeSection === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-xl space-y-4 max-w-xl transition-colors"
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>{language === 'ru' ? 'Настройки системы и безопасности' : language === 'en' ? 'System & Security Settings' : 'Tizim va Xavfsizlik Sozlamalari'}</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Supabase Cloud Database</div>
                      <div className="text-gray-500 dark:text-slate-400 text-[11px] font-mono">bdpmekcxbfeydodkyrbn.supabase.co</div>
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{language === 'ru' ? 'Подключено' : language === 'en' ? 'Connected' : 'Ulangan'}</span>
                    </span>
                  </motion.div>

                  {/* Email Jo'natuvchi & SMTP Sozlamalari (Elrizo / me) */}
                  <motion.div 
                    whileHover={{ scale: 1.005 }}
                    className="p-5 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 dark:from-slate-900 dark:to-purple-950/20 rounded-2xl border border-purple-200/80 dark:border-purple-800/40 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-sm">
                            {language === 'ru' ? 'Настройки почты и отправителя' : language === 'en' ? 'Email & Sender Settings' : "Pochta va Jo'natuvchi Sozlamalari"}
                          </div>
                          <div className="text-gray-500 dark:text-slate-400 text-[11px]">
                            {language === 'ru' ? 'Правило отображения: «me» для админа и «Elrizo» для клиентов' : language === 'en' ? 'Display rule: "me" for admin and "Elrizo" for clients' : "Ko'rinish qoidasi: Admin uchun «me» va mijozlar uchun «Elrizo»"}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 w-fit">
                        Sender: Elrizo / me
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-purple-100 dark:border-slate-700 space-y-1">
                        <div className="text-gray-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>{language === 'ru' ? 'Для Администратора' : language === 'en' ? 'For Administrator' : "Administrator uchun"}</span>
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          Pochtadagi nom: <span className="text-purple-600 dark:text-purple-300 font-mono">me</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">
                          {ADMIN_EMAIL} o'ziga o'zi yuborgani sababli Gmail pochta oynasida jo'natuvchini «me» deb ko'rsatadi.
                        </p>
                      </div>

                      <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-purple-100 dark:border-slate-700 space-y-1">
                        <div className="text-gray-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ru' ? 'Для всех остальных клиентов' : language === 'en' ? 'For all other clients' : "Barcha mijozlar uchun"}</span>
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          Pochtadagi nom: <span className="text-emerald-600 dark:text-emerald-400 font-mono">Elrizo</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-tight">
                          Mijozlar pochtasiga xat borganida rasmiy brend sifatida jo'natuvchi «Elrizo» bo'lib chiqadi.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">LocalStorage Kesh</div>
                      <div className="text-gray-500 dark:text-slate-400 text-[11px]">{language === 'ru' ? 'База данных Offline-First' : language === 'en' ? 'Offline-First database cache' : "Offline-First ma'lumotlar bazasi"}</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefreshCache}
                      className="px-3.5 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-xl text-gray-800 dark:text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCache ? 'animate-spin' : ''}`} />
                      <span>{language === 'ru' ? 'Обновить' : language === 'en' ? 'Refresh' : 'Yangilash'}</span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. FULL ANIMATED APPLICATION DOSSIER MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 25 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center font-bold shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {language === 'ru' ? 'Договор №' : language === 'en' ? 'Contract №' : 'Shartnoma №'} {selectedOrder.contractNumber || selectedOrder.id}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {language === 'ru' ? 'Дата оформления:' : language === 'en' ? 'Date registered:' : 'Rasmiylashtirilgan sana:'} {new Date(selectedOrder.createdAt).toLocaleString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ')}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Customer Info Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700">
                  <div>
                    <span className="text-gray-400 block text-[11px]">{language === 'ru' ? 'Ф.И.О клиента:' : language === 'en' ? 'Customer Full Name:' : 'Mijoz F.I.Sh:'}</span>
                    <strong className="text-sm text-gray-900 dark:text-white">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">{language === 'ru' ? 'Номер телефона:' : language === 'en' ? 'Phone Number:' : 'Telefon raqami:'}</span>
                    <strong className="text-sm font-mono text-gray-900 dark:text-white">{selectedOrder.customerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">{language === 'ru' ? 'ПИНФЛ:' : language === 'en' ? 'PINFL:' : 'JShShIR (PINFL):'}</span>
                    <strong className="text-xs font-mono text-purple-600 dark:text-purple-300">{selectedOrder.pinfl || '31204956780012'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">{language === 'ru' ? 'Адрес доставки:' : language === 'en' ? 'Delivery Address:' : 'Yetkazish manzili:'}</span>
                    <strong className="text-xs text-gray-900 dark:text-white">{selectedOrder.deliveryAddress || (language === 'ru' ? 'г. Ташкент, Чиланзар' : language === 'en' ? 'Tashkent city, Chilanzar' : 'Toshkent shahri, Chilonzor')}</strong>
                  </div>
                </div>

                {/* Scoring & Financial Details */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 text-white space-y-3 shadow-md">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-purple-200 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ru' ? 'Кредитный скоринг:' : language === 'en' ? 'Credit Scoring:' : 'Kredit Skoringi:'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-400/30">
                      {selectedOrder.scoringScore || 795} {language === 'ru' ? 'баллов (Отлично)' : language === 'en' ? 'pts (Excellent)' : "ball (A'lo)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div>
                      <span className="text-[10px] text-purple-300 block">{language === 'ru' ? 'Общая сумма:' : language === 'en' ? 'Total amount:' : 'Jami summa:'}</span>
                      <strong className="text-sm text-amber-300">{formatPrice(selectedOrder.totalPrice, true, language)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-300 block">{language === 'ru' ? 'Срок:' : language === 'en' ? 'Term:' : 'Muddat:'}</span>
                      <strong className="text-sm text-white">{selectedOrder.installmentMonths || 12} {language === 'ru' ? 'мес' : language === 'en' ? 'mo' : 'oy'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-purple-300 block">{language === 'ru' ? 'Ежемесячный платёж:' : language === 'en' ? 'Monthly payment:' : "Oylik to'lov:"}</span>
                      <strong className="text-sm text-amber-300">{formatPrice(selectedOrder.monthlyPayment || 0, true, language)}/{language === 'ru' ? 'мес' : language === 'en' ? 'mo' : 'oy'}</strong>
                    </div>
                  </div>
                </div>

                {/* Items in Contract */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">
                    {language === 'ru' ? 'Товары в договоре' : language === 'en' ? 'Contract items' : 'Shartnomadagi tovarlar'} ({selectedOrder.items?.length || 1}):
                  </span>
                  <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="p-3 bg-white dark:bg-slate-900/50 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{item.title}</span>
                          <span className="text-gray-400 text-[11px]">{item.quantity} {language === 'ru' ? 'шт' : language === 'en' ? 'items' : 'dona'} • {formatPrice(item.price, true, language)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-gray-900 dark:text-white block">{formatPrice(item.price * item.quantity, true, language)}</span>
                          {item.monthlyPayment && (
                            <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                              {formatPrice(item.monthlyPayment, true, language)}/{language === 'ru' ? 'мес' : language === 'en' ? 'mo' : 'oy'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'scoring_approved');
                      setSelectedOrder({ ...selectedOrder, status: 'scoring_approved' });
                      addToast(language === 'ru' ? 'Договор успешно подтвержден!' : language === 'en' ? 'Contract approved successfully!' : 'Shartnoma tasdiqlandi!', 'success');
                    }}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === 'ru' ? 'Одобрить' : language === 'en' ? 'Approve' : 'Tasdiqlash'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'delivered');
                      setSelectedOrder({ ...selectedOrder, status: 'delivered' });
                      addToast(language === 'ru' ? "Статус заказа обновлен на 'Доставлено'!" : language === 'en' ? "Status updated to 'Delivered'!" : "Shartnoma 'Yetkazildi' holatiga o'tkazildi!", 'info');
                    }}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Package className="w-4 h-4" />
                    <span>{language === 'ru' ? 'Доставлено' : language === 'en' ? 'Delivered' : 'Yetkazildi'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      deleteOrder(selectedOrder.id);
                      setSelectedOrder(null);
                      addToast(language === 'ru' ? 'Договор удален' : language === 'en' ? 'Contract deleted' : "Shartnoma o'chirildi", 'warning');
                    }}
                    className="py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'ru' ? 'Удалить' : language === 'en' ? 'Delete' : "O'chirish"}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
