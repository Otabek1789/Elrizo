import { Review } from '../types';

export const INITIAL_REVIEWS: Record<string, Review[]> = {
  'prod-001': [
    {
      id: 'rev-01',
      productId: 'prod-001',
      userName: 'Jasur Beknazarov',
      rating: 5,
      comment: "iPhone 16 Pro Max ni Elrizo orqali 12 oyga 0% boshlang'ich to'lov bilan oldim. Shartnoma 3 daqiqada tasdiqlandi, ertasi kuni ertalab kuryer uyimga bepul yetkazib berdi. Telefon original, 1 yil rasmiy kafolat kartasi ham ichida bor ekan. Juda xursandman!",
      createdAt: '2026-10-18T10:30:00Z',
      verifiedPurchase: true,
      likesCount: 14,
    },
    {
      id: 'rev-02',
      productId: 'prod-001',
      userName: 'Madina Karimova',
      rating: 5,
      comment: "Desert Titanium rangi juda nafis va chiroyli! Kamera sifati va akkumulyatori ajoyib, bir quvvatlash bilan 2 kungacha yetmoqda. Nasiya to'lovini Payme orqali to'lash ham juda qulay.",
      createdAt: '2026-10-14T14:15:00Z',
      verifiedPurchase: true,
      likesCount: 8,
    },
    {
      id: 'rev-03',
      productId: 'prod-001',
      userName: 'Sardorbek Toshmatov',
      rating: 5,
      comment: "Usta sifatida aytaman: A18 Pro protsessori eng og'ir 4K montajlarni ham qizimasdan o'tkazmoqda. Elrizo servisiga alohida rahmat!",
      createdAt: '2026-10-09T08:45:00Z',
      verifiedPurchase: true,
      likesCount: 5,
    },
  ],
  'prod-002': [
    {
      id: 'rev-04',
      productId: 'prod-002',
      userName: 'Farrux Aliyev',
      rating: 5,
      comment: "Galaxy S24 Ultra dagi Galaxy AI tarjimoni va S-Pen qalami ishimda har kuni yordam beryapti. 200MP kamera oydan ham tiniq rasm oladi. Tavsiya qilaman!",
      createdAt: '2026-10-16T12:00:00Z',
      verifiedPurchase: true,
      likesCount: 11,
    },
    {
      id: 'rev-05',
      productId: 'prod-002',
      userName: 'Nargiza Usmonova',
      rating: 4,
      comment: "Telefon juda kuchli va chiroyli, lekin birmuncha og'irroq ekan. Qolgan barcha jihatlari 5 yulduz!",
      createdAt: '2026-10-11T16:20:00Z',
      verifiedPurchase: true,
      likesCount: 3,
    },
  ],
  'prod-003': [
    {
      id: 'rev-06',
      productId: 'prod-003',
      userName: 'Olimjon Qosimov',
      rating: 5,
      comment: "Dyson fenini xotinimga sovg'a uchun nasiyaga rasmiylashtirdim. Sochni kuydirmasdan juda tez quritadi. Haqiqiy original mahsulot!",
      createdAt: '2026-10-15T09:10:00Z',
      verifiedPurchase: true,
      likesCount: 9,
    },
  ],
};

export const DEFAULT_PRODUCT_COLORS = [
  { name: 'Natural Titanium', hex: '#9a958e' },
  { name: 'Black Titanium', hex: '#1f2022' },
  { name: 'White Titanium', hex: '#f2f1ed' },
  { name: 'Desert Titanium', hex: '#c5a98d' },
];

export const DEFAULT_STORAGE_OPTIONS = [
  { size: '128 GB', priceOffset: 0 },
  { size: '256 GB', priceOffset: 1500000 },
  { size: '512 GB', priceOffset: 3200000 },
  { size: '1 TB', priceOffset: 5500000 },
];
