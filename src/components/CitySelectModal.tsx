import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Check, X, Building2, Compass } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';
import { UZBEKISTAN_REGIONS, CityOption } from '../data/regions';

export const CitySelectModal: React.FC = () => {
  const { isCityModalOpen, closeCityModal, selectedCity, setSelectedCity, addToast } = useStore();
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const getCityDisplayName = (city: CityOption) => {
    if (language === 'ru') return city.nameRu;
    if (language === 'en') return city.nameEn;
    return city.nameUz;
  };

  const getCityShortName = (city: CityOption) => {
    return city.shortUz;
  };

  // Filtered cities based on search
  const filteredRegions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return UZBEKISTAN_REGIONS;
    return UZBEKISTAN_REGIONS.filter((c) =>
      c.nameUz.toLowerCase().includes(q) ||
      c.nameRu.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.shortUz.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const popularRegions = useMemo(() => {
    return UZBEKISTAN_REGIONS.filter(c => c.popular);
  }, []);

  if (!isCityModalOpen) return null;

  const handleSelectCity = (city: CityOption) => {
    setSelectedCity(city.shortUz);
    const displayName = getCityDisplayName(city);
    addToast(`${t('cityChangedToast')} ${displayName}`, 'success');
    closeCityModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div
          onClick={closeCityModal}
          className="fixed inset-0"
          aria-hidden="true"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-800/60">
                <MapPin className="w-5 h-5 text-uzum-primary dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight">
                  {t('selectCityTitle')}
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
                  {t('freeDelivery')}
                </p>
              </div>
            </div>

            <button
              onClick={closeCityModal}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title={t('backLinkBtn')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 sm:px-6 sm:py-3 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/40">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchCityPlaceholder')}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-uzum-primary dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular cities quick chips */}
            {!searchQuery && (
              <div className="mt-3">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                  {t('popularCitiesTitle')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularRegions.map((city) => {
                    const isSelected = selectedCity.toLowerCase() === city.shortUz.toLowerCase() ||
                      selectedCity.toLowerCase() === city.nameUz.toLowerCase();
                    return (
                      <button
                        key={city.id}
                        onClick={() => handleSelectCity(city)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-uzum-primary text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        <span>{city.shortUz}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cities / Regions List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 divide-y divide-gray-100 dark:divide-slate-800/60 no-scrollbar">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block pb-2">
              {t('allRegionsTitle')} ({filteredRegions.length})
            </span>

            {filteredRegions.length === 0 ? (
              <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-xs sm:text-sm">
                Shahar yoki viloyat topilmadi
              </div>
            ) : (
              filteredRegions.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.shortUz.toLowerCase() ||
                  selectedCity.toLowerCase() === city.nameUz.toLowerCase();

                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className={`w-full py-3 px-3 rounded-2xl flex items-center justify-between text-left transition-all group ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-uzum-primary dark:text-purple-300 font-extrabold'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/70 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-uzum-primary text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:text-uzum-primary group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm">
                          {getCityDisplayName(city)}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500">
                          1 kunda bepul yetkazib berish
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-uzum-primary text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-700 group-hover:border-purple-400 transition-colors" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
