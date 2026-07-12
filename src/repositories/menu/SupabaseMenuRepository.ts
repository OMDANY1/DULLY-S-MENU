import { MenuCategory, MenuItem, MenuSettings } from "@/domain/menu/types";
import { MenuRepository } from "./MenuRepository";
import { supabase as browserClient } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cache } from "react";

// ─── RPC Type Interfaces ───────────────────────────────────────
interface RpcSize {
  id: string;
  size_label: string;
  size_code: string | null;
  price: number;
  calories: number | null;
  calorie_note: string | null;
  oz: number | null;
  image: string | null;
}

interface RpcProduct {
  id: string;
  menu_code: string | null;
  name: string;
  arabic_name: string;
  dairy_milk: string | null;
  image: string | null;
  sizes: RpcSize[];
}

interface RpcCategory {
  id: string;
  slug: string;
  display_name: string;
  arabic_name: string;
  description: string;
  visibility_mode: string;
  hero_image: string | null;
  items: RpcProduct[];
}

// ─── Validation Helpers ────────────────────────────────────────
function assertString(val: any, path: string): string {
  if (typeof val !== "string") {
    throw new Error(`Data format error: Expected string at ${path}, got ${typeof val}`);
  }
  return val;
}

function assertStringOrNull(val: any, path: string): string | null {
  if (val !== null && typeof val !== "string") {
    throw new Error(`Data format error: Expected string or null at ${path}, got ${typeof val}`);
  }
  return val;
}

function assertFiniteNumber(val: any, path: string): number {
  const num = Number(val);
  if (typeof val === "boolean" || isNaN(num) || !Number.isFinite(num)) {
    throw new Error(`Data format error: Expected finite number at ${path}, got ${typeof val}`);
  }
  return num;
}

function assertFiniteNumberOrNull(val: any, path: string): number | null {
  if (val === null || val === undefined) return null;
  return assertFiniteNumber(val, path);
}

function validateAndNormalizePayload(data: unknown): { settings: MenuSettings; categories: MenuCategory[] } {
  if (!data || typeof data !== "object") {
    throw new Error("Data format error: RPC payload is not an object");
  }
  const payload = data as any;

  if (payload.version !== 1) {
    throw new Error(`Data format error: Expected version 1, got ${payload.version}`);
  }

  const rawSettings = payload.settings;
  if (!rawSettings || typeof rawSettings !== "object") {
    throw new Error("Data format error: settings must be an object");
  }

  const menuMode = rawSettings.menuMode;
  if (menuMode !== "standard" && menuMode !== "ipad") {
    throw new Error(`Data format error: Invalid menuMode "${menuMode}"`);
  }

  const publicationStatus = assertString(rawSettings.publicationStatus, "settings.publicationStatus");
  const maintenanceMessage = assertStringOrNull(rawSettings.maintenanceMessage, "settings.maintenanceMessage");

  const settings: MenuSettings = {
    menuMode,
    publicationStatus,
    maintenanceMessage,
  };

  const rawCategories = payload.categories;
  if (!Array.isArray(rawCategories)) {
    throw new Error("Data format error: categories must be an array");
  }

  // If unpublished, return empty list of categories immediately (valid business state)
  if (publicationStatus !== "published") {
    return { settings, categories: [] };
  }

  const categories: MenuCategory[] = rawCategories.map((cat: any, cIdx: number) => {
    const cPath = `categories[${cIdx}]`;
    if (!cat || typeof cat !== "object") {
      throw new Error(`Data format error: Category at index ${cIdx} is not an object`);
    }

    const id = assertString(cat.id, `${cPath}.id`);
    const slug = assertString(cat.slug, `${cPath}.slug`);
    const displayName = assertString(cat.display_name, `${cPath}.display_name`);
    const arabicName = assertString(cat.arabic_name, `${cPath}.arabic_name`);
    const description = assertString(cat.description, `${cPath}.description`);
    const heroImageRaw = assertStringOrNull(cat.hero_image, `${cPath}.hero_image`);
    
    const visibilityMode = cat.visibility_mode;
    if (visibilityMode !== "standard" && visibilityMode !== "ipad") {
      throw new Error("Data format error: Invalid visibility_mode");
    }

    if (!Array.isArray(cat.items)) {
      throw new Error(`Data format error: Category items must be an array at ${cPath}`);
    }

    const items: MenuItem[] = cat.items.map((prod: any, pIdx: number) => {
      const pPath = `${cPath}.items[${pIdx}]`;
      if (!prod || typeof prod !== "object") {
        throw new Error(`Data format error: Product at index ${pIdx} is not an object under ${cPath}`);
      }

      const pId = assertString(prod.id, `${pPath}.id`);
      const num = assertStringOrNull(prod.menu_code, `${pPath}.menu_code`);
      const name = assertString(prod.name, `${pPath}.name`);
      const arabicNameProd = assertString(prod.arabic_name, `${pPath}.arabic_name`);
      const dairyMilk = assertStringOrNull(prod.dairy_milk, `${pPath}.dairy_milk`);
      const image = assertStringOrNull(prod.image, `${pPath}.image`);

      if (!Array.isArray(prod.sizes)) {
        throw new Error(`Data format error: Product sizes must be an array at ${pPath}`);
      }

      const sizes = prod.sizes.map((sz: any, sIdx: number) => {
        const sPath = `${pPath}.sizes[${sIdx}]`;
        if (!sz || typeof sz !== "object") {
          throw new Error(`Data format error: Size at index ${sIdx} is not an object under ${pPath}`);
        }

        const sId = assertString(sz.id, `${sPath}.id`);
        const label = assertString(sz.size_label, `${sPath}.size_label`);
        const code = assertStringOrNull(sz.size_code, `${sPath}.size_code`);
        const price = assertFiniteNumber(sz.price, `${sPath}.price`);
        const calories = assertFiniteNumberOrNull(sz.calories, `${sPath}.calories`);
        const calorieNote = assertStringOrNull(sz.calorie_note, `${sPath}.calorie_note`);
        const oz = assertFiniteNumberOrNull(sz.oz, `${sPath}.oz`);
        const szImage = assertStringOrNull(sz.image, `${sPath}.image`);

        return {
          id: sId,
          label,
          code,
          price,
          calories,
          calorieNote,
          oz,
          image: szImage,
        };
      });

      return {
        id: pId,
        num,
        name,
        arabicName: arabicNameProd,
        category: id,
        image,
        dairyMilk,
        sizes,
      };
    });

    return {
      id,
      slug,
      name: displayName,
      displayName,
      arabicName,
      description,
      items,
      visibility: visibilityMode,
      heroImage: heroImageRaw,
    };
  });

  return { settings, categories };
}

// ─── Client Resolution ─────────────────────────────────────────
async function getClient() {
  if (typeof window === "undefined") {
    return await createServerSupabaseClient();
  }
  return browserClient;
}

// ─── Request-level Caching ─────────────────────────────────────
const getSnapshotFromServer = cache(async () => {
  const client = await getClient();
  const { data: rawPayload, error } = await client.rpc("get_public_menu");

  if (error) {
    console.error("[DATABASE RPC ERROR] get_public_menu failed:", error.message, error.details);
    throw new Error("Failed to load menu data. Please try again later.");
  }

  // Perform complete payload validation and normalization.
  // Throws a controlled data-format error if malformed.
  const snapshot = validateAndNormalizePayload(rawPayload);

  // 1. Force 'mojitos' category visibility to standard so it displays on standard customer menu
  const mojitoCat = snapshot.categories.find((cat) => cat.id === "mojitos");
  if (mojitoCat) {
    mojitoCat.visibility = "standard";
  }

  // 2. Group 'mineral-water-small' and 'drink-and-chips-combo-offer' under a normalized 'special' category
  const snowIceCat = snapshot.categories.find((cat) => cat.id === "snow-ice");
  if (snowIceCat) {
    const specialItems: MenuItem[] = [];
    snowIceCat.items = snowIceCat.items.filter((item) => {
      if (item.id === "mineral-water-small" || item.id === "drink-and-chips-combo-offer") {
        item.category = "special";
        specialItems.push(item);
        return false;
      }
      return true;
    });

    if (specialItems.length > 0) {
      const specialCat: MenuCategory = {
        id: "special",
        slug: "special",
        name: "Special",
        displayName: "Special",
        arabicName: "العروض الخاصة",
        description: "Mineral water, combo offers, and special menu items.",
        visibility: "standard",
        heroImage: null,
        items: specialItems,
      };

      const snowIceIdx = snapshot.categories.findIndex((cat) => cat.id === "snow-ice");
      if (snowIceIdx !== -1) {
        snapshot.categories.splice(snowIceIdx + 1, 0, specialCat);
      } else {
        snapshot.categories.push(specialCat);
      }
    }
  }

  // Apply public storage CDN URLs to all normalized images
  const getUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return client.storage.from("menu-products").getPublicUrl(path).data.publicUrl;
  };

  snapshot.categories.forEach((cat) => {
    cat.heroImage = getUrl(cat.heroImage);
    cat.items.forEach((item) => {
      item.image = getUrl(item.image);
      item.sizes.forEach((sz) => {
        sz.image = getUrl(sz.image);
      });
    });
  });

  return snapshot;
});

export class SupabaseMenuRepository implements MenuRepository {
  private async loadPublicMenuSnapshot() {
    return await getSnapshotFromServer();
  }

  async getSettings(): Promise<MenuSettings> {
    const snapshot = await this.loadPublicMenuSnapshot();
    return snapshot.settings;
  }

  async getCategories(): Promise<MenuCategory[]> {
    const snapshot = await this.loadPublicMenuSnapshot();
    return snapshot.categories;
  }

  async getCategoryBySlug(slug: string): Promise<MenuCategory | null> {
    const snapshot = await this.loadPublicMenuSnapshot();
    return snapshot.categories.find((cat) => cat.slug === slug) || null;
  }

  async getCategoryById(id: string): Promise<MenuCategory | null> {
    const snapshot = await this.loadPublicMenuSnapshot();
    return snapshot.categories.find((cat) => cat.id === id) || null;
  }

  async getProductsByCategory(categoryId: string): Promise<MenuItem[]> {
    const cat = await this.getCategoryById(categoryId);
    return cat ? cat.items : [];
  }

  async getProductById(id: string): Promise<MenuItem | null> {
    const snapshot = await this.loadPublicMenuSnapshot();
    for (const cat of snapshot.categories) {
      const item = cat.items.find((p) => p.id === id);
      if (item) return item;
    }
    return null;
  }
}
