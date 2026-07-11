import { MenuCategory, MenuItem, MenuSettings } from "@/domain/menu/types";
import { MenuRepository } from "./MenuRepository";
import { supabase as browserClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RpcSize {
  id: string;
  size_label: string;
  size_code: string;
  price: number;
  calories: number | null;
  calorie_note: string | null;
  oz: number | null;
  image: string | null;
}

interface RpcProduct {
  id: string;
  menu_code: string;
  name: string;
  arabic_name: string;
  dairy_milk: string | null;
  image: string | null;
  sizes: RpcSize[];
}

interface RpcCategory {
  id: string;
  display_name: string;
  arabic_name: string;
  description: string;
  visibility_mode: string;
  items: RpcProduct[];
}

async function getClient() {
  if (typeof window === "undefined") {
    return await createServerSupabaseClient();
  }
  return browserClient;
}

export class SupabaseMenuRepository implements MenuRepository {
  async getSettings(): Promise<MenuSettings> {
    const client = await getClient();
    
    // Read global settings from the secure public view to enforce bounds
    const { data, error } = await client
      .from("public_menu_settings")
      .select("value")
      .eq("key", "global")
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("[DATABASE ERROR] Failed to fetch settings from public view:", error.message);
      }
      return {
        menuMode: "standard",
        publicationStatus: "published",
        maintenanceMessage: null,
      };
    }

    const val = data.value as { menuMode?: string; publicationStatus?: string; maintenanceMessage?: string | null } | null;
    return {
      menuMode: (val?.menuMode || "standard") as "standard" | "ipad",
      publicationStatus: val?.publicationStatus || "published",
      maintenanceMessage: val?.maintenanceMessage || null,
    };
  }

  async getCategories(): Promise<MenuCategory[]> {
    const client = await getClient();

    // Invoke database RPC for public visibility enforcement
    const { data: rawMenu, error } = await client.rpc("get_public_menu");

    if (error) {
      console.error("[DATABASE RPC ERROR] get_public_menu failed:", error.message, error.details);
      throw new Error("Failed to load menu data. Please try again later.");
    }

    const getUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return client.storage.from("menu-products").getPublicUrl(path).data.publicUrl;
    };

    const categories = (rawMenu as RpcCategory[] || []);

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.display_name,
      displayName: cat.display_name,
      arabicName: cat.arabic_name,
      description: cat.description,
      visibility: cat.visibility_mode as "standard" | "ipad",
      items: (cat.items || []).map((prod) => ({
        id: prod.id,
        num: prod.menu_code,
        name: prod.name,
        arabicName: prod.arabic_name,
        category: cat.id,
        image: getUrl(prod.image),
        dairyMilk: prod.dairy_milk,
        sizes: (prod.sizes || []).map((v) => ({
          id: v.id,
          label: v.size_label,
          code: v.size_code,
          price: Number(v.price),
          calories: v.calories,
          calorieNote: v.calorie_note,
          oz: v.oz ? Number(v.oz) : null,
          image: getUrl(v.image),
        })),
      })),
    }));
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
