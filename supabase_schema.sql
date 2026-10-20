-- ==============================================================================
-- ELRIZO NASIYA SAVDO - SUPABASE MA'LUMOTLAR BAZASI TO'LIQ SKRIPTI
-- ==============================================================================
-- Ushbu skriptni Supabase boshqaruv panelidagi "SQL Editor" bo'limiga joylashtirib,
-- "Run" tugmasini bosing.
-- Loyiha: ELRIZO (bdpmekcxbfeydodkyrbn.supabase.co)
-- ==============================================================================

-- 1. NASIYA VA NAQD BUYURTMALAR JADVALI (nasiya_orders)
CREATE TABLE IF NOT EXISTS public.nasiya_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT,
    customer_name TEXT NOT NULL,
    pinfl TEXT,
    phone TEXT NOT NULL,
    city TEXT,
    address TEXT,
    total_price NUMERIC NOT NULL DEFAULT 0,
    monthly_payment NUMERIC DEFAULT 0,
    payment_mode TEXT DEFAULT 'installment', -- 'installment' yoki 'full'
    installment_months INTEGER DEFAULT 12,
    items JSONB DEFAULT '[]'::jsonb,
    scoring_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processing', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indekslar (tezkor qidirish, filtrlash va statistikalar uchun)
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_created_at ON public.nasiya_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_phone ON public.nasiya_orders (phone);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_status ON public.nasiya_orders (status);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_pinfl ON public.nasiya_orders (pinfl);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_contract_number ON public.nasiya_orders (contract_number);

-- 2. ROW LEVEL SECURITY (RLS) - XAVFSIZLIK VA RUXSATLAR
ALTER TABLE public.nasiya_orders ENABLE ROW LEVEL SECURITY;

-- Eski siyosatlarni tozalash (qayta run qilinganda konflikt bo'lmasligi uchun)
DROP POLICY IF EXISTS "Anon va foydalanuvchilar buyurtma qo'shishi mumkin" ON public.nasiya_orders;
DROP POLICY IF EXISTS "Buyurtmalarni o'qish huquqi" ON public.nasiya_orders;
DROP POLICY IF EXISTS "Buyurtmalarni yangilash huquqi" ON public.nasiya_orders;
DROP POLICY IF EXISTS "Buyurtmalarni o'chirish huquqi" ON public.nasiya_orders;

-- a) Buyurtma qo'shish (Checkout paytida anonim yoki tizimga kirgan mijoz uchun)
CREATE POLICY "Anon va foydalanuvchilar buyurtma qo'shishi mumkin"
ON public.nasiya_orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- b) Buyurtmalarni o'qish (Admin panel va buyurtma holatini ko'rish uchun)
CREATE POLICY "Buyurtmalarni o'qish huquqi"
ON public.nasiya_orders
FOR SELECT
TO anon, authenticated
USING (true);

-- c) Buyurtma holatini yangilash (Admin tasdiqlashi, bekor qilishi yoki statusni o'zgartirishi uchun)
CREATE POLICY "Buyurtmalarni yangilash huquqi"
ON public.nasiya_orders
FOR UPDATE
TO anon, authenticated
USING (true);

-- d) Buyurtmalarni o'chirish (Admin panel orqali o'chirish)
CREATE POLICY "Buyurtmalarni o'chirish huquqi"
ON public.nasiya_orders
FOR DELETE
TO anon, authenticated
USING (true);

-- 3. UPDATED_AT USTUNINI AVTOMATIK YANGILASH FUNKSIYASI VA TRIGGERI
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_nasiya_orders_updated_at ON public.nasiya_orders;
CREATE TRIGGER set_nasiya_orders_updated_at
BEFORE UPDATE ON public.nasiya_orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. REALTIME (Jonli yangilanishlar)
-- Yangi buyurtma tushganda admin panelda sahifani yangilamasdan jonli ko'rinishi uchun:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'nasiya_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.nasiya_orders;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 5. FOYDALANUVCHILAR EMAILINI AVTOMATIK TASDIQLASH (AUTO-CONFIRM)
-- Foydalanuvchi yoki admin email tasdiqlash xatini kutmasdan darhol tizimga kira olishi uchun:
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_new_users();

-- 6. ADMIN FOYDALANUVCHISINI (otabek1789@gmail.com) DARHOL TASDIQLASH
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'otabek1789@gmail.com';

-- ==============================================================================
-- TUGADI: Barcha jadvallar, ruxsatlar va triggerlar muvaffaqiyatli tayyorlandi!
-- ==============================================================================
