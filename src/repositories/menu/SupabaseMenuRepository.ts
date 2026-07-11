import { MenuCategory, MenuItem, MenuSize, MenuSettings } from "@/domain/menu/types";
import { MenuRepository } from "./MenuRepository";
import { supabase as browserClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getClient() {
  if (typeof window === "undefined") {
    return await createServerSupabaseClient();
  }
  return browserClient;
}

export class SupabaseMenuRepository implements MenuRepository {
  async getSettings(): Promise<MenuSettings> {
    const client = await getClient();
    const { data, error } = await client
      .from("menu_settings")
      .select("value")
      .eq("key", "global")
      .maybeSingle();

    if (error || !data) {
      return {
        menuMode: "standard",
        publicationStatus: "published",
        maintenanceMessage: null,
      };
    }

    const val = data.value as any;
    return {
      menuMode: val?.menuMode || "standard",
      publicationStatus: val?.publicationStatus || "published",
      maintenanceMessage: val?.maintenanceMessage || null,
    };
  }

  async getCategories(): Promise<MenuCategory[]> {
    const client = await getClient();
    const settings = await this.getSettings();

    // Fetch categories with nested products, variants, and assets
    const { data: categoriesData, error } = await client
      .from("menu_categories")
      .select(`
        id,
        display_name,
        arabic_name,
        description,
        visibility_mode,
        is_active,
        display_order,
        menu_products (
          id,
          menu_code,
          name,
          arabic_name,
          dairy_milk,
          is_active,
          availability_status,
          launch_date,
          end_date,
          display_order,
          menu_product_variants (
            id,
            size_label,
            size_code,
            price,
            calories,
            calorie_note,
            oz,
            is_active,
            display_order
          ),
          menu_product_assets (
            storage_path,
            variant_id
          )
        )
      `)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !categoriesData) {
      console.error("Error fetching categories from Supabase:", error);
      return [];
    }

    const now = new Date();
    const result: MenuCategory[] = [];

    for (const cat of categoriesData) {
      // 1. Filter category visibility against the current active menuMode
      if (settings.menuMode === "standard" && cat.visibility_mode !== "standard") {
        continue;
      }

      const items: MenuItem[] = [];

      const rawProducts = (cat.menu_products as any[]) || [];
      // Sort products by display_order
      rawProducts.sort((a, b) => a.display_order - b.display_order);

      for (const prod of rawProducts) {
        // 2. Filter active products, availability status, and launch/end dates
        if (!prod.is_active || prod.availability_status !== "available") continue;

        if (prod.launch_date && new Date(prod.launch_date) > now) continue;
        if (prod.end_date && new Date(prod.end_date) < now) continue;

        const rawVariants = (prod.menu_product_variants as any[]) || [];
        // Sort variants by display_order
        rawVariants.sort((a, b) => a.display_order - b.display_order);

        const sizes: MenuSize[] = [];
        for (const v of rawVariants) {
          // 3. Filter active variants (sizes)
          if (!v.is_active) continue;

          sizes.push({
            label: v.size_label,
            price: Number(v.price),
            calories: v.calories,
            calorieNote: v.calorie_note,
            oz: v.oz ? Number(v.oz) : null,
          });
        }

        // Must have at least one active size variant to be visible
        if (sizes.length === 0) continue;

        // Resolve product assets
        const rawAssets = (prod.menu_product_assets as any[]) || [];
        // Find default product image (variant_id is null)
        const defaultAsset = rawAssets.find((a) => !a.variant_id);
        const defaultImgUrl = defaultAsset
          ? client.storage.from("menu-products").getPublicUrl(defaultAsset.storage_path).data.publicUrl
          : null;

        items.push({
          id: prod.id,
          num: prod.menu_code,
          name: prod.name,
          arabicName: prod.arabic_name,
          category: cat.id,
          sizes,
          image: defaultImgUrl,
          dairyMilk: prod.dairy_milk,
        });
      }

      result.push({
        id: cat.id,
        name: cat.display_name, // Map display name to name for legacy compat
        displayName: cat.display_name,
        arabicName: cat.arabic_name,
        description: cat.description,
        visibility: cat.visibility_mode as "standard" | "ipad",
        items,
      });
    }

    return result;
  }

  async getCategoryById(id: string): Promise<MenuCategory | null> {
    const categories = await this.getCategories();
    return categories.find((cat) => cat.id === id) || null;
  }

  async getProductsByCategory(categoryId: string): Promise<MenuItem[]> {
    const cat = await this.getCategoryById(categoryId);
    return cat ? cat.items : [];
  }

  async getProductById(id: string): Promise<MenuItem | null> {
    const categories = await this.getCategories();
    for (const cat of categories) {
      const item = cat.items.find((p) => p.id === id);
      if (item) return item;
    }
    return null;
  }
}
