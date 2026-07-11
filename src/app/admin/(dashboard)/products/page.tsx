import { createServerSupabaseClient } from "@/lib/supabase/server";
import { menuCategories } from "@/data/menu";
import ProductsManager from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const dataSource = process.env.NEXT_PUBLIC_MENU_DATA_SOURCE || "static";

  let categories: any[] = [];
  let products: any[] = [];

  if (dataSource === "supabase") {
    try {
      const client = await createServerSupabaseClient();
      
      const { data: cats, error: catsError } = await client
        .from("menu_categories")
        .select("*")
        .order("display_order", { ascending: true });

      const { data: prods, error: prodsError } = await client
        .from("menu_products")
        .select("*")
        .order("display_order", { ascending: true });

      if (cats && !catsError) categories = cats;
      if (prods && !prodsError) products = prods;
    } catch (err) {
      console.error("Error loading products catalog for admin:", err);
    }
  } else {
    // Static fallback
    categories = menuCategories.map((c) => ({
      id: c.id,
      display_name: c.displayName,
      name: c.name,
      arabic_name: c.arabicName,
    }));

    for (const cat of menuCategories) {
      for (const p of cat.items) {
        products.push({
          id: p.id,
          category_id: cat.id,
          menu_code: p.num,
          name: p.name,
          arabic_name: p.arabicName,
          dairy_milk: p.dairyMilk,
          is_active: true,
          availability_status: "available",
        });
      }
    }
  }

  return <ProductsManager categories={categories} initialProducts={products} />;
}
