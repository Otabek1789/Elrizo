import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { FavoritesPage } from './pages/FavoritesPage';
import { AdminPanel } from './pages/AdminPanel';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { LoginRequiredModal } from './components/LoginRequiredModal';
import { CitySelectModal } from './components/CitySelectModal';
import { InstallmentCalculator } from './components/InstallmentCalculator';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ComparisonBar } from './components/ComparisonBar';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { NakapitelniyCardModal } from './components/NakapitelniyCardModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ScrollProgressBar, ScrollToTopButton } from './components/ScrollFeatures';
import { TelegramFloatingButton } from './components/TelegramFloatingButton';
import { useStore } from './store/useStore';
import { supabase, isAdminUser, ADMIN_EMAIL } from './lib/supabase';
import { User } from './types';
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    calculatorProduct,
    isCalculatorOpen,
    closeCalculator,
    toasts,
    removeToast,
    initSupabaseCheck,
    fetchProductsFromCloud,
    theme,
  } = useStore();

  useEffect(() => {
    initSupabaseCheck();
    fetchProductsFromCloud();

    // Supabase OAuth (Google) orqali kirganda sessiyani avtomatik qabul qilish
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const isAdmin = isAdminUser(email);
        const meta = session.user.user_metadata || {};
        const fullName = meta.full_name || meta.name || email.split('@')[0];

        const currentUser = useStore.getState().user;
        if (!currentUser || currentUser.email !== email) {
          const userObj: User = {
            id: session.user.id || (isAdmin ? 'admin-otabek' : `usr-${Date.now()}`),
            fullName: isAdmin ? "Otabek Jo'rayev (Bosh Administrator)" : fullName,
            email: email,
            phone: session.user.phone || meta.phone || '+998 90 123 45 67',
            isVerified: true,
            scoringLimit: 0,
            usedLimit: 0,
            isAdmin,
            role: isAdmin ? 'admin' : 'user',
            cashbackBalance: currentUser?.cashbackBalance ?? 0,
          };

          useStore.setState({ user: userObj });
          const currentLang = useStore.getState().language;
          useStore.getState().addToast(
            isAdmin 
              ? (currentLang === 'ru' 
                  ? "Добро пожаловать, Главный Администратор! (Google)" 
                  : currentLang === 'en' 
                  ? "Welcome, Head Administrator! (Google)" 
                  : "Xush kelibsiz, Bosh Administrator! (Google)")
              : (currentLang === 'ru' 
                  ? `Добро пожаловать, ${userObj.fullName}! (через Google)` 
                  : currentLang === 'en' 
                  ? `Welcome, ${userObj.fullName}! (via Google)` 
                  : `Xush kelibsiz, ${userObj.fullName}! (Google orqali kirdingiz)`), 
            'success'
          );
          if (isAdmin && (location.pathname === '/login' || location.pathname === '/auth')) {
            navigate('/admin', { replace: true });
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initSupabaseCheck]);

  // Dark/Light theme class synchronization
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Har safar sahifa o'zgarganda yuqoriga aylantirish
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth';

  return (
    <div className={`flex flex-col bg-[#F8F9FA] dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 relative selection:bg-purple-200 selection:text-purple-900 ${
      isAdminPage ? 'h-screen overflow-hidden' : 'min-h-screen'
    }`}>
      {/* 1. Scroll Progress Bar (Sayt bo'ylab scroll animatsiyasi) */}
      {!isAuthPage && !isAdminPage && <ScrollProgressBar />}

      {/* 2. Global Header (Admin panel yoki Login sahifasida bo'lmaganda) */}
      {!isAdminPage && !isAuthPage && <Header />}

      {/* 3. Main Dynamic Routes (Tezkor va qotishlarsiz o'tish) */}
      <main className={isAdminPage ? "flex-1 h-full overflow-hidden" : "flex-1 pb-20 md:pb-0"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 4. Global Footer (Admin panel va Login sahifasida ko'rinmaydi) */}
      {!isAdminPage && !isAuthPage && <Footer />}

      {/* 5. Suzuvchi Telegram Bot Tugmasi (@elrizo_bot) & Tepaga Qaytish */}
      {!isAdminPage && <TelegramFloatingButton />}
      {!isAdminPage && <ScrollToTopButton />}

      {/* 5.1. Mobil Pastki Navigatsiya (Faqat telefonlarda ko'rinadi) */}
      {!isAdminPage && !isAuthPage && <MobileBottomNav />}

      {/* 6. Global Modallar & Mini-Drawerlar */}
      <CartDrawer />
      <AuthModal />
      <LoginRequiredModal />
      <CitySelectModal />
      <ProductComparisonModal />
      <ComparisonBar />
      <OrderTrackingModal />
      <NakapitelniyCardModal />

      {/* 7. Global Tezkor Nasiya Kalkulyatori Modali */}
      {isCalculatorOpen && calculatorProduct && (
        <InstallmentCalculator
          product={calculatorProduct}
          isModal={true}
          onClose={closeCalculator}
        />
      )}

      {/* 8. Toast Bildirishnomalar Animatsiyasi */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-gray-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs backdrop-blur-md border border-white/10"
            >
              <div className="flex items-center gap-2.5">
                {t.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
                <span className="font-medium">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
