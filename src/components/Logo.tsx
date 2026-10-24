import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  showBadge?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const LogoIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 44 }) => (
  <div 
    style={{ width: size, height: size }} 
    className={`shrink-0 select-none flex items-center justify-center ${className}`}
  >
    <img 
      src="/elrizo-icon.png" 
      alt="ELRIZO emblem" 
      width={size} 
      height={size}
      className="w-full h-full object-contain filter drop-shadow-xs"
      loading="eager"
    />
  </div>
);

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showSlogan = true,
  showBadge = true,
  variant = 'light',
  className = '' 
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 56 : 38;
  const titleSize = size === 'sm' ? 'text-base sm:text-lg' : size === 'lg' ? 'text-2xl' : size === 'xl' ? 'text-3xl' : 'text-lg sm:text-xl md:text-2xl';
  const sloganSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-[12px]' : size === 'xl' ? 'text-sm' : 'text-[10px] md:text-[11px]';
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* Animated Brand Emblem */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="shrink-0"
      >
        <LogoIcon size={iconSize} />
      </motion.div>

      {/* Brand Name & Official Slogan */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-2">
          <span 
            className={`font-black tracking-wider uppercase ${titleSize} text-[#640199]`}
          >
            ELRIZO
          </span>

          {showBadge && (
            <span className="text-[9px] uppercase font-extrabold tracking-wide text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200/60 dark:border-purple-800/50 hidden sm:inline-block">
              Nasiya
            </span>
          )}
        </div>

        {/* Official Slogan: Siz rozi — biz rozi! */}
        {showSlogan && (
          <div className="hidden sm:flex items-center gap-1.5 mt-1">
            <span className={`font-semibold tracking-normal ${sloganSize} ${isLight ? 'text-gray-700 dark:text-gray-200' : 'text-gray-200'}`}>
              Siz rozi — biz rozi!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
