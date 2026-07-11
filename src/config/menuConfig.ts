export type MenuMode = "standard" | "ipad";

export const menuConfig = {
  mode: "standard" as MenuMode,
};

export function isCategoryVisible(
  category: { visibility: "standard" | "ipad" },
  mode: MenuMode = menuConfig.mode
): boolean {
  if (mode === "ipad") return true;
  return category.visibility === "standard";
}

export function getVisibleCategories<T extends { visibility: "standard" | "ipad" }>(
  categories: T[],
  mode: MenuMode = menuConfig.mode
): T[] {
  return categories.filter((cat) => isCategoryVisible(cat, mode));
}
