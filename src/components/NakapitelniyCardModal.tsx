import React from 'react';
import { 
  X, 
  CreditCard, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  QrCode, 
  Gift, 
  Zap,
  Info
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export const NakapitelniyCardModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isCashbackCardModalOpen, 
    closeCashbackCardModal, 
    cashbackTransactions 
  } = useStore();

  if (!isCashbackCardModalOpen) return null;

  const currentBalance = user?.cashbackBalance ?? 245000;
  const cardNumber = user?.loyaltyCardNumber || '8600 4910 8274 9912';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-amber-50/30 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>ELRIZO Nakapitelniy Karta</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-purple-950">
                  1% Keshbek
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Har bir xariddan 1% yig'iladi, xohlasangiz jamg'arasiz yoki to'lovga ishlatasiz
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCashbackCardModal}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Virtual VIP Card Display */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-purple-950 to-indigo-900 text-white p-6 shadow-2xl border border-purple-500/30">
            {/* Holographic / Light Flare Overlay */}
            <div className="absolute -right-16 -top-16 w-52 h-52 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Card Top */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center shadow-inner font-black text-slate-950 text-xs">
                  EZ
                </div>
                <div>
                  <span className="font-black tracking-widest text-sm uppercase block bg-gradient-to-r from-amber-200 via-white to-purple-200 bg-clip-text text-transparent">
                    ELRIZO CLUB
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono tracking-wider">
                    NAKAPITELNAYA KARTA
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Faol status
                </span>
              </div>
            </div>

            {/* Chip & Contactless */}
            <div className="my-5 flex items-center justify-between relative z-10">
              {/* EMV Chip */}
              <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-amber-300/60 shadow-md flex items-center justify-center">
                <div className="w-7 h-5 border border-amber-800/40 rounded flex flex-col justify-around px-0.5">
                  <div className="h-0.5 bg-amber-800/30" />
                  <div className="h-0.5 bg-amber-800/30" />
                </div>
              </div>

              {/* Contactless waves */}
              <div className="text-purple-300/80 font-mono text-xs flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-300" />
                <span>NFC / QR</span>
              </div>
            </div>

            {/* Card Balance Display */}
            <div className="space-y-1 relative z-10">
              <span className="text-xs uppercase font-medium text-purple-300 tracking-wider">
                Jamg'arilgan Keshbek Balansi:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {currentBalance.toLocaleString()}
                </span>
                <span className="text-base font-bold text-amber-300">
                  so'm
                </span>
              </div>
            </div>

            {/* Card Bottom: Number & Name */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono relative z-10">
              <div>
                <span className="text-[10px] text-purple-300/80 block uppercase">Karta raqami</span>
                <span className="text-sm tracking-widest text-slate-100 font-bold">
                  {cardNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-purple-300/80 block uppercase">Egasi</span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[140px] block">
                  {(user?.fullName || 'Bobur Mirzayev').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* How it works info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">1. Xarid qiling</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Har qanday tovar uchun narxining 1% i kartangizga qaytadi.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">2. Yig'ib boring</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Keshbek balansingiz muddatsiz saqlanadi va cheksiz to'planadi.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">3. Xohlaganda sarflang</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                  Checkout sahifasida balansingizni 100% gacha to'lovga ishlating.
                </span>
              </div>
            </div>
          </div>

          {/* Cashback Transaction History */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Keshbek hisob-kitob tarixi</span>
              <span className="text-xs text-slate-400 font-normal">
                {cashbackTransactions.length} ta operatsiya
              </span>
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50">
              {cashbackTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'earned' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'earned' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {tx.description}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {tx.date}
                      </span>
                    </div>
                  </div>

                  <span className={`text-sm font-black font-mono shrink-0 ${
                    tx.type === 'earned' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'earned' ? '+' : '-'}{tx.amount.toLocaleString()} so'm
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ELRIZO Kafolatlangan Keshbek Tizimi</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeCashbackCardModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Yopish
            </button>
            <button
              type="button"
              onClick={() => {
                closeCashbackCardModal();
                navigate('/catalog');
              }}
              className="px-5 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02]"
            >
              Xarid qilish va yig'ish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
