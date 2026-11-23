'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Camera, 
  Save, 
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
  Image as ImageIcon,
  Trash2,
  CreditCard,
  Share2,
  Copy,
  Plus,
  CheckCircle2,
  Building2,
  Gift
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/calculator';
import { useTranslation } from '../utils/translations';
import { AddressMapModal } from '../components/AddressMapModal';

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
  const { 
    user, 
    updateUserProfile, 
    logoutUser, 
    orders, 
    deleteOrder, 
    clearAllOrders, 
    favorites, 
    language, 
    addToast,
    userCards,
    addUserCard,
    removeUserCard,
    toggleCardAutoDebit
  } = useStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'cards' | 'referral'>('info');

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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Karta qo'shish va referal holati
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(user?.fullName || '');
  const [isCopiedRef, setIsCopiedRef] = useState(false);

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

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    updateUserProfile({ avatarUrl: '' });
    setShowAvatarModal(false);
    addToast(
      language === 'ru' 
        ? 'Фото профиля успешно удалено' 
        : "Profil rasmi muvaffaqiyatli o'chirildi", 
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-slate-900 py-6 sm:py-10 pb-24 md:pb-10 transition-colors">
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
              {/* Rasm mavjud bo'lganda o'chirish tugmasi */}
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -bottom-2 -left-2 p-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition-transform hover:scale-110 flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-800"
                  title={language === 'ru' ? 'Удалить фото профиля' : "Profil rasmini o'chirish"}
                  aria-label="Profil rasmini o'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`pb-3 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'border-uzum-primary text-uzum-primary dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t('profileTabCards')} ({userCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referral')}
            className={`pb-3 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'referral'
                ? 'border-uzum-primary text-uzum-primary dark:border-purple-400 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{t('profileTabReferral')}</span>
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{t('profileAddressLabel')}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-uzum-primary dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition-all shadow-xs group cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-uzum-primary dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      <span>{language === 'ru' ? 'Выбрать на карте' : 'Xaritadan tanlash'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('profileAddressPlaceholder')}
                      className="w-full pl-4 pr-10 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      title={language === 'ru' ? 'Выбрать на карте' : 'Xaritadan tanlash'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-uzum-primary dark:hover:text-purple-400 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
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
                <div className="space-y-3">
                  {/* Test buyurtmalarni tozalash tugmasi (Admin yoki foydalanuvchi uchun) */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {language === 'ru' ? 'Всего заказов:' : 'Jami buyurtmalar:'} <strong className="text-gray-900 dark:text-white">{orders.length} ta</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => clearAllOrders()}
                      className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200/50 dark:border-rose-900/30"
                      title={language === 'ru' ? 'Очистить историю заказов' : 'Barcha test buyurtmalarni o\'chirish'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'ru' ? 'Очистить историю' : "Tarixni tozalash (0 qilish)"}</span>
                    </button>
                  </div>

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

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">
                              {formatPrice(ord.totalPrice, true, language)}
                            </span>
                            <span className="text-[11px] text-gray-500 dark:text-slate-400">
                              {formatPrice(ord.monthlyPayment || Math.round(ord.totalPrice / 12), true, language)} {t('profilePerMonth')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteOrder(ord.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title={language === 'ru' ? 'Удалить заказ' : "Buyurtmani o'chirish"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: BANK KARTALARI VA AUTO-DEBIT */}
          {activeTab === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {t('profileTabCards')}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Nasiya to'lovlarini avtomatik yechish (Auto-debit) uchun kartalarni boshqaring
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(true)}
                  className="px-4 py-2 bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('profileAddCard')}</span>
                </button>
              </div>

              {userCards.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-3">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-700">{t('profileCardsEmpty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCards.map((c) => (
                    <div
                      key={c.id}
                      className="bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[190px]"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-300">
                          {c.cardType.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeUserCard(c.id)}
                          className="text-white/60 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                          title="Kartani o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="my-3">
                        <div className="text-lg font-mono tracking-widest font-black text-white">
                          {c.cardNumber}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-purple-200 uppercase mt-1 font-mono">
                          <span>{c.cardHolder}</span>
                          <span>{c.expiryDate}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCardAutoDebit(c.id)}
                            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                              c.isAutoDebitEnabled ? 'bg-emerald-500' : 'bg-white/20'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                c.isAutoDebitEnabled ? 'left-4.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                          <span className="text-[11px] font-bold text-purple-200">
                            {c.isAutoDebitEnabled ? t('profileCardAutoDebitActive') : t('profileCardAutoDebitInactive')}
                          </span>
                        </div>
                        {c.balance !== undefined && (
                          <span className="text-[11px] font-bold text-emerald-400 font-mono">
                            {formatPrice(c.balance, true, language)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3">
                <Building2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">Auto-debit tizimi haqida:</strong>
                  Auto-debit yoqilgan kartalardan har oyning to'lov sanasida kerakli oylik to'lov summasi avtomatik yechiladi. Siz hech qanday jarima va kechikishlarsiz to'lovni amalga oshirasiz.
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: REFERAL VA KESHEBK DASTURI */}
          {activeTab === 'referral' && (
            <motion.div
              key="referral"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Hero Referral Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-uzum-primary text-white shadow-xl space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                  ELRIZO Referral Program
                </span>
                <h3 className="text-xl sm:text-2xl font-black">
                  {t('profileReferralTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
                  Shaxsiy taklif havolangizni do'stlaringizga yuboring. Ular birinchi marta nasiyaga xarid qilishganda, sizning balansingizga 50 000 so'm keshbek qo'shiladi!
                </p>
              </div>

              {/* Referal statistikasi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-1 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium block">{t('profileReferralStatsInvited')}</span>
                  <strong className="text-2xl font-black text-uzum-primary">4 ta do'st</strong>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-1 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium block">{t('profileReferralStatsEarned')}</span>
                  <strong className="text-2xl font-black text-emerald-600">200 000 so'm</strong>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-1 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium block">Keshbek Balans</span>
                  <strong className="text-2xl font-black text-amber-600">
                    {formatPrice(user?.cashbackBalance || 200000, true, language)}
                  </strong>
                </div>
              </div>

              {/* Shaxsiy havola va ulashish */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <label className="text-xs font-bold text-gray-700 block">Sizning shaxsiy referal havolangiz:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://elrizonasiya.vercel.app/?ref=${user?.id?.slice(0, 8) || 'ELR-7829'}`}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono font-bold text-gray-800 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const link = `https://elrizonasiya.vercel.app/?ref=${user?.id?.slice(0, 8) || 'ELR-7829'}`;
                      navigator.clipboard.writeText(link);
                      setIsCopiedRef(true);
                      addToast(t('profileReferralLinkCopied'), 'success');
                      setTimeout(() => setIsCopiedRef(false), 3000);
                    }}
                    className="px-5 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    {isCopiedRef ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopiedRef ? "Nusxalandi" : "Nusxa olish"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const link = `https://elrizonasiya.vercel.app/?ref=${user?.id?.slice(0, 8) || 'ELR-7829'}`;
                      const text = encodeURIComponent("ELRIZO Nasiya Savdoda 0-0-12 halol muddatli to'lov bilan xarid qiling va bonusga ega bo'ling!");
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
                    }}
                    className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t('profileReferralShareTelegram')}</span>
                  </button>
                </div>
              </div>

              {/* Dastur qoidalari */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">1</span>
                  <strong className="block text-gray-900">Havolani ulashing</strong>
                  <p className="text-gray-500 text-[11px]">Telegram yoki ijtimoiy tarmoqlar orqali do'stlaringizga yuboring.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">2</span>
                  <strong className="block text-gray-900">Do'stingiz xarid qilsin</strong>
                  <p className="text-gray-500 text-[11px]">Do'stingiz saytdan istalgan tovarni 0-0-12 nasiyaga oladi.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">3</span>
                  <strong className="block text-gray-900">50 000 so'm oling</strong>
                  <p className="text-gray-500 text-[11px]">Keshbek hisobingizga tushadi va keyingi xaridlaringizda chegirma bo'ladi.</p>
                </div>
              </div>
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

                {/* Profil rasmini o'chirish tugmasi */}
                {avatarUrl && (
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{language === 'ru' ? 'Удалить текущее фото профиля' : "Profil rasmini o'chirish"}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Yangi bank kartasini ulash modali */}
      <AnimatePresence>
        {showAddCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 border border-gray-200 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-uzum-primary" />
                  <span>{t('profileAddCard')}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Karta raqami (16 xonali):</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="8600 0000 0000 0000"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono tracking-wider outline-none focus:border-uzum-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Amal qilish muddati:</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono tracking-wider outline-none focus:border-uzum-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Karta egasi:</label>
                    <input
                      type="text"
                      placeholder="ISM FAMILYA"
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold uppercase outline-none focus:border-uzum-primary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (newCardNumber.length < 16) {
                      addToast("Iltimos, to'liq 16 xonali karta raqamini kiriting", 'warning');
                      return;
                    }
                    const isUzcard = newCardNumber.startsWith('8600');
                    const cleanNum = newCardNumber.replace(/\s/g, '');
                    const masked = `${cleanNum.slice(0, 4)} •••• •••• ${cleanNum.slice(-4)}`;
                    addUserCard({
                      cardNumber: masked,
                      cardHolder: newCardHolder || (user?.fullName?.toUpperCase() || 'MIJOZ'),
                      expiryDate: newCardExpiry || '12/28',
                      cardType: isUzcard ? 'uzcard' : 'humo',
                      isAutoDebitEnabled: true,
                      isDefault: false,
                      balance: 1500000,
                    });
                    setShowAddCardModal(false);
                    setNewCardNumber('');
                    setNewCardExpiry('');
                  }}
                  className="w-full py-3 bg-uzum-primary hover:bg-uzum-hover text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  Kartani saqlash va ulash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Xaritadan manzilni tanlash modal oynasi */}
      <AddressMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectAddress={(selectedAddr, detectedCity) => {
          setAddress(selectedAddr);
          if (detectedCity) setCity(detectedCity);
        }}
        initialAddress={address}
        defaultCity={city}
      />
    </div>
  );
};
