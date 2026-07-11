import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { menuCategories } from "@/data/menu";
import ProductEditor from "./ProductEditor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const dataSource = process.env.NEXT_PUBLIC_MENU_DATA_SOURCE || "static";

  let product: any = null;
  let categories: any[] = [];
  let variants: any[] = [];
  let assets: any[] = [];

  if (dataSource === "supabase") {
    try {
      const client = await createServerSupabaseClient();

      // Fetch product details
      const { data: prod, error: prodError } = await client
        .from("menu_products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (prodError || !prod) {
        notFound();
      }
      product = prod;

      // Fetch categories
      const { data: cats } = await client
        .from("menu_categories")
        .select("id, display_name");
      categories = cats || [];

      // Fetch variants
      const { data: vars } = await client
        .from("menu_product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true });
      variants = vars || [];

      // Fetch assets
      const { data: asts } = await client
        .from("menu_product_assets")
        .select("*")
        .eq("product_id", productId);
      assets = asts || [];

    } catch (err) {
      console.error("Error loading product editing datasets from Supabase:", err);
      notFound();
    }
  } else {
    // Static mode mapping fallback
    for (const cat of menuCategories) {
      const item = cat.items.find((p) => p.id === productId);
      if (item) {
        product = {
          id: item.id,
          category_id: cat.id,
          menu_code: item.num,
          name: item.name,
          arabic_name: item.arabicName,
          dairy_milk: item.dairyMilk,
          is_active: true,
          availability_status: "available",
          launch_date: null,
          end_date: null,
        };

        variants = item.sizes.map((sz, idx) => ({
          id: `${productId}-sz-${idx}`,
          product_id: productId,
          size_label: sz.label,
          size_code: sz.label.toLowerCase().replace(/\s+/g, ""),
          price: sz.price,
          calories: sz.calories,
          calorie_note: sz.calorieNote,
          oz: sz.oz,
          is_active: true,
          display_order: idx,
        }));

        if (item.image) {
          assets = [
            {
              id: `${productId}-img`,
              product_id: productId,
              variant_id: null,
              storage_path: item.image,
              file_type: "image/png",
              file_size: 0,
            },
          ];
        }
        break;
      }
    }

    if (!product) {
      notFound();
    }

    categories = menuCategories.map((c) => ({
      id: c.id,
      display_name: c.displayName,
    }));
  }

  return (
    <ProductEditor
      product={product}
      categories={categories}
      initialVariants={variants}
      initialAssets={assets}
    />
  );
}
