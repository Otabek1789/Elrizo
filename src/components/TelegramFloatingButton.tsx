'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const TelegramFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const language = useStore((s) => s.language);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
      {/* Tooltip Popup */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 text-gray-800 dark:text-white shadow-xl border border-sky-200 dark:border-sky-900/50 text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span>
              {language === 'ru' 
                ? 'Наш Telegram-бот: @elrizo_bot' 
                : 'Bizning Telegram bot: @elrizo_bot'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.a
        href="https://t.me/elrizo_bot"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.92 }}
        className="relative p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-[#229ED9] via-[#2AABEE] to-[#39b7f5] text-white shadow-xl shadow-sky-500/35 hover:shadow-sky-500/50 flex items-center justify-center border-2 border-white/40 backdrop-blur-sm cursor-pointer group"
        title="Telegram Bot: @elrizo_bot"
      >
        {/* Pulse beacon */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-300 border border-white" />
        </span>

        {/* Telegram paper plane icon */}
        <Send className="w-5 h-5 -rotate-12 group-hover:scale-110 transition-transform" />
      </motion.a>
    </div>
  );
};
