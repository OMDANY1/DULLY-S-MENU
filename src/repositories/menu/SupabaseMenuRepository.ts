import { MenuCategory, MenuItem, MenuSettings } from "@/domain/menu/types";
import { MenuRepository } from "./MenuRepository";
import { supabase as browserClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ─── RPC Envelope Shape ────────────────────────────────────────
interface RpcEnvelope {
  version: number;
  settings: {
    menuMode: string;
    publicationStatus: string;
    maintenanceMessage: string | null;
  };
  categories: RpcCategory[];
}

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

// ─── Envelope Validation ───────────────────────────────────────
function isValidEnvelope(data: unknown): data is RpcEnvelope {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.version === "number" &&
    obj.settings !== null &&
    typeof obj.settings === "object" &&
    Array.isArray(obj.categories)
  );
}

// ─── Client Resolution ─────────────────────────────────────────
async function getClient() {
  if (typeof window === "undefined") {
    return await createServerSupabaseClient();
  }
  return browserClient;
}

export class SupabaseMenuRepository implements MenuRepository {
  /**
   * Fetches menu settings from the RPC envelope.
   * Falls back to safe defaults on any failure.
   */
  async getSettings(): Promise<MenuSettings> {
    try {
      const client = await getClient();
      const { data, error } = await client.rpc("get_public_menu");

      if (error) {
        console.error("[DATABASE RPC ERROR] get_public_menu failed:", error.message, error.details);
        return this.defaultSettings();
      }

      if (!isValidEnvelope(data)) {
        console.error("[RPC VALIDATION ERROR] get_public_menu returned invalid envelope shape");
        return this.defaultSettings();
      }

      return {
        menuMode: (data.settings.menuMode || "standard") as "standard" | "ipad",
        publicationStatus: data.settings.publicationStatus || "published",
        maintenanceMessage: data.settings.maintenanceMessage || null,
      };
    } catch (err) {
      console.error("[UNEXPECTED ERROR] getSettings failed:", err);
      return this.defaultSettings();
    }
  }

  /**
   * Fetches menu categories from the RPC envelope.
   * Distinguishes between:
   * - Valid unpublished state (envelope.categories is []) → returns []
   * - RPC/database failure (error or invalid envelope) → throws Error
   */
  async getCategories(): Promise<MenuCategory[]> {
    const client = await getClient();

    const { data: rawPayload, error } = await client.rpc("get_public_menu");

    // RPC or database failure → throw (caller should show error state)
    if (error) {
      console.error("[DATABASE RPC ERROR] get_public_menu failed:", error.message, error.details);
      throw new Error("Failed to load menu data. Please try again later.");
    }

    // Validate envelope structure before normalization
    if (!isValidEnvelope(rawPayload)) {
      console.error("[RPC VALIDATION ERROR] get_public_menu returned invalid envelope shape:", typeof rawPayload);
      throw new Error("Menu data format is invalid. Please contact support.");
    }

    // Valid unpublished response → return empty array (not an error)
    if (rawPayload.settings.publicationStatus !== "published") {
      return [];
    }

    const getUrl = (path: string | null) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return client.storage.from("menu-products").getPublicUrl(path).data.publicUrl;
    };

    return rawPayload.categories.map((cat) => ({
      id: cat.id,
      slug: cat.id,
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

  async getCategoryBySlug(slug: string): Promise<MenuCategory | null> {
    const categories = await this.getCategories();
    return categories.find((cat) => cat.slug === slug) || null;
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

  private defaultSettings(): MenuSettings {
    return {
      menuMode: "standard",
      publicationStatus: "published",
      maintenanceMessage: null,
    };
  }
}
