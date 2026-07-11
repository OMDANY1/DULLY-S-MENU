import { MenuCategory, MenuItem, MenuSettings } from "@/domain/menu/types";

export interface MenuRepository {
  getCategories(): Promise<MenuCategory[]>;
  getCategoryById(id: string): Promise<MenuCategory | null>;
  getCategoryBySlug(slug: string): Promise<MenuCategory | null>;
  getProductsByCategory(categoryId: string): Promise<MenuItem[]>;
  getProductById(id: string): Promise<MenuItem | null>;
  getSettings(): Promise<MenuSettings>;
}
