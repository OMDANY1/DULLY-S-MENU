import { createServerSupabaseClient } from "@/lib/supabase/server";
import { menuCategories } from "@/data/menu";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const dataSource = process.env.NEXT_PUBLIC_MENU_DATA_SOURCE || "static";

  let totalCategoriesCount = 0;
  let totalProductsCount = 0;
  let inactiveProductsCount = 0;
  let missingImagesProducts: { id: string; name: string; category: string }[] = [];

  if (dataSource === "supabase") {
    try {
      const client = await createServerSupabaseClient();

      const { data: categories } = await client
        .from("menu_categories")
        .select("id");
      totalCategoriesCount = categories?.length || 0;

      const { data: products } = await client
        .from("menu_products")
        .select("id, name, category_id, is_active");
      totalProductsCount = products?.length || 0;
      inactiveProductsCount = products?.filter((p) => !p.is_active).length || 0;

      const { data: assets } = await client
        .from("menu_product_assets")
        .select("product_id")
        .is("variant_id", null);

      const defaultAssetProductIds = new Set(assets?.map((a) => a.product_id) || []);

      if (products) {
        for (const p of products) {
          if (!defaultAssetProductIds.has(p.id)) {
            missingImagesProducts.push({
              id: p.id,
              name: p.name,
              category: p.category_id,
            });
          }
        }
      }
    } catch (err) {
      console.error("Error loading admin dashboard stats from Supabase:", err);
    }
  } else {
    // Static mode from data/menu.ts
    totalCategoriesCount = menuCategories.length;
    for (const cat of menuCategories) {
      totalProductsCount += cat.items.length;
      for (const item of cat.items) {
        // In static mode, image field is checked
        if (!item.image) {
          missingImagesProducts.push({
            id: item.id,
            name: item.name,
            category: cat.id,
          });
        }
      }
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-condensed text-[32px] font-black uppercase tracking-wider">
          Exhibition Overview
        </h1>
        <p className="font-condensed text-[12px] text-white/45 tracking-widest uppercase mt-1">
          CMS Control Dashboard — Mode: <span className="text-crimson font-bold">{dataSource.toUpperCase()}</span>
        </p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-condensed tracking-wider">
        <div className="bg-charcoal/20 border border-white/5 p-6 flex flex-col justify-between h-32">
          <span className="text-[10px] text-white/40 uppercase">Total Categories</span>
          <span className="text-[42px] font-black text-white leading-none">{totalCategoriesCount}</span>
        </div>

        <div className="bg-charcoal/20 border border-white/5 p-6 flex flex-col justify-between h-32">
          <span className="text-[10px] text-white/40 uppercase">Total Products</span>
          <span className="text-[42px] font-black text-white leading-none">{totalProductsCount}</span>
        </div>

        <div className="bg-charcoal/20 border border-white/5 p-6 flex flex-col justify-between h-32">
          <span className="text-[10px] text-white/40 uppercase">Inactive Items</span>
          <span className="text-[42px] font-black text-crimson leading-none">{inactiveProductsCount}</span>
        </div>
      </div>

      {/* Missing Images warning panels */}
      <div className="space-y-4">
        <h2 className="font-condensed text-[16px] font-bold uppercase tracking-widest text-white/60">
          Image Asset Audit Reports
        </h2>

        {missingImagesProducts.length === 0 ? (
          <div className="bg-charcoal/10 border border-white/5 p-4 text-[11px] font-condensed text-white/40 uppercase tracking-widest">
            All active products contain valid default image assets.
          </div>
        ) : (
          <div className="border border-crimson/20 bg-crimson/5 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-crimson font-condensed text-[12px] font-bold tracking-widest uppercase">
              <span>⚠️ ATTENTION: {missingImagesProducts.length} PRODUCTS MISSING IMAGES</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
              {missingImagesProducts.map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center text-[11px] font-condensed tracking-widest uppercase text-white/70">
                  <span>{p.name}</span>
                  <span className="text-white/30">Category: {p.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
