-- Embroidery Design Marketplace Database Setup Script
-- Run this script in the SQL Editor of your Supabase Dashboard (https://supabase.com)

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREATE USERS PROFILE TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    two_factor_secret TEXT,            -- Secret for TOTP 2FA (admins only)
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. CREATE DESIGNS TABLE
CREATE TABLE IF NOT EXISTS public.designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    preview_image_url TEXT NOT NULL, -- Public preview URL (Mandatory Primary Image)
    secondary_image_url TEXT,        -- Public preview URL (Optional Secondary Image)
    image_urls TEXT[],               -- Array of public preview image URLs (Supports unlimited images)
    zip_file_path TEXT NOT NULL,     -- Private storage path (original-files/design_id.zip)
    is_featured BOOLEAN NOT NULL DEFAULT false,
    hooks TEXT,                      -- Weaving hook count parameter (e.g. 480 hooks)
    cards TEXT,                      -- Weaving card count parameter (e.g. 960 cards)
    box TEXT,                        -- Weaving box count parameter (e.g. 2 boxes)
    reed TEXT,                       -- Weaving reed density parameter (e.g. 100 steel reed)
    formats TEXT,                    -- Supported file formats (e.g. DST, PES, EXP, XXX)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration for existing databases:
-- ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS secondary_image_url TEXT;
-- ALTER TABLE public.designs ADD COLUMN IF NOT EXISTS image_urls TEXT[];


-- Enable Row Level Security (RLS) on designs
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- 4. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_email TEXT,
    design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
    payment_id TEXT UNIQUE,          -- Razorpay Payment ID
    order_id TEXT,                   -- Razorpay Order ID
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. CREATE DOWNLOADS TABLE (To track download histories and count)
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    customer_email TEXT,
    design_id UUID REFERENCES public.designs(id) ON DELETE CASCADE,
    download_count INTEGER NOT NULL DEFAULT 0,
    last_download TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(customer_email, design_id)
);

-- Enable Row Level Security (RLS) on downloads
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- 6. SYNC TRIGGER: AUTH.USERS TO PUBLIC.USERS
-- Automatically creates a public profile row when a new user registers through Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', 'Embroidery Customer'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS POLICIES DEFINITIONS

-- Users Policies:
DROP POLICY IF EXISTS "Allow select users profile" ON public.users;
CREATE POLICY "Allow select users profile" ON public.users
    FOR SELECT USING (
        auth.uid() = id 
        OR (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
    );

DROP POLICY IF EXISTS "Allow update user profile" ON public.users;
CREATE POLICY "Allow update user profile" ON public.users
    FOR UPDATE USING (
        auth.uid() = id 
        OR (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin')
    );

-- Categories Policies:
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin modify categories" ON public.categories;
CREATE POLICY "Allow admin modify categories" ON public.categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Designs Policies:
DROP POLICY IF EXISTS "Allow public read designs" ON public.designs;
CREATE POLICY "Allow public read designs" ON public.designs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin modify designs" ON public.designs;
CREATE POLICY "Allow admin modify designs" ON public.designs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Orders Policies:
DROP POLICY IF EXISTS "Allow user/admin read orders" ON public.orders;
CREATE POLICY "Allow user/admin read orders" ON public.orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users insert orders" ON public.orders;
CREATE POLICY "Allow users insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin modify orders" ON public.orders;
CREATE POLICY "Allow admin modify orders" ON public.orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Downloads Policies:
DROP POLICY IF EXISTS "Allow user/admin read downloads" ON public.downloads;
CREATE POLICY "Allow user/admin read downloads" ON public.downloads
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Allow server write downloads" ON public.downloads;
CREATE POLICY "Allow server write downloads" ON public.downloads
    FOR ALL USING (true); -- Server role key or backend controller handles syncing downloads

-- 8. STORAGE BUCKET CREATION (Using Supabase client or manual execution)
-- Note: Buckets can be created manually in storage dashboard or using the SQL below:
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('previews', 'previews', true),
    ('original-files', 'original-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Objects Policies:
DROP POLICY IF EXISTS "Allow public select previews" ON storage.objects;
CREATE POLICY "Allow public select previews" ON storage.objects
    FOR SELECT USING (bucket_id = 'previews');

DROP POLICY IF EXISTS "Allow admin management storage" ON storage.objects;
CREATE POLICY "Allow admin management storage" ON storage.objects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
