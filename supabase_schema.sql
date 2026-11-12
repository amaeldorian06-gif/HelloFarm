-- Supabase Schema for Hello Farm MVP
-- Tables: users, farms, products, orders

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    phone_number TEXT UNIQUE,
    full_name TEXT,
    role TEXT CHECK (role IN ('producer', 'buyer', 'transporter')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    surface_area FLOAT, -- in hectares
    crop_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table (Marketplace)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_per_unit FLOAT NOT NULL,
    unit TEXT DEFAULT 'kg',
    quantity_available FLOAT NOT NULL,
    image_url TEXT,
    location_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table (Transactions)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES public.users(id),
    product_id UUID REFERENCES public.products(id),
    quantity FLOAT NOT NULL,
    total_price FLOAT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('momo', 'orange_money', 'cash')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Farms are viewable by owner" ON public.farms FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Farms are insertable by owner" ON public.farms FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products are insertable by producers" ON public.products FOR INSERT WITH CHECK (auth.uid() = producer_id);

CREATE POLICY "Orders are viewable by buyer and producer" ON public.orders FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() IN (SELECT producer_id FROM public.products WHERE id = product_id)
);
