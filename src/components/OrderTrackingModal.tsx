import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';
import { generateAndPrintContract } from '../lib/pdfContractGenerator';

interface TrackingStatusStep {
  title: string;
  desc: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
}

interface MockOrderTrackingData {
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  pinfl: string;
  address: string;
  city: string;
  date: string;
  totalAmount: number;
  months: number;
  monthlyPayment: number;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  currentStepIndex: number;
  steps: TrackingStatusStep[];
  courierName?: string;
  courierPhone?: string;
  estimatedDelivery?: string;
}

const DEMO_ORDERS: Record<string, MockOrderTrackingData> = {
  'ELR-849201': {
    orderNumber: 'ELR-849201',
    buyerName: 'Otabek Mirzayev',
    buyerPhone: '+998 (90) 123-45-67',
    pinfl: '31204984500012',
    address: 'Amir Temur shoh ko\'chasi, 42-uy',
    city: 'Toshkent shahri',
    date: '2026-10-19',
    totalAmount: 14500000,
    months: 12,
    monthlyPayment: 1450000,
    items: [
      {
        title: 'iPhone 15 Pro Max 256GB Natural Titanium',
        quantity: 1,
        price: 14500000,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=400',
      }
    ],
    currentStepIndex: 3,
    steps: [
      { title: 'Ariza qabul qilindi', desc: 'Scoring tizimi orqali avtomatik tasdiqlandi', date: '19-Okt, 11:20', status: 'completed' },
      { title: 'Nasiya shartnomasi imzolandi', desc: 'SMS orqali bir martalik kod bilan tasdiqlandi', date: '19-Okt, 11:25', status: 'completed' },
      { title: 'Omborda qadoqlanmoqda', desc: 'Sifat nazoratidan o\'tkazilib jo\'natishga tayyorlandi', date: '20-Okt, 09:10', status: 'completed' },
      { title: 'Kuryer yo\'lda', desc: 'Tezkor kuryerlik xizmati buyurtmangizni yetkazmoqda', date: '20-Okt, 14:40', status: 'current' },
      { title: 'Topshirildi', desc: 'Mijoz tovarlarni qabul qildi', date: 'Taxminan bugun 18:30', status: 'pending' },
    ],
    courierName: 'Sardor Qodirov (Express Kuryer)',
    courierPhone: '+998 97 780-45-12',
    estimatedDelivery: 'Bugun, 18:30 gacha'
  },
  'ELR-731904': {
    orderNumber: 'ELR-731904',
    buyerName: 'Dilshod Normurodov',
    buyerPhone: '+998 (93) 987-65-43',
    pinfl: '32008945600021',
    address: 'Buyuk Ipak Yo\'li, 18-uy',
    city: 'Samarqand shahri',
    date: '2026-10-18',
    totalAmount: 8200000,
    months: 6,
    monthlyPayment: 1571666,
    items: [
      {
        title: 'Sony PlayStation 5 Slim Digital Edition',
        quantity: 1,
        price: 8200000,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400',
      }
    ],
    currentStepIndex: 2,
    steps: [
      { title: 'Ariza qabul qilindi', desc: 'Scoring tasdiqlandi', date: '18-Okt, 16:00', status: 'completed' },
      { title: 'Shartnoma rasmiylashtirildi', desc: 'Shartnoma kodi qabul qilindi', date: '18-Okt, 16:05', status: 'completed' },
      { title: 'Omborda qadoqlanmoqda', desc: 'Markaziy ombordan tayyorlanmoqda', date: '19-Okt, 10:15', status: 'current' },
      { title: 'Viloyatga jo\'natildi', desc: 'Samarqand viloyati omboriga yo\'l oldi', date: 'Kutilmoqda', status: 'pending' },
      { title: 'Topshirildi', desc: 'Buyurtma topshiriladi', date: '21-Okt', status: 'pending' },
    ],
    estimatedDelivery: '21-Oktabr, 14:00 gacha'
  }
};

export const OrderTrackingModal: React.FC = () => {
  const { isOrderTrackingOpen, closeOrderTracking, orders } = useStore();
  const { t, language } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<MockOrderTrackingData | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOrderTrackingOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    // Check predefined mock demo
    if (DEMO_ORDERS[query]) {
      setActiveOrder(DEMO_ORDERS[query]);
      setNotFound(false);
      return;
    }

    // Check real orders in store
    const realOrder = orders.find(o => 
      o.id.toUpperCase().includes(query) || 
      o.customerPhone.includes(query)
    );

    if (realOrder) {
      const isApproved = realOrder.status === 'scoring_approved' || realOrder.status === 'delivered';
      const isDelivered = realOrder.status === 'delivered';
      
      const customOrder: MockOrderTrackingData = {
        orderNumber: realOrder.contractNumber || realOrder.id,
        buyerName: realOrder.customerName || 'Mijoz',
        buyerPhone: realOrder.customerPhone,
        pinfl: realOrder.pinfl || '31204984500012',
        address: realOrder.deliveryAddress || 'Toshkent shahri',
        city: 'Toshkent shahri',
        date: realOrder.createdAt ? new Date(realOrder.createdAt).toLocaleDateString() : 'Bugun',
        totalAmount: realOrder.totalPrice,
        months: realOrder.installmentMonths || 12,
        monthlyPayment: realOrder.monthlyPayment || Math.round(realOrder.totalPrice / (realOrder.installmentMonths || 12)),
        items: realOrder.items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=300',
        })),
        currentStepIndex: isDelivered ? 4 : isApproved ? 3 : 1,
        steps: [
          { title: 'Ariza yuborildi', desc: 'Scoring ko\'rib chiqilmoqda', date: 'Yuborilgan', status: 'completed' },
          { title: 'Nasiya shartnomasi', desc: 'SMS orqali imzolangan', date: 'Bugun', status: isApproved ? 'completed' : 'current' },
          { title: 'Omborda tayyorlanmoqda', desc: 'Sifat nazorati', date: 'Bugun', status: isApproved ? 'completed' : 'pending' },
          { title: 'Yetkazib berish', desc: 'Kuryer yo\'lda', date: 'Bugun', status: isApproved && !isDelivered ? 'current' : isDelivered ? 'completed' : 'pending' },
          { title: 'Topshirildi', desc: 'Mijoz qabul qildi', date: isDelivered ? 'Tugallangan' : 'Kutilmoqda', status: isDelivered ? 'completed' : 'pending' },
        ],
        courierName: 'ELRIZO Express Courier',
        courierPhone: '+998 71 200-45-45',
        estimatedDelivery: '1-2 ish kuni ichida'
      };
      setActiveOrder(customOrder);
      setNotFound(false);
      return;
    }

    setNotFound(true);
    setActiveOrder(null);
  };

  const handleDownloadPdf = () => {
    if (!activeOrder) return;
    generateAndPrintContract({
      id: activeOrder.orderNumber,
      contractNumber: activeOrder.orderNumber,
      createdAt: new Date().toISOString(),
      customerName: activeOrder.buyerName,
      customerPhone: activeOrder.buyerPhone,
      deliveryAddress: activeOrder.address,
      pinfl: activeOrder.pinfl,
      totalPrice: activeOrder.totalAmount,
      paymentMode: 'installment',
      installmentMonths: activeOrder.months,
      monthlyPayment: activeOrder.monthlyPayment,
      status: 'scoring_approved',
      items: activeOrder.items.map((i, idx) => ({
        productId: `item-${idx}`,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-primary-50/30 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-inner shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {t('trackModalTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('trackModalSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeOrderTracking}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t('trackModalSearchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md shadow-primary-500/20"
            >{t('trackModalSubmitBtn')}</button>
          </form>

          {/* Quick Demo Chips */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto">
            <span>{t('trackModalDemoTitle')}</span>
            <button
              type="button"
              onClick={() => { setSearchInput('ELR-849201'); setActiveOrder(DEMO_ORDERS['ELR-849201']); setNotFound(false); }}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] text-primary-600 dark:text-primary-400 hover:border-primary-400 transition"
            >
              ELR-849201 ({language === 'ru' ? "В пути" : language === 'en' ? "In transit" : "Yo'lda"})
            </button>
            <button
              type="button"
              onClick={() => { setSearchInput('ELR-731904'); setActiveOrder(DEMO_ORDERS['ELR-731904']); setNotFound(false); }}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] text-primary-600 dark:text-primary-400 hover:border-primary-400 transition"
            >
              ELR-731904 ({language === 'ru' ? "На складе" : language === 'en' ? "In warehouse" : "Omborda"})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {notFound ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
                {t('trackModalNotFound')}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {language === 'ru' 
                  ? `Договор с номером "${searchInput}" не найден. Проверьте номер или выберите демо-заказ.` 
                  : language === 'en' 
                  ? `Contract with number "${searchInput}" was not found. Please verify the number or select a demo order.` 
                  : `"${searchInput}" raqamli shartnoma mavjud emas. Iltimos raqamni to'g'ri kiritganingizni tekshiring yoki yuqoridagi namunalarni tanlang.`}
              </p>
            </div>
          ) : activeOrder ? (
            <>
              {/* Order summary card */}
              <div className="bg-gradient-to-br from-primary-50/50 to-indigo-50/30 dark:from-slate-800/60 dark:to-slate-800/30 rounded-2xl p-5 border border-primary-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                      {t('trackModalActiveContract')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      № {activeOrder.orderNumber}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                    {activeOrder.totalAmount.toLocaleString()} {language === 'ru' ? 'сум' : language === 'en' ? 'UZS' : "so'm"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('trackModalInstallmentDesc')} {language === 'ru' 
                      ? `в течение ${activeOrder.months} мес. по ${activeOrder.monthlyPayment.toLocaleString()} сум/мес` 
                      : language === 'en' 
                      ? `for ${activeOrder.months} months, ${activeOrder.monthlyPayment.toLocaleString()} UZS/mo` 
                      : `${activeOrder.months} oy davomida har oy ${activeOrder.monthlyPayment.toLocaleString()} so'mdan`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4 text-primary-500" />
                  <span>{t('trackModalDownloadPdf')}</span>
                </button>
              </div>

              {/* Delivery progress timeline */}
              <div>
                <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {t('trackModalDeliverySteps')}
                </h5>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {activeOrder.steps.map((step, index) => {
                    const isDone = step.status === 'completed';
                    const isCurrent = step.status === 'current';

                    return (
                      <div key={index} className="relative flex items-start gap-4">
                        {/* Dot indicator */}
                        <div 
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDone 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : isCurrent 
                              ? 'bg-primary-600 border-white dark:border-slate-900 ring-4 ring-primary-100 dark:ring-primary-950 text-white animate-pulse' 
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>

                        {/* Step content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-semibold ${
                              isCurrent ? 'text-primary-600 dark:text-primary-400' : isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                            }`}>
                              {step.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {step.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier and address details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    <User className="w-4 h-4 text-primary-500" />
                    <span>{t('trackModalRecipient')}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {activeOrder.buyerName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {activeOrder.buyerPhone}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {activeOrder.city}, {activeOrder.address}
                  </p>
                </div>

                {activeOrder.courierName && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      <Truck className="w-4 h-4 text-emerald-500" />
                      <span>{t('trackModalResponsibleCourier')}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {activeOrder.courierName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {activeOrder.courierPhone}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      Kutilayotgan vaqt: {activeOrder.estimatedDelivery}
                    </p>
                  </div>
                )}
              </div>

              {/* Items in order */}
              <div>
                <h5 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  {t('trackModalItemsTitle')} ({activeOrder.items.length})
                </h5>
                <div className="space-y-2">
                  {activeOrder.items.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800"
                    >
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-12 h-12 object-contain rounded-lg bg-slate-50 dark:bg-slate-700 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} dona × {item.price.toLocaleString()} so'm
                        </p>
                      </div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {(item.quantity * item.price).toLocaleString()} so'm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-slate-800 text-uzum-primary dark:text-purple-300 mx-auto flex items-center justify-center mb-4 shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                {t('trackModalTitle')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t('trackModalSubtitle')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('trackModalGuaranteedSystem')}</span>
          </div>
          <button
            type="button"
            onClick={closeOrderTracking}
            className="px-5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >{t('trackModalCloseBtn')}</button>
        </div>
      </div>
    </div>
  );
};
