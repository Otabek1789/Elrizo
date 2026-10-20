import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Search, 
  ChevronRight, 
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
  ArrowRight
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { CustomSelect } from '../components/CustomSelect';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/mockData';
import { formatPrice } from '../utils/calculator';
import { searchProducts } from '../utils/searchHelper';
import { Product } from '../types';
import { useTranslation, getCategoryTitle } from '../utils/translations';

type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'discount' | 'newest';

const isProductInCategory = (product: Product, slugOrId: string | null): boolean => {
  if (!slugOrId) return true;
  const s = slugOrId.toLowerCase();
  const catId = product.categoryId.toLowerCase();
  const catName = product.categoryName.toLowerCase();

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
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategorySlug, 
    navigateToCategory 
  } = useStore();
  const { t, language } = useTranslation();

  // URL query parametrlarini sinxronlash
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null && cat !== selectedCategorySlug) {
      navigateToCategory(cat || null);
    }
  }, [searchParams]);

  // Filtr holatlari
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [onlyZeroDown, setOnlyZeroDown] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Brendlar ro'yxati (mavjud tovarlardan avtomatik chiqariladi)
  const availableBrands = useMemo(() => {
    const defaultBrands = [
      'Apple', 'Samsung', 'Xiaomi', 'Artel', 'Dyson', 
      'Sony', 'Lenovo', 'Asus', 'HP', 'Philips', 
      'Braun', 'Tefal', 'Baseus', '70mai', 'DeLonghi', 'Pioneer', 'Midea', 'LG'
    ];
    return defaultBrands.filter((b) => products.some((p) => isProductInBrand(p, b)));
  }, [products]);

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
    sortBy,
  ]);

  // Faol filtrlar mavjudligini tekshirish
  const hasActiveFilters = Boolean(
    onlyZeroDown ||
    selectedMonths !== null ||
    priceRange[0] > 0 ||
    priceRange[1] < 25000000 ||
    selectedBrands.length > 0 ||
    minRating !== null ||
    freeDeliveryOnly ||
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
    selectedCategorySlug !== null,
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setOnlyZeroDown(false);
    setSelectedMonths(null);
    setPriceRange([0, 25000000]);
    setSelectedBrands([]);
    setMinRating(null);
    setFreeDeliveryOnly(false);
    setSearchQuery('');
    navigateToCategory(null);
    setSearchParams({});
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-6 animate-in fade-in duration-300">
      {/* 1. Breadcrumb va Sarlavha */}
      <div className="space-y-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-uzum-primary transition-colors">{t('home')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-700 font-semibold">{t('catalogAndFilters')}</span>
          {currentCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-uzum-primary font-bold">{getCategoryTitle(currentCategory.slug, language)}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {searchQuery
                ? `"${searchQuery}" ${t('searchResultsFor')}`
                : currentCategory
                ? getCategoryTitle(currentCategory.slug, language)
                : t('catalogTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {t('foundLabel')} <strong className="text-uzum-primary font-bold">{filteredAndSortedProducts.length}</strong> {t('itemsCount')}
            </p>
          </div>

          {/* Mobil uchun filtr ochish tugmasi */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-bold text-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('filterBtn')} {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Yuqori Saralash (Sort) va Ko'rinish (View) Paneli */}
      <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Saralash (Sort) Tanlovi */}
        {/* Mobile CustomSelect */}
        <div className="w-full sm:hidden">
          <CustomSelect
            size="sm"
            value={sortBy}
            onChange={(val) => setSortBy(val as SortOption)}
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
        <div className="hidden sm:flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold mr-1">
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
              onClick={() => setSortBy(s.id as SortOption)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                sortBy === s.id
                  ? 'bg-uzum-primary text-white shadow-xs'
                  : 'bg-gray-100/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* O'ng tomon: Ko'rinish (Grid/List) va faol filtrlar tozalash */}
        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{t('clearAll')}</span>
            </button>
          )}

          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-uzum-primary dark:text-purple-300 shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={t('gridViewTitle')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-uzum-primary dark:text-purple-300 shadow-xs' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={t('listViewTitle')}
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Faol Filtr Chiplari (Active Filter Badges) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 font-semibold mr-1">{t('activeFilters')}:</span>

          {selectedCategorySlug && (
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-uzum-primary font-bold px-2.5 py-1 rounded-lg">
              {t('categoryLabel')} {currentCategory ? getCategoryTitle(currentCategory.slug, language) : selectedCategorySlug}
              <button onClick={() => navigateToCategory(null)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyZeroDown && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
              0-0-12 {t('installment')}
              <button onClick={() => setOnlyZeroDown(false)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedMonths && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 font-bold px-2.5 py-1 rounded-lg">
              {selectedMonths} {t('monthsUnit')}
              <button onClick={() => setSelectedMonths(null)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(priceRange[0] > 0 || priceRange[1] < 25000000) && (
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg">
              {t('priceBadgeLabel')} {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
              <button onClick={() => setPriceRange([0, 25000000])} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedBrands.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 font-bold px-2.5 py-1 rounded-lg">
              {t('brandLabel')} {b}
              <button onClick={() => toggleBrand(b)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {minRating && (
            <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-900 font-bold px-2.5 py-1 rounded-lg">
              <span className="flex items-center gap-1">{minRating}+ <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /></span>
              <button onClick={() => setMinRating(null)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {freeDeliveryOnly && (
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded-lg">
              {t('fastDelivery1Day')}
              <button onClick={() => setFreeDeliveryOnly(false)} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* 4. Asosiy Maydon: Chapda Keng qamrovli Filtrlar Sidebar, O'ngda Mahsulotlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/90 dark:border-slate-800 p-5 shadow-xs space-y-6 sticky top-24 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-uzum-primary dark:text-purple-400" />
              <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('filterBtn')}</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {t('clearAll')}
              </button>
            )}
          </div>

          {/* 1. 0-0-12 Imtiyozli Nasiya */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              {t('specialPrivilege')}
            </span>
            <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 cursor-pointer hover:bg-purple-100/70 dark:hover:bg-purple-900/50 transition-colors">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-uzum-primary dark:text-purple-300" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">0-0-12 {t('installment')}</span>
              </div>
              <input
                type="checkbox"
                checked={onlyZeroDown}
                onChange={(e) => setOnlyZeroDown(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 2. Bo'limlar / Kategoriyalar */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              {t('allCategories')}
            </span>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => navigateToCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                  selectedCategorySlug === null
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{t('allCategories')}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              </button>
              {CATEGORIES.map((c) => {
                const count = products.filter((p) => isProductInCategory(p, c.slug)).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => navigateToCategory(c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      selectedCategorySlug === c.slug
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{getCategoryTitle(c.slug, language)}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Narx oralig'i (Min - Max) */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              {t('priceRange')}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">{t('priceFrom')}</label>
                <input
                  type="number"
                  min={0}
                  max={priceRange[1]}
                  step={500000}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-bold outline-none focus:border-uzum-primary"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">{t('priceTo')}</label>
                <input
                  type="number"
                  min={priceRange[0]}
                  max={25000000}
                  step={500000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
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
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="text-[11px] text-right font-bold text-uzum-primary dark:text-purple-300">
              {t('maxLimit')} {formatPrice(priceRange[1], true, language)}
            </div>
          </div>

          {/* 4. Nasiya muddati */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              {t('maxMonths')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[3, 6, 12, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonths(selectedMonths === m ? null : m)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedMonths === m
                      ? 'bg-uzum-primary text-white border-uzum-primary shadow-xs'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m} {t('monthsUnit')}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Brendlar bo'yicha filter */}
          {availableBrands.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                {t('brands')}
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {availableBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:text-black dark:hover:text-white">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 6. Reyting */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              {language === 'ru' ? 'Рейтинг' : language === 'en' ? 'Rating' : 'Reyting'}
            </span>
            <div className="space-y-1">
              {[4.8, 4.5, 4.0].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? null : r)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    minRating === r ? 'bg-amber-100 dark:bg-amber-950/40 font-bold text-amber-900 dark:text-amber-300' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
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
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              {language === 'ru' ? 'Доставка' : language === 'en' ? 'Delivery' : 'Yetkazish'}
            </span>
            <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={freeDeliveryOnly}
                onChange={(e) => setFreeDeliveryOnly(e.target.checked)}
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
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-gray-200/90 dark:border-slate-800 shadow-xs space-y-4 max-w-md mx-auto my-4">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center mx-auto shadow-inner">
                  <Package className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('noProductsFound')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t('noProductsDesc')}
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-uzum-primary text-white text-xs font-bold rounded-xl hover:bg-uzum-hover transition-colors shadow-sm inline-flex items-center gap-1.5 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('clearFiltersBtn')}
                </button>
              </div>

              {/* Tavsiya qilingan mahsulotlar */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-uzum-primary" />
                    {t('recommendedProducts')}
                  </h4>
                  <button onClick={resetAllFilters} className="text-xs font-bold text-uzum-primary hover:underline flex items-center gap-1">
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
            /* Grid Ko'rinishi (3-4 ustun) */
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-5"
            >
              {filteredAndSortedProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* List / Ro'yxat Ko'rinishi */
            <div className="space-y-3">
              {filteredAndSortedProducts.map((p) => (
                <div 
                  key={p.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-all"
                >
                  <img 
                    src={p.images[0]} 
                    alt={p.title} 
                    className="w-24 h-24 object-contain rounded-xl shrink-0 bg-gray-50 dark:bg-slate-800 p-1 border border-gray-100 dark:border-slate-700" 
                  />
                  <div className="flex-1 min-w-0 space-y-1.5 text-left w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{getCategoryTitle(p.categoryId, language)}</span>
                      {p.hasZeroDown && (
                        <span className="text-[9px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200/50 dark:border-purple-800/50">
                          0-0-12
                        </span>
                      )}
                    </div>
                    <Link to={`/product/${p.id}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-uzum-primary dark:hover:text-purple-400 block line-clamp-1">
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                        {p.rating}
                      </div>
                      <span className="text-gray-400 dark:text-gray-500">({p.reviewsCount} {t('reviewsCount')})</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800 flex sm:flex-col justify-between items-end">
                    <div>
                      <div className="text-base font-black text-gray-900 dark:text-white">{formatPrice(p.price, true, language)}</div>
                      <div className="text-[11px] font-bold text-uzum-primary dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                        {formatPrice(Math.round(p.price / 12), true, language)} {t('perMonth')}
                      </div>
                    </div>
                    <Link
                      to={`/product/${p.id}`}
                      className="mt-2 px-3 py-1.5 bg-uzum-primary text-white text-xs font-bold rounded-xl hover:bg-uzum-hover shadow-xs"
                    >
                      {t('moreDetails')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Filter Drawer / Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xs bg-white dark:bg-slate-800 h-full overflow-y-auto p-5 space-y-6 shadow-2xl flex flex-col justify-between transition-colors"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-uzum-primary dark:text-purple-400" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('filterBtn')}</h3>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 0-0-12 */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/50 cursor-pointer">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">0-0-12 {t('installment')}</span>
                  <input
                    type="checkbox"
                    checked={onlyZeroDown}
                    onChange={(e) => setOnlyZeroDown(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </label>

                {/* Muddat */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('maxMonths')}:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[3, 6, 12, 24].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMonths(selectedMonths === m ? null : m)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                          selectedMonths === m
                            ? 'bg-uzum-primary text-white border-uzum-primary'
                            : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-800'
                        }`}
                      >
                        {m} {t('monthsUnit')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Narx */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('priceLimit')}</span>
                  <input
                    type="range"
                    min={1000000}
                    max={25000000}
                    step={500000}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-purple-600"
                  />
                  <div className="text-xs font-bold text-uzum-primary dark:text-purple-300 text-right">
                    {formatPrice(priceRange[1], true, language)}
                  </div>
                </div>

                {/* Toifalar (Mobile) */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('allCategories')}:</span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    <button
                      onClick={() => navigateToCategory(null)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        selectedCategorySlug === null
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t('allCategories')} ({products.length})
                    </button>
                    {CATEGORIES.map((c) => {
                      const count = products.filter((p) => isProductInCategory(p, c.slug)).length;
                      return (
                        <button
                          key={c.id}
                          onClick={() => navigateToCategory(c.slug)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                            selectedCategorySlug === c.slug
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-uzum-primary dark:text-purple-300 font-bold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{getCategoryTitle(c.slug, language)}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brendlar (Mobile) */}
                {availableBrands.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('brands')}:</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {availableBrands.map((b) => (
                        <label key={b} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
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

              {/* Qo'llash tugmasi */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-uzum-primary text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {t('applyFilter')} ({filteredAndSortedProducts.length})
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="w-full py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    {t('clearAll')}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
