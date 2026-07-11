import { createServerSupabaseClient } from "@/lib/supabase/server";
import { menuCategories } from "@/data/menu";
import CategoriesManager from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const dataSource = process.env.NEXT_PUBLIC_MENU_DATA_SOURCE || "static";
  let categories: any[] = [];

  if (dataSource === "supabase") {
    try {
      const client = await createServerSupabaseClient();
      const { data, error } = await client
        .from("menu_categories")
        .select(`
          *,
          menu_category_assets(storage_path, asset_type, is_active)
        `)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("[DATABASE QUERY FAILURE] admin categories load failed:", error.message, error.details);
        throw new Error(`Failed to load categories: ${error.message}`);
      }

      if (data) {
        categories = data.map((cat: any) => {
          const heroAsset = cat.menu_category_assets?.find(
            (a: any) => a.asset_type === "hero" && a.is_active
          );
          let heroUrl = null;
          if (heroAsset && heroAsset.storage_path) {
            heroUrl = client.storage.from("menu-products").getPublicUrl(heroAsset.storage_path).data.publicUrl;
          }
          return {
            id: cat.id,
            display_name: cat.display_name,
            name: cat.display_name,
            arabic_name: cat.arabic_name,
            description: cat.description,
            visibility_mode: cat.visibility_mode,
            is_active: cat.is_active,
            hero_image: heroUrl,
            storage_path: heroAsset ? heroAsset.storage_path : null,
          };
        });
      }
    } catch (err) {
      console.error("Error loading categories for admin:", err);
    }
  } else {
    categories = menuCategories.map((c) => ({
      id: c.id,
      display_name: c.displayName,
      name: c.name,
      arabic_name: c.arabicName,
      description: c.description,
      visibility_mode: c.visibility || "standard",
      is_active: true,
    }));
  }

  return <CategoriesManager categories={categories} />;
}
