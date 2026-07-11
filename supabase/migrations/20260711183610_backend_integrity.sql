-- DULLY'S MENU — BACKEND INTEGRITY, SECURITY & PARITY MIGRATION
-- Reference Timestamp: 20260711183610

-- ==================================================
-- 01. ADD IS_ACTIVE COLUMN TO ASSETS
-- ==================================================
ALTER TABLE public.menu_product_assets
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ==================================================
-- 02. ADMIN PROFILES REFERENTIAL INTEGRITY AUDIT
-- ==================================================
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM public.admin_profiles
  WHERE user_id NOT IN (SELECT id FROM auth.users);

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Migration aborted: Found % orphan admin_profiles rows with user_ids not present in auth.users. Please perform manual database review.', orphan_count;
  END IF;
END $$;

-- Enforce Schema-level Referential Constraint
ALTER TABLE public.admin_profiles
DROP CONSTRAINT IF EXISTS fk_admin_profiles_user_id;

ALTER TABLE public.admin_profiles
ADD CONSTRAINT fk_admin_profiles_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- ==================================================
-- 03. DEDUPLICATE PRODUCT ASSET RELATIONSHIPS
-- ==================================================
-- Deduplicate default assets (keep only the latest active one per product)
DELETE FROM public.menu_product_assets a
WHERE a.variant_id IS NULL
  AND a.id <> (
    SELECT sub.id
    FROM public.menu_product_assets sub
    WHERE sub.product_id = a.product_id AND sub.variant_id IS NULL
    ORDER BY 
      sub.is_active DESC,
      sub.updated_at DESC,
      sub.created_at DESC,
      sub.id DESC
    LIMIT 1
  );

-- Deduplicate size-variant assets (keep only the latest active one per variant)
DELETE FROM public.menu_product_assets a
WHERE a.variant_id IS NOT NULL
  AND a.id <> (
    SELECT sub.id
    FROM public.menu_product_assets sub
    WHERE sub.variant_id = a.variant_id
    ORDER BY 
      sub.is_active DESC,
      sub.updated_at DESC,
      sub.created_at DESC,
      sub.id DESC
    LIMIT 1
  );

-- ==================================================
-- 04. CREATE PARTIAL UNIQUE INDEXES FOR ASSETS
-- ==================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_menu_product_assets_default
ON public.menu_product_assets(product_id)
WHERE variant_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_menu_product_assets_variant
ON public.menu_product_assets(variant_id)
WHERE variant_id IS NOT NULL;

-- ==================================================
-- 05. HARDEN AUTHORIZATION HELPER FUNCTION
-- ==================================================
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated, service_role;

-- ==================================================
-- 06. TIGHTEN ROW LEVEL SECURITY SELECT POLICIES
-- ==================================================
-- Revoke public access to base tables
DROP POLICY IF EXISTS "Public categories select read access" ON public.menu_categories;
DROP POLICY IF EXISTS "Admin categories select read access" ON public.menu_categories;
CREATE POLICY "Admin categories select read access" ON public.menu_categories
    FOR SELECT USING (is_active_admin());

DROP POLICY IF EXISTS "Public products select read access" ON public.menu_products;
DROP POLICY IF EXISTS "Admin products select read access" ON public.menu_products;
CREATE POLICY "Admin products select read access" ON public.menu_products
    FOR SELECT USING (is_active_admin());

DROP POLICY IF EXISTS "Public variants select read access" ON public.menu_product_variants;
DROP POLICY IF EXISTS "Admin variants select read access" ON public.menu_product_variants;
CREATE POLICY "Admin variants select read access" ON public.menu_product_variants
    FOR SELECT USING (is_active_admin());

DROP POLICY IF EXISTS "Public assets select read access" ON public.menu_product_assets;
DROP POLICY IF EXISTS "Admin assets select read access" ON public.menu_product_assets;
CREATE POLICY "Admin assets select read access" ON public.menu_product_assets
    FOR SELECT USING (is_active_admin());

DROP POLICY IF EXISTS "Public settings select read access" ON public.menu_settings;
DROP POLICY IF EXISTS "Admin settings select read access" ON public.menu_settings;
CREATE POLICY "Admin settings select read access" ON public.menu_settings
    FOR SELECT USING (is_active_admin());

-- ==================================================
-- 07. SECURE PUBLIC READ BOUNDARY (get_public_menu)
-- ==================================================
CREATE OR REPLACE FUNCTION public.get_public_menu()
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSONB;
  menu_mode TEXT;
  pub_status TEXT;
BEGIN
  -- Get active global settings
  SELECT 
    COALESCE((value->>'menuMode'), 'standard'),
    COALESCE((value->>'publicationStatus'), 'published')
  INTO menu_mode, pub_status
  FROM public.menu_settings 
  WHERE key = 'global';

  -- If unpublished, return empty array immediately
  IF pub_status <> 'published' THEN
    RETURN '[]'::JSONB;
  END IF;

  -- Build nested JSON array
  SELECT COALESCE(jsonb_agg(cat_json), '[]'::JSONB)
  INTO result
  FROM (
    SELECT jsonb_build_object(
      'id', c.id,
      'display_name', c.display_name,
      'arabic_name', c.arabic_name,
      'description', c.description,
      'visibility_mode', c.visibility_mode,
      'items', COALESCE(
        (
          SELECT jsonb_agg(prod_json)
          FROM (
            SELECT jsonb_build_object(
              'id', p.id,
              'menu_code', p.menu_code,
              'name', p.name,
              'arabic_name', p.arabic_name,
              'dairy_milk', p.dairy_milk,
              'image', (
                -- Find default asset storage path
                SELECT a.storage_path
                FROM public.menu_product_assets a
                WHERE a.product_id = p.id AND a.variant_id IS NULL AND a.is_active = true
                LIMIT 1
              ),
              'sizes', COALESCE(
                (
                  SELECT jsonb_agg(var_json)
                  FROM (
                    SELECT jsonb_build_object(
                      'id', v.id,
                      'size_label', v.size_label,
                      'size_code', v.size_code,
                      'price', v.price,
                      'calories', v.calories,
                      'calorie_note', v.calorie_note,
                      'oz', v.oz,
                      'image', (
                        -- Find size-specific asset storage path
                        SELECT a.storage_path
                        FROM public.menu_product_assets a
                        WHERE a.variant_id = v.id AND a.is_active = true
                        LIMIT 1
                      )
                    ) as var_json
                    FROM public.menu_product_variants v
                    WHERE v.product_id = p.id AND v.is_active = true
                    ORDER BY v.display_order ASC
                  ) var_sub
                ),
                '[]'::JSONB
              )
            ) as prod_json
            FROM public.menu_products p
            WHERE p.category_id = c.id
              AND p.is_active = true
              AND p.availability_status = 'available'
              AND (p.launch_date IS NULL OR p.launch_date <= NOW())
              AND (p.end_date IS NULL OR p.end_date >= NOW())
            ORDER BY p.display_order ASC
          ) prod_sub
        ),
        '[]'::JSONB
      )
    ) as cat_json
    FROM public.menu_categories c
    WHERE c.is_active = true
      AND (menu_mode = 'ipad' OR c.visibility_mode = 'standard')
    ORDER BY c.display_order ASC
  ) cat_sub;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.get_public_menu() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_menu() TO anon, authenticated;
