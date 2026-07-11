"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActionResult } from "../types";
import { revalidatePath, revalidateTag } from "next/cache";

const ALLOWED_MIME_TYPES = ["image/png", "image/webp", "image/avif", "image/jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadProductImage(
  productId: string,
  variantId: string | null,
  formData: FormData
): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided in form upload" };
    }

    // 1. Basic validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: `Invalid image type: ${file.type}. Allowed: PNG, WebP, AVIF, JPEG` };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "File exceeds maximum size limits (10MB)" };
    }

    const client = await createServerSupabaseClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate safe unique storage filename
    const uuid = crypto.randomUUID();
    const ext = file.name.split(".").pop() || "png";
    
    // Construct path structures
    const storagePath = variantId
      ? `products/${productId}/variants/${variantId}/${uuid}.${ext}`
      : `products/${productId}/default/${uuid}.${ext}`;

    // 2. Fetch existing asset to replace later (atomic sequence)
    const query = client
      .from("menu_product_assets")
      .select("id, storage_path");

    if (variantId) {
      query.eq("variant_id", variantId);
    } else {
      query.eq("product_id", productId).is("variant_id", null);
    }

    const { data: existingAsset } = await query.maybeSingle();

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await client.storage
      .from("menu-products")
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // 4. Update Database relationships
    let dbResult;
    if (existingAsset) {
      const { data, error: dbError } = await client
        .from("menu_product_assets")
        .update({
          storage_path: storagePath,
          file_type: file.type,
          file_size: file.size,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAsset.id)
        .select()
        .single();

      if (dbError) {
        // Cleanup uploaded file since database insert failed
        await client.storage.from("menu-products").remove([storagePath]);
        return { success: false, error: `Database asset update failed: ${dbError.message}` };
      }
      dbResult = data;
    } else {
      const { data, error: dbError } = await client
        .from("menu_product_assets")
        .insert({
          product_id: productId,
          variant_id: variantId || null,
          storage_path: storagePath,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup uploaded file since database insert failed
        await client.storage.from("menu-products").remove([storagePath]);
        return { success: false, error: `Database asset insert failed: ${dbError.message}` };
      }
      dbResult = data;
    }

    // 5. Success! Now safely clean up the old storage object if it existed
    if (existingAsset) {
      await client.storage.from("menu-products").remove([existingAsset.storage_path]);
    }

    // Invalidate caches
    const { data: prod } = await client
      .from("menu_products")
      .select("category_id")
      .eq("id", productId)
      .single();

    const catSlug = prod?.category_id;
    revalidateTag("menu", "default");
    revalidateTag(`menu:product:${productId}`, "default");
    revalidatePath("/", "layout");
    if (catSlug) {
      revalidateTag(`menu:category:${catSlug}`, "default");
      revalidatePath(`/menu/${catSlug}`, "page");
    }

    return { success: true, data: dbResult };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function removeProductImage(
  productId: string,
  variantId: string | null
): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const client = await createServerSupabaseClient();

    // Query asset to get path
    const query = client
      .from("menu_product_assets")
      .select("id, storage_path");

    if (variantId) {
      query.eq("variant_id", variantId);
    } else {
      query.eq("product_id", productId).is("variant_id", null);
    }

    const { data: asset, error: queryError } = await query.maybeSingle();

    if (queryError || !asset) {
      return { success: false, error: "Asset not found or already deleted" };
    }

    // Delete database relation first
    const { error: dbError } = await client
      .from("menu_product_assets")
      .delete()
      .eq("id", asset.id);

    if (dbError) {
      return { success: false, error: `Failed to remove database asset row: ${dbError.message}` };
    }

    // Then remove from storage
    await client.storage.from("menu-products").remove([asset.storage_path]);

    // Invalidate caches
    const { data: prod } = await client
      .from("menu_products")
      .select("category_id")
      .eq("id", productId)
      .single();

    const catSlug = prod?.category_id;
    revalidateTag("menu", "default");
    revalidateTag(`menu:product:${productId}`, "default");
    revalidatePath("/", "layout");
    if (catSlug) {
      revalidateTag(`menu:category:${catSlug}`, "default");
      revalidatePath(`/menu/${catSlug}`, "page");
    }

    return { success: true, data: asset.id };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
