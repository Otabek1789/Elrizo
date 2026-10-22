import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  LayoutGrid, 
  CreditCard, 
  Heart, 
  ShoppingCart,
  User as UserIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/calculator';
import { useTranslation } from '../utils/translations';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    favorites, 
    cart, 
    user,
    openCart, 
    openCashbackCardModal,
    getCartItemsCount,
    getCartTotal
  } = useStore();
  const { t, language } = useTranslation();

  const cartCount = getCartItemsCount();
  const cartTotal = getCartTotal();
  const favoritesCount = favorites.length;
  const cashbackBalance = user?.cashbackBalance ?? 0;

  const currentPath = location.pathname;

  return (
    <nav 
      aria-label="Mobil pastki navigatsiya"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-colors"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {/* 1. Asosiy (Home) */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            currentPath === '/' 
              ? 'text-uzum-primary dark:text-purple-400 font-extrabold' 
              : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${currentPath === '/' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentPath === '/' && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-uzum-primary dark:bg-purple-400"
              />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">
            {t('home')}
          </span>
        </Link>

        {/* 2. Katalog */}
        <Link
          to="/catalog"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            currentPath.startsWith('/catalog') || currentPath.startsWith('/products')
              ? 'text-uzum-primary dark:text-purple-400 font-extrabold' 
              : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <LayoutGrid className={`w-5 h-5 ${currentPath.startsWith('/catalog') ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentPath.startsWith('/catalog') && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-uzum-primary dark:bg-purple-400"
              />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">
            {t('catalog')}
          </span>
        </Link>

        {/* 3. Jamg'arma Karta (1% Keshbek) */}
        <button
          type="button"
          onClick={openCashbackCardModal}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-amber-600 dark:text-amber-400 font-bold transition-all group"
          title="1% Jamg'arma Karta"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-active:scale-95 transition-transform">
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="absolute -top-1 -right-1 text-[8px] font-black bg-purple-900 text-amber-300 px-1 rounded-full border border-amber-300 shadow-xs">
              1%
            </span>
          </div>
          <span className="text-[9px] mt-0.5 font-black text-amber-700 dark:text-amber-300 truncate">
            Jamg'arma
          </span>
        </button>

        {/* 4. Sevimlilar (Favorites) */}
        <Link
          to="/favorites"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            currentPath === '/favorites' 
              ? 'text-uzum-primary dark:text-purple-400 font-extrabold' 
              : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${currentPath === '/favorites' ? 'fill-uzum-primary dark:fill-purple-400 stroke-uzum-primary dark:stroke-purple-400' : 'stroke-2'}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {favoritesCount}
              </span>
            )}
            {currentPath === '/favorites' && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-uzum-primary dark:bg-purple-400"
              />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">
            {t('favorites')}
          </span>
        </Link>

        {/* 5. Savat (Cart) */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:text-uzum-primary dark:hover:text-purple-300 transition-all relative group"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 stroke-2 group-active:scale-95 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 bg-uzum-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate font-bold text-gray-800 dark:text-gray-200">
            {cartTotal > 0 ? formatPrice(cartTotal, false, language) : t('cart')}
          </span>
        </button>
      </div>
    </nav>
  );
};
