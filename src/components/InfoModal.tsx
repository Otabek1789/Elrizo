'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  HelpCircle, 
  Briefcase, 
  Smartphone, 
  Phone, 
  Send, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../utils/translations';
import { InfoModalTopic } from '../types';

export const InfoModal: React.FC = () => {
  const { infoModalTopic, closeInfoModal } = useStore();
  const { language } = useTranslation();

  if (!infoModalTopic) return null;

  const isRu = language === 'ru';

  const renderContent = (topic: InfoModalTopic) => {
    switch (topic) {
      case 'offer':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/50 text-uzum-primary dark:text-purple-300 font-semibold text-xs">
              {isRu
                ? 'Настоящая публичная оферта регулирует условия покупки товаров и оформления рассрочки в интернет-магазине ELRIZO NASIYA SAVDO.'
                : 'Ushbu ommaviy oferta «ELRIZO NASIYA SAVDO» internet-do\'koni orqali tovarlar sotib olish va muddatli to\'lov (nasiya) shartnomalarini rasmiylashtirish tartibini belgilaydi.'}
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">
                {isRu ? '1. Общие положения' : '1. Umumiy qoidalar'}
              </h4>
              <p>
                {isRu
                  ? 'Интернет-магазин ELRIZO (далее «Продавец») предлагает любому дееспособному физическому лицу (далее «Покупатель») заключить договор купли-продажи товаров на условиях настоящей Оферты.'
                  : '«ELRIZO NASIYA SAVDO» (keyingi o\'rinlarda «Sotuvchi») har qanday muomala layoqatiga ega jismoniy shaxsga (keyingi o\'rinlarda «Xaridor») ushbu Oferta shartlari asosida tovarlarni xarid qilish va muddatli to\'lov shartnomasini tuzishni taklif etadi.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">
                {isRu ? '2. Условия рассрочки 0-0-12' : '2. 0-0-12 Nasiya savdo qoidalari'}
              </h4>
              <p>
                {isRu
                  ? 'Рассрочка оформляется без первоначального взноса (0%), без скрытых комиссий и процентов. Оплата производится ежемесячно равными частями в течение выбранного срока (от 3 до 12 месяцев) через платежные системы Payme, Click или Uzum.'
                  : 'Nasiya savdo 0% boshlang\'ich to\'lov bilan, hech qanday yashirin foiz va komissiyalarsiz amalga oshiriladi. To\'lovlar tanlangan muddat (3 oydan 12 oygacha) davomida har oy teng ulushlarda Payme, Click yoki Uzum ilovalari orqali to\'lanadi.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">
                {isRu ? '3. Доставка и передача товара' : '3. Yetkazib berish va tovarni qabul qilish'}
              </h4>
              <p>
                {isRu
                  ? 'Доставка по Ташкенту осуществляется бесплатно в течение 24 часов, в регионы — от 24 до 48 часов. Покупатель имеет право вскрыть упаковку в присутствии курьера и убедиться в целостности и комплектации товара.'
                  : 'Toshkent shahri bo\'ylab yetkazib berish 24 soatda, viloyatlarga 24-48 soatda bepul amalga oshiriladi. Xaridor kuryer huzurida tovar qadog\'ini ochish, uning butunligi va sifatini tekshirib qabul qilish huquqiga ega.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1.5">
                {isRu ? '4. Гарантия и возврат товара' : '4. Kafolat va qaytarish tartibi'}
              </h4>
              <p>
                {isRu
                  ? 'На все товары предоставляется официальная гарантия 1 год. Товар надлежащего качества подлежит возврату или обмену в течение 14 дней со дня получения при условии сохранения товарного вида и заводских пломб.'
                  : 'Barcha tovarlarga 1 yillik rasmiy kafolat beriladi. Sifatli tovar 14 kun ichida, tovar ko\'rinishi, zavod plombalari va qadoqlari saqlangan holda almashtirilishi yoki qaytarilishi mumkin.'}
              </p>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
                <div className="text-[11px] text-gray-400 font-semibold">{isRu ? 'Юридическое наименование' : 'Yuridik nomi'}</div>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">«ELRIZO NASIYA SAVDO» MChJ</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
                <div className="text-[11px] text-gray-400 font-semibold">{isRu ? 'ИНН организации' : 'Tashkilot STIR (INN)'}</div>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">309 845 712</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
                <div className="text-[11px] text-gray-400 font-semibold">{isRu ? 'Основной юридический адрес' : 'Yuridik manzili'}</div>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {isRu ? 'Наманганская обл., Янгикурганский р-н, ул. Мустакиллик, 45' : 'Namangan viloyati, Yangiqo\'rg\'on tumani, Mustaqillik shoh ko\'chasi, 45-uy'}
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
                <div className="text-[11px] text-gray-400 font-semibold">{isRu ? 'Филиал в Ташкенте' : 'Toshkent shahri filiali'}</div>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {isRu ? 'г. Ташкент, Чиланзарский р-н, пр-т Бунёдкор, 18' : 'Toshkent shahri, Chilonzor tumani, Bunyodkor shoh ko\'chasi, 18-uy'}
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">
                  {isRu ? 'Служба поддержки и операторы' : 'Qo\'llab-quvvatlash xizmati va operatorlar'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {isRu ? 'Ежедневно с 09:00 до 21:00 без выходных' : 'Har kuni 09:00 dan 21:00 gacha dam olish kunlarisiz'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+998712000020"
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 hover:border-uzum-primary transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-uzum-primary" />
                  <span>+998 71 200 00 20</span>
                </a>
                <a
                  href="https://t.me/yahyo0526"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        );

      case 'installment':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">0%</div>
                <div className="font-bold text-gray-900 dark:text-white text-xs mt-1">
                  {isRu ? 'Первоначальный взнос' : 'Boshlang\'ich to\'lov'}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {isRu ? 'Без предоплаты' : 'Oldindan to\'lovsiz'}
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                <div className="text-xl sm:text-2xl font-black text-uzum-primary dark:text-purple-400">0%</div>
                <div className="font-bold text-gray-900 dark:text-white text-xs mt-1">
                  {isRu ? 'Скрытые проценты' : 'Yashirin foizlar'}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {isRu ? 'Честная рассрочка' : 'Halol nasiya savdo'}
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">12</div>
                <div className="font-bold text-gray-900 dark:text-white text-xs mt-1">
                  {isRu ? 'Месяцев срок' : 'Oygacha muddat'}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {isRu ? 'Удобный график' : 'Teng taqsimlangan'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                {isRu ? 'Как оформить рассрочку за 3 шага:' : 'Nasiyani 3 qadamda rasmiylashtirish:'}
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-uzum-primary text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{isRu ? 'Выберите товар и срок' : 'Tovarni va muddatni tanlang'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{isRu ? 'Нажмите кнопку «Nasiyaga» в карточке любого товара.' : 'Har qanday tovar kartochkasidagi «Nasiyaga» tugmasini bosing.'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-uzum-primary text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{isRu ? 'Введите номер телефона и карту' : 'Telefon raqam va bank kartangizni kiriting'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{isRu ? 'Система автоматически проверит лимит за 2 минуты.' : 'Skoring tizimi 2 daqiqada sizga ajratilgan limitni aniqlaydi.'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 dark:bg-slate-800/80 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-uzum-primary text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{isRu ? 'Получите товар у курьера' : 'Tovarni kuryerdan bepul qabul qilib oling'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{isRu ? 'Kурьер доставит заказ до двери, проверит целостность и передаст гарантийный талон.' : 'Kuryer buyurtmani eshikkacha yetkazib, kafolat talonini topshiradi.'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'scoring':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-300">
              {isRu
                ? 'Скоринг — это автоматическая проверка платежеспособности без визита в банк и сбора бумажных справок.'
                : 'Skoring — bu bankka bormasdan va qog\'ozbozliksiz, 2 daqiqada sizga nasiya limitini avtomatik belgilovchi xavfsiz tizim.'}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{isRu ? 'Возраст:' : 'Yosh chegarasi:'}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">{isRu ? 'От 18 до 65 лет, граждане Республики Узбекистан.' : '18 yoshdan 65 yoshgacha bo\'lgan O\'zbekiston Respublikasi fuqarolari.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{isRu ? 'Банковская карта:' : 'Bank kartasi:'}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">{isRu ? 'Действующая карта Uzcard или Humo любого банка Узбекистана.' : 'Har qanday O\'zbekiston bankining faol Uzcard yoki Humo kartasi.'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{isRu ? 'Оборот по карте:' : 'Karta aylanmasi:'}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">{isRu ? 'Наличие регулярных поступлений (зарплата, пенсия или доходы) за последние 3 месяца.' : 'So\'nggi 3 oy ichida muntazam tushumlar (oylik maosh, pensiya yoki o\'z-o\'zini band qilish tushumlari).'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{isRu ? 'Без поручителей:' : 'Kafillarsiz:'}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">{isRu ? 'Поручительство родственников или залог не требуется.' : 'Qarindoshlar kafilligi yoki garov mulki talab etilmaydi.'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pickup':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {isRu
                ? 'Бесплатная доставка курьером прямо до дверей вашего дома во всех 14 регионах Узбекистана!'
                : 'O\'zbekistonning barcha 14 ta hududiga to\'g\'ridan-to\'g\'ri uyingiz eshigigacha bepul yetkazib berish!'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
                <div className="font-bold text-gray-900 dark:text-white">{isRu ? 'Ташкент и Ташкентская область' : 'Toshkent shahri va viloyati'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{isRu ? 'Срок доставки: до 24 часов' : 'Yetkazish muddati: 24 soatgacha'}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">{isRu ? 'Бесплатно' : 'Mutlaqo bepul'}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
                <div className="font-bold text-gray-900 dark:text-white">{isRu ? 'Все областные центры и районы' : 'Barcha viloyat markazlari va tumanlar'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{isRu ? 'Срок доставки: от 24 до 48 часов' : 'Yetkazish muddati: 24-48 soat'}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">{isRu ? 'Бесплатно' : 'Mutlaqo bepul'}</div>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {isRu
                ? 'Курьер обязательно свяжется с вами за 1 час до прибытия. При получении вы можете проверить товар, включить его и убедиться в работоспособности.'
                : 'Kuryer yetib kelishidan 1 soat oldin sizga qo\'ng\'iroq qilib aniqlashtiradi. Tovar topshirilganda uni yoqib, benuqsonligiga to\'liq ishonch hosil qilib qabul qilasiz.'}
            </p>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">
                {isRu ? '1. Доставка действительно бесплатная?' : '1. Yetkazib berish rostdan ham bepulmi?'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRu
                  ? 'Да, абсолютно во все города и районы Узбекистана доставка осуществляется на 100% бесплатно за счет интернет-магазина.'
                  : 'Ha, O\'zbekistonning barcha shahar va tumanlariga yetkazib berish do\'kon hisobidan 100% bepul amalga oshiriladi.'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">
                {isRu ? '2. Есть ли штрафы и пени при задержке?' : '2. To\'lov kechiksa penya yoki jarima bormi?'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRu
                  ? 'ELRIZO работает по принципам исламских финансов: мы не начисляем штрафы, пени и ростовщические проценты.'
                  : 'ELRIZO halol nasiya tamoyillariga muvofiq ishlaydi: bizda nohaq penya, jarima yoki ustamalar yo\'q.'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">
                {isRu ? '3. Как оплачивать ежемесячные платежи?' : '3. Oylik to\'lovlarni qanday to\'layman?'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRu
                  ? 'Через приложения Payme, Click, Uzum Bank или в личном кабинете на сайте. Также доступно автоматическое списание в назначенный день.'
                  : 'Payme, Click, Uzum Bank mobil ilovalari orqali yoki saytdagi shaxsiy kabinetda. Shuningdek kartadan avtomatik to\'lov ham mavjud.'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">
                {isRu ? '4. Оригинальные ли товары?' : '4. Tovarlar originalmi?'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRu
                  ? 'Все товары поступают от официальных дистрибьюторов (Apple, Samsung, LG, Artel) с заводской гарантией на 1 год.'
                  : 'Barcha mahsulotlar rasmiy dilerlardan (Apple, Samsung, LG, Artel) keltiriladi va 1 yillik rasmiy servis kafolatiga ega.'}
              </p>
            </div>
          </div>
        );

      case 'vacancies':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isRu
                ? 'Мы постоянно расширяем нашу команду и рады амбициозным специалистам в сфере e-commerce и логистики.'
                : 'Biz o\'z jamoamizni doimiy kengaytirib bormoqdamiz va e-commerce sohasida faol yoshlarni hamkorlikka chorlaymiz.'}
            </p>

            <div className="space-y-2.5">
              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {isRu ? 'Оператор контакт-центра (Call-center)' : 'Mijozlarni qo\'llab-quvvatlash operatori (Call-center)'}
                  </div>
                  <div className="text-[11px] text-gray-500">{isRu ? 'Ташкент / Удаленно • Полная занятость' : 'Toshkent / Masofaviy • To\'liq bandlik'}</div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">Faol</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {isRu ? 'Курьер службы экспресс-доставки' : 'Tezkor kuryer (Avto / Moto)'}
                  </div>
                  <div className="text-[11px] text-gray-500">{isRu ? 'Ташкент и регионы • Свободный график' : 'Toshkent va viloyatlar • Moslashuvchan grafik'}</div>
                </div>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">Faol</span>
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {isRu ? 'Отправьте резюме нашему HR-менеджеру:' : 'Rezyumengizni HR menejerimizga yuboring:'}
              </span>
              <a
                href="https://t.me/yahyo0526"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-uzum-primary hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>@yahyo0526</span>
              </a>
            </div>
          </div>
        );

      case 'app':
        return (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-uzum-primary dark:text-purple-300 flex items-center justify-center mx-auto mb-2">
              <Smartphone className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-black text-gray-900 dark:text-white text-base sm:text-lg">
                {isRu ? 'Мобильное приложение ELRIZO' : 'ELRIZO Mobil Ilovasi'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
                {isRu
                  ? 'Официальные приложения для iOS (App Store) и Android (Google Play) находятся на стадии финальной разработки и скоро будут доступны!'
                  : 'Rasmiy iOS (App Store) va Android (Google Play) mobil ilovalarimiz ayni damda yakuniy testdan o\'tkazilmoqda va tez kunda do\'konlarga joylanadi!'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 max-w-md mx-auto text-left">
              <div className="font-bold text-gray-900 dark:text-white text-xs mb-1">
                {isRu ? 'Пользуйтесь прямо сейчас без установки:' : 'Hozirning o\'zida ilovadek tez va qulay foydalaning:'}
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                {isRu
                  ? 'Вы можете делать покупки в один клик через наш официальный Telegram Mini App или добавить сайт на главный экран телефона.'
                  : 'Xarid qilish uchun ilova yuklab olish shart emas — rasmiy Telegram Mini App orqali to\'liq ilova imkoniyatlaridan foydalaning.'}
              </p>
              <a
                href="https://t.me/elrizo_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-uzum-primary hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>{isRu ? 'Открыть в Telegram Mini App' : 'Telegram Mini App-ni ochish'}</span>
              </a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = (topic: InfoModalTopic) => {
    switch (topic) {
      case 'offer':
        return isRu ? 'Публичная оферта' : 'Ommaviy oferta va shartnoma';
      case 'details':
        return isRu ? 'Реквизиты и контакты' : 'Kompaniya rekvizitlari va manzillar';
      case 'installment':
        return isRu ? 'Условия рассрочки 0-0-12' : '0-0-12 Halol Nasiya Savdo qoidalari';
      case 'scoring':
        return isRu ? 'Требования скоринга' : 'Skoring va shartnoma talablari';
      case 'pickup':
        return isRu ? 'Доставка и получение' : 'Yetkazib berish va topshirish shartlari';
      case 'faq':
        return isRu ? 'Часто задаваемые вопросы' : 'Ko\'p beriladigan savollar (FAQ)';
      case 'vacancies':
        return isRu ? 'Вакансии и карьера' : 'Bo\'sh ish o\'rinlari (Karyera)';
      case 'app':
        return isRu ? 'Мобильное приложение' : 'ELRIZO Mobil Ilovasi';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-uzum-primary dark:text-purple-300 flex items-center justify-center">
                {infoModalTopic === 'offer' && <FileText className="w-4 h-4" />}
                {infoModalTopic === 'details' && <Building2 className="w-4 h-4" />}
                {infoModalTopic === 'installment' && <ShieldCheck className="w-4 h-4" />}
                {infoModalTopic === 'scoring' && <CreditCard className="w-4 h-4" />}
                {infoModalTopic === 'pickup' && <Truck className="w-4 h-4" />}
                {infoModalTopic === 'faq' && <HelpCircle className="w-4 h-4" />}
                {infoModalTopic === 'vacancies' && <Briefcase className="w-4 h-4" />}
                {infoModalTopic === 'app' && <Smartphone className="w-4 h-4" />}
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                {getTitle(infoModalTopic)}
              </h3>
            </div>
            <button
              onClick={closeInfoModal}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {renderContent(infoModalTopic)}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end shrink-0">
            <button
              onClick={closeInfoModal}
              className="px-5 py-2 bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {isRu ? 'Закрыть' : 'Tushunarli'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
