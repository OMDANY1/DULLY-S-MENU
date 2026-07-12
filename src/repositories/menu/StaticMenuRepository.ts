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

    const baseCategories = menuCategories.map((cat) => {
      const visibility = (cat.id === "mojitos" ? "standard" : (cat.visibility || "standard")) as "standard" | "ipad";
      return {
        id: cat.id,
        slug: cat.id,
        name: cat.displayName,
        displayName: cat.displayName,
        arabicName: cat.arabicName,
        description: cat.description,
        items: cat.items.map((item) => this.mapItem(item, cat.id)),
        visibility,
        heroImage: null as string | null,
      };
    });

    const standardCategories = baseCategories.filter((cat) => isIpadMode || cat.visibility === "standard");



    return standardCategories;
  }

  async getCategoryBySlug(slug: string): Promise<MenuCategory | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  }

  async getCategoryById(id: string): Promise<MenuCategory | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.id === id) || null;
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
