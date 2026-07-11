import { createClient } from "@supabase/supabase-js";
import { menuCategories } from "../src/data/menu";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log("Starting Supabase database seed...");

  // 1. Seed Categories, Products, and Variants
  for (let i = 0; i < menuCategories.length; i++) {
    const cat = menuCategories[i];
    console.log(`Seeding Category: ${cat.displayName} (${cat.id})`);

    const { error: catError } = await supabase
      .from("menu_categories")
      .upsert({
        id: cat.id,
        display_name: cat.displayName,
        arabic_name: cat.arabicName,
        description: cat.description,
        visibility_mode: cat.visibility || "standard",
        display_order: i,
        is_active: true,
      }, { onConflict: "id" });

    if (catError) {
      console.error(`Error inserting category ${cat.id}:`, catError.message);
      continue;
    }

    for (let j = 0; j < cat.items.length; j++) {
      const p = cat.items[j];
      const menuCode = p.num || (j + 1).toString().padStart(2, "0");

      const { error: prodError } = await supabase
        .from("menu_products")
        .upsert({
          id: p.id,
          category_id: cat.id,
          menu_code: menuCode,
          name: p.name,
          arabic_name: p.arabicName,
          dairy_milk: p.dairyMilk,
          display_order: j,
          is_active: true,
          availability_status: "available",
        }, { onConflict: "id" });

      if (prodError) {
        console.error(`Error inserting product ${p.id}:`, prodError.message);
        continue;
      }

      for (let k = 0; k < p.sizes.length; k++) {
        const sz = p.sizes[k];
        const sizeCode = sz.label.toLowerCase().replace(/\s+/g, "");

        const { error: varError } = await supabase
          .from("menu_product_variants")
          .upsert({
            product_id: p.id,
            size_label: sz.label,
            size_code: sizeCode,
            price: sz.price,
            calories: sz.calories,
            calorie_note: sz.calorieNote || null,
            oz: sz.oz || null,
            display_order: k,
            is_active: true,
          }, { onConflict: "product_id,size_code" });

        if (varError) {
          console.error(`Error inserting variant for product ${p.id} size ${sz.label}:`, varError.message);
        }
      }
    }
  }

  // 2. Seed Default Global Settings
  console.log("Seeding global menu settings...");
  const { error: settingsError } = await supabase
    .from("menu_settings")
    .upsert({
      key: "global",
      value: {
        menuMode: "standard",
        publicationStatus: "published",
        maintenanceMessage: null,
      },
    }, { onConflict: "key" });

  if (settingsError) {
    console.error("Error inserting global settings:", settingsError.message);
  }

  console.log("Database seeding completed successfully!");
}

seed()
  .catch((err) => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
  });
