import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Camera, 
  Save, 
  CreditCard, 
  Package, 
  Heart, 
  LogOut, 
  Crown, 
  Sparkles, 
  Check, 
  ArrowLeft,
  Calendar,
  FileText,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/calculator';
import { useTranslation } from '../utils/translations';

// Zamonaviy tayyor avatarlar to'plami
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
];

const CITIES = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Andijon',
  'Farg\'ona',
  'Namangan',
  'Qarshi',
  'Termiz',
  'Nukus',
  'Urganch',
  'Navoiy',
  'Jizzax',
  'Guliston'
];

// Qurilmadan yuklangan rasmni 256x256 hajmda sifatli siqish (localStorage xotirasini tejash uchun)
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, logoutUser, orders, favorites, language, openCashbackCardModal } = useStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'security'>('info');

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Toshkent');
  const [passportOrPinfl, setPassportOrPinfl] = useState(user?.passportOrPinfl || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || 'Toshkent');
      setPassportOrPinfl(user.passportOrPinfl || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Agar foydalanuvchi tizimga kirmagan bo'lsa, login sahifasiga yo'naltirish
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          {t('profileNotLoggedIn')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6">
          {t('profileNotLoggedInDesc')}
        </p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-2xl bg-uzum-primary hover:bg-[#520080] text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 transition-all no-underline inline-block"
        >
          {t('profileSignInBtn')}
        </Link>
      </div>
    );
  }

  // O'zgarishlar bor-yo'qligini aniqlash
  const hasUnsavedChanges = 
    fullName.trim() !== (user.fullName || '').trim() ||
    phone.trim() !== (user.phone || '').trim() ||
    address.trim() !== (user.address || '').trim() ||
    city !== (user.city || 'Toshkent') ||
    passportOrPinfl.trim() !== (user.passportOrPinfl || '').trim() ||
    avatarUrl.trim() !== (user.avatarUrl || '').trim();

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) return;

    setIsSaving(true);
    updateUserProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city,
      passportOrPinfl: passportOrPinfl.trim(),
      avatarUrl: avatarUrl.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 300);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setAvatarUrl(compressedBase64);
        updateUserProfile({ avatarUrl: compressedBase64 });
        setShowAvatarModal(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error("Image upload compression error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-[#0B1120] py-6 sm:py-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb & Orqaga qaytish */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-uzum-primary dark:text-slate-400 dark:hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('profileHome')}</span>
          </Link>

          <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800/40">
            {t('profileMyAccount')}
          </span>
        </div>

        {/* 1. KATTA FOYDALANUVCHI ASOSIY KARTASI */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar & O'zgartirish tugmasi */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-3xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0).toUpperCase() || 'E'
                )}
              </div>
              {user.isAdmin && (
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 p-1.5 rounded-xl shadow-md border-2 border-white dark:border-slate-800" title="Bosh Administrator">
                  <Crown className="w-4 h-4" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-uzum-primary hover:bg-[#520080] text-white shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
                title={t('profileChangePhoto')}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Ism, email va status */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {fullName || t('profileDearCustomer')}
                </h1>
                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                    <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{t('loginAdminRole')}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{t('profileVerified')}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{user.email}</span>
                </span>
                {phone && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{phone}</span>
                  </span>
                )}
                {city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{city}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tezkor keshbek, saqlash va chiqish tugmalari */}
            <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-auto">
              {hasUnsavedChanges && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleSaveProfile()}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer ring-2 ring-emerald-300"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('profileSaveBtn')}</span>
                </motion.button>
              )}

              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all no-underline"
                >
                  <Crown className="w-3.5 h-3.5 text-slate-950" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                type="button"
                onClick={openCashbackCardModal}
                className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:bg-amber-500/20 border border-amber-300 dark:border-amber-600/40 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('profileSavingsTitle')}: {formatPrice(user.cashbackBalance ?? 0, true, language)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('profileLogoutConfirm'))) {
                    logoutUser();
                    navigate('/');
                  }
                }}
                className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-rose-50 dark:bg-slate-700/60 dark:hover:bg-rose-950/40 text-gray-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('profileLogout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. TEZKOR STATISTIKA KO'RSATKICHLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase block">
                {t('profileMyOrders')}
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {orders.length} {t('profileOrdersCount')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase block">
                {t('profileFavorites')}
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {favorites.length} {t('profileFavoritesCount')}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase block">
                {t('profilePurchaseTerms')}
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {t('profileZeroTerms')}
              </span>
            </div>
          </div>
        </div>

        {/* 3. TABS: SHAXSIY MA'LUMOTLAR / BUYURTMALAR */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-uzum-primary text-uzum-primary dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{t('profilePersonalDetails')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-uzum-primary text-uzum-primary dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('profileOrderHistory')} ({orders.length})</span>
          </button>
        </div>

        {/* 4. TAB KONTENTI */}
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.form
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSaveProfile}
              className="bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  {t('profileEditTitle')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t('profileEditDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Ism-familiya */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{t('profileFullNameLabel')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('profileFullNamePlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all"
                  />
                </div>

                {/* Telefon raqami */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{t('profilePhoneLabel')}</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all"
                  />
                </div>

                {/* Email (Readonly) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Email {t('profileEmailLabel')}</span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                {/* Shahar / Viloyat */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{t('profileCityLabel')}</span>
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-uzum-primary transition-all cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Yetkazib berish manzili */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{t('profileAddressLabel')}</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('profileAddressPlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all"
                  />
                </div>

                {/* JShShIR / Pasport (Ixtiyoriy) */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>JShShIR (PINFL) {t('profilePinflLabel')}</span>
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={passportOrPinfl}
                    onChange={(e) => setPassportOrPinfl(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('profilePinflPlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-mono font-semibold text-gray-900 dark:text-white outline-none focus:border-uzum-primary transition-all"
                  />
                </div>
              </div>

              {/* Saqlash tugmasi */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-700/60">
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {hasUnsavedChanges ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>{t('profileUnsavedChanges')}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('profileAllSaved')}</span>
                    </span>
                  )}
                </div>

                <button
                  id="save-profile-btn"
                  type="submit"
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    saveSuccess 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 ring-2 ring-emerald-300' 
                      : 'bg-uzum-primary hover:bg-[#520080] text-white shadow-purple-500/25 hover:shadow-purple-500/40'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{t('profileSaveSuccess')}</span>
                    </>
                  ) : isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>{t('profileSaving')}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{t('profileSaveChanges')}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    {t('profileOrdersTitle')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t('profileOrdersDesc')}
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t('profileNoOrders')}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                    {t('profileNoOrdersDesc')}
                  </p>
                  <button
                    onClick={() => navigate('/catalog')}
                    className="mt-2 px-5 py-2.5 rounded-2xl bg-uzum-primary hover:bg-[#520080] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t('profileBrowseCatalog')}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {orders.map((ord) => (
                    <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {ord.contractNumber || ord.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.installmentMonths || 12} {t('monthsUnit')}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">
                          {formatPrice(ord.totalPrice, true, language)}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          {formatPrice(ord.monthlyPayment || Math.round(ord.totalPrice / 12), true, language)} {t('profilePerMonth')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* 5. RASM VA AVATARNI TANLASH POPUP MODALI */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>{t('profileSelectAvatar')}</span>
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Preset avatarlar */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-600 dark:text-slate-300 block">
                  {t('profilePresetAvatars')}
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(url);
                        updateUserProfile({ avatarUrl: url });
                        setShowAvatarModal(false);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                        avatarUrl === url ? 'border-uzum-primary ring-2 ring-purple-300' : 'border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fayl yuklash yoki URL kiritish */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700 space-y-3">
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-uzum-primary dark:hover:border-purple-400 text-xs font-bold text-gray-700 dark:text-slate-200 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{t('profileUploadFile')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder={t('profileUrlPlaceholder')}
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        const trimmed = customAvatarInput.trim();
                        setAvatarUrl(trimmed);
                        updateUserProfile({ avatarUrl: trimmed });
                        setCustomAvatarInput('');
                        setShowAvatarModal(false);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-uzum-primary text-white font-bold text-xs cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
