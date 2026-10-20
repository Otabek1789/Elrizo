import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Zap
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
  } = useStore();

  const { t, language, setLanguage } = useTranslation();

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close live search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
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
    navigate('/catalog');
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
    navigate('/catalog');
    setIsCatalogOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top utility bar */}
      <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-300 py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <motion.div 
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 animate-bounce" />
              <span>{t('cityLabel')} <strong className="text-gray-800 dark:text-white">{t('cityTashkent')}</strong></span>
            </motion.div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white cursor-pointer transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>{t('installment')}: <span className="font-semibold text-uzum-primary dark:text-purple-300">{t('scoringNotice')}</span></span>
            </div>
            <div className="text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white cursor-pointer transition-colors">
              {t('freeDelivery')}
            </div>
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-[#640199] dark:text-purple-300 bg-purple-50/90 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200/50 dark:border-purple-900/40">
              <span>«{t('slogan')}»</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+998712000000" className="flex items-center gap-1 text-gray-600 dark:text-gray-200 hover:text-uzum-primary dark:hover:text-white transition-colors font-medium">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+998 71 200 00 00</span>
            </a>

            {/* Language Selector in Top Bar */}
            <div className="flex items-center bg-gray-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
              {(['uz', 'ru', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded-md uppercase transition-all ${
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
              className="p-1 rounded-lg text-gray-500 hover:text-uzum-primary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-gray-200" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link 
          to="/"
          onClick={() => navigateToCategory(null)}
          className="group block select-none"
        >
          <Logo size="md" />
        </Link>

        {/* Catalog Button */}
        <div className="relative" ref={catalogRef}>
          <motion.button
            id="catalog-toggle-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isCatalogOpen
                ? 'bg-white dark:bg-white text-uzum-primary dark:text-uzum-primary ring-2 ring-purple-400 border border-purple-200 shadow-md'
                : 'bg-white dark:bg-white text-uzum-primary dark:text-uzum-primary hover:bg-gray-50 dark:hover:bg-gray-100 border border-gray-200/90 dark:border-gray-200'
            }`}
          >
            <motion.div
              animate={{ rotate: isCatalogOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isCatalogOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
            <span className="hidden sm:inline">{t('catalog')}</span>
          </motion.button>

          {/* Mega Menu Dropdown with Framer Motion AnimatePresence */}
          <AnimatePresence>
            {isCatalogOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 left-0 w-[92vw] sm:w-[680px] md:w-[780px] bg-white dark:bg-slate-800 rounded-3xl shadow-dropdown border border-gray-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col md:flex-row backdrop-blur-xl"
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

        {/* Central Search Bar with Live Results Dropdown */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative">
          <motion.div 
            animate={{ scale: isSearchFocused ? 1.01 : 1 }}
            className={`relative flex items-center rounded-2xl border transition-all ${
              isSearchFocused
                ? 'border-uzum-primary ring-4 ring-purple-100 dark:ring-purple-950/60 shadow-md bg-white dark:bg-slate-900'
                : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/70 hover:bg-gray-100/70 dark:hover:bg-slate-800/80'
            }`}
          >
            <input
              id="search-input"
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
              className="w-full pl-11 pr-24 py-2.5 bg-transparent text-sm text-gray-900 dark:text-white rounded-2xl outline-none placeholder:text-gray-400 dark:placeholder:text-gray-400 font-medium"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 pointer-events-none" />

            {/* Clear search button */}
            {localSearch && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                className="absolute right-14 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title={t('clearAll')}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExecuteSearch()}
              className="absolute right-1.5 bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
            >
              {language === 'ru' ? 'Поиск' : language === 'en' ? 'Search' : 'Qidirish'}
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
                            <span>{language === 'ru' ? `Смотреть еще ${liveResults.length - 5} товаров в Каталоге` : language === 'en' ? `View ${liveResults.length - 5} more products in Catalog` : `Yana ${liveResults.length - 5} ta mahsulotni Katalogda ko'rish`}</span>
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
                      <span>{language === 'ru' ? 'Популярные поисковые запросы:' : language === 'en' ? 'Popular searches:' : 'Ommabop qidiruvlar:'}</span>
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

        {/* Right Actions (Theme, Language, Profile, Admin Panel, Favorites, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Switcher Button (Mobile only, on desktop it is in the top bar) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors md:hidden"
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
            )}
          </motion.button>

          {/* Language Selector in Main Header (Mobile only, on desktop it is in the top bar) */}
          <div className="flex md:hidden items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] sm:text-xs font-bold">
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-1.5 py-0.5 rounded-lg uppercase transition-all ${
                  language === l
                    ? 'bg-white dark:bg-slate-700 text-uzum-primary dark:text-purple-300 shadow-xs font-black'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* User / Profile */}
          <motion.button
            id="user-profile-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (!user) {
                navigate('/login');
              } else {
                openAuth();
              }
            }}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden shadow-sm ${
              user?.isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:border-amber-500/50' : 'bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300'
            }`}>
              {user ? (
                user.isAdmin ? (
                  <Crown className="w-4 h-4 text-amber-600" />
                ) : user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )
              ) : (
                <UserIcon className="w-4 h-4 text-uzum-primary" />
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                {user ? user.fullName.split(' ')[0] : t('enter')}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                {user?.isAdmin ? (
                  <>
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Admin</span>
                  </>
                ) : (user ? `${t('nasiyaLimit')} ${Math.round((user.scoringLimit - user.usedLimit) / 1000000)} ${t('mln')}` : t('installment'))}
              </span>
            </div>
          </motion.button>

          {/* Admin Panel Button (Faqat otabek1789@gmail.com uchun) */}
          {user?.isAdmin && (
            <motion.button
              id="admin-panel-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black transition-all shadow-md ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-gray-950 hover:shadow-amber-400/50'
              }`}
              title={t('adminPanel')}
            >
              <Crown className="w-4 h-4 text-amber-950 animate-bounce" />
              <span className="hidden sm:inline">{t('adminPanel')}</span>
            </motion.button>
          )}

          {/* Favorites */}
          <Link to="/favorites">
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
            className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-uzum-primary dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors font-bold text-sm shadow-sm"
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
        </div>
      </div>

      {/* Sub-header navigation (Quick Categories) */}
      <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-2 hidden sm:block bg-white dark:bg-[#0F172A] text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/catalog"
              className="font-extrabold text-[#640199] dark:text-purple-300 hover:underline flex items-center gap-1.5 bg-purple-50/90 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-200/50 dark:border-purple-900/40"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#640199] dark:text-purple-300" />
              <span>{t('catalogAndFilters')}</span>
            </Link>
            <Link
              to="/"
              onClick={() => navigateToCategory(null)}
              className="font-extrabold text-uzum-primary dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400" />
              {t('allPromotions')}
            </Link>
            <button
              onClick={() => handleCategoryClick('smartphones')}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors"
            >
              {t('smartphonesNav')}
            </button>
            <button
              onClick={() => handleCategoryClick('appliances')}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors"
            >
              {t('appliancesNav')}
            </button>
            <button
              onClick={() => handleCategoryClick('computers')}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors"
            >
              {t('laptopsNav')}
            </button>
            <button
              onClick={() => handleCategoryClick('beauty')}
              className="text-gray-700 dark:text-white hover:text-uzum-primary dark:hover:text-purple-300 font-medium transition-colors"
            >
              {t('beautyNav')}
            </button>
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
