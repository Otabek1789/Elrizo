'use client';

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@/lib/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { CartDrawer } from './CartDrawer';
import { AuthModal } from './AuthModal';
import { LoginRequiredModal } from './LoginRequiredModal';
import { CitySelectModal } from './CitySelectModal';
import { InstallmentCalculator } from './InstallmentCalculator';
import { ProductComparisonModal } from './ProductComparisonModal';
import { ComparisonBar } from './ComparisonBar';
import { OrderTrackingModal } from './OrderTrackingModal';
import { ScrollToTopButton } from './ScrollFeatures';
import { TelegramFloatingButton } from './TelegramFloatingButton';
import { useStore } from '../store/useStore';
import { supabase, isAdminUser } from '../lib/supabase';
import { User } from '../types';
import { CheckCircle, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
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
                  ? 'Добро пожаловать, Главный Администратор! (Google)'
                  : 'Xush kelibsiz, Bosh Administrator! (Google)')
              : (currentLang === 'ru'
                  ? `Добро пожаловать, ${userObj.fullName}! (через Google)`
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
  }, [initSupabaseCheck, navigate, location.pathname]);

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
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth';
  const isTgPage = location.pathname.startsWith('/tg') || location.pathname.startsWith('/webapp');

  return (
    <div
      className={`flex flex-col w-full max-w-full overflow-x-hidden bg-[#F8F9FA] dark:bg-slate-900 text-gray-900 dark:text-gray-100 relative selection:bg-purple-200 selection:text-purple-900 ${
        isAdminPage ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Global Header (Admin panel, Login yoki Telegram Mini App da bo'lmaganda) */}
      {!isAdminPage && !isAuthPage && !isTgPage && <Header />}

      {/* Main Content */}
      <main
        className={
          isAdminPage
            ? 'flex-1 h-full overflow-hidden'
            : isTgPage
            ? 'flex-1 w-full'
            : 'flex-1 w-full max-w-full overflow-x-hidden pb-20 md:pb-0'
        }
      >
        {children}
      </main>

      {/* Global Footer */}
      {!isAdminPage && !isAuthPage && !isTgPage && <Footer />}

      {/* Suzuvchi Telegram Bot Tugmasi (@elrizo_bot) & Tepaga Qaytish */}
      {!isAdminPage && !isTgPage && <TelegramFloatingButton />}
      {!isAdminPage && !isTgPage && <ScrollToTopButton />}

      {/* Mobil Pastki Navigatsiya */}
      {!isAdminPage && !isAuthPage && !isTgPage && <MobileBottomNav />}

      {/* Global Modallar & Mini-Drawerlar */}
      {!isTgPage && mounted && (
        <>
          <CartDrawer />
          <AuthModal />
          <LoginRequiredModal />
          <CitySelectModal />
          <ProductComparisonModal />
          <ComparisonBar />
          <OrderTrackingModal />

          {/* Global Tezkor Nasiya Kalkulyatori Modali */}
          {isCalculatorOpen && calculatorProduct && (
            <InstallmentCalculator
              product={calculatorProduct}
              isModal={true}
              onClose={closeCalculator}
            />
          )}
        </>
      )}

      {/* Toast Bildirishnomalar Animatsiyasi */}
      {mounted && (
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
      )}
    </div>
  );
};

