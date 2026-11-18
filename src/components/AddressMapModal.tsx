'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  X, 
  Check, 
  Loader2, 
  Building2, 
  Compass, 
  CornerDownRight,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../utils/translations';
import { useStore } from '../store/useStore';

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (fullAddress: string, detectedCity?: string) => void;
  initialAddress?: string;
  defaultCity?: string;
}

// O'zbekistonning asosiy shaharlari markaziy koordinatalari
const UZBEKISTAN_CITIES_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  'Toshkent': { lat: 41.311081, lng: 69.240562, name: 'Toshkent shahri' },
  'Samarqand': { lat: 39.654167, lng: 66.959722, name: 'Samarqand viloyati' },
  'Namangan': { lat: 40.9983, lng: 71.6726, name: 'Namangan viloyati' },
  'Farg\'ona': { lat: 40.3842, lng: 71.7843, name: 'Farg\'ona viloyati' },
  'Andijon': { lat: 40.7821, lng: 72.3442, name: 'Andijon viloyati' },
  'Buxoro': { lat: 39.7747, lng: 64.4286, name: 'Buxoro viloyati' },
  'Qashqadaryo': { lat: 38.8606, lng: 65.7891, name: 'Qarshi shahri' },
  'Xorazm': { lat: 41.5564, lng: 60.6314, name: 'Urganch shahri' },
  'Qoraqalpog\'iston': { lat: 42.4619, lng: 59.6166, name: 'Nukus shahri' },
  'Surxondaryo': { lat: 37.2242, lng: 67.2783, name: 'Termiz shahri' },
  'Navoiy': { lat: 40.1039, lng: 65.3688, name: 'Navoiy shahri' },
  'Jizzax': { lat: 40.1158, lng: 67.8422, name: 'Jizzax shahri' },
  'Sirdaryo': { lat: 40.4983, lng: 68.7842, name: 'Guliston shahri' },
};

export const AddressMapModal: React.FC<AddressMapModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  initialAddress = '',
  defaultCity = 'Toshkent',
}) => {
  const { language, t } = useTranslation();
  const { addToast } = useStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const reverseTimeoutRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Tanlangan manzil ma'lumotlari
  const [detectedAddress, setDetectedAddress] = useState<string>(initialAddress || '');
  const [detectedCity, setDetectedCity] = useState<string>(defaultCity || 'Toshkent');
  const [apartmentDetails, setApartmentDetails] = useState<string>('');

  // 1. Leaflet kutubxonasini dinamik yuklash
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadLeaflet = async () => {
      try {
        // CSS ni head ga qo'shish
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // JS ni dinamik tekshirish va yuklash
        if (!(window as any).L) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Leaflet load failed'));
            document.body.appendChild(script);
          });
        }

        if (isMounted) {
          setMapLoaded(true);
        }
      } catch (err) {
        console.error('Leaflet loading error:', err);
        if (isMounted) {
          setMapError('Xarita yuklanishida xatolik yuz berdi. Manzilni qidiruv orqali kiritishingiz mumkin.');
        }
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Reverse geocoding (koordinatani matnga aylantirish)
  const fetchAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=uz,ru,en`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Geocoding response failed');
      const data = await res.json();

      if (data && data.address) {
        const addr = data.address;
        
        // Shahar yoki viloyat
        const cityOrRegion = addr.city || addr.state || addr.province || addr.county || 'Toshkent';
        // Tuman
        const district = addr.suburb || addr.district || addr.borough || addr.city_district || '';
        // Ko'cha va uy
        const road = addr.road || addr.pedestrian || addr.street || '';
        const houseNumber = addr.house_number ? `${addr.house_number}-uy` : '';

        const parts: string[] = [];
        if (cityOrRegion) parts.push(cityOrRegion);
        if (district && district !== cityOrRegion) parts.push(district);
        if (road) parts.push(road);
        if (houseNumber) parts.push(houseNumber);

        const formatted = parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        
        setDetectedAddress(formatted);

        // Viloyatni aniqlash
        for (const [key] of Object.entries(UZBEKISTAN_CITIES_COORDS)) {
          if (cityOrRegion.toLowerCase().includes(key.toLowerCase()) || (district && district.toLowerCase().includes(key.toLowerCase()))) {
            setDetectedCity(key);
            break;
          }
        }
      } else if (data?.display_name) {
        const simple = data.display_name.split(',').slice(0, 3).join(',');
        setDetectedAddress(simple);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      // Fallback koordinata matni
      setDetectedAddress(`${detectedCity}, Koordinatalar: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [detectedCity]);

  // 2. Xarita instansiyasini initsializatsiya qilish
  useEffect(() => {
    if (!isOpen || !mapLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Mavjud xarita bo'lsa tozalash
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCoords = UZBEKISTAN_CITIES_COORDS[defaultCity] || UZBEKISTAN_CITIES_COORDS['Toshkent'];
    const map = L.map(mapContainerRef.current, {
      center: [initialCoords.lat, initialCoords.lng],
      zoom: 14,
      zoomControl: false,
    });

    // Zoom tugmalarini o'ng tomonga qo'yish
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap plitalari
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Xarita harakati tugaganda koordinatani olish
    map.on('moveend', () => {
      const center = map.getCenter();
      if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current);
      reverseTimeoutRef.current = setTimeout(() => {
        fetchAddressFromCoords(center.lat, center.lng);
      }, 400);
    });

    // Dastlabki markaziy manzilni aniqlash
    fetchAddressFromCoords(initialCoords.lat, initialCoords.lng);

    // Modal ochilganda Leaflet o'lchamlarini to'g'rilash
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, mapLoaded, defaultCity, fetchAddressFromCoords]);

  // Mening joylashuvim (GPS)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast(
        language === 'ru' 
          ? 'Геолокация не поддерживается вашим браузером.' 
          : "Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi.", 
        'info'
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, { animate: true, duration: 1.2 });
        }
        fetchAddressFromCoords(latitude, longitude);
        addToast(
          language === 'ru' 
            ? 'Ваше местоположение успешно определено!' 
            : "Sizning joylashuvingiz muvaffaqiyatli aniqlandi!", 
          'success'
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        addToast(
          language === 'ru'
            ? 'Не удалось получить доступ к геолокации. Пожалуйста, разрешите доступ к местоположению.'
            : "Joylashuvni aniqlashga ruxsat berilmadi. Iltimos, brauzerda geolokatsiyaga ruxsat bering.",
          'info'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Manzil bo'yicha qidirish (Nominatim Search API)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const formattedQuery = encodeURIComponent(`${query}, Uzbekistan`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${formattedQuery}&countrycodes=uz&limit=1&accept-language=uz,ru`);
      if (!res.ok) throw new Error('Search failed');
      const results = await res.json();

      if (results && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 16, { animate: true, duration: 1.2 });
        }
        setDetectedAddress(item.display_name.split(',').slice(0, 3).join(', '));
      } else {
        addToast(
          language === 'ru' 
            ? 'По данному запросу адрес не найден. Попробуйте ввести другое название.' 
            : "Ushbu manzil bo'yicha natija topilmadi. Boshqa ko'cha yoki tuman nomini kiriting.", 
          'info'
        );
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Tezkor shahar tanlash chipi
  const handleQuickCitySelect = (cityName: string) => {
    const coords = UZBEKISTAN_CITIES_COORDS[cityName];
    if (coords && mapInstanceRef.current) {
      setDetectedCity(cityName);
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, { animate: true });
    }
  };

  // Manzilni tasdiqlash
  const handleConfirm = () => {
    if (!detectedAddress.trim()) {
      addToast(
        language === 'ru' ? 'Пожалуйста, выберите адрес на карте' : "Iltimos, xaritadan manzilni belgilang", 
        'info'
      );
      return;
    }

    const fullFinalAddress = apartmentDetails.trim()
      ? `${detectedAddress.trim()}, ${apartmentDetails.trim()}`
      : detectedAddress.trim();

    onSelectAddress(fullFinalAddress, detectedCity);
    addToast(
      language === 'ru' 
        ? 'Адрес доставки успешно выбран!' 
        : "Yetkazib berish manzili muvaffaqiyatli belgilandi!", 
      'success'
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-uzum-primary dark:text-purple-400 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                {language === 'ru' ? 'Выбор адреса доставки на карте' : "Yetkazib berish manzilini xaritadan tanlash"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {language === 'ru' ? 'Перемещайте карту или укажите точку' : "Xaritani siljiting yoki aniq lokatsiyangizni belgilang"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Qidiruv va Shahar Chiplari */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 space-y-2.5">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'ru'
                    ? 'Поиск улицы, района или ориентира (например: Чиланзар, Амир Темур)...'
                    : "Ko'cha, mahalla yoki mo'ljalni qidiring (masalan: Chilonzor, Amir Temur)..."
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white text-xs outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-uzum-primary hover:bg-uzum-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{language === 'ru' ? 'Найти' : 'Qidirish'}</span>
            </button>
          </form>

          {/* Shahar tezkor chiplari */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-xs">
            <span className="text-gray-400 dark:text-slate-500 font-semibold shrink-0 text-[11px]">
              {language === 'ru' ? 'Города:' : 'Shaharlar:'}
            </span>
            {['Toshkent', 'Samarqand', 'Namangan', 'Farg\'ona', 'Andijon', 'Buxoro', 'Qashqadaryo'].map((cityName) => (
              <button
                key={cityName}
                type="button"
                onClick={() => handleQuickCitySelect(cityName)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                  detectedCity === cityName
                    ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700 text-uzum-primary dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>

        {/* Xarita qismi */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[350px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">{mapError}</p>
            </div>
          ) : (
            <>
              {/* Leaflet DOM container */}
              <div ref={mapContainerRef} className="w-full h-full min-h-[300px] sm:min-h-[350px] z-10" />

              {/* Markaziy Pin (Marker) */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center"
                style={{ marginTop: '-4px' }}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-purple-500/25 animate-bounce-short">
                    <MapPin className="w-5 h-5 fill-white stroke-purple-700" />
                  </div>
                </div>
                {/* Pin soya / soyasi */}
                <div className="w-3 h-1.5 bg-black/35 rounded-full blur-[1px] mt-0.5" />
              </div>

              {/* Mening joylashuvim (GPS) tugmasi */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                title={language === 'ru' ? 'Мое местоположение' : "Mening joylashuvim"}
                className="absolute bottom-4 right-4 z-20 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 text-gray-800 dark:text-white shadow-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-bold group"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 text-uzum-primary animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 text-uzum-primary group-hover:scale-110 transition-transform" />
                )}
                <span className="hidden sm:inline">
                  {isLocating 
                    ? (language === 'ru' ? 'Определение...' : "Aniqlanmoqda...") 
                    : (language === 'ru' ? 'Мое местоположение' : "Mening joylashuvim")}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Tanlangan manzil kartochkasi va qo'shimcha ma'lumotlar */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-uzum-primary dark:text-purple-300 uppercase tracking-wider block">
                {language === 'ru' ? 'Выбранная точка:' : "Aniqlangan manzil:"}
              </span>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate sm:whitespace-normal">
                {isReverseGeocoding ? (
                  <span className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ru' ? 'Определение адреса...' : "Manzil aniqlanmoqda..."}</span>
                  </span>
                ) : (
                  detectedAddress || (language === 'ru' ? 'Укажите точку на карте' : "Xaritada nuqtani belgilang")
                )}
              </p>
            </div>
          </div>

          {/* Qo'shimcha xonadon, qavat, mo'ljal */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-slate-400 mb-1">
              {language === 'ru' ? 'Квартира, этаж, подъезд, ориентир (необязательно):' : "Xonadon, qavat, podyezd, mo'ljal (ixtiyoriy):"}
            </label>
            <input
              type="text"
              value={apartmentDetails}
              onChange={(e) => setApartmentDetails(e.target.value)}
              placeholder={
                language === 'ru'
                  ? 'например: 14-кв, 3-этаж, домофон 14, возле супермаркета'
                  : "masalan: 14-xonadon, 3-qavat, 2-podyezd, Korzinka ro'parasi"
              }
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white text-xs outline-none focus:border-uzum-primary focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all"
            />
          </div>

          {/* Tugmalar */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              {language === 'ru' ? 'Отмена' : 'Bekor qilish'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!detectedAddress.trim() || isReverseGeocoding}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-uzum-primary to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'ru' ? 'Подтвердить адрес' : 'Manzilni tasdiqlash'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
