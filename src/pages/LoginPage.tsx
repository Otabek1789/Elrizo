import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Crown,
  ChevronRight,
  AlertCircle,
  X,
  Loader2,
  Send
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ADMIN_EMAIL, supabase } from '../lib/supabase';
import { User } from '../types';
import { useTranslation } from '../utils/translations';
import '../styles/auth103.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logoutUser, addToast } = useStore();
  const { t, language } = useTranslation();

  // 103 Rejimi (Sign In vs Sign Up)
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Sign In ma'lumotlari
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up ma'lumotlari
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('+998 ');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');

  // Agar allaqachon kirgan bo'lsa va profil holatida bo'lsa
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-purple-100 text-uzum-primary shadow-inner">
            {user.isAdmin ? (
              <Crown className="w-10 h-10 text-amber-500" />
            ) : (
              <UserIcon className="w-10 h-10 text-uzum-primary" />
            )}
          </div>

          <div>
            <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${
              user.isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-uzum-primary'
            }`}>
              {user.isAdmin ? t('loginAdminRole') : t('loginUserRole')}
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">{user.fullName}</h2>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
          </div>

          <div className="space-y-3 pt-2">
            {user.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>{t('authAdminPanelCardTitle')}</span>
              </button>
            )}

            <button
              onClick={() => navigate('/catalog')}
              className="w-full py-3 bg-uzum-primary hover:bg-uzum-hover text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>{t('catalog')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                logoutUser();
              }}
              className="w-full py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors"
            >
              {t('authLogoutBtn')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 1. Kirish (Sign in) — OTP shart emas, to'g'ridan-to'g'ri kirish
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail || !signInPassword) {
      setErrorMessage(t('checkoutFillRequired'));
      return;
    }

    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    // Administrator tekshiruvi: faqat belgilangan parol bilan
    if (isAdmin) {
      if (signInPassword !== '7540084@OJr') {
        setErrorMessage(
          language === 'ru' 
            ? 'Неверный пароль администратора!' 
            : language === 'en' 
            ? 'Incorrect administrator password!' 
            : "Administrator paroli noto'g'ri kiritildi!"
        );
        return;
      }

      // ADMIN PANELGA TO'G'RIDAN-TO'G'RI KIRISH
      const adminUser: User = {
        id: 'admin-otabek',
        fullName: "Otabek Jo'rayev (Bosh Administrator)",
        email: ADMIN_EMAIL,
        phone: '+998 90 777 00 00',
        isVerified: true,
        scoringLimit: 0,
        usedLimit: 0,
        isAdmin: true,
        role: 'admin',
      };

      useStore.setState({ user: adminUser, isAuthOpen: false });
      addToast(
        language === 'ru' 
          ? 'Добро пожаловать, Главный Администратор!' 
          : language === 'en' 
          ? 'Welcome, Head Administrator!' 
          : "Xush kelibsiz, Bosh Administrator!", 
        'success'
      );
      navigate('/admin');
      return;
    }

    // ODDIY FOYDALANUVCHI SIFATIDA TO'G'RIDAN-TO'G'RI KIRISH
    const regularUser: User = {
      id: `usr-${Date.now()}`,
      fullName: cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: '+998 90 123 45 67',
      isVerified: true,
      scoringLimit: 0,
      usedLimit: 0,
      isAdmin: false,
      role: 'user',
    };

    useStore.setState({ user: regularUser, isAuthOpen: false });
    addToast(`${regularUser.fullName}! ${t('checkoutSmsVerified')}`, 'success');
    navigate('/');
  };

  // 2. Ro'yxatdan o'tish (Sign up) — OTP shart emas, to'g'ridan-to'g'ri ro'yxatdan o'tish
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = signUpEmail.trim().toLowerCase();
    if (!signUpName || !cleanEmail || !signUpPassword) {
      setErrorMessage(t('checkoutFillRequired'));
      return;
    }

    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    if (isAdmin) {
      if (signUpPassword !== '7540084@OJr') {
        setErrorMessage(
          language === 'ru' 
            ? 'Неверный пароль администратора!' 
            : language === 'en' 
            ? 'Incorrect administrator password!' 
            : "Administrator paroli noto'g'ri kiritildi!"
        );
        return;
      }

      const adminUser: User = {
        id: 'admin-otabek',
        fullName: signUpName || "Otabek Jo'rayev (Bosh Administrator)",
        email: ADMIN_EMAIL,
        phone: signUpPhone || '+998 90 777 00 00',
        isVerified: true,
        scoringLimit: 0,
        usedLimit: 0,
        isAdmin: true,
        role: 'admin',
      };

      useStore.setState({ user: adminUser, isAuthOpen: false });
      addToast(
        language === 'ru' 
          ? 'Добро пожаловать, Главный Администратор!' 
          : language === 'en' 
          ? 'Welcome, Head Administrator!' 
          : "Xush kelibsiz, Bosh Administrator!", 
        'success'
      );
      navigate('/admin');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: signUpName,
      email: cleanEmail,
      phone: signUpPhone,
      isVerified: true,
      scoringLimit: 0,
      usedLimit: 0,
      isAdmin: false,
      role: 'user',
    };

    useStore.setState({ user: newUser, isAuthOpen: false });
    addToast(`${newUser.fullName}! ${t('checkoutSmsVerified')}`, 'success');
    navigate('/');
  };

  // Google OAuth orqali kirish (Google haqiqiy oynasi ochiladi va akkaunt tanlanadi)
  const handleGoogleLogin = async () => {
    try {
      setIsOAuthLoading(true);
      setErrorMessage(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.error("Google auth error:", error);
        const localizedMsg = language === 'ru'
          ? "Вход через Google еще не включен в консоли Supabase. Пожалуйста, включите провайдер Google."
          : language === 'en'
          ? "Google sign-in is not yet enabled in your Supabase dashboard. Please enable Google provider."
          : "Google orqali kirish Supabase panelida hali yoqilmagan. Iltimos, Supabase'da Google providerni faollashtiring.";

        setErrorMessage(localizedMsg);
        addToast(localizedMsg, 'info');
      }
    } catch (err: any) {
      console.error("Google login catch:", err);
      const errTxt = language === 'ru'
        ? "Произошла ошибка при подключении к Google."
        : language === 'en'
        ? "An error occurred while connecting to Google."
        : "Google tizimiga ulanishda xatolik yuz berdi.";
      setErrorMessage(errTxt);
      addToast(errTxt, 'error');
    } finally {
      setIsOAuthLoading(false);
    }
  };

  // Telegram orqali kirish tasdiqlash
  const handleTelegramLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTg = telegramUsername.trim().replace(/^@/, '');
    if (!cleanTg) return;

    const isAdmin = cleanTg.toLowerCase() === 'otabek1789' || cleanTg.toLowerCase() === 'otabek';

    if (isAdmin) {
      const adminUser: User = {
        id: 'admin-otabek',
        fullName: "Otabek Jo'rayev (Bosh Administrator)",
        email: ADMIN_EMAIL,
        phone: '+998 90 777 00 00',
        isVerified: true,
        scoringLimit: 0,
        usedLimit: 0,
        isAdmin: true,
        role: 'admin',
      };
      useStore.setState({ user: adminUser, isAuthOpen: false });
      addToast(
        language === 'ru' 
          ? 'Добро пожаловать через Telegram, Главный Администратор!' 
          : language === 'en'
          ? 'Welcome via Telegram, Head Administrator!'
          : "Telegram orqali xush kelibsiz, Bosh Administrator!", 
        'success'
      );
      setIsTelegramModalOpen(false);
      navigate('/admin');
      return;
    }

    const tgUser: User = {
      id: `tg-${Date.now()}`,
      fullName: `@${cleanTg}`,
      email: `${cleanTg}@telegram.org`,
      phone: '+998 90 123 45 67',
      isVerified: true,
      scoringLimit: 0,
      usedLimit: 0,
      isAdmin: false,
      role: 'user',
    };
    useStore.setState({ user: tgUser, isAuthOpen: false });
    addToast(
      language === 'ru'
        ? `${tgUser.fullName}! Вы успешно вошли через Telegram`
        : language === 'en'
        ? `${tgUser.fullName}! Successfully signed in via Telegram`
        : `${tgUser.fullName}! Telegram orqali muvaffaqiyatli kirdingiz`,
      'success'
    );
    setIsTelegramModalOpen(false);
    navigate('/');
  };

  // Ijtimoiy tarmoqlar (Google & Telegram) tugmalari bloki
  const renderSocialButtons = () => (
    <div className="w-full max-w-[380px] mt-2">
      <div className="flex items-center my-3">
        <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
        <span className="px-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{t('loginOrSocial')}</span>
        <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
      </div>

      <div className="flex items-center justify-center gap-3 w-full">
        {/* Haqiqiy Google bilan kirish tugmasi */}
        <button 
          type="button" 
          onClick={handleGoogleLogin}
          disabled={isOAuthLoading}
          className="flex-1 h-11 px-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/80 shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs font-bold text-gray-700 dark:text-slate-200 cursor-pointer disabled:opacity-50"
          title={language === 'ru' ? 'Войти через аккаунт Google' : language === 'en' ? 'Sign in with Google account' : 'Google hisobi orqali kirish'}
        >
          {isOAuthLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-uzum-primary" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* Telegram orqali kirish tugmasi */}
        <button 
          type="button" 
          onClick={() => {
            setErrorMessage(null);
            setIsTelegramModalOpen(true);
          }}
          className="flex-1 h-11 px-3 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs font-bold text-sky-700 dark:text-sky-300 cursor-pointer"
          title={language === 'ru' ? 'Быстрый вход через Telegram' : language === 'en' ? 'Fast login via Telegram' : 'Telegram orqali tezkor kirish'}
        >
          <svg className="w-4 h-4 text-[#229ED9] fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          <span>Telegram</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`auth-103-container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      {/* Yuqori orqaga qaytish tugmasi */}
      <Link 
        to="/" 
        replace
        onClick={() => window.scrollTo(0, 0)}
        className="absolute top-5 left-5 z-20 flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-sm hover:text-uzum-primary dark:hover:text-purple-300 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-gray-200 dark:border-slate-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('loginBackHome')}</span>
      </Link>

      <div className="auth-103-forms-container">
        <div className="auth-103-signin-signup">

          {/* 1. SIGN IN FORMASI */}
          <form onSubmit={handleSignInSubmit} className="auth-103-form sign-in-form">
            <div className="text-center mb-2">
              <h2 className="auth-103-title">{t('loginTitle')}</h2>
              <p className="text-xs text-gray-500 font-medium">
                {t('loginSubtitle')}
              </p>
            </div>

            {errorMessage && (
              <div className="w-full max-w-[400px] mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="auth-103-input-field">
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder={t('authEmailLabel')}
              />
            </div>

            <div className="auth-103-input-field">
              <Lock className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type={showSignInPassword ? 'text' : 'password'}
                required
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder={t('authPasswordLabel')}
              />
              <button
                type="button"
                onClick={() => setShowSignInPassword(!showSignInPassword)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" className="auth-103-btn">
              <span>{t('loginSignInTab')}</span>
            </button>

            {renderSocialButtons()}
          </form>

          {/* 2. SIGN UP FORMASI */}
          <form onSubmit={handleSignUpSubmit} className="auth-103-form sign-up-form">
            <div className="text-center mb-2">
              <h2 className="auth-103-title">{t('loginSignUpTab')}</h2>
              <p className="text-xs text-gray-500 font-medium">
                {t('loginSubtitle')}
              </p>
            </div>

            {errorMessage && (
              <div className="w-full max-w-[400px] mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="auth-103-input-field">
              <UserIcon className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                required
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder={t('loginFullNameLabel')}
              />
            </div>

            <div className="auth-103-input-field">
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder={t('authEmailLabel')}
              />
            </div>

            <div className="auth-103-input-field">
              <Phone className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="tel"
                required
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
                placeholder={t('loginPhoneLabel')}
              />
            </div>

            <div className="auth-103-input-field">
              <Lock className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type={showSignUpPassword ? 'text' : 'password'}
                required
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder={t('authPasswordLabel')}
              />
              <button
                type="button"
                onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" className="auth-103-btn">
              <span>{t('loginCreateAccountBtn')}</span>
            </button>

            {renderSocialButtons()}
          </form>

        </div>
      </div>

      {/* 103 PANELS KONTEYNERI (Chap va O'ng Panel Slidlari) */}
      <div className="auth-103-panels-container">
        {/* Chap Panel */}
        <div className="auth-103-panel auth-103-left-panel">
          <div className="auth-103-content">
            <h3>{t('loginNewUserQ')}</h3>
            <p>
              {t('loginNewUserText')}
            </p>
            <button 
              className="auth-103-btn transparent" 
              onClick={() => {
                setIsSignUpMode(true);
                setErrorMessage(null);
              }}
            >
              {t('loginSignUpTab')}
            </button>
          </div>
          <img src="/auth/log.svg" className="auth-103-image" alt="ELRIZO" />
        </div>

        {/* O'ng Panel */}
        <div className="auth-103-panel auth-103-right-panel">
          <div className="auth-103-content">
            <h3>{t('loginExistingUserQ')}</h3>
            <p>
              {t('loginExistingUserText')}
            </p>
            <button 
              className="auth-103-btn transparent" 
              onClick={() => {
                setIsSignUpMode(false);
                setErrorMessage(null);
              }}
            >
              {t('loginSignInTab')}
            </button>
          </div>
          <img src="/auth/register.svg" className="auth-103-image" alt="ELRIZO" />
        </div>
      </div>

      {/* TELEGRAM ORQALI KIRISH MODALI */}
      <AnimatePresence>
        {isTelegramModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-sky-100 dark:border-slate-800 shadow-2xl text-center space-y-4 relative"
            >
              <button
                type="button"
                onClick={() => setIsTelegramModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mx-auto text-[#229ED9] shadow-inner border border-sky-100 dark:border-sky-800/50">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {language === 'ru' ? 'Вход через Telegram' : language === 'en' ? 'Log in with Telegram' : 'Telegram orqali kirish'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {language === 'ru' 
                    ? <>Введите ваш профиль Telegram (<span className="text-sky-600 dark:text-sky-400 font-semibold">@username</span>) или номер телефона</>
                    : language === 'en'
                    ? <>Enter your Telegram handle (<span className="text-sky-600 dark:text-sky-400 font-semibold">@username</span>) or phone number</>
                    : <>Telegram profilingiz (<span className="text-sky-600 dark:text-sky-400 font-semibold">@username</span>) yoki telefon raqamingizni kiriting</>}
                </p>
              </div>

              <form onSubmit={handleTelegramLoginSubmit} className="space-y-3 pt-1">
                <div className="flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-[#229ED9] focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
                  <span className="text-[#229ED9] font-bold text-sm mr-2">@</span>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder={language === 'ru' ? 'username или номер телефона' : language === 'en' ? 'username or phone number' : 'username yoki telefon raqam'}
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!telegramUsername.trim()}
                  className="w-full py-3 rounded-xl bg-[#229ED9] hover:bg-[#1E88C7] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-500/25 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ru' ? 'Подтвердить и войти' : language === 'en' ? 'Confirm & Sign in' : 'Tasdiqlash va Kirish'}
                  </span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
