import { createServerSupabaseClient } from "@/lib/supabase/server";
import { menuCategories } from "@/data/menu";
import CategoriesManager from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const dataSource = process.env.NEXT_PUBLIC_MENU_DATA_SOURCE || "static";
  let categories: any[] = [];

  if (dataSource === "supabase") {
    try {
      const client = await createServerSupabaseClient();
      const { data, error } = await client
        .from("menu_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (data && !error) {
        categories = data;
      }
    } catch (err) {
      console.error("Error loading categories for admin:", err);
    }
  } else {
    categories = menuCategories.map((c) => ({
      id: c.id,
      display_name: c.displayName,
      name: c.name,
      arabic_name: c.arabicName,
      description: c.description,
      visibility_mode: c.visibility || "standard",
      is_active: true,
    }));
  }

  return <CategoriesManager categories={categories} />;
}
