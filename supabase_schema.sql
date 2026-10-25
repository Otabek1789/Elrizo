-- ==============================================================================
-- ELRIZO NASIYA SAVDO - SUPABASE TO'LIQ MA'LUMOTLAR BAZASI STRUKTURASI
-- ==============================================================================
-- Barcha ma'lumotlar (Tovarlar, Toifalar, Buyurtmalar, Mijozlar, Sharhlar, Keshbek)
-- to'liq Supabase boshqaruv panelida ko'rinadi va sinxronlashadi.
--
-- QO'LLANMA:
-- 1. https://supabase.com ga kiring va o'z loyihangizni oching (bdpmekcxbfeydodkyrbn)
-- 2. Chap menyudan "SQL Editor" bo'limiga o'ting
-- 3. "New query" tugmasini bosing
-- 4. Ushbu faylning barcha matnini nusxalab (Ctrl+A, Ctrl+C), SQL Editorga qo'ying (Ctrl+V)
-- 5. "Run" (yashil tugma)ni bosing!
--
-- Bir necha soniyada barcha jadvallar va to'liq ma'lumotlar bazangizga joylashadi!
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TOIFALAR (CATEGORIES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    image TEXT,
    item_count INTEGER DEFAULT 0,
    subcategories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_all_access" ON public.categories;
CREATE POLICY "categories_all_access" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 2. MAHSULOTLAR (PRODUCTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC,
    discount_percentage INTEGER,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    category_id TEXT,
    category_name TEXT,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 10,
    is_best_seller BOOLEAN DEFAULT false,
    is_weekly_offer BOOLEAN DEFAULT false,
    has_zero_down BOOLEAN DEFAULT true,
    max_months INTEGER DEFAULT 24,
    tags JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    description TEXT DEFAULT '',
    delivery_days INTEGER DEFAULT 1,
    colors JSONB DEFAULT '[]'::jsonb,
    storage_options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_all_access" ON public.products;
CREATE POLICY "products_all_access" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 3. NASIYA VA NAQD BUYURTMALAR (NASIYA_ORDERS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.nasiya_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    pinfl TEXT,
    phone TEXT NOT NULL,
    city TEXT DEFAULT 'Toshkent',
    address TEXT,
    total_price NUMERIC NOT NULL DEFAULT 0,
    monthly_payment NUMERIC DEFAULT 0,
    payment_mode TEXT DEFAULT 'installment', -- 'installment' yoki 'full'
    installment_months INTEGER DEFAULT 12,
    items JSONB DEFAULT '[]'::jsonb,
    scoring_score INTEGER DEFAULT 750,
    status TEXT DEFAULT 'pending', -- 'pending', 'scoring_approved', 'processing', 'delivered', 'rejected'
    promo_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    cashback_earned NUMERIC DEFAULT 0,
    cashback_spent NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nasiya_orders_created_at ON public.nasiya_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_phone ON public.nasiya_orders (phone);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_status ON public.nasiya_orders (status);
CREATE INDEX IF NOT EXISTS idx_nasiya_orders_contract_number ON public.nasiya_orders (contract_number);

ALTER TABLE public.nasiya_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "nasiya_orders_all_access" ON public.nasiya_orders;
CREATE POLICY "nasiya_orders_all_access" ON public.nasiya_orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. FOYDALANUVCHILAR VA MIJOZLAR PROFILI (USER_PROFILES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    city TEXT DEFAULT 'Toshkent',
    address TEXT,
    passport_or_pinfl TEXT,
    avatar_url TEXT,
    scoring_limit NUMERIC DEFAULT 0,
    used_limit NUMERIC DEFAULT 0,
    cashback_balance NUMERIC DEFAULT 0,
    loyalty_card_number TEXT,
    is_admin BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles (email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_profiles_all_access" ON public.user_profiles;
CREATE POLICY "user_profiles_all_access" ON public.user_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. SHARHLAR VA BAHOLASH (PRODUCT_REVIEWS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews (product_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_reviews_all_access" ON public.product_reviews;
CREATE POLICY "product_reviews_all_access" ON public.product_reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. JAMG'ARMA KARTA (KESHBEK) TRANZAKSIYALARI (CASHBACK_TRANSACTIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cashback_transactions (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    user_email TEXT,
    type TEXT NOT NULL, -- 'earned' yoki 'spent'
    amount NUMERIC NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cashback_user ON public.cashback_transactions (user_email);

ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cashback_transactions_all_access" ON public.cashback_transactions;
CREATE POLICY "cashback_transactions_all_access" ON public.cashback_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. PROMO-KODLAR VA CHEGIRMALAR (PROMO_CODES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL, -- 'percentage' yoki 'fixed'
    discount_value NUMERIC NOT NULL,
    description TEXT,
    min_order_amount NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promo_codes_all_access" ON public.promo_codes;
CREATE POLICY "promo_codes_all_access" ON public.promo_codes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. TRIGGER: UPDATED_AT AVTOMATIK YANGILANISHI
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_nasiya_orders_updated_at ON public.nasiya_orders;
CREATE TRIGGER trg_nasiya_orders_updated_at BEFORE UPDATE ON public.nasiya_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. SUPABASE REALTIME (JONLI EFIR ULANISHLARI)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'nasiya_orders') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.nasiya_orders;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'product_reviews') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'cashback_transactions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cashback_transactions;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 10. AUTH TRIGGER (YANGI FOYDALANUVCHILARNI DARHOL AVTO-TASDIQLASH)
-- ==============================================================================
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

-- ==============================================================================
-- 11. BOSHLANG'ICH REAL MA'LUMOTLARNI EKISH (INITIAL SEED DATA)
-- ==============================================================================

-- a) Kategoriyalarni kiritish
INSERT INTO public.categories (id, name, slug, icon_name, image, item_count, subcategories)
VALUES ('cat-smartphones', 'Smartfonlar va gadjetlar', 'smartphones', 'Smartphone', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80', 420, '[{"id":"sub-apple","name":"Apple iPhone","slug":"apple"},{"id":"sub-samsung","name":"Samsung Galaxy","slug":"samsung"},{"id":"sub-xiaomi","name":"Xiaomi & Redmi","slug":"xiaomi"},{"id":"sub-smartwatches","name":"Aqlli soatlar (Smart Watch)","slug":"smartwatches"},{"id":"sub-headphones","name":"Simsiz quloqchinlar","slug":"headphones"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    image = EXCLUDED.image,
    item_count = EXCLUDED.item_count,
    subcategories = EXCLUDED.subcategories;
INSERT INTO public.categories (id, name, slug, icon_name, image, item_count, subcategories)
VALUES ('cat-appliances', 'Maishiy texnika', 'appliances', 'Tv', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&auto=format&fit=crop&q=80', 310, '[{"id":"sub-tv","name":"Smart Televizorlar","slug":"smart-tv"},{"id":"sub-fridge","name":"Sovutgichlar","slug":"refrigerators"},{"id":"sub-washers","name":"Kir yuvish mashinalari","slug":"washing-machines"},{"id":"sub-aircon","name":"Konditsionerlar","slug":"air-conditioners"},{"id":"sub-vacuum","name":"Robot changyutgichlar","slug":"vacuums"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    image = EXCLUDED.image,
    item_count = EXCLUDED.item_count,
    subcategories = EXCLUDED.subcategories;
INSERT INTO public.categories (id, name, slug, icon_name, image, item_count, subcategories)
VALUES ('cat-computers', 'Noutbuk va kompyuterlar', 'computers', 'Laptop', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&auto=format&fit=crop&q=80', 215, '[{"id":"sub-macbook","name":"Apple MacBook","slug":"macbook"},{"id":"sub-windows-laptop","name":"Windows noutbuklar","slug":"windows-laptops"},{"id":"sub-monitors","name":"Monitorlar","slug":"monitors"},{"id":"sub-peripherals","name":"Klaviatura va sichqonchalar","slug":"peripherals"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    image = EXCLUDED.image,
    item_count = EXCLUDED.item_count,
    subcategories = EXCLUDED.subcategories;
INSERT INTO public.categories (id, name, slug, icon_name, image, item_count, subcategories)
VALUES ('cat-beauty', 'Goʻzallik va parvarish', 'beauty', 'Sparkles', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80', 180, '[{"id":"sub-hair","name":"Dyson & soch feni","slug":"hair-dryers"},{"id":"sub-perfume","name":"Atirlar va parfyumeriya","slug":"perfumes"},{"id":"sub-skincare","name":"Teri parvarishi","slug":"skincare"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    image = EXCLUDED.image,
    item_count = EXCLUDED.item_count,
    subcategories = EXCLUDED.subcategories;
INSERT INTO public.categories (id, name, slug, icon_name, image, item_count, subcategories)
VALUES ('cat-auto', 'Avtomobil jihozlari', 'auto', 'Car', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop&q=80', 95, '[{"id":"sub-dashcam","name":"Videoregistratorlar","slug":"dashcams"},{"id":"sub-auto-acc","name":"Avto aksessuarlar","slug":"auto-accessories"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    image = EXCLUDED.image,
    item_count = EXCLUDED.item_count,
    subcategories = EXCLUDED.subcategories;
INSERT INTO public.categories (id, name, slug, icon_name, image, item_count, subcategories)
VALUES ('cat-home', 'Uy-roʻzgʻor buyumlari', 'home-goods', 'Armchair', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&auto=format&fit=crop&q=80', 350, '[{"id":"sub-kitchen","name":"Oshxona idishlari","slug":"kitchen"},{"id":"sub-furniture","name":"Mebel va matraslar","slug":"furniture"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    image = EXCLUDED.image,
    item_count = EXCLUDED.item_count,
    subcategories = EXCLUDED.subcategories;

-- b) Tovarlarni kiritish (29 ta saralangan mahsulot)
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-001', 'ELR-IPH16PM-256', 'Apple iPhone 16 Pro Max 256GB Desert Titanium (Nasiya 0-0-12)', 'apple-iphone-16-pro-max-256gb-desert-titanium', 18450000, 20500000, 10,
    4.95, 342, '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 14, true, true, true,
    24, '["0-0-12","Yangi","Kafolat 1 yil","Apple"]'::jsonb, '{"Brend":"Apple","Ekran":"6.9\" Super Retina XDR OLED 120Hz","Protsessor":"Apple A18 Pro Bionic","Xotira":"256 GB NVMe","Kamera":"48 MP + 48 MP + 12 MP (5x zoom)","Akkumulyator":"4685 mA/soat"}'::jsonb, 'Yangi Apple iPhone 16 Pro Max titan korpus, eng kuchli A18 Pro chipi va Camera Control maxsus sensor tugmasi bilan jihozlangan. Elrizo Nasiya orqali ortiqcha to''lovlarsiz 0-0-12 tizimida oling!', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-002', 'ELR-SAM-S24U', 'Samsung Galaxy S24 Ultra 12GB/512GB Titanium Gray (Galaxy AI)', 'samsung-galaxy-s24-ultra-512gb', 16200000, 17800000, 9,
    4.9, 215, '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 8, true, false, true,
    24, '["Galaxy AI","S-Pen","Nasiya 0%","Samsung"]'::jsonb, '{"Brend":"Samsung","Ekran":"6.8\" Dynamic AMOLED 2X 120Hz","Protsessor":"Snapdragon 8 Gen 3 for Galaxy","Xotira":"12GB RAM / 512GB ROM","Asosiy kamera":"200 MP + 50 MP + 12 MP + 10 MP"}'::jsonb, 'Samsung Galaxy S24 Ultra - sun''iy intellekt Galaxy AI xususiyatlari, titan ramka va 200 MP kamera bilan jihozlangan eng ilg''or flagman.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-003', 'ELR-XIA-RN13P', 'Xiaomi Redmi Note 13 Pro+ 5G 12GB/512GB Midnight Black', 'xiaomi-redmi-note-13-pro-plus-512gb', 4650000, 5500000, 15,
    4.75, 198, '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 25, true, true, true,
    12, '["0-0-12","Arzon narx","200MP Kamera","Xiaomi"]'::jsonb, '{"Brend":"Xiaomi","Ekran":"6.67\" AMOLED 120Hz Curved","Kamera":"200 MP OIS stabilizator bilan","Zaryadlash":"120W HyperCharge (19 daqiqada 100%)","Himoya":"IP68 suv va changdan himoya"}'::jsonb, '200 megapikselli kamera, 120W ultra-tez quvvatlash va qavariq AMOLED ekran bilan hamyonbop flagman darajasidagi smartfon.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-004', 'ELR-SAM-A55', 'Samsung Galaxy A55 5G 8GB/256GB Awesome Iceblue', 'samsung-galaxy-a55-5g-256gb', 4850000, 5400000, 10,
    4.7, 145, '["https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 18, false, false, true,
    12, '["0-0-12","Samsung","Hit"]'::jsonb, '{"Brend":"Samsung","Ekran":"6.6\" Super AMOLED 120Hz","Protsessor":"Exynos 1480 (4nm)","Batareya":"5000 mA/soat"}'::jsonb, 'Metall korpus, Gorilla Glass Victus+ himoyasi va yuqori darajadagi xavfsizlik bilan jihozlangan eng ommabop Samsung smartfoni.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-005', 'ELR-AW-S10', 'Apple Watch Series 10 46mm GPS Jet Black Aluminium Case', 'apple-watch-series-10-46mm', 6200000, 6900000, 10,
    4.9, 88, '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 11, true, false, true,
    24, '["Aqlli soat","Yangi","Apple"]'::jsonb, '{"Brend":"Apple","Korpus":"46 mm yupqa alyuminiy","Ekran":"Keng burchakli OLED Always-On","Sensorlar":"EKG, kislorod, uyqu apnoesi nazorati"}'::jsonb, 'Tarixdagi eng yupqa va eng katta displeyli Apple Watch. Salomatlik va sport nazorati bo''yicha birinchi raqamli ko''makchi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-006', 'ELR-AIRPODS-PRO2', 'Apple AirPods Pro 2 (USB-C MagSafe zaryadlovchi keys bilan)', 'apple-airpods-pro-2-type-c', 3250000, 3800000, 14,
    4.9, 310, '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 22, true, false, true,
    12, '["ANC shovqin so''ndirish","Type-C","Apple"]'::jsonb, '{"Brend":"Apple","Chip":"Apple H2 naushnik chipi","Shovqin so''ndirish":"2 baravar kuchli faol shovqin bekor qilish","Batareya":"Keys bilan 30 soatgacha"}'::jsonb, 'Kristaldek tiniq audio, ilg''or adaptiv audio va USB-C portli yangilangan keys bilan AirPods Pro 2.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-007', 'ELR-PS5-SLIM', 'Sony PlayStation 5 Slim 1TB + 2-pult DualSense (O''yinlar to''plami)', 'sony-playstation-5-slim-1tb', 7650000, 8500000, 10,
    4.95, 420, '["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-smartphones', 'Smartfonlar va gadjetlar',
    true, 19, true, true, true,
    24, '["Hit","4K 120FPS","1TB SSD","Sony"]'::jsonb, '{"Brend":"Sony","Xotira":"Ultra-tezkor 1TB NVMe SSD","Komplekt":"2 dona DualSense pulti + HDMI 2.1 kabel"}'::jsonb, 'Sony PlayStation 5 Slim yangi ixcham korpusda va ultra yuqori tezlikdagi SSD bilan sizga unutilmas o''yin sarguzashtlarini taqdim etadi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-008', 'ELR-ART-TV65', 'Artel 65" 4K UHD Smart TV Android 11 Voice Control (A65LU8500)', 'artel-65-inch-4k-uhd-smart-tv', 6150000, 7000000, 12,
    4.7, 98, '["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-appliances', 'Maishiy texnika',
    true, 11, false, true, true,
    24, '["4K UHD","Android TV","3 yil kafolat","Artel"]'::jsonb, '{"Brend":"Artel","Ekran o''lchami":"65 dyuym (165 sm)","Ruxsat":"4K Ultra HD (3840x2160)","Kafolat":"3 yil to''liq bepul servis"}'::jsonb, 'Ulkan 65 dyuymli 4K ekran, jonli ranglar va qulay pultdagi ovozli boshqaruv bilan kinoteatr zavqini uyingizda his eting.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-009', 'ELR-ART-REF', 'Artel Grand Inverter NoFrost 340L Sovutgich (Muzlatgich)', 'artel-grand-inverter-nofrost-340l', 5400000, 6200000, 13,
    4.8, 84, '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-appliances', 'Maishiy texnika',
    true, 15, true, false, true,
    24, '["NoFrost","Inverter","Tejamkor A++","Artel"]'::jsonb, '{"Brend":"Artel","Hajmi":"340 litr","Tizim":"Total No Frost muzlatmasdan sovitish","Kompressor":"Smart Inverter (10 yil kafolat)"}'::jsonb, 'NoFrost tizimi, A++ energiya tejamkorligi va jim ishlaydigan zamonaviy inverter kompressorli Artel muzlatgichi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-010', 'ELR-LG-WASH', 'LG 8.5 kg AI DD Inverter Kir yuvish mashinasi Steam bug'' funksiyasi', 'lg-8kg-ai-dd-inverter-washing-machine', 6900000, 7800000, 11,
    4.85, 112, '["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-appliances', 'Maishiy texnika',
    true, 9, true, false, true,
    24, '["AI DD","Bug'' bilan yuvish","LG"]'::jsonb, '{"Brend":"LG","Yuklash sig''imi":"8.5 kg","Siqish tezligi":"1200 ayl/daq","Dvigatel":"Direct Drive to''g''ridan-to''g''ri uzatma (10 yil kafolat)"}'::jsonb, 'Mato turini o''zi aniqlaydigan sun''iy intellekt AI DD va kiyimlarni 99.9% allergenlardan tozalovchi Steam bug'' texnologiyasi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-011', 'ELR-ROB-X10', 'Xiaomi Robot Vacuum X10+ Namlab tozalovchi robot changyutgich', 'xiaomi-robot-vacuum-x10-plus', 6850000, 7800000, 12,
    4.85, 76, '["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-appliances', 'Maishiy texnika',
    true, 6, true, false, false,
    12, '["Avtomatik tozalash","LiDAR","Xiaomi"]'::jsonb, '{"Brend":"Xiaomi","So''rish quvvati":"4000 Pa","Navigatsiya":"S-Cross AI 3D to''siqlardan qochish + LDS lazer"}'::jsonb, 'Xiaomi flagman aqlli tozalash stansiyasi: o''zi yuvadi, o''zi quritadi va uyingizni mukammal toza tutadi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-012', 'ELR-MID-AC12', 'Midea Inverter 12000 BTU Konditsioner (Qish-Yoz -25°C gacha)', 'midea-inverter-12000-btu-air-conditioner', 4800000, 5600000, 14,
    4.8, 65, '["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-appliances', 'Maishiy texnika',
    true, 12, false, true, true,
    12, '["0-0-12","Inverter","Qish-Yoz","Midea"]'::jsonb, '{"Brend":"Midea","Maydon":"35 kv.m gacha","Turi":"Full DC Inverter split-tizim","Qishki rejim":"-25°C gacha isitish"}'::jsonb, 'Midea invertorli konditsioner: yozda muzdek salqin, qishning qattiq sovuqlarida ham yuqori tejamkorlik bilan isitadi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-013', 'ELR-MAC-M3', 'Apple MacBook Air 13" M3 Chip (16GB / 512GB SSD) Midnight', 'apple-macbook-air-13-m3-16-512', 15900000, 17200000, 8,
    5, 164, '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-computers', 'Noutbuk va kompyuterlar',
    true, 7, true, false, true,
    24, '["M3 Chip","18 soat avtonomiya","Apple"]'::jsonb, '{"Brend":"Apple","Protsessor":"Apple M3 chip (8 yadroli CPU, 10 yadroli GPU)","Operativ xotira":"16 GB birlashtirilgan xotira","Doimiy xotira":"512 GB SSD"}'::jsonb, 'Yupqa, yengil va nihoyatda tezkor Apple MacBook Air M3. Talabalar, dasturchilar va dizaynerlar uchun eng ideal noutbuk.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-014', 'ELR-LEN-LEG5', 'Lenovo Legion 5 Pro Gaming (Ryzen 7 7745HX / RTX 4060 / 16GB / 1TB)', 'lenovo-legion-5-pro-rtx4060', 16800000, 18200000, 8,
    4.9, 92, '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-computers', 'Noutbuk va kompyuterlar',
    true, 5, true, false, true,
    24, '["Geymer noutbuk","RTX 4060","Lenovo"]'::jsonb, '{"Brend":"Lenovo","Ekran":"16\" WQXGA 240Hz IPS 500 nits","Videokarta":"NVIDIA GeForce RTX 4060 8GB (140W TGP)","Protsessor":"AMD Ryzen 7 7745HX (16 potok)"}'::jsonb, 'Og''ir o''yinlar, 3D modellashtirish va montaj uchun afsonaviy sovutish tizimi va 240Hz ekranga ega Lenovo Legion flagmani.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-015', 'ELR-ASU-V15', 'Asus Vivobook 15 OLED (Intel Core i5-13500H / 16GB / 512GB SSD)', 'asus-vivobook-15-oled-i5', 7900000, 9200000, 14,
    4.8, 110, '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-computers', 'Noutbuk va kompyuterlar',
    true, 14, false, true, true,
    12, '["0-0-12","OLED ekran","Asus"]'::jsonb, '{"Brend":"Asus","Ekran":"15.6\" Full HD OLED 600 nits","Protsessor":"Intel Core i5 13-avlod","Xotira":"16GB DDR4 / 512GB NVMe SSD"}'::jsonb, 'OLED ekranning chuqur qora ranglari va 13-avlod Intel Core i5 kuchli protsessori bilan har kuni zavq bag''ishlovchi noutbuk.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-016', 'ELR-HP-15DW', 'HP 15-dw Noutbuk (Intel Core i3 / 8GB RAM / 256GB SSD) Silver', 'hp-15-dw-intel-core-i3', 4300000, 5100000, 16,
    4.65, 78, '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-computers', 'Noutbuk va kompyuterlar',
    true, 20, false, false, true,
    12, '["0-0-12","Hamyonbop","HP"]'::jsonb, '{"Brend":"HP","Ekran":"15.6\" Full HD Antiglare","Protsessor":"Intel Core i3 12-avlod","Xotira":"8GB RAM / 256GB SSD"}'::jsonb, 'O''qish, ofis ishlari va internetda qulay ishlash uchun eng ishonchli va arzon noutbuk.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-017', 'ELR-DYS-AIR', 'Dyson Airwrap Multi-Styler Complete Long (Nickel/Copper)', 'dyson-airwrap-multi-styler-complete-long', 7490000, 8300000, 10,
    4.95, 189, '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-beauty', 'Goʻzallik va parvarish',
    true, 5, true, true, false,
    12, '["Original","Hit savdo","Dyson"]'::jsonb, '{"Brend":"Dyson","Turi":"Multistayler fen","Quvvat":"1300 Vt","Komplektatsiya":"6 ta almashtiriladigan nasadka + saqlash qutisi"}'::jsonb, 'Sochni haddan tashqari qizdirmasdan shakllantiruvchi afsonaviy Dyson Airwrap Coanda effekti bilan.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-018', 'ELR-DYS-SUPER', 'Dyson Supersonic Nural Aqlli soch quritgich fen (Strawberry Bronze)', 'dyson-supersonic-nural-hair-dryer', 5950000, 6500000, 8,
    4.9, 74, '["https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-beauty', 'Goʻzallik va parvarish',
    true, 8, false, false, true,
    12, '["0-0-12","Yangi","Dyson"]'::jsonb, '{"Brend":"Dyson","Datchik":"Bosh terisini avtomatik himoyalovchi Nural datchik","Quvvat":"1600 Vt"}'::jsonb, 'Bosh terisiga yaqinlashganda issiqlikni o''zi kamaytiruvchi eng yangi avlod Dyson Supersonic Nural feni.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-019', 'ELR-PHI-LUM', 'Philips Lumea Series 9000 IPL Lazerli fotoepilyator (SenseIQ bilan)', 'philips-lumea-9000-ipl-epilator', 4200000, 5100000, 18,
    4.85, 135, '["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-beauty', 'Goʻzallik va parvarish',
    true, 10, true, false, true,
    12, '["0-0-12","Philips","Fotoepilyator"]'::jsonb, '{"Brend":"Philips","Resurs":"450 000 chaqnash (15+ yil foydalanish)","SenseIQ":"Teri rangini aniqlash va xavfsiz quvvat berish"}'::jsonb, 'Uy sharoitida salondagi kabi silliq teriga erishing. SenseIQ datchigi terini to''liq himoyalaydi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-020', 'ELR-BRA-S9P', 'Braun Series 9 Pro Premium erkaklar elektr ustarasi (PowerCase keys)', 'braun-series-9-pro-electric-shaver', 3850000, 4500000, 15,
    4.8, 91, '["https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-beauty', 'Goʻzallik va parvarish',
    true, 12, false, true, true,
    12, '["0-0-12","Braun","Ustara"]'::jsonb, '{"Brend":"Braun","Pichoqlar":"40 000 kesish harakati/daqiqasiga ProLift trimmer","Qo''shimcha":"O''rnatilgan akkumulyatorli PowerCase"}'::jsonb, 'Germaniyada ishlab chiqarilgan eng ilg''or va teriga muloyim elektr ustara.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-021', 'ELR-70M-A810', '70mai A810 4K HDR Videoregistrator Sony Starvis 2 sensori GPS bilan', '70mai-a810-4k-hdr-dashcam', 1650000, 1950000, 15,
    4.85, 142, '["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-auto', 'Avtomobil jihozlari',
    true, 20, true, true, true,
    12, '["0-0-12","4K UHD","GPS","70mai"]'::jsonb, '{"Brend":"70mai","Kamera":"Sony Starvis 2 IMX678 4K Ultra HD","Funktsiyalar":"Tungi ko''rish, ADAS haydovchi yordamchisi, GPS trek","Kafolat":"1 yil rasmiy kafolat"}'::jsonb, 'Kechasi ham qorong''uda avtomobil raqamlarini 4K sifatda aniq yozib oluvchi eng mukammal videoregistrator.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-022', 'ELR-BAS-JUMP', 'Baseus Super Energy Pro Car Jump Starter & Akkumulyator kompressor', 'baseus-super-energy-jump-starter', 850000, 1050000, 19,
    4.8, 114, '["https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-auto', 'Avtomobil jihozlari',
    true, 30, true, false, true,
    6, '["0-0-12","Arzon","Baseus"]'::jsonb, '{"Brend":"Baseus","Sig''im":"12000 mA/soat","Pik toki":"1000A (Akkumulyatori o''tirgan mashinani yurgizish)","Qo''shimcha":"Fonarik va PowerBank"}'::jsonb, 'Qishda akkumulyatoringiz o''tirib qolsa bir zumda mashinani yurgizib beruvchi universal uskuna.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-023', 'ELR-PIO-6970', 'Pioneer TS-A6970F 600W 5-polosali Avtomobil dinamiklari (Kalonka)', 'pioneer-ts-a6970f-600w-speakers', 720000, 850000, 15,
    4.75, 89, '["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-auto', 'Avtomobil jihozlari',
    true, 15, false, false, true,
    6, '["0-0-12","Pioneer","Musiqa"]'::jsonb, '{"Brend":"Pioneer","Maksimal quvvat":"600 Watt","Nominal quvvat":"100 Watt RMS","Turi":"Oval 6x9 dyuymli 5 polosali"}'::jsonb, 'Chuqur bas va tiniq ovozli mashhur Pioneer original oval dinamiklari to''plami.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-024', 'ELR-BAS-MAGCAR', 'Baseus MagSafe 15W Avtomobil simsiz tezkor zaryadlovchi ushlagichi', 'baseus-magsafe-15w-car-mount', 240000, 320000, 25,
    4.8, 167, '["https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-auto', 'Avtomobil jihozlari',
    true, 50, true, false, true,
    3, '["Super narx","Baseus","MagSafe"]'::jsonb, '{"Brend":"Baseus","Quvvat":"15W simsiz tezkor zaryadlash","O''rnatish":"Havo chiqish panjarasiga (Deflektor)"}'::jsonb, 'Kuchli magnitli va 15W tezkor zaryadlash xususiyatiga ega qulay avtomobil ushlagichi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-025', 'ELR-TEF-GRILL', 'Tefal OptiGrill Elite Aqlli elektr gril XL (Avtomatik pishirish)', 'tefal-optigrill-elite-xl', 2950000, 3550000, 17,
    4.9, 124, '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-home', 'Uy-roʻzgʻor buyumlari',
    true, 14, true, true, true,
    12, '["0-0-12","Tefal","Oshxona"]'::jsonb, '{"Brend":"Tefal","Quvvat":"2200 Vt","Datchik":"Go''sht qalinligini o''lchovchi aqlli sensor","Dasturlar":"16 ta avtomatik pishirish dasturi"}'::jsonb, 'Go''shtning pishish darajasini (Rare, Medium, Well-done) o''zi belgilab pishirib beruvchi aqlli Tefal grili.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-026', 'ELR-PHI-AIR3', 'Philips Series 3000 Havo tozalagich va namlagich (HEPA NanoProtect)', 'philips-air-purifier-series-3000', 3400000, 3950000, 14,
    4.8, 88, '["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-home', 'Uy-roʻzgʻor buyumlari',
    true, 8, false, false, true,
    12, '["0-0-12","Philips","Toza havo"]'::jsonb, '{"Brend":"Philips","Filtr":"HEPA NanoProtect 99.97% tozalash","Xona maydoni":"48 kv.m gacha"}'::jsonb, 'Xonadagi chang, virus, allergen va noxush hidlarni daqiqalarda tozalovchi sokin Philips havoni tozalash uskunasi.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-027', 'ELR-DEL-DED', 'DeLonghi Dedica EC685 Metall korpusli espresso kofe mashinasi', 'delonghi-dedica-ec685-coffee-maker', 2800000, 3200000, 12,
    4.85, 165, '["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-home', 'Uy-roʻzgʻor buyumlari',
    true, 11, true, false, true,
    12, '["Kofe","DeLonghi","Espresso"]'::jsonb, '{"Brend":"DeLonghi","Bosim":"15 bar professional nasos","Kapuchinator":"Sut ko''pirtirgich moslamasi"}'::jsonb, 'Klassik italyancha espresso, kapuchino va latte kofelarini uyingizda tayyorlash uchun professional ixcham kofevarka.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-028', 'ELR-XIA-FRY4', 'Xiaomi Smart Air Fryer Pro 4L Aqlli oyna oynali aerogrill', 'xiaomi-smart-air-fryer-pro-4l', 1150000, 1420000, 19,
    4.8, 230, '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-home', 'Uy-roʻzgʻor buyumlari',
    true, 24, true, true, true,
    6, '["0-0-12","Yog''siz pishirish","Xiaomi"]'::jsonb, '{"Brend":"Xiaomi","Hajmi":"4 litr (shaffof pishish darchasi bilan)","Harorat":"40°C dan 200°C gacha (yogurt, meva quritish)"}'::jsonb, 'Yog''siz, parhezbop qarsildoq tovuq, fri va pishiriqlar tayyorlash uchun aqlli Xiaomi aerogrili.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;
INSERT INTO public.products (
    id, sku, title, slug, price, original_price, discount_percentage,
    rating, reviews_count, images, category_id, category_name,
    in_stock, stock_count, is_best_seller, is_weekly_offer, has_zero_down,
    max_months, tags, specs, description, delivery_days, colors, storage_options
) VALUES (
    'prod-029', 'ELR-TEF-ING12', 'Tefal Ingenio Emotion 12 qismli yapishmaydigan idishlar to''plami', 'tefal-ingenio-emotion-12-pieces', 1850000, 2380000, 22,
    4.9, 140, '["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80"]'::jsonb, 'cat-home', 'Uy-roʻzgʻor buyumlari',
    true, 16, true, false, true,
    12, '["0-0-12","Tefal","Idishlar"]'::jsonb, '{"Brend":"Tefal","Material":"Zanglamas po''lat va titan qoplamasi","Dasta":"Olinadigan xavfsiz 10 kg ushlovchi dasta"}'::jsonb, 'Plitadan pechka va to''g''ridan-to''g''ri muzlatgichga sig''adigan olinadigan dastali mashhur Tefal Ingenio to''plami.', 1, '[]'::jsonb, '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    discount_percentage = EXCLUDED.discount_percentage,
    stock_count = EXCLUDED.stock_count,
    images = EXCLUDED.images,
    specs = EXCLUDED.specs,
    description = EXCLUDED.description;

-- c) Sharhlar va baholarni kiritish
INSERT INTO public.product_reviews (id, product_id, user_name, rating, comment, verified_purchase, likes_count, created_at)
VALUES ('rev-01', 'prod-001', 'Jasur Beknazarov', 5, 'iPhone 16 Pro Max ni Elrizo orqali 12 oyga 0% boshlang''ich to''lov bilan oldim. Shartnoma 3 daqiqada tasdiqlandi, ertasi kuni ertalab kuryer uyimga bepul yetkazib berdi. Telefon original, 1 yil rasmiy kafolat kartasi ham ichida bor ekan. Juda xursandman!', true, 14, '2026-10-18T10:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_reviews (id, product_id, user_name, rating, comment, verified_purchase, likes_count, created_at)
VALUES ('rev-02', 'prod-001', 'Madina Karimova', 5, 'Desert Titanium rangi juda nafis va chiroyli! Kamera sifati va akkumulyatori ajoyib, bir quvvatlash bilan 2 kungacha yetmoqda. Nasiya to''lovini Payme orqali to''lash ham juda qulay.', true, 8, '2026-10-14T14:15:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_reviews (id, product_id, user_name, rating, comment, verified_purchase, likes_count, created_at)
VALUES ('rev-03', 'prod-001', 'Sardorbek Toshmatov', 5, 'Usta sifatida aytaman: A18 Pro protsessori eng og''ir 4K montajlarni ham qizimasdan o''tkazmoqda. Elrizo servisiga alohida rahmat!', true, 5, '2026-10-09T08:45:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_reviews (id, product_id, user_name, rating, comment, verified_purchase, likes_count, created_at)
VALUES ('rev-04', 'prod-002', 'Farrux Aliyev', 5, 'Galaxy S24 Ultra dagi Galaxy AI tarjimoni va S-Pen qalami ishimda har kuni yordam beryapti. 200MP kamera oydan ham tiniq rasm oladi. Tavsiya qilaman!', true, 11, '2026-10-16T12:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_reviews (id, product_id, user_name, rating, comment, verified_purchase, likes_count, created_at)
VALUES ('rev-05', 'prod-002', 'Nargiza Usmonova', 4, 'Telefon juda kuchli va chiroyli, lekin birmuncha og''irroq ekan. Qolgan barcha jihatlari 5 yulduz!', true, 3, '2026-10-11T16:20:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_reviews (id, product_id, user_name, rating, comment, verified_purchase, likes_count, created_at)
VALUES ('rev-06', 'prod-003', 'Olimjon Qosimov', 5, 'Dyson fenini xotinimga sovg''a uchun nasiyaga rasmiylashtirdim. Sochni kuydirmasdan juda tez quritadi. Haqiqiy original mahsulot!', true, 9, '2026-10-15T09:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- d) Promo-kodlarni kiritish
INSERT INTO public.promo_codes (id, code, discount_type, discount_value, description, min_order_amount, is_active, usage_count)
VALUES ('promo-welcome10', 'WELCOME10', 'percentage', 10, 'Yangi mijozlar uchun 10% chegirma', 0, true, 0)
ON CONFLICT (id) DO UPDATE SET discount_value = EXCLUDED.discount_value, is_active = EXCLUDED.is_active;
INSERT INTO public.promo_codes (id, code, discount_type, discount_value, description, min_order_amount, is_active, usage_count)
VALUES ('promo-elrizo15', 'ELRIZO15', 'percentage', 15, 'ELRIZO maxsus aksiyasi — 15% chegirma', 0, true, 0)
ON CONFLICT (id) DO UPDATE SET discount_value = EXCLUDED.discount_value, is_active = EXCLUDED.is_active;
INSERT INTO public.promo_codes (id, code, discount_type, discount_value, description, min_order_amount, is_active, usage_count)
VALUES ('promo-super500', 'SUPER500', 'fixed', 500000, '3 000 000 so''mdan yuqori xaridga 500 000 so''m sovg''a', 3000000, true, 0)
ON CONFLICT (id) DO UPDATE SET discount_value = EXCLUDED.discount_value, is_active = EXCLUDED.is_active;
INSERT INTO public.promo_codes (id, code, discount_type, discount_value, description, min_order_amount, is_active, usage_count)
VALUES ('promo-bahor20', 'BAHOR20', 'percentage', 20, 'Bahoriy katta chegirma 20%', 0, true, 0)
ON CONFLICT (id) DO UPDATE SET discount_value = EXCLUDED.discount_value, is_active = EXCLUDED.is_active;

-- e) Boshlang'ich Admin va Mijoz profillari
INSERT INTO public.user_profiles (id, email, full_name, phone, city, address, passport_or_pinfl, avatar_url, scoring_limit, used_limit, cashback_balance, loyalty_card_number, is_admin, role)
VALUES 
('admin-otabek', 'otabek1789@gmail.com', 'Otabek Jo''rayev (Bosh Administrator)', '+998 94 333 55 22', 'Toshkent', 'Amir Temur shoh ko''chasi, 42', '31204956780012', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 50000000, 0, 150000, 'ELR-777-VIP', true, 'admin'),
('usr-demo-01', 'jasur@beknazarov.uz', 'Jasur Beknazarov', '+998 90 123 45 67', 'Toshkent', 'Chilonzor tumani, 9-mavze, 24-uy', '31204984500012', '', 25000000, 14500000, 145000, 'ELR-102-GOLD', false, 'user')
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin,
    role = EXCLUDED.role;

-- f) Boshlang'ich Namuna Buyurtmalar (Nasiya arizalari)
INSERT INTO public.nasiya_orders (
    contract_number, customer_name, pinfl, phone, city, address, total_price, monthly_payment, payment_mode, installment_months, items, scoring_score, status, cashback_earned
) VALUES 
('ELR-849201', 'Jasur Beknazarov', '31204984500012', '+998 90 123 45 67', 'Toshkent', 'Amir Temur shoh ko''chasi, 42-uy', 18450000, 1537500, 'installment', 12, '[{"title": "Apple iPhone 16 Pro Max 256GB", "quantity": 1, "price": 18450000}]'::jsonb, 820, 'delivered', 184500),
('ELR-731904', 'Dilnoza Karimova', '41508923400034', '+998 93 456 78 90', 'Samarqand', 'Registon ko''chasi, 15-uy', 16200000, 1350000, 'installment', 12, '[{"title": "Samsung Galaxy S24 Ultra 512GB", "quantity": 1, "price": 16200000}]'::jsonb, 780, 'processing', 162000),
('ELR-620415', 'Farrux Aliyev', '32901948500067', '+998 97 789 01 23', 'Farg''ona', 'Mustaqillik shoh ko''chasi, 8-uy', 6800000, 566666, 'installment', 12, '[{"title": "Dyson Airwrap Multi-Styler Complete", "quantity": 1, "price": 6800000}]'::jsonb, 750, 'scoring_approved', 68000)
ON CONFLICT (contract_number) DO NOTHING;

-- g) Boshlang'ich Keshbek Harakatlari
INSERT INTO public.cashback_transactions (id, order_id, user_email, type, amount, description)
VALUES 
('cb-init-01', 'ELR-849201', 'jasur@beknazarov.uz', 'earned', 184500, 'iPhone 16 Pro Max xarididan +1% keshbek'),
('cb-init-02', 'ELR-731904', 'dilnoza@karimova.uz', 'earned', 162000, 'Samsung Galaxy S24 Ultra xarididan +1% keshbek')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- TUGADI: BARCHA JADVALLAR VA MA'LUMOTLAR SUPABASEGA MUVAFFAQIYATLI YUKLANDI!
-- ==============================================================================
