import { MenuRepository } from "./MenuRepository";
import { StaticMenuRepository } from "./StaticMenuRepository";
import { SupabaseMenuRepository } from "./SupabaseMenuRepository";

let activeRepository: MenuRepository | null = null;

export function getMenuRepository(): MenuRepository {
  if (activeRepository) return activeRepository;

  const source = process.env.NEXT_PUBLIC_MENU_DATA_SOURCE || "static";

  if (source === "supabase") {
    activeRepository = new SupabaseMenuRepository();
  } else {
    activeRepository = new StaticMenuRepository();
  }

  return activeRepository;
}
