import { MenuCategory, MenuItem, MenuSettings } from "@/domain/menu/types";
import { MenuRepository } from "./MenuRepository";
import { menuCategories, MenuItem as StaticMenuItem, MenuSize as StaticMenuSize } from "@/data/menu";
import { menuConfig } from "@/config/menuConfig";
import { productAssetManifest } from "@/data/productAssetManifest";

export class StaticMenuRepository implements MenuRepository {
  private mapItem(item: StaticMenuItem, categoryId: string): MenuItem {
    const assetInfo = productAssetManifest[item.id] || { default: null, variants: {} };

    return {
      id: item.id,
      num: item.num,
      name: item.name,
      arabicName: item.arabicName,
      category: categoryId,
      image: assetInfo.default,
      dairyMilk: item.dairyMilk,
      sizes: item.sizes.map((sz: StaticMenuSize) => {
        const sizeCode = sz.label.toLowerCase().replace(/\s+/g, "");
        const variantImage = assetInfo.variants[sizeCode] || null;
        return {
          label: sz.label,
          code: sizeCode,
          price: sz.price,
          calories: sz.calories,
          calorieNote: sz.calorieNote,
          oz: sz.oz,
          image: variantImage,
        };
      }),
    };
  }

  async getCategories(): Promise<MenuCategory[]> {
    const isIpadMode = menuConfig.mode === "ipad";

    return menuCategories
      .filter((cat) => isIpadMode || cat.visibility === "standard")
      .map((cat) => ({
        id: cat.id,
        slug: cat.id,
        name: cat.name,
        displayName: cat.displayName,
        arabicName: cat.arabicName,
        description: cat.description,
        items: cat.items.map((item) => this.mapItem(item, cat.id)),
        visibility: (cat.visibility || "standard") as "standard" | "ipad",
      }));
  }

  async getCategoryBySlug(slug: string): Promise<MenuCategory | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  }

  async getCategoryById(id: string): Promise<MenuCategory | null> {
    const isIpadMode = menuConfig.mode === "ipad";
    const cat = menuCategories.find((c) => c.id === id);
    if (!cat) return null;
    if (!isIpadMode && cat.visibility !== "standard") return null;

    return {
      id: cat.id,
      slug: cat.id,
      name: cat.name,
      displayName: cat.displayName,
      arabicName: cat.arabicName,
      description: cat.description,
      items: cat.items.map((item) => this.mapItem(item, cat.id)),
      visibility: (cat.visibility || "standard") as "standard" | "ipad",
    };
  }

  async getProductsByCategory(categoryId: string): Promise<MenuItem[]> {
    const cat = await this.getCategoryById(categoryId);
    return cat ? cat.items : [];
  }

  async getProductById(id: string): Promise<MenuItem | null> {
    const isIpadMode = menuConfig.mode === "ipad";
    for (const cat of menuCategories) {
      if (!isIpadMode && cat.visibility !== "standard") continue;
      const item = cat.items.find((p) => p.id === id);
      if (item) return this.mapItem(item, cat.id);
    }
    return null;
  }

  async getSettings(): Promise<MenuSettings> {
    return {
      menuMode: menuConfig.mode,
      publicationStatus: "published",
      maintenanceMessage: null,
    };
  }
}
