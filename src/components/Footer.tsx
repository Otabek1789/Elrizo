import React from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw, CreditCard } from 'lucide-react';
import { LogoIcon } from './Logo';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';

export const Footer: React.FC = () => {
  const { setActivePage, navigateToCategory } = useStore();
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-[#0B0F19] border-t border-gray-200 dark:border-slate-800 mt-16 text-xs text-gray-600 dark:text-gray-400 transition-colors">
      {/* 4 ta ishonch ustunlari */}
      <div className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/60 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{t('trust1Footer')}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('trust1FooterDesc')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{t('trust2Footer')}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('trust2FooterDesc')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{t('trust3Footer')}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('trust3FooterDesc')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{t('trust4Footer')}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('trust4FooterDesc')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t('footerAboutTitle')}</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerPickupPoints')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerVacancies')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerCompanyDetails')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerPublicOffer')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t('footerForUsers')}</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerContactUs')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerFaq')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerInstallmentRules')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerScoringRequirements')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t('footerForBusiness')}</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerSellOnElrizo')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerSellerCabinet')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerOpenPickup')}</a></li>
            <li><a href="#" className="hover:text-uzum-primary dark:hover:text-purple-300 transition-colors">{t('footerPartnership')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t('footerDownloadApp')}</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs leading-relaxed">
            {t('footerAppDesc')}
          </p>
          <div className="flex flex-col gap-2">
            <button className="px-3 py-2 bg-gray-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700">
              <span className="text-xs font-bold">App Store</span>
            </button>
            <button className="px-3 py-2 bg-gray-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700">
              <span className="text-xs font-bold">Google Play</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 dark:border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <div className="flex flex-wrap items-center gap-2">
            <LogoIcon size={22} />
            <span className="font-black text-[#640199] dark:text-purple-400">ELRIZO</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 italic">«{t('slogan')}»</span>
            <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">• {t('footerCopyright')}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-500 dark:text-gray-400">{t('footerSafePayments')}</span>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              <span>Uzcard</span>
              <span>•</span>
              <span>Humo</span>
              <span>•</span>
              <span>Visa</span>
              <span>•</span>
              <span>Mastercard</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
