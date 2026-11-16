'use client';
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTranslation, Language } from '../utils/translations';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    {
      code: 'uz',
      name: "O'zbekcha",
      nativeName: "O'zbek tili (Lotin)",
      flag: '/flags/uz.svg',
    },
    {
      code: 'ru',
      name: 'Русский',
      nativeName: 'Русский язык',
      flag: '/flags/ru.svg',
    },
  ];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                  {language === 'ru' ? 'Выберите язык' : 'Tilni tanlang'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {language === 'ru'
                    ? 'Интерфейс сайта будет переведен'
                    : "Sayt interfeysi tanlangan tilda ko'rsatiladi"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {languages.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelect(item.code)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'border-uzum-primary bg-purple-50/80 dark:bg-purple-950/40 dark:border-purple-600 shadow-xs ring-2 ring-purple-100 dark:ring-purple-900/50'
                        : 'border-gray-200/80 dark:border-slate-800 hover:border-purple-200 dark:hover:border-slate-700 hover:bg-gray-50/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-7 h-5 rounded-xs overflow-hidden shadow-xs border border-gray-200/60 dark:border-slate-700 shrink-0">
                        <img
                          src={item.flag}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {item.nativeName}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-uzum-primary text-white shadow-xs'
                          : 'border-2 border-gray-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800/80 text-center">
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                ELRIZO • 0-0-12 Halol Nasiya Savdo
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
