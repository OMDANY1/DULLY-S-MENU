-- DULLY'S MENU — SUPABASE DATABASE INITIAL SCHEMAS MIGRATION

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- 01. ADMIN PROFILES TABLE (Authorization boundary)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    user_id UUID PRIMARY KEY, -- References auth.users(id)
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_allowed_roles CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- ==================================================
-- 02. MENU CATEGORIES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id TEXT PRIMARY KEY, -- Category Slug (e.g. 'hot-tea')
    display_name TEXT NOT NULL,
    arabic_name TEXT NOT NULL,
    description TEXT NOT NULL,
    visibility_mode TEXT NOT NULL DEFAULT 'standard',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_visibility_modes CHECK (visibility_mode IN ('standard', 'ipad'))
);

-- ==================================================
-- 03. MENU PRODUCTS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.menu_products (
    id TEXT PRIMARY KEY, -- Product Slug (e.g. 'asam-black-tea')
    category_id TEXT NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    menu_code TEXT NOT NULL, -- Business numbering (e.g. '01')
    name TEXT NOT NULL,
    arabic_name TEXT NOT NULL,
    dairy_milk TEXT DEFAULT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    availability_status TEXT NOT NULL DEFAULT 'available',
    launch_date TIMESTAMPTZ DEFAULT NULL,
    end_date TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_availability_states CHECK (availability_status IN ('available', 'out_of_stock')),
    CONSTRAINT unique_category_menu_code UNIQUE (category_id, menu_code)
);

-- ==================================================
-- 04. MENU PRODUCT VARIANTS TABLE (Sizes)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.menu_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.menu_products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL, -- (e.g. '16 OZ', 'Premium')
    size_code TEXT NOT NULL,  -- (e.g. '16oz', 'premium')
    price NUMERIC(10, 2) NOT NULL,
    calories INTEGER DEFAULT NULL,
    calorie_note TEXT DEFAULT NULL,
    oz NUMERIC(10, 2) DEFAULT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_product_size_code UNIQUE (product_id, size_code)
);

-- ==================================================
-- 05. MENU PRODUCT ASSETS TABLE (Images)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.menu_product_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.menu_products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.menu_product_variants(id) ON DELETE CASCADE DEFAULT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================================================
-- 06. MENU SETTINGS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.menu_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.menu_products(category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.menu_product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_assets_product ON public.menu_product_assets(product_id);
CREATE INDEX IF NOT EXISTS idx_assets_variant ON public.menu_product_assets(variant_id);

-- Enable RLS on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_product_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_settings ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- 07. ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================

-- Helper function to check if the authenticated user is an active admin
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- 1. admin_profiles Policies
CREATE POLICY "Admin profile check read-only" ON public.admin_profiles
    FOR SELECT USING (auth.uid() = user_id OR is_active_admin());

CREATE POLICY "Admin profiles full modification by admins" ON public.admin_profiles
    FOR ALL USING (is_active_admin());

-- 2. menu_categories Policies
CREATE POLICY "Public categories select read access" ON public.menu_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin categories full write access" ON public.menu_categories
    FOR ALL USING (is_active_admin());

-- 3. menu_products Policies
CREATE POLICY "Public products select read access" ON public.menu_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin products full write access" ON public.menu_products
    FOR ALL USING (is_active_admin());

-- 4. menu_product_variants Policies
CREATE POLICY "Public variants select read access" ON public.menu_product_variants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin variants full write access" ON public.menu_product_variants
    FOR ALL USING (is_active_admin());

-- 5. menu_product_assets Policies
CREATE POLICY "Public assets select read access" ON public.menu_product_assets
    FOR SELECT USING (true);

CREATE POLICY "Admin assets full write access" ON public.menu_product_assets
    FOR ALL USING (is_active_admin());

-- 6. menu_settings Policies
CREATE POLICY "Public settings select read access" ON public.menu_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin settings full write access" ON public.menu_settings
    FOR ALL USING (is_active_admin());
