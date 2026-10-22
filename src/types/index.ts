export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number; // so'mda
  originalPrice?: number;
  discountPercentage?: number;
  rating: number; // 0 - 5
  reviewsCount: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  inStock: boolean;
  stockCount: number;
  isBestSeller?: boolean; // Nasiyaga eng ko'p olinayotganlar
  isWeeklyOffer?: boolean; // Hafta taklifi
  hasZeroDown?: boolean; // 0-0-12 nasiya
  maxMonths: 3 | 6 | 12 | 24;
  tags?: string[];
  specs: Record<string, string>;
  description: string;
  deliveryDays?: number;
  sku: string;
  colors?: { name: string; hex: string }[];
  storageOptions?: { size: string; priceOffset?: number }[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  likesCount?: number;
}

export type OnlinePaymentProvider = 'click' | 'payme' | 'uzumpay';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  subcategories: SubCategory[];
  image?: string;
  itemCount?: number;
}

export interface InstallmentPlan {
  months: 3 | 6 | 12 | 24;
  markupPercent: number; // Masalan: 3 oy: 0%, 6 oy: 12%, 12 oy: 24%, 24 oy: 38%
  label: string;
  isZeroPercent?: boolean;
}

export interface InstallmentScheduleItem {
  monthIndex: number;
  dueDate: string; // "15.11.2026"
  monthlyAmount: number;
  principalAmount: number;
  markupAmount: number;
  remainingBalance: number;
}

export interface InstallmentCalculationResult {
  totalAmount: number;
  monthlyPayment: number;
  markupAmount: number;
  markupPercent: number;
  months: number;
  downPayment: number;
  financedAmount: number;
  schedule: InstallmentScheduleItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedInstallmentMonths?: 3 | 6 | 12 | 24;
  purchaseType: 'full' | 'installment';
}

export interface CashbackTransaction {
  id: string;
  orderId?: string;
  type: 'earned' | 'spent';
  amount: number; // in so'm
  date: string;
  description: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passportOrPinfl?: string;
  isVerified: boolean;
  scoringLimit: number; // masalan 15 000 000 so'm
  usedLimit: number;
  avatarUrl?: string;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
  cashbackBalance?: number; // Nakapitelniy karta balansi (so'm)
  loyaltyCardNumber?: string; // 8600 4521 8812 9014
}

export type PaymentMode = 'full' | 'installment';

export interface ScoringRequest {
  fullName: string;
  pinfl: string;
  phone: string;
  cardNumber?: string;
  cardExpiry?: string;
  totalAmount: number;
  months: number;
}

export interface ScoringResult {
  status: 'idle' | 'checking' | 'approved' | 'rejected';
  score: number;
  approvedLimit: number;
  decisionMessage: string;
  contractNumber?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  monthlyPayment?: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMode: PaymentMode;
  installmentMonths?: number;
  monthlyPayment?: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  pinfl?: string;
  contractNumber?: string;
  scoringScore?: number;
  status: 'pending' | 'scoring_approved' | 'processing' | 'delivered';
  appliedPromoCode?: string;
  discountAmount?: number;
  cashbackEarned?: number; // Xariddan yig'ilgan 1% keshbek
  cashbackSpent?: number; // Xaridda ishlatilgan keshbek
}

export interface PromoCode {
  id: string;
  code: string; // e.g. "WELCOME10", "ELRIZO15"
  discountType: 'percentage' | 'fixed';
  discountValue: number; // 10 (for 10%) or 500000 (for 500,000 so'm)
  description: string;
  minOrderAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  usageCount?: number;
}

export type ActivePage = 'home' | 'product-detail' | 'checkout' | 'favorites' | 'catalog' | 'admin';

