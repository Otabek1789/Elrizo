'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useNavigate } from '@/lib/navigation';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { PROMO_BANNERS } from '../data/mockData';
import { useStore } from '../store/useStore';
import { useTranslation, getBannerContent } from '../utils/translations';

interface BannerSliderProps {
  onBannerAction?: (targetCategory?: string) => void;
}

// Uzum Market uslubidagi silliq gorizontal surilish animatsiyasi (cubic-bezier)
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    zIndex: 1,
    x: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1,
  }),
};

export const BannerSlider: React.FC<BannerSliderProps> = ({ onBannerAction }) => {
  const navigate = useNavigate();
  const { navigateToCategory } = useStore();
  const { language } = useTranslation();

  // Monotonik sahifa hisoblagichi va yo'nalish: [page, direction]
  // Page 1 -> 2 -> 3 -> 1 uzluksiz bir yo'nalishda (o'ngdan chapga) suriladi
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const lastSlideTimeRef = useRef(0);

  const bannerCount = PROMO_BANNERS.length;
  // Haqiqiy aylanma indeks (0, 1, 2)
  const bannerIndex = ((page % bannerCount) + bannerCount) % bannerCount;

  const paginate = useCallback((newDirection: number) => {
    const now = Date.now();
    if (now - lastSlideTimeRef.current < 250) return;
    lastSlideTimeRef.current = now;
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  // Nuqtalarni bosganda eng yaqin aylanma yo'nalish bo'yicha surish
  const goToIndex = useCallback((targetIndex: number) => {
    if (targetIndex === bannerIndex) return;
    const n = bannerCount;
    const forwardDist = (targetIndex - bannerIndex + n) % n;
    const backwardDist = (bannerIndex - targetIndex + n) % n;

    if (forwardDist <= backwardDist) {
      setPage(([prevPage]) => [prevPage + forwardDist, 1]);
    } else {
      setPage(([prevPage]) => [prevPage - backwardDist, -1]);
    }
  }, [bannerIndex, bannerCount]);

  // Avtomatik o'tish taymeri (4.5 soniya) - sichqoncha ustiga kelganda yoki ushlab turganda to'xtaydi
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, paginate, page]);

  // Brauzer vkladkasi orqa fonga o'tganda to'xtatib turish
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const banner = PROMO_BANNERS[bannerIndex];
  const localizedBanner = getBannerContent(banner.id, language) || banner;

  const handleBannerAction = (targetCat?: string) => {
    if (onBannerAction) {
      onBannerAction(targetCat);
      return;
    }
    const slug = (targetCat || 'smartphones').replace('cat-', '');
    navigateToCategory(slug);
    navigate(`/catalog?category=${slug}`);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 40;
    const velocityThreshold = 350;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      paginate(-1);
    }
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 80);
  };

  return (
    <div 
      className="relative w-full h-[195px] sm:h-[300px] md:h-[360px] rounded-2xl md:rounded-3xl overflow-hidden shadow-card group select-none isolate"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Uzum.uz uslubidagi gorizontal suriluvchi bannerlar */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.55 },
          }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => {
            isDraggingRef.current = true;
          }}
          onDragEnd={handleDragEnd}
          onClick={() => {
            if (isDraggingRef.current) return;
            handleBannerAction(banner.targetCategory);
          }}
          className={`absolute inset-0 w-full h-full bg-gradient-to-r ${banner.gradient} text-white p-4 sm:p-10 md:p-14 flex items-center justify-between cursor-pointer overflow-hidden`}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Orqa fondagi ambient nur */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Chap matn qismi */}
          <div className="max-w-xl z-10 space-y-2 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{localizedBanner.badge}</span>
            </div>

            <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
              {localizedBanner.title}
            </h2>

            <p className="text-[11px] sm:text-sm md:text-base text-purple-100 font-medium max-w-md line-clamp-2">
              {localizedBanner.subtitle}
            </p>

            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (isDraggingRef.current) return;
                handleBannerAction(banner.targetCategory);
              }}
              className="mt-1.5 sm:mt-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-gray-900 font-extrabold text-xs sm:text-sm hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-lg active:scale-95 flex items-center gap-1.5 w-fit cursor-pointer"
            >
              <span>{localizedBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* O'ng rasm qismi */}
          <div className="hidden sm:block sm:w-1/3 md:w-5/12 h-full z-10 relative flex items-center justify-center">
            <img
              src={banner.image}
              alt={localizedBanner.title}
              className="w-full h-44 sm:h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-2xl border-4 border-white/20 transform group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Uzum.uz uslubidagi chap va o'ng doirasimon boshqarish tugmalari */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          paginate(-1);
        }}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 hidden sm:flex"
        aria-label={language === 'ru' ? 'Предыдущий слайд' : 'Oldingi slayd'}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          paginate(1);
        }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 hidden sm:flex"
        aria-label={language === 'ru' ? 'Следующий слайд' : 'Keyingi slayd'}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* Uzum.uz uslubidagi pastki indikator nuqtalar (faol nuqta kengayadi) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md shadow-sm">
        {PROMO_BANNERS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(idx);
            }}
            className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              bannerIndex === idx 
                ? 'w-7 sm:w-8 bg-white shadow-sm' 
                : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slayd ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
