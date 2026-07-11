import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runE2ETests() {
  console.log("Starting End-to-End database mutation smoke tests...\n");

  const testProductId = "asam-black-tea";

  // 1. Fetch original product values
  console.log(`[PRE-TEST] Fetching original product details for: ${testProductId}`);
  const { data: originalProduct, error: fetchErr } = await supabase
    .from("menu_products")
    .select("*")
    .eq("id", testProductId)
    .single();

  if (fetchErr || !originalProduct) {
    console.error("Failed to fetch product:", fetchErr?.message);
    process.exit(1);
  }

  const { data: originalVariants, error: fetchVarErr } = await supabase
    .from("menu_product_variants")
    .select("*")
    .eq("product_id", testProductId);

  if (fetchVarErr || !originalVariants || originalVariants.length === 0) {
    console.error("Failed to fetch variants:", fetchVarErr?.message);
    process.exit(1);
  }

  const originalName = originalProduct.name;
  const originalNameAr = originalProduct.arabic_name;
  const targetVariant = originalVariants[0];
  const originalPrice = targetVariant.price;
  const originalCalories = targetVariant.calories;

  console.log("Original English Name:", originalName);
  console.log("Original Arabic Name:", originalNameAr);
  console.log("Target Size Variant:", targetVariant.size_label);
  console.log("Original Price:", originalPrice);
  console.log("Original Calories:", originalCalories);
  console.log("");

  // A. ENGLISH NAME TEST
  console.log("[TEST] Mutating English Name to 'TEST ASAM BLACK TEA'...");
  const { error: updateNameErr } = await supabase
    .from("menu_products")
    .update({ name: "TEST ASAM BLACK TEA" })
    .eq("id", testProductId);

  if (updateNameErr) {
    console.error("Failed English Name update:", updateNameErr.message);
    process.exit(1);
  }

  // Verify stored
  const { data: checkProd1 } = await supabase
    .from("menu_products")
    .select("name")
    .eq("id", testProductId)
    .single();
  console.log("Stored English Name in DB:", checkProd1?.name);
  if (checkProd1?.name !== "TEST ASAM BLACK TEA") {
    console.error("Verification failed for English Name!");
    process.exit(1);
  }

  // Restore
  console.log("[RESTORE] Restoring original English Name...");
  await supabase
    .from("menu_products")
    .update({ name: originalName })
    .eq("id", testProductId);
  console.log("Restored English Name successfully!\n");

  // B. ARABIC NAME TEST
  console.log("[TEST] Mutating Arabic Name to 'شاي اختبار أسام الأسود'...");
  await supabase
    .from("menu_products")
    .update({ arabic_name: "شاي اختبار أسام الأسود" })
    .eq("id", testProductId);

  const { data: checkProd2 } = await supabase
    .from("menu_products")
    .select("arabic_name")
    .eq("id", testProductId)
    .single();
  console.log("Stored Arabic Name in DB:", checkProd2?.arabic_name);
  if (checkProd2?.arabic_name !== "شاي اختبار أسام الأسود") {
    console.error("Verification failed for Arabic Name!");
    process.exit(1);
  }

  // Restore
  console.log("[RESTORE] Restoring original Arabic Name...");
  await supabase
    .from("menu_products")
    .update({ arabic_name: originalNameAr })
    .eq("id", testProductId);
  console.log("Restored Arabic Name successfully!\n");

  // C. PRICE TEST
  console.log(`[TEST] Mutating Price to 15.00 for size ${targetVariant.size_label}...`);
  await supabase
    .from("menu_product_variants")
    .update({ price: 15.00 })
    .eq("id", targetVariant.id);

  const { data: checkVar1 } = await supabase
    .from("menu_product_variants")
    .select("price")
    .eq("id", targetVariant.id)
    .single();
  console.log("Stored Price in DB:", checkVar1?.price);
  if (Number(checkVar1?.price) !== 15.00) {
    console.error("Verification failed for Price!");
    process.exit(1);
  }

  // Restore
  console.log("[RESTORE] Restoring original Price...");
  await supabase
    .from("menu_product_variants")
    .update({ price: originalPrice })
    .eq("id", targetVariant.id);
  console.log("Restored Price successfully!\n");

  // D. CALORIE TEST
  console.log(`[TEST] Mutating Calories to 99 for size ${targetVariant.size_label}...`);
  await supabase
    .from("menu_product_variants")
    .update({ calories: 99 })
    .eq("id", targetVariant.id);

  const { data: checkVar2 } = await supabase
    .from("menu_product_variants")
    .select("calories")
    .eq("id", targetVariant.id)
    .single();
  console.log("Stored Calories in DB:", checkVar2?.calories);
  if (Number(checkVar2?.calories) !== 99) {
    console.error("Verification failed for Calories!");
    process.exit(1);
  }

  // Restore
  console.log("[RESTORE] Restoring original Calories...");
  await supabase
    .from("menu_product_variants")
    .update({ calories: originalCalories })
    .eq("id", targetVariant.id);
  console.log("Restored Calories successfully!\n");

  // E. CATEGORY REORDERING TEST
  console.log("[TEST] Testing Category Reordering...");
  const targetCategory = "hot-tea";
  const { data: originalCategory, error: catFetchErr } = await supabase
    .from("menu_categories")
    .select("display_order")
    .eq("id", targetCategory)
    .single();

  if (catFetchErr || !originalCategory) {
    console.error("Failed to fetch category order:", catFetchErr?.message);
    process.exit(1);
  }

  const originalOrder = originalCategory.display_order;
  console.log("Original Display Order:", originalOrder);

  console.log("Mutating Display Order to 99...");
  await supabase
    .from("menu_categories")
    .update({ display_order: 99 })
    .eq("id", targetCategory);

  const { data: checkCat } = await supabase
    .from("menu_categories")
    .select("display_order")
    .eq("id", targetCategory)
    .single();
  console.log("Stored Display Order in DB:", checkCat?.display_order);
  if (checkCat?.display_order !== 99) {
    console.error("Verification failed for Category Reordering!");
    process.exit(1);
  }

  // Restore
  console.log("[RESTORE] Restoring original Display Order...");
  await supabase
    .from("menu_categories")
    .update({ display_order: originalOrder })
    .eq("id", targetCategory);
  console.log("Restored Display Order successfully!\n");

  console.log("✓ All end-to-end database mutation tests completed successfully!");
}

runE2ETests().catch(err => {
  console.error("E2E Test failed:", err);
  process.exit(1);
});
