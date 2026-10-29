'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from '@/lib/navigation';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Zap, 
  Star, 
  Truck, 
  Check, 
  Grid3X3, 
  ListFilter, 
  X, 
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  Package,
  ArrowRight,
  Smartphone,
  Tv,
  Laptop,
  Car,
  Armchair,
  ShoppingBag,
  Heart,
  Calculator,
  Tag,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CustomSelect } from '../components/CustomSelect';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/mockData';
import { formatPrice, calculateMonthlyPaymentQuick } from '../utils/calculator';
import { searchProducts } from '../utils/searchHelper';
import { Product } from '../types';
import { useTranslation, getCategoryTitle } from '../utils/translations';

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'discount' | 'newest';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'smartphones': Smartphone,
  'cat-smartphones': Smartphone,
  'appliances': Tv,
  'cat-appliances': Tv,
  'computers': Laptop,
  'cat-computers': Laptop,
  'beauty': Sparkles,
  'cat-beauty': Sparkles,
  'auto': Car,
  'cat-auto': Car,
  'home-goods': Armchair,
  'cat-home': Armchair,
};

const isProductInCategory = (product: Product, slugOrId: string | null): boolean => {
  if (!slugOrId) return true;
  const s = slugOrId.toLowerCase();
  const catId = (product.categoryId || '').toLowerCase();
  const catName = (product.categoryName || '').toLowerCase();

  if (catId === s || catId.includes(s) || catName.includes(s)) return true;
  if ((s === 'auto' || s === 'cat-auto') && (catId === 'cat-auto' || catId === 'auto')) return true;
  if ((s === 'home-goods' || s === 'cat-home' || s === 'home') && (catId === 'cat-home' || catId === 'home-goods')) return true;
  if ((s === 'smartphones' || s === 'cat-smartphones') && (catId === 'cat-smartphones' || catId === 'smartphones')) return true;
  if ((s === 'appliances' || s === 'cat-appliances') && (catId === 'cat-appliances' || catId === 'appliances')) return true;
  if ((s === 'computers' || s === 'cat-computers') && (catId === 'cat-computers' || catId === 'computers')) return true;
  if ((s === 'beauty' || s === 'cat-beauty') && (catId === 'cat-beauty' || catId === 'beauty')) return true;
  return false;
};

const isProductInBrand = (product: Product, brand: string): boolean => {
  const b = brand.toLowerCase();
  const title = product.title.toLowerCase();
  const brandSpec = (product.specs?.['Brend'] || '').toLowerCase();
  const tags = (product.tags || []).map(t => t.toLowerCase());
  const desc = (product.description || '').toLowerCase();

  return title.includes(b) || brandSpec.includes(b) || tags.some(t => t.includes(b)) || desc.includes(b);
};

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategorySlug, 
    navigateToCategory,
    addToCart,
    openCalculator,
    toggleFavorite,
    isFavorite,
    comparisonList,
    addToComparison,
    removeFromComparison,
    addToast
  } = useStore();
  const { t, language } = useTranslation();

  // URL query parametrlarini sinxronlash (React Router bilan)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== selectedCategorySlug) {
      navigateToCategory(cat || null);
    }
    const q = searchParams.get('search') ?? searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Har qanday toifada turganda ortga qaytish (barcha mahsulotlarga aylanmasdan to'g'ri ortga qaytadi)
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSelectCategory = (slug: string | null) => {
    navigateToCategory(slug);
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    // replace: true orqali brauzer tarixiga ortiqcha oraliq qadam qo'shilmaydi
    setSearchParams(params, { replace: true });
    setCurrentPage(1);
  };

  // Filtr holatlari
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [onlyZeroDown, setOnlyZeroDown] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination holatlari
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  // Brendlar ro'yxati (mavjud tovarlardan avtomatik chiqariladi)
  const availableBrands = useMemo(() => {
    const defaultBrands = [
      'Apple', 'Samsung', 'Xiaomi', 'Artel', 'Dyson', 
      'Sony', 'Lenovo', 'Asus', 'HP', 'Philips', 
      'Braun', 'Tefal', 'Baseus', '70mai', 'DeLonghi', 'Pioneer', 'Midea', 'LG'
    ];
    return defaultBrands.filter((b) => products.some((p) => isProductInBrand(p, b)));
  }, [products]);

  // Brendlar qidiruvi
  const filteredBrandsList = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    return availableBrands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase().trim()));
  }, [availableBrands, brandSearch]);

  // Hozirgi tanlangan toifa obyekti
  const currentCategory = useMemo(() => {
    if (!selectedCategorySlug) return null;
    return CATEGORIES.find((c) => isProductInCategory({ categoryId: c.id, categoryName: c.name } as Product, selectedCategorySlug) || c.slug === selectedCategorySlug || c.id === selectedCategorySlug);
  }, [selectedCategorySlug]);

  // Mahsulotlarni filtrlash va saralash
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Qidiruv bo'yicha (Aqlli tokenlashtirilgan qidiruv)
    if (searchQuery.trim()) {
      result = searchProducts(result, searchQuery);

      // Agar kategoriya ham tanlangan bo'lsa va unda ham tovarlar topilsa
      if (selectedCategorySlug) {
        const inCat = result.filter((p) => isProductInCategory(p, selectedCategorySlug));
        if (inCat.length > 0) {
          result = inCat;
        }
      }
    } else if (selectedCategorySlug) {
      // Qidiruv bo'lmaganda faqat toifa bo'yicha
      result = result.filter((p) => isProductInCategory(p, selectedCategorySlug));
    }

    // 2. 0-0-12 Nasiya
    if (onlyZeroDown) {
      result = result.filter((p) => p.hasZeroDown);
    }

    // 3. Muddat
    if (selectedMonths) {
      result = result.filter((p) => p.maxMonths >= selectedMonths);
    }

    // 4. Narx oralig'i
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // 5. Brendlar
    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        selectedBrands.some((b) => isProductInBrand(p, b))
      );
    }

    // 6. Reyting
    if (minRating) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 7. 1 kunda yetkazish
    if (freeDeliveryOnly) {
      result = result.filter((p) => p.deliveryDays === 1);
    }

    // 8. Faqat chegirmalilar
    if (discountOnly) {
      result = result.filter((p) => (p.discountPercentage || 0) > 0);
    }

    // 9. Omborda mavjud
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Saralash (Sorting)
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'discount':
          return (b.discountPercentage || 0) - (a.discountPercentage || 0);
        case 'newest':
          return (b.discountPercentage || 0) - (a.discountPercentage || 0) || b.price - a.price;
        case 'popular':
        default:
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      }
    });

    return result;
  }, [
    products,
    selectedCategorySlug,
    searchQuery,
    onlyZeroDown,
    selectedMonths,
    priceRange,
    selectedBrands,
    minRating,
    freeDeliveryOnly,
    discountOnly,
    inStockOnly,
    sortBy,
  ]);

  // Pagination hisob-kitoblari
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // Faol filtrlar mavjudligini tekshirish
  const hasActiveFilters = Boolean(
    onlyZeroDown ||
    selectedMonths !== null ||
    priceRange[0] > 0 ||
    priceRange[1] < 25000000 ||
    selectedBrands.length > 0 ||
    minRating !== null ||
    freeDeliveryOnly ||
    discountOnly ||
    inStockOnly ||
    selectedCategorySlug !== null ||
    searchQuery.trim() !== ''
  );

  const activeFilterCount = [
    onlyZeroDown,
    selectedMonths !== null,
    priceRange[0] > 0 || priceRange[1] < 25000000,
    selectedBrands.length > 0,
    minRating !== null,
    freeDeliveryOnly,
    discountOnly,
    inStockOnly,
    selectedCategorySlug !== null,
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setOnlyZeroDown(false);
    setSelectedMonths(null);
    setPriceRange([0, 25000000]);
    setSelectedBrands([]);
    setBrandSearch('');
    setMinRating(null);
    setFreeDeliveryOnly(false);
    setDiscountOnly(false);
    setInStockOnly(false);
    setSearchQuery('');
    navigateToCategory(null);
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  // Tezkor narx chipini bosish
  const setQuickPrice = (maxPrice: number) => {
    if (priceRange[1] === maxPrice && priceRange[0] === 0) {
      setPriceRange([0, 25000000]);
    } else {
      setPriceRange([0, maxPrice]);
    }
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-6 pb-24 md:pb-8">
      {/* 1. Breadcrumb va Sarlavha Paneli */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer group shrink-0"
            title="Ortga qaytish"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-black dark:text-gray-400 dark:group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
            <span>{language === 'ru' ? 'Назад' : 'Ortga'}</span>
          </button>

          <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 overflow-x-auto no-scrollbar py-0.5">
            <Link to="/" className="text-gray-600 dark:text-slate-300 hover:text-uzum-primary dark:hover:text-purple-400 transition-colors font-medium shrink-0">
              {t('home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-600 shrink-0" />
            <span className="text-gray-800 dark:text-slate-100 font-semibold shrink-0">{t('catalogAndFilters')}</span>
            {currentCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-600 shrink-0" />
                <span className="text-uzum-primary dark:text-purple-300 font-bold shrink-0">{getCategoryTitle(currentCategory.slug, language)}</span>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {searchQuery
                ? `"${searchQuery}" ${t('searchResultsFor')}`
                : currentCategory
                ? getCategoryTitle(currentCategory.slug, language)
                : t('catalogTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1 flex items-center gap-2">
              <span>{t('foundLabel')} <strong className="text-uzum-primary dark:text-purple-400 font-bold">{filteredAndSortedProducts.length}</strong> {t('itemsCount')}</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-uzum-primary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200/50 dark:border-purple-800/50">
                  <SlidersHorizontal className="w-3 h-3" />
                  {activeFilterCount} ta faol filtr
                </span>
              )}
            </p>
          </div>

          {/* Mobil uchun Filtr ochish tugmasi */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-uzum-primary text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('filterBtn')}</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-uzum-primary text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Yangi: Interaktiv Toifalar Karusel Paneli (Category Pills / Chips Carousel) */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
          {/* Barcha toifalar tugmasi */}
          <button
            type="button"
            onClick={() => handleSelectCategory(null)}
            className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              selectedCategorySlug === null
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 ring-2 ring-purple-300 dark:ring-purple-900'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200/80 dark:border-slate-700 hover:border-uzum-primary/50 hover:bg-purple-50/50 dark:hover:bg-slate-700/60 shadow-xs'
            }`}
          >
            <Layers className={`w-4 h-4 ${selectedCategorySlug === null ? 'text-white' : 'text-uzum-primary dark:text-purple-400'}`} />
            <span>{t('allCategories')}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              selectedCategorySlug === null ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
            }`}>
              {products.length}
            </span>
          </button>

          {/* Har bir toifa chipi */}
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.slug] || Sparkles;
            const isSelected = selectedCategorySlug === cat.slug;
            const count = products.filter((p) => isProductInCategory(p, cat.slug)).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.slug)}
                className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 ring-2 ring-purple-300 dark:ring-purple-900'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200/80 dark:border-slate-700 hover:border-uzum-primary/50 hover:bg-purple-50/50 dark:hover:bg-slate-700/60 shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-uzum-primary dark:text-purple-400'}`} />
                <span>{getCategoryTitle(cat.slug, language)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tanlangan Toifa Uchun Maxsus Spotlight Banner */}
      {currentCategory && (
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-purple-800/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-purple-500 to-transparent" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-purple-950">
                  {t('catalogTitle')}
                </span>
                <span className="text-xs text-purple-200 font-medium">
                  {filteredAndSortedProducts.length} {t('itemsCount')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {getCategoryTitle(currentCategory.slug, language)}
              </h2>
              {/* Afzalliklar */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-purple-100 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {t('categoryBannerPerk1')}
                </span>
                <span className="hidden sm:inline text-purple-400">•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {t('categoryBannerPerk2')}
                </span>
                <span className="hidden sm:inline text-purple-400">•</span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-300" />
                  {t('categoryBannerPerk3')}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSelectCategory(null)}
              className="self-start sm:self-center px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('categoryBannerClear')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Yuqori Saralash (Sort), Ko'rinish (View), va 1-bosqichli Tezkor Filtrlar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-gray-200 dark:border-slate-700/80 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mobile Sort Select */}
          <div className="w-full sm:hidden">
            <CustomSelect
              size="sm"
              value={sortBy}
              onChange={(val) => {
                setSortBy(val as SortOption);
                setCurrentPage(1);
              }}
              options={[
                { value: 'popular', label: t('sortPopular') },
                { value: 'price_asc', label: t('sortPriceAsc') },
                { value: 'price_desc', label: t('sortPriceDesc') },
                { value: 'rating', label: t('sortRating') },
                { value: 'discount', label: t('sortDiscount') },
                { value: 'newest', label: t('sortNewest') },
              ]}
            />
          </div>

          {/* Desktop Sorting Pills */}
          <div className="hidden sm:flex items-center gap-1.5 flex-wrap text-xs">
            <div className="flex items-center gap-1 text-gray-500 dark:text-slate-400 font-bold mr-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400" />
              <span>{t('sorting')}</span>
            </div>

            {[
              { id: 'popular', label: t('sortPopular') },
              { id: 'price_asc', label: t('sortPriceAsc') },
              { id: 'price_desc', label: t('sortPriceDesc') },
              { id: 'rating', label: t('sortRating') },
              { id: 'discount', label: t('sortDiscount') },
              { id: 'newest', label: t('sortNewest') },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSortBy(s.id as SortOption);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  sortBy === s.id
                    ? 'bg-uzum-primary text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-700/60 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* O'ng tomon: Ko'rinish (Grid/List) va Sahifadagi tovarlar soni */}
          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('clearAll')}</span>
              </button>
            )}

            {/* Grid / List almashtirish */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-700/60 p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-800 text-uzum-primary dark:text-purple-300 shadow-xs' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('gridViewTitle')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-800 text-uzum-primary dark:text-purple-300 shadow-xs' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('listViewTitle')}
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tezkor 1-bosqichli filtrlar (Direct Quick Filter Chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100 dark:border-slate-700/60 scrollbar-none text-xs">
          <span className="text-gray-400 dark:text-slate-500 font-semibold text-[11px] shrink-0 mr-1">
            {t('quickFiltersLabel')}
          </span>

          {/* 0-0-12 tezkor filtr */}
          <button
            type="button"
            onClick={() => {
              setOnlyZeroDown(!onlyZeroDown);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              onlyZeroDown
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>0-0-12 {t('installment')}</span>
          </button>

          {/* 1 kunda yetkazish */}
          <button
            type="button"
            onClick={() => {
              setFreeDeliveryOnly(!freeDeliveryOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              freeDeliveryOnly
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/50 dark:border-blue-800/40'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{t('fastDelivery1Day')}</span>
          </button>

          {/* Reyting 4.5+ */}
          <button
            type="button"
            onClick={() => {
              setMinRating(minRating === 4.5 ? null : 4.5);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              minRating === 4.5
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200/50 dark:border-amber-800/40'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>4.5+ {t('ratingFilterLabel')}</span>
          </button>

          {/* Chegirmali tovarlar */}
          <button
            type="button"
            onClick={() => {
              setDiscountOnly(!discountOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              discountOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/50 dark:border-rose-800/40'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{t('discountOnlyFilter')}</span>
          </button>

          {/* Omborda mavjud */}
          <button
            type="button"
            onClick={() => {
              setInStockOnly(!inStockOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              inStockOnly
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-uzum-primary dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200/50 dark:border-purple-800/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('inStockOnlyFilter')}</span>
          </button>
        </div>
      </div>

      {/* 5. Faol Filtr Chiplari (Active Filter Badges) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 dark:text-slate-500 font-semibold mr-1">{t('activeFilters')}:</span>

          {selectedCategorySlug && (
            <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 font-bold px-3 py-1 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              {t('categoryLabel')} {currentCategory ? getCategoryTitle(currentCategory.slug, language) : selectedCategorySlug}
              <button onClick={() => handleSelectCategory(null)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {onlyZeroDown && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-3 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              0-0-12 {t('installment')}
              <button onClick={() => setOnlyZeroDown(false)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {selectedMonths && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold px-3 py-1 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              {selectedMonths} {t('monthsUnit')}
              <button onClick={() => setSelectedMonths(null)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {(priceRange[0] > 0 || priceRange[1] < 25000000) && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold px-3 py-1 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
              {t('priceBadgeLabel')} {formatPrice(priceRange[0], true, language)} — {formatPrice(priceRange[1], true, language)}
              <button onClick={() => setPriceRange([0, 25000000])} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {selectedBrands.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700/70 text-gray-800 dark:text-slate-200 font-bold px-3 py-1 rounded-xl border border-gray-200 dark:border-slate-600">
              {t('brandLabel')} {b}
              <button onClick={() => toggleBrand(b)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {minRating && (
            <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-300 font-bold px-3 py-1 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50">
              <span className="flex items-center gap-1">{minRating}+ <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /></span>
              <button onClick={() => setMinRating(null)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {freeDeliveryOnly && (
            <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 font-bold px-3 py-1 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              {t('fastDelivery1Day')}
              <button onClick={() => setFreeDeliveryOnly(false)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {discountOnly && (
            <span className="inline-flex items-center gap-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 font-bold px-3 py-1 rounded-xl border border-rose-200/50 dark:border-rose-800/50">
              {t('discountOnlyFilter')}
              <button onClick={() => setDiscountOnly(false)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 font-bold px-3 py-1 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              {t('inStockOnlyFilter')}
              <button onClick={() => setInStockOnly(false)} className="hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* 6. Asosiy Maydon: Chapda Keng qamrovli Filtrlar Sidebar, O'ngda Mahsulotlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/90 dark:border-slate-700/80 p-5 shadow-xs space-y-6 sticky top-24 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-uzum-primary dark:text-purple-400" />
              <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('filters')}</h3>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-uzum-primary dark:text-purple-300 text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {t('clearAll')}
              </button>
            )}
          </div>

          {/* 1. 0-0-12 Imtiyozli Nasiya */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              {t('specialPrivilege')}
            </span>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/50 cursor-pointer hover:bg-purple-100/70 transition-all select-none">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-uzum-primary dark:text-purple-300 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">0-0-12 {t('installment')}</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">{t('zeroMarkup')}</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={onlyZeroDown}
                onChange={(e) => {
                  setOnlyZeroDown(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 2. Bo'limlar / Kategoriyalar */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              {t('allCategories')}
            </span>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => handleSelectCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  selectedCategorySlug === null
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>{t('allCategories')}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                  {products.length}
                </span>
              </button>
              {CATEGORIES.map((c) => {
                const count = products.filter((p) => isProductInCategory(p, c.slug)).length;
                const isSel = selectedCategorySlug === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCategory(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isSel
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="truncate">{getCategoryTitle(c.slug, language)}</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Narx oralig'i (Min - Max) va Tezkor Chiplar */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              {t('priceRange')}
            </span>

            {/* Tezkor narx presetlari */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: t('quickPriceUpTo3m'), max: 3000000 },
                { label: t('quickPriceUpTo5m'), max: 5000000 },
                { label: t('quickPriceUpTo10m'), max: 10000000 },
                { label: t('quickPriceAll'), max: 25000000 },
              ].map((qp) => (
                <button
                  key={qp.max}
                  type="button"
                  onClick={() => setQuickPrice(qp.max)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                    priceRange[1] === qp.max && priceRange[0] === 0
                      ? 'bg-uzum-primary text-white border-uzum-primary shadow-xs'
                      : 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {qp.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 dark:text-slate-500 block mb-1">{t('priceFrom')}</label>
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  step={500000}
                  value={priceRange[0]}
                  onChange={(e) => {
                    setPriceRange([Number(e.target.value), priceRange[1]]);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-bold outline-none focus:border-uzum-primary"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 dark:text-slate-500 block mb-1">{t('priceTo')}</label>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={25000000}
                  step={500000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], Number(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-bold outline-none focus:border-uzum-primary"
                />
              </div>
            </div>
            <input
              type="range"
              min={1000000}
              max={25000000}
              step={500000}
              value={priceRange[1]}
              onChange={(e) => {
                setPriceRange([priceRange[0], Number(e.target.value)]);
                setCurrentPage(1);
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="text-[11px] text-right font-bold text-uzum-primary dark:text-purple-300">
              {t('maxLimit')} {formatPrice(priceRange[1], true, language)}
            </div>
          </div>

          {/* 4. Nasiya muddati */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              {t('maxMonths')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[3, 6, 12, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelectedMonths(selectedMonths === m ? null : m);
                    setCurrentPage(1);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedMonths === m
                      ? 'bg-uzum-primary text-white border-uzum-primary shadow-xs'
                      : 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m} {t('monthsUnit')} {m === 12 && '⭐'}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Brendlar bo'yicha filter (Ichki qidiruv bilan) */}
          {availableBrands.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
                {t('brands')}
              </span>

              {/* Brend qidirish inputi */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={t('searchBrandsPlaceholder')}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white text-xs outline-none focus:border-uzum-primary transition-all"
                />
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {filteredBrandsList.map((b) => (
                  <label key={b} className="flex items-center justify-between text-xs text-gray-700 dark:text-slate-300 cursor-pointer hover:text-black dark:hover:text-white select-none py-0.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => toggleBrand(b)}
                        className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
                      />
                      <span>{b}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                      ({products.filter(p => isProductInBrand(p, b)).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 6. Reyting */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              {t('ratingFilterLabel')}
            </span>
            <div className="space-y-1">
              {[4.8, 4.5, 4.0].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setMinRating(minRating === r ? null : r);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    minRating === r ? 'bg-amber-100 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{r} {t('ratingAndAbove')}</span>
                  </div>
                  {minRating === r && <Check className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Yetkazib berish sharti */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              {t('deliveryFilterLabel')}
            </span>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={freeDeliveryOnly}
                onChange={(e) => {
                  setFreeDeliveryOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {t('fastDelivery1Day')}
              </span>
            </label>
          </div>
        </aside>

        {/* O'NG TOMON: MAHSULOTLAR (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {filteredAndSortedProducts.length === 0 ? (
            /* Bo'sh holat (No products found) + Tavsiya etilgan tovarlar */
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-gray-200/90 dark:border-slate-700/80 shadow-xs space-y-4 max-w-md mx-auto my-4">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner">
                  <Package className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('noProductsFound')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {t('noProductsDesc')}
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-uzum-primary text-white text-xs font-bold rounded-xl hover:bg-uzum-hover transition-colors shadow-sm inline-flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('clearFiltersBtn')}
                </button>
              </div>

              {/* Tavsiya qilingan mahsulotlar */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-uzum-primary dark:text-purple-400" />
                    {t('recommendedProducts')}
                  </h4>
                  <button onClick={resetAllFilters} className="text-xs font-bold text-uzum-primary dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer">
                    <span>{t('viewAll')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {products.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid Ko'rinishi (Responsive 2-4 ustun) */
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                {paginatedProducts.map((p) => (
                  <div key={p.id}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* Pagination va Sahifalar Paneli */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    {t('showingProductsCount')} <strong className="text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</strong> {t('ofProductsCount')} <strong className="text-gray-900 dark:text-white">{filteredAndSortedProducts.length}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>{t('prevPage')}</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-uzum-primary text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('nextPage')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Yangi Yuqori Sifatli List / Ro'yxat Ko'rinishi */
            <div className="space-y-4">
              {paginatedProducts.map((p) => {
                const fav = isFavorite(p.id);
                const compared = comparisonList.includes(p.id);
                const monthlyPayment = calculateMonthlyPaymentQuick(p.price, 12);

                return (
                  <div 
                    key={p.id}
                    className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/90 dark:border-slate-700/80 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-5 hover:shadow-md transition-all group"
                  >
                    {/* Mahsulot Rasmi va Chegirma Yorlig'i */}
                    <div className="relative w-full md:w-44 h-44 shrink-0 bg-gray-50 dark:bg-slate-900 rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-slate-700/60 overflow-hidden">
                      <img 
                        src={p.images[0]} 
                        alt={p.title} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                      {p.discountPercentage && p.discountPercentage > 0 && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-xs">
                          -{p.discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Mahsulot Tafsilotlari */}
                    <div className="flex-1 min-w-0 space-y-2 text-left w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                          {getCategoryTitle(p.categoryId, language)}
                        </span>
                        {p.hasZeroDown && (
                          <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            0-0-12
                          </span>
                        )}
                        {p.deliveryDays === 1 && (
                          <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-600" />
                            {t('fastDelivery1Day')}
                          </span>
                        )}
                      </div>

                      <Link 
                        to={`/product/${p.id}`} 
                        className="font-extrabold text-base text-gray-900 dark:text-white hover:text-uzum-primary dark:hover:text-purple-400 block line-clamp-2 transition-colors"
                      >
                        {p.title}
                      </Link>

                      {/* Reyting va Sharhlar */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                          <span>{p.rating}</span>
                        </div>
                        <span className="text-gray-400 dark:text-slate-500">
                          ({p.reviewsCount} {t('reviewsCount')})
                        </span>
                        <span className="text-gray-300 dark:text-slate-600">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          {p.inStock ? t('compareModalInStock') : t('compareModalOutOfStock')}
                        </span>
                      </div>

                      {/* Xususiyatlar preview chiplari */}
                      {p.specs && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(p.specs).slice(0, 3).map(([key, val]) => (
                            <span key={key} className="text-[11px] bg-gray-100 dark:bg-slate-700/60 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                              <strong className="font-semibold text-gray-700 dark:text-slate-200">{key}:</strong> {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Narx va Harakat Tugmalari */}
                    <div className="shrink-0 w-full md:w-56 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-700/60 flex flex-row md:flex-col justify-between items-end md:items-stretch gap-3">
                      <div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 line-through block">
                            {formatPrice(p.originalPrice, true, language)}
                          </span>
                        )}
                        <div className="text-lg font-black text-gray-900 dark:text-white">
                          {formatPrice(p.price, true, language)}
                        </div>
                        <div className="text-xs font-bold text-uzum-primary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl inline-block mt-1">
                          {formatPrice(monthlyPayment, true, language)} {t('perMonth')}
                        </div>
                      </div>

                      {/* Harakatlar */}
                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(p, 12, 'installment');
                            addToast(`«${p.title}» ${t('cartTitle')}ga qo'shildi`, 'success');
                          }}
                          className="flex-1 py-2.5 px-3 bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-bold rounded-2xl shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t('addToCart')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openCalculator(p)}
                          className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 transition-colors cursor-pointer"
                          title={t('calculatorTitle')}
                        >
                          <Calculator className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(p.id)}
                          className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                            fav 
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-800/40' 
                              : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-700/60 text-gray-500 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                          }`}
                          title="Sevimli"
                        >
                          <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* List view pagination */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    {t('showingProductsCount')} <strong className="text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)}</strong> {t('ofProductsCount')} <strong className="text-gray-900 dark:text-white">{filteredAndSortedProducts.length}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>{t('prevPage')}</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('nextPage')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 7. Mobile Filter Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Content */}
          <div
            className="relative w-full max-w-sm bg-white dark:bg-slate-800 h-full overflow-y-auto p-5 space-y-6 shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-uzum-primary dark:text-purple-400" />
                  <h3 className="text-base font-black text-gray-900 dark:text-white">{t('filters')}</h3>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-uzum-primary dark:text-purple-300 text-[10px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 0-0-12 */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/60 dark:border-purple-800/50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-uzum-primary dark:text-purple-300" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">0-0-12 {t('installment')}</span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">{t('zeroMarkup')}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={onlyZeroDown}
                  onChange={(e) => {
                    setOnlyZeroDown(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </label>

              {/* Narx presetlari va Slider */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{t('priceRange')}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: t('quickPriceUpTo3m'), max: 3000000 },
                    { label: t('quickPriceUpTo5m'), max: 5000000 },
                    { label: t('quickPriceUpTo10m'), max: 10000000 },
                    { label: t('quickPriceAll'), max: 25000000 },
                  ].map((qp) => (
                    <button
                      key={qp.max}
                      type="button"
                      onClick={() => setQuickPrice(qp.max)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border text-center cursor-pointer ${
                        priceRange[1] === qp.max && priceRange[0] === 0
                          ? 'bg-uzum-primary text-white border-uzum-primary shadow-xs'
                          : 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={1000000}
                  max={25000000}
                  step={500000}
                  value={priceRange[1]}
                  onChange={(e) => {
                    setPriceRange([priceRange[0], Number(e.target.value)]);
                    setCurrentPage(1);
                  }}
                  className="w-full accent-purple-600 cursor-pointer mt-2"
                />
                <div className="text-xs font-bold text-uzum-primary dark:text-purple-300 text-right">
                  {formatPrice(priceRange[1], true, language)}
                </div>
              </div>

              {/* Muddat */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{t('maxMonths')}:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMonths(selectedMonths === m ? null : m);
                        setCurrentPage(1);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                        selectedMonths === m
                          ? 'bg-uzum-primary text-white border-uzum-primary'
                          : 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {m} {t('monthsUnit')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toifalar (Mobile) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{t('allCategories')}:</span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  <button
                    onClick={() => handleSelectCategory(null)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      selectedCategorySlug === null
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t('allCategories')} ({products.length})
                  </button>
                  {CATEGORIES.map((c) => {
                    const count = products.filter((p) => isProductInCategory(p, c.slug)).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCategory(c.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                          selectedCategorySlug === c.slug
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate">{getCategoryTitle(c.slug, language)}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brendlar (Mobile) */}
              {availableBrands.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{t('brands')}:</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {availableBrands.map((b) => (
                      <label key={b} className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={() => toggleBrand(b)}
                          className="w-3.5 h-3.5 accent-purple-600 rounded"
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Qo'llash va Tozalash tugmalari */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700/60 space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-uzum-primary text-white font-bold rounded-2xl text-xs shadow-md shadow-purple-500/25 active:scale-95 cursor-pointer"
              >
                {t('showResults')} ({filteredAndSortedProducts.length})
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-2xl text-xs hover:bg-gray-200 cursor-pointer"
                >
                  {t('clearAll')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
