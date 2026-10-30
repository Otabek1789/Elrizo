'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronRight, 
  Smartphone, 
  Tv, 
  Laptop, 
  Sparkles, 
  Car, 
  Armchair, 
  ShieldCheck, 
  MapPin, 
  PhoneCall,
  Crown,
  SlidersHorizontal,
  TrendingUp,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Zap,
  Truck,
  Scale,
  CreditCard,
  Gift,
  ChevronDown,
  LogOut,
  Package
} from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/mockData';
import { formatPrice } from '../utils/calculator';
import { searchProducts } from '../utils/searchHelper';
import { useTranslation, getCategoryTitle, getSubcategoryTitle } from '../utils/translations';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className="w-5 h-5" />;
    case 'Tv':
      return <Tv className="w-5 h-5" />;
    case 'Laptop':
      return <Laptop className="w-5 h-5" />;
    case 'Sparkles':
      return <Sparkles className="w-5 h-5" />;
    case 'Car':
      return <Car className="w-5 h-5" />;
    case 'Armchair':
      return <Armchair className="w-5 h-5" />;
    default:
      return <Smartphone className="w-5 h-5" />;
  }
};

const formatCity = (name: string, lang: string): string => {
  if (lang === 'ru') {
    if (name.toLowerCase().includes('toshkent')) return 'Ташкент';
    if (name.toLowerCase().includes('samarqand')) return 'Самарканд';
    if (name.toLowerCase().includes('buxoro')) return 'Бухара';
    if (name.toLowerCase().includes('andijon')) return 'Андижан';
    if (name.toLowerCase().includes('namangan')) return 'Наманган';
    if (name.toLowerCase().includes("farg'ona")) return 'Фергана';
    if (name.toLowerCase().includes('qashqadaryo')) return 'Кашкадарья';
    if (name.toLowerCase().includes('surxondaryo')) return 'Сурхандарья';
    if (name.toLowerCase().includes('xorazm')) return 'Хорезм';
    if (name.toLowerCase().includes('jizzax')) return 'Джизак';
    if (name.toLowerCase().includes('navoiy')) return 'Навои';
    if (name.toLowerCase().includes('sirdaryo')) return 'Сырдарья';
    if (name.toLowerCase().includes("qoraqalpog'iston")) return 'Каракалпакстан';
  }
  return name;
};

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products,
    navigateToCategory,
    searchQuery,
    setSearchQuery,
    cart,
    favorites,
    user,
    openCart,
    openAuth,
    getCartItemsCount,
    getCartTotal,
    theme,
    toggleTheme,
    selectedCity,
    openCityModal,
    openOrderTracking,
    comparisonList,
    openComparisonModal,
    logoutUser,
  } = useStore();

  const { t, language, setLanguage } = useTranslation();

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleUserMenuClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleUserMenuClickOutside);
    return () => document.removeEventListener('mousedown', handleUserMenuClickOutside);
  }, []);

  // Close user dropdown on navigation
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Tashqi qidiruv so'zi o'zgarganda inputni sinxronlash
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Agar foydalanuvchi /catalog yoki /products sahifasida bo'lsa, yozishi bilanoq natijalarni yangilash
  useEffect(() => {
    const isCatalog = location.pathname.startsWith('/catalog') || location.pathname.startsWith('/products');
    if (isCatalog) {
      const handler = setTimeout(() => {
        setSearchQuery(localSearch);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [localSearch, location.pathname, setSearchQuery]);

  // Click outside to close live search dropdown (both desktop and mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedDesktop = searchContainerRef.current?.contains(target);
      const clickedMobile = mobileSearchContainerRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Jonli qidiruv natijalari
  const liveResults = useMemo(() => {
    if (!localSearch.trim()) return [];
    return searchProducts(products, localSearch);
  }, [products, localSearch]);

  const handleExecuteSearch = (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : localSearch;
    setLocalSearch(q);
    setSearchQuery(q);
    setIsSearchFocused(false);
    navigate(q.trim() ? `/catalog?search=${encodeURIComponent(q.trim())}` : '/catalog');
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchFocused(false);
    navigate(`/product/${productId}`);
  };

  // Click outside to close catalog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };
    if (isCatalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCatalogOpen]);

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];
  const cartItemsCount = getCartItemsCount();
  const cartTotal = getCartTotal();

  const handleCategoryClick = (categorySlug: string) => {
    navigateToCategory(categorySlug);
    const isAlreadyCatalog = location.pathname.startsWith('/catalog') || location.pathname.startsWith('/products');
    navigate(`/catalog?category=${encodeURIComponent(categorySlug)}`, { replace: isAlreadyCatalog });
    setIsCatalogOpen(false);
  };

  const renderSearchBar = (variant: 'desktop' | 'mobile') => {
    const isMobile = variant === 'mobile';
    return (
      <div className="relative w-full">
        <motion.div 
          animate={{ scale: isSearchFocused ? 1.005 : 1 }}
          className={`relative flex items-center rounded-2xl border transition-all ${
            isSearchFocused
              ? 'border-uzum-primary ring-4 ring-purple-100 dark:ring-purple-950/60 shadow-md bg-white dark:bg-slate-900'
              : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/70 hover:bg-gray-100/70 dark:hover:bg-slate-800/80'
          }`}
        >
          <input
            id={isMobile ? "search-input-mobile" : "search-input"}
            type="text"
            value={localSearch}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setIsSearchFocused(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleExecuteSearch();
              }
            }}
            placeholder={t('searchPlaceholder')}
            className={`w-full ${isMobile ? 'pl-8 pr-16 py-2 text-xs' : 'pl-11 pr-24 py-2.5 text-sm'} bg-transparent text-gray-900 dark:text-white rounded-2xl outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400 font-medium`}
          />
          <Search className={`${isMobile ? 'w-4 h-4 left-2.5' : 'w-5 h-5 left-3.5'} text-gray-400 absolute pointer-events-none`} />

          {/* Clear search button */}
          {localSearch && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => {
                setLocalSearch('');
                setSearchQuery('');
              }}
              className={`absolute ${isMobile ? 'right-10' : 'right-16'} p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors`}
              title={t('clearAll')}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExecuteSearch()}
            className={`absolute right-1 sm:right-1.5 bg-uzum-primary hover:bg-uzum-hover text-white ${isMobile ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 sm:px-3.5 py-1 sm:py-1.5'} font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1`}
          >
            <Search className="w-3.5 h-3.5 sm:hidden" />
            <span className="hidden sm:inline">{t('headerSearchBtn')}</span>
          </motion.button>
        </motion.div>

        {/* Jonli Qidiruv Natijalari (Live Search Dropdown) */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 text-left"
            >
              {localSearch.trim() ? (
                <div>
                  <div className="p-3 bg-gray-50/80 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {t('searchFoundCount')} ({liveResults.length}):
                    </span>
                    {liveResults.length > 0 && (
                      <button
                        onMouseDown={() => handleExecuteSearch()}
                        className="font-bold text-uzum-primary dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <span>{t('viewAll')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {liveResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200">"{localSearch}" - {t('searchNotFound')}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{t('noProductsDesc')}</p>
                      <button
                        onMouseDown={() => {
                          setSearchQuery('');
                          setLocalSearch('');
                          setIsSearchFocused(false);
                          navigate('/catalog');
                        }}
                        className="mt-2 px-4 py-2 bg-uzum-primary text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        {t('allCategories')}
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                      {liveResults.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          onMouseDown={() => handleSelectProduct(p.id)}
                          className="p-3 flex items-center gap-3 hover:bg-purple-50/60 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-12 h-12 object-contain rounded-xl bg-gray-50 dark:bg-slate-800 shrink-0 border border-gray-100 dark:border-slate-700 p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                              {getCategoryTitle(p.categoryId, language)}
                            </span>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-uzum-primary dark:group-hover:text-purple-300 transition-colors">
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-gray-900 dark:text-white">
                                {formatPrice(p.price, true, language)}
                              </span>
                              <span className="text-[10px] font-bold text-uzum-primary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 rounded">
                                {formatPrice(Math.round(p.price / 12), true, language)}{t('perMonth')}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-uzum-primary dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      ))}

                      {liveResults.length > 5 && (
                        <button
                          onMouseDown={() => handleExecuteSearch()}
                          className="w-full p-3 bg-gray-50 dark:bg-slate-900 text-center font-bold text-xs text-uzum-primary dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>{language === 'ru' ? `Смотреть еще ${liveResults.length - 5} товаров в Каталоге` : `Yana ${liveResults.length - 5} ta mahsulotni Katalogda ko'rish`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400" />
                    <span>{language === 'ru' ? 'Популярные поисковые запросы:' : 'Ommabop qidiruvlar:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'iPhone 16 Pro Max',
                      'Samsung Galaxy S24 Ultra',
                      'Dyson Airwrap',
                      'MacBook Air M3',
                      'Artel Smart TV',
                      `0-0-12 ${t('installment')}`,
                    ].map((term) => (
                      <button
                        key={term}
                        onMouseDown={() => handleExecuteSearch(term)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-uzum-primary dark:hover:text-purple-300 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Search className="w-3 h-3 text-gray-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top utility bar */}
      <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-300 py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-2.5 lg:gap-4 xl:gap-5 shrink-0 whitespace-nowrap">
            <motion.div 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={openCityModal}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-purple-300 cursor-pointer transition-colors group py-0.5 px-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 shrink-0 whitespace-nowrap"
              title={language === 'ru' ? "Изменить город" : "Shaharni o'zgartirish"}
            >
              <MapPin className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="whitespace-nowrap">{t('cityLabel')} <strong className="text-gray-800 dark:text-white underline decoration-dotted decoration-purple-400 underline-offset-2 font-bold whitespace-nowrap">{formatCity(selectedCity, language)}</strong></span>
            </motion.div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white cursor-pointer transition-colors shrink-0 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">{t('installment')}: <span className="font-semibold text-uzum-primary dark:text-purple-300 whitespace-nowrap">{t('scoringNotice')}</span></span>
            </div>
            <div className="text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white cursor-pointer transition-colors shrink-0 whitespace-nowrap hidden xl:block">
              {t('freeDelivery')}
            </div>
            <button
              type="button"
              onClick={openOrderTracking}
              className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-purple-300 font-bold cursor-pointer transition-colors bg-purple-50/60 dark:bg-purple-950/40 px-2 py-0.5 rounded-lg border border-purple-200/40 dark:border-purple-900/30 shrink-0 whitespace-nowrap"
              title={language === 'ru' ? "Отследить статус заказа" : "Shartnoma yoki buyurtma holatini kuzatish"}
            >
              <Truck className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 shrink-0" />
              <span className="whitespace-nowrap">{t('headerTrackOrder')}</span>
            </button>
            <div className="hidden 2xl:flex items-center gap-1 text-[11px] font-bold text-uzum-primary dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200/50 dark:border-purple-900/40 shrink-0 whitespace-nowrap">
              <span className="whitespace-nowrap">«{t('slogan')}»</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            <a href="tel:+998943335522" className="flex items-center gap-1 text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white transition-colors font-medium shrink-0 whitespace-nowrap">
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap font-semibold">+998 94 333 55 22</span>
            </a>

            {/* Language Selector in Top Bar */}
            <div className="flex items-center bg-gray-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold shrink-0 whitespace-nowrap">
              {(['uz', 'ru'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-md uppercase transition-all whitespace-nowrap ${
                    language === lang
                      ? 'bg-white dark:bg-slate-700 text-uzum-primary dark:text-purple-300 shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg text-gray-500 hover:text-uzum-primary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-3">
        {/* Navigation Row 1: Brand & Actions */}
        <div className="flex items-center justify-between gap-1 sm:gap-3">
          {/* Left: Brand Logo & Catalog Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Brand Logo */}
            <Link 
              to="/"
              onClick={() => navigateToCategory(null)}
              className="group block select-none shrink-0"
            >
              <Logo size="md" />
            </Link>

            {/* Catalog Button */}
            <div className="relative shrink-0" ref={catalogRef}>
          <motion.button
            id="catalog-toggle-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
              isCatalogOpen
                ? 'bg-uzum-hover text-white ring-2 ring-purple-300 dark:ring-purple-400 shadow-md'
                : 'bg-uzum-primary hover:bg-uzum-hover text-white shadow-sm'
            }`}
          >
            <motion.div
              animate={{ rotate: isCatalogOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isCatalogOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
            </motion.div>
            <span className="hidden sm:inline text-white">{t('catalog')}</span>
          </motion.button>

          {/* Mega Menu Dropdown with Framer Motion AnimatePresence */}
          <AnimatePresence>
            {isCatalogOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-2 top-24 sm:top-28 md:absolute md:top-12 md:left-0 md:inset-x-auto md:w-[780px] bg-white dark:bg-slate-800 rounded-3xl shadow-dropdown border border-gray-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col md:flex-row backdrop-blur-xl max-h-[80vh] md:max-h-none"
              >
                {/* Left categories list */}
                <div className="w-full md:w-1/2 bg-gray-50/80 dark:bg-slate-900/80 border-r border-gray-100 dark:border-slate-800 p-3 max-h-[460px] overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t('allCategories')}
                  </div>
                  {CATEGORIES.map((cat) => {
                    const isSelected = cat.id === activeCategoryId;
                    return (
                      <motion.div
                        key={cat.id}
                        whileHover={{ x: 4 }}
                        onMouseEnter={() => setActiveCategoryId(cat.id)}
                        onClick={() => handleCategoryClick(cat.slug)}
                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-white dark:bg-slate-800 text-uzum-primary dark:text-purple-300 shadow-sm font-bold border border-purple-100 dark:border-purple-900/50'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-xl ${isSelected ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300' : 'bg-gray-200/60 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}>
                            {getCategoryIcon(cat.iconName)}
                          </span>
                          <span>{getCategoryTitle(cat.slug, language)}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-uzum-primary translate-x-1' : 'text-gray-400'}`} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Right subcategories list */}
                <div className="w-full md:w-1/2 p-5 bg-white dark:bg-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{getCategoryTitle(activeCategory.slug, language)}</h3>
                      <button
                        onClick={() => handleCategoryClick(activeCategory.slug)}
                        className="text-xs text-uzum-primary dark:text-purple-400 hover:underline font-bold flex items-center gap-1"
                      >
                        <span>{t('viewAll')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {activeCategory.subcategories.map((sub) => (
                        <motion.div
                          key={sub.id}
                          whileHover={{ x: 4 }}
                          onClick={() => handleCategoryClick(activeCategory.slug)}
                          className="p-2 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-uzum-primary dark:hover:text-purple-300 cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <span>{getSubcategoryTitle(sub.slug, language)}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-uzum-primary dark:group-hover:text-purple-300 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Promo box inside mega-menu */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryClick(activeCategory.slug)}
                    className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white cursor-pointer shadow-md"
                  >
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      0-0-12 {t('zeroDownTitle')}
                    </div>
                    <div className="text-xs font-bold mt-0.5">
                      {t('zeroDownDesc')}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Central Search Bar (Desktop only: md:block) */}
      <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-2xl relative mx-2">
          {renderSearchBar('desktop')}
        </div>

        {/* Right Actions (Theme, Language, Profile, Admin Panel, Favorites, Cart) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* City Selector Button (Mobile only) */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={openCityModal}
            className="flex md:hidden items-center gap-1 px-1.5 py-1 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 text-[10px] sm:text-xs font-bold transition-colors border border-gray-200/70 dark:border-slate-700/60 shrink-0"
            title={language === 'ru' ? "Выбрать город" : "Shaharni tanlash"}
          >
            <MapPin className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 shrink-0" />
            <span className="max-w-[48px] sm:max-w-[65px] truncate text-[10px] sm:text-[11px] font-bold">{formatCity(selectedCity, language)}</span>
          </motion.button>

          {/* Theme Switcher Button (Mobile only) */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-1 sm:p-1.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors md:hidden shrink-0"
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            )}
          </motion.button>

          {/* Language Selector in Main Header (Mobile only: Compact cycling badge) */}
          <button
            type="button"
            onClick={() => {
              const nextLang = language === 'uz' ? 'ru' : 'uz';
              setLanguage(nextLang);
            }}
            className="flex md:hidden items-center gap-1 px-2 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-[10px] font-black uppercase transition-all shrink-0 border border-gray-200/60 dark:border-slate-700/60 cursor-pointer"
            title={language === 'ru' ? "Сменить язык (UZ / RU)" : "Tilni o'zgartirish (UZ / RU)"}
          >
            <Globe className="w-3 h-3 text-uzum-primary dark:text-purple-400" />
            <span>{language}</span>
          </button>

          {/* Favorites Heart Icon in Mobile Header */}
          <Link 
            to="/favorites" 
            className="relative p-1.5 rounded-xl text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden shrink-0 transition-colors" 
            title={t('favorites')}
          >
            <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Product Comparison (Taqqoslash) */}
          <motion.button
            id="comparison-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={openComparisonModal}
            className="hidden md:flex relative p-2.5 rounded-2xl transition-colors items-center gap-1 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-uzum-primary dark:hover:text-purple-300"
            title={language === 'ru' ? "Сравнение товаров" : "Tovarlarni taqqoslash"}
          >
            <Scale className={`w-5 h-5 ${comparisonList.length > 0 ? 'text-primary-600 dark:text-primary-400' : ''}`} />
            {comparisonList.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow"
              >
                {comparisonList.length}
              </motion.span>
            )}
            <span className="hidden xl:inline text-xs font-bold ml-1 text-gray-700 dark:text-white">{t('headerComparison')}</span>
          </motion.button>

          {/* Favorites */}
          <Link to="/favorites" className="hidden md:block">
            <motion.button
              id="favorites-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={`relative p-2.5 rounded-2xl transition-colors flex items-center gap-1 ${
                location.pathname === '/favorites'
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300'
                  : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-uzum-primary dark:hover:text-purple-300'
              }`}
              title={t('favorites')}
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500 animate-pulse' : ''}`} />
              {favorites.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-uzum-accent text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow"
                >
                  {favorites.length}
                </motion.span>
              )}
              <span className="hidden xl:inline text-xs font-bold ml-1 text-gray-700 dark:text-white">{t('favorites')}</span>
            </motion.button>
          </Link>

          {/* Cart Drawer Trigger */}
          <motion.button
            id="cart-drawer-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCart}
            className="hidden md:flex relative items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-uzum-primary dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors font-bold text-sm shadow-sm"
            title={t('cart')}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-uzum-primary dark:text-purple-300" />
              {cartItemsCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-uzum-primary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md"
                >
                  {cartItemsCount}
                </motion.span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-uzum-primary dark:text-white">{t('cart')}</span>
              {cartTotal > 0 && (
                <span className="text-[10px] font-extrabold text-gray-900 dark:text-white mt-0.5">
                  {formatPrice(cartTotal, true, language)}
                </span>
              )}
            </div>
          </motion.button>

          {/* User / Profile Dropdown Wrapper (Navbarni eng chetida) */}
          <div className="relative" ref={userMenuRef}>
            {!user ? (
              /* Kirish tugmasi (Unauthenticated) — Mobil va Desktopda ochiq-oydin "Kirish" yozuvi bilan */
              <motion.button
                id="header-user-enter-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-black shadow-sm transition-all shrink-0 cursor-pointer"
                title={t('enter')}
              >
                <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
                <span className="text-[11px] sm:text-xs font-black">{t('enter')}</span>
              </motion.button>
            ) : (
              /* Foydalanuvchi tizimga kirgan holat */
              <motion.button
                id="user-profile-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
              >
                <div className="relative">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm ${
                    user?.isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:border-amber-500/50' : 'bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300'
                  }`}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : user.isAdmin ? (
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      user.fullName.charAt(0)
                    )}
                  </div>
                  {user?.isAdmin && user?.avatarUrl && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center p-0.5 shadow-sm border border-white dark:border-slate-800">
                      <Crown className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left justify-center">
                  <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 flex items-center gap-1">
                    {user.fullName.split(' ')[0]}
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </span>
                  {(user.isAdmin || user.scoringLimit > 0) && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      {user.isAdmin ? (
                        <>
                          <Crown className="w-3 h-3 text-amber-500" />
                          <span>Admin</span>
                        </>
                      ) : (
                        `${t('nasiyaLimit')} ${Math.round((user.scoringLimit - user.usedLimit) / 1000000)} ${t('mln')}`
                      )}
                    </span>
                  )}
                </div>
              </motion.button>
            )}

            {/* Dropdown Menu when user is logged in */}
            <AnimatePresence>
              {isUserMenuOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl"
                >
                  {/* User Header Preview */}
                  <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl flex items-center gap-3 border border-purple-100 dark:border-purple-900/30">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-sm">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        user.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-gray-900 dark:text-white truncate">
                        {user.fullName}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate font-mono">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 space-y-0.5">
                    {/* Profil tugmasi */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 text-gray-700 dark:text-slate-200 font-bold transition-colors cursor-pointer group"
                    >
                      <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      <div className="text-left flex-1">
                        <div className="font-extrabold text-gray-900 dark:text-white">{t('myProfile')}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{t('headerUserCardDesc')}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Buyurtmalarim */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/60 text-gray-700 dark:text-slate-200 font-bold transition-colors cursor-pointer group"
                    >
                      <Package className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span>{t('headerUserOrders')}</span>
                    </button>

                    {/* Admin panel (faqat admin uchun) */}
                    {user.isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-black transition-colors cursor-pointer group"
                      >
                        <Crown className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
                        <span>Admin Panel</span>
                      </button>
                    )}
                  </div>

                  {/* Chiqish */}
                  <div className="pt-1 border-t border-gray-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logoutUser();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('profileLogout')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Row 2: Mobile Search Bar (Mobile only) */}
      <div ref={mobileSearchContainerRef} className="block md:hidden mt-2 relative w-full">
        {renderSearchBar('mobile')}
      </div>
    </div>

      {/* Sub-header navigation (Quick Categories) */}
      <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-2 hidden sm:block bg-white dark:bg-slate-850 text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/catalog"
              className="font-extrabold text-[#640199] dark:text-purple-300 no-underline hover:no-underline hover:opacity-90 transition-opacity flex items-center gap-1.5 bg-purple-50/90 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-200/50 dark:border-purple-900/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#640199] dark:text-purple-300" />
              <span>{t('catalogAndFilters')}</span>
            </Link>
            <Link
              to="/"
              onClick={() => navigateToCategory(null)}
              className="font-extrabold text-uzum-primary dark:text-purple-400 no-underline hover:no-underline hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400" />
              {t('allPromotions')}
            </Link>
            <Link
              to="/catalog?category=smartphones"
              onClick={(e) => {
                if (location.pathname.startsWith('/catalog') || location.pathname.startsWith('/products')) {
                  e.preventDefault();
                }
                handleCategoryClick('smartphones');
              }}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors no-underline"
            >
              {t('smartphonesNav')}
            </Link>
            <Link
              to="/catalog?category=appliances"
              onClick={(e) => {
                if (location.pathname.startsWith('/catalog') || location.pathname.startsWith('/products')) {
                  e.preventDefault();
                }
                handleCategoryClick('appliances');
              }}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors no-underline"
            >
              {t('appliancesNav')}
            </Link>
            <Link
              to="/catalog?category=computers"
              onClick={(e) => {
                if (location.pathname.startsWith('/catalog') || location.pathname.startsWith('/products')) {
                  e.preventDefault();
                }
                handleCategoryClick('computers');
              }}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors no-underline"
            >
              {t('laptopsNav')}
            </Link>
            <Link
              to="/catalog?category=beauty"
              onClick={(e) => {
                if (location.pathname.startsWith('/catalog') || location.pathname.startsWith('/products')) {
                  e.preventDefault();
                }
                handleCategoryClick('beauty');
              }}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors no-underline"
            >
              {t('beautyNav')}
            </Link>
          </div>

          <div className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full font-bold shrink-0 text-[11px] flex items-center gap-1.5 shadow-sm border border-emerald-200/40 dark:border-emerald-900/40">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('onlineScoringBadge')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
