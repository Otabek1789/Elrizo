import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { PROMO_BANNERS } from '../data/mockData';
import { useStore } from '../store/useStore';
import { useTranslation, getBannerContent } from '../utils/translations';

interface BannerSliderProps {
  onBannerAction?: (targetCategory?: string) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ onBannerAction }) => {
  const navigate = useNavigate();
  const { navigateToCategory } = useStore();
  const { language } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  const banner = PROMO_BANNERS[currentIndex];
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

  return (
    <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-card group">
      {/* Banner Card Container */}
      <div 
        onClick={() => handleBannerAction(banner.targetCategory)}
        className={`w-full min-h-[190px] sm:min-h-[300px] md:min-h-[360px] bg-gradient-to-r ${banner.gradient} text-white p-4 sm:p-10 md:p-14 flex items-center justify-between cursor-pointer relative overflow-hidden transition-all duration-700`}
      >
        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Text Block */}
        <div className="max-w-xl z-10 space-y-2 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{localizedBanner.badge}</span>
          </div>

          <h2 className="text-base sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight drop-shadow-sm">
            {localizedBanner.title}
          </h2>

          <p className="text-[11px] sm:text-base text-purple-100 font-medium max-w-md line-clamp-2">
            {localizedBanner.subtitle}
          </p>

          {onBannerAction ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBannerAction(banner.targetCategory);
              }}
              className="mt-1.5 sm:mt-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-gray-900 font-extrabold text-xs sm:text-sm hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-lg active:scale-95 flex items-center gap-1.5 w-fit cursor-pointer"
            >
              <span>{localizedBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          ) : (
            <Link 
              to={`/catalog?category=${(banner.targetCategory || 'smartphones').replace('cat-', '')}`}
              onClick={(e) => {
                e.stopPropagation();
                handleBannerAction(banner.targetCategory);
              }}
              className="mt-1.5 sm:mt-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-gray-900 font-extrabold text-xs sm:text-sm hover:bg-yellow-300 hover:text-gray-900 transition-all shadow-lg active:scale-95 flex items-center gap-1.5 w-fit cursor-pointer no-underline"
            >
              <span>{localizedBanner.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          )}
        </div>

        {/* Right Image */}
        <div className="hidden sm:block sm:w-1/3 md:w-5/12 h-full z-10 relative">
          <img
            src={banner.image}
            alt={localizedBanner.title}
            className="w-full h-56 sm:h-72 object-cover rounded-2xl shadow-2xl border-4 border-white/20 transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Nav buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        title={language === 'ru' ? 'Предыдущий' : language === 'en' ? 'Previous' : 'Oldingi'}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        title={language === 'ru' ? 'Следующий' : language === 'en' ? 'Next' : 'Keyingi'}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {PROMO_BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-2 rounded-full transition-all ${
              currentIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
