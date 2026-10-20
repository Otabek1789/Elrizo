import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';

export const LoginRequiredModal: React.FC = () => {
  const navigate = useNavigate();
  const { isLoginRequiredModalOpen, closeLoginRequiredModal } = useStore();
  const { t } = useTranslation();

  if (!isLoginRequiredModalOpen) return null;

  const handleGoToLogin = () => {
    closeLoginRequiredModal();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        {/* Backdrop click to close */}
        <div 
          onClick={closeLoginRequiredModal} 
          className="fixed inset-0"
          aria-hidden="true" 
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 sm:p-7 text-center overflow-hidden z-10"
        >
          {/* Top Right Close Button */}
          <button
            onClick={closeLoginRequiredModal}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title={t('backLinkBtn')}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-100 to-amber-100 dark:from-purple-950/60 dark:to-amber-950/40 text-uzum-primary dark:text-purple-300 flex items-center justify-center border border-purple-200/60 dark:border-purple-800/60 shadow-sm mb-4">
            <Lock className="w-7 h-7 text-uzum-primary dark:text-purple-400" />
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-2">
            {t('loginRequiredTitle')}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 px-1">
            {t('loginRequiredDesc')}
          </p>

          {/* Action: Kirish button */}
          <button
            id="login-required-modal-enter-btn"
            onClick={handleGoToLogin}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-uzum-primary to-purple-700 hover:from-uzum-hover hover:to-purple-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('loginBtn')}</span>
          </button>

          {/* Back button with text and icon: Ortga -> */}
          <div className="mt-3">
            <button
              id="login-required-modal-back-btn"
              onClick={closeLoginRequiredModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-uzum-primary dark:hover:text-purple-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <span>{t('backLinkBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
