-- DULLY'S MENU — CATEGORY HERO VISUAL REPAIR MIGRATION
-- Reference Timestamp: 20260711200000

-- ==================================================
-- 01. GRANT PERMISSIONS ON public.menu_category_assets
-- ==================================================
GRANT ALL ON TABLE public.menu_category_assets TO anon, authenticated, service_role;

-- ==================================================
-- 02. RECREATE get_public_menu() TO EXPLICITLY RETURN SLUG AND HERO IMAGE
-- ==================================================
CREATE OR REPLACE FUNCTION public.get_public_menu()
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSONB;
  categories_json JSONB;
  menu_mode TEXT;
  pub_status TEXT;
  maint_msg TEXT;
BEGIN
  -- Get active global settings
  SELECT
    (value->>'menuMode'),
    (value->>'publicationStatus'),
    (value->>'maintenanceMessage')
  INTO menu_mode, pub_status, maint_msg
  FROM public.menu_settings
  WHERE key = 'global';

  -- If settings row is missing or publicationStatus is null or empty, fail closed (default to draft / empty categories)
  IF menu_mode IS NULL OR pub_status IS NULL THEN
    RETURN jsonb_build_object(
      'version', 1,
      'settings', jsonb_build_object(
        'menuMode', COALESCE(menu_mode, 'standard'),
        'publicationStatus', COALESCE(pub_status, 'draft'),
        'maintenanceMessage', maint_msg
      ),
      'categories', '[]'::JSONB
    );
  END IF;

  -- If unpublished, return envelope with empty categories
  IF pub_status <> 'published' THEN
    RETURN jsonb_build_object(
      'version', 1,
      'settings', jsonb_build_object(
        'menuMode', menu_mode,
        'publicationStatus', pub_status,
        'maintenanceMessage', maint_msg
      ),
      'categories', '[]'::JSONB
    );
  END IF;

  -- Build nested JSON array of categories
  SELECT COALESCE(jsonb_agg(cat_json), '[]'::JSONB)
  INTO categories_json
  FROM (
    SELECT jsonb_build_object(
      'id', c.id,
      'slug', c.slug,
      'display_name', c.display_name,
      'arabic_name', c.arabic_name,
      'description', c.description,
      'visibility_mode', c.visibility_mode,
      'hero_image', (
        -- Find active category hero asset
        SELECT a.storage_path
        FROM public.menu_category_assets a
        WHERE a.category_id = c.id AND a.asset_type = 'hero' AND a.is_active = true
        LIMIT 1
      ),
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

  -- Return structured envelope
  RETURN jsonb_build_object(
    'version', 1,
    'settings', jsonb_build_object(
      'menuMode', menu_mode,
      'publicationStatus', pub_status,
      'maintenanceMessage', maint_msg
    ),
    'categories', categories_json
  );
END;
$$ LANGUAGE plpgsql;

-- Security: revoke from PUBLIC, grant only to intended Supabase roles
REVOKE ALL ON FUNCTION public.get_public_menu() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_menu() TO anon, authenticated;
