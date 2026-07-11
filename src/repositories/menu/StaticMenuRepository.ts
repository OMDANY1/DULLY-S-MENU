import { MenuCategory, MenuItem, MenuSettings } from "@/domain/menu/types";
import { MenuRepository } from "./MenuRepository";
import { menuCategories } from "@/data/menu";
import { menuConfig } from "@/config/menuConfig";

export class StaticMenuRepository implements MenuRepository {
  async getCategories(): Promise<MenuCategory[]> {
    return menuCategories.map(cat => ({
      id: cat.id,
      displayName: cat.displayName,
      arabicName: cat.arabicName,
      description: cat.description,
      items: cat.items,
      visibility: (cat.visibility || "standard") as "standard" | "ipad"
    }));
  }

  async getCategoryById(id: string): Promise<MenuCategory | null> {
    const cat = menuCategories.find(c => c.id === id);
    if (!cat) return null;
    return {
      id: cat.id,
      displayName: cat.displayName,
      arabicName: cat.arabicName,
      description: cat.description,
      items: cat.items,
      visibility: (cat.visibility || "standard") as "standard" | "ipad"
    };
  }

  async getProductsByCategory(categoryId: string): Promise<MenuItem[]> {
    const cat = menuCategories.find(c => c.id === categoryId);
    if (!cat) return [];
    return cat.items;
  }

  async getProductById(id: string): Promise<MenuItem | null> {
    for (const cat of menuCategories) {
      const item = cat.items.find(p => p.id === id);
      if (item) return item;
    }
    return null;
  }

  async getSettings(): Promise<MenuSettings> {
    return {
      menuMode: menuConfig.mode,
      publicationStatus: "published",
      maintenanceMessage: null
    };
  }
}
