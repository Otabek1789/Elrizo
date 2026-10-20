import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Mail, 
  Lock, 
  CheckCircle2, 
  LogOut, 
  CreditCard, 
  Sparkles, 
  Crown,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/calculator';
import { ADMIN_EMAIL } from '../lib/supabase';
import { useTranslation } from '../utils/translations';

export const AuthModal: React.FC = () => {
  const { 
    user, 
    isAuthOpen, 
    closeAuth, 
    loginWithEmail, 
    logoutUser, 
    orders,
    setActivePage 
  } = useStore();
  const { t, language } = useTranslation();

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthOpen && !user) {
      closeAuth();
      navigate('/login');
    }
  }, [isAuthOpen, user, closeAuth, navigate]);

  if (!isAuthOpen || !user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    await loginWithEmail(email, password);
    setIsLoading(false);
  };

  const handleGoToAdmin = () => {
    closeAuth();
    navigate('/admin');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-gray-100 overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {user ? t('authProfileTitle') : t('authLoginTitle')}
            </h3>
            {user?.isAdmin && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                Admin
              </span>
            )}
          </div>
          <button
            onClick={closeAuth}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {user ? (
            /* Profil qismi */
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl overflow-hidden border ${
                  user.isAdmin ? 'bg-amber-100 text-amber-800 border-amber-300 dark:border-amber-500/50' : 'bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
                }`}>
                  {user.isAdmin ? <Crown className="w-7 h-7 text-amber-600" /> : user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{user.fullName}</h4>
                    {user.isAdmin && (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('authVerifiedBySupabase')}</span>
                  </div>
                </div>
              </div>

              {/* Admin Panelga O'tish Tugmasi (Faqat otabek1789@gmail.com uchun) */}
              {user.isAdmin && (
                <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Crown className="w-5 h-5 text-yellow-200" />
                      <span>{t('authAdminPanelCardTitle')}</span>
                    </div>
                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-bold">
                      {t('authAdminExclusive')}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100">
                    {t('authAdminPanelDesc')}
                  </p>
                  <button
                    onClick={handleGoToAdmin}
                    className="w-full py-2 bg-white text-gray-900 font-black text-xs rounded-xl hover:bg-yellow-100 transition-colors shadow flex items-center justify-center gap-1.5"
                  >
                    <span>{t('authGoToAdminBtn')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-900" />
                  </button>
                </div>
              )}

              {/* Nasiya Limiti Qutisi */}
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs text-purple-200">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    {t('authNasiyaAccount')}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {t('authAccountActive')}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-purple-200">{t('authAvailableLimit')}</div>
                  <div className="text-2xl font-black text-amber-300">
                    {formatPrice(user.scoringLimit - user.usedLimit, true, language)}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-purple-200">
                  <span>{t('authTotalLimit')} {formatPrice(user.scoringLimit, true, language)}</span>
                  <span>{t('authUsedLimit')} {formatPrice(user.usedLimit, true, language)}</span>
                </div>
              </div>

              {/* Saqlangan arizalar va buyurtmalar (LocalStorage va Supabase) */}
              {orders.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                    <span>{t('authMyApplications')} ({orders.length}):</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">LocalStorage & Cloud</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{ord.contractNumber || ord.id}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {ord.paymentMode === 'installment' ? `${ord.installmentMonths} ${t('authInstallmentMonthsLabel')}` : t('authFullPaymentLabel')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold block">
                            {formatPrice(ord.paymentMode === 'installment' && ord.monthlyPayment ? ord.monthlyPayment : ord.totalPrice, true, language)}
                            {ord.paymentMode === 'installment' ? t('perMonth') : ''}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-bold border border-emerald-200 dark:border-emerald-800/40">
                            {ord.status === 'scoring_approved' ? t('authStatusApproved') : ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={logoutUser}
                className="w-full py-2.5 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('authLogoutBtn')}</span>
              </button>
            </div>
          ) : (
            /* Email va Parol bilan Kirish Formasi */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-uzum-primary dark:text-purple-300 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{t('authEmailLoginHeader')}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('authEmailLoginSub')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('authEmailLabel')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 outline-none"
                    placeholder="namuna@gmail.com"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t('authPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 outline-none"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-uzum-primary hover:bg-uzum-hover text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('authLoggingIn')}</span>
                  </>
                ) : (
                  <span>{t('authSignInSubmitBtn')}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
