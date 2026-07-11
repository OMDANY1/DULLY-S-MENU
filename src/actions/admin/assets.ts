"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActionResult } from "../types";
import { revalidatePath, revalidateTag } from "next/cache";

const ALLOWED_MIME_TYPES = ["image/png", "image/webp", "image/avif", "image/jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/jpeg": "jpg",
};

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

    // 1. MIME Validation & Trusted Extension Resolution
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: `Invalid image type: ${file.type}. Allowed: PNG, WebP, AVIF, JPEG` };
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return { success: false, error: `Unsupported image MIME type: ${file.type}` };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "File exceeds maximum size limits (10MB)" };
    }

    const client = await createServerSupabaseClient();

    // 2. Validate Variant Ownership BEFORE Storage Upload
    if (variantId) {
      const { data: variant, error: varError } = await client
        .from("menu_product_variants")
        .select("product_id")
        .eq("id", variantId)
        .maybeSingle();

      if (varError) {
        return { success: false, error: `Variant ownership validation query failed: ${varError.message}` };
      }
      if (!variant) {
        return { success: false, error: `Variant with ID ${variantId} does not exist.` };
      }
      if (variant.product_id !== productId) {
        return { success: false, error: `Logical ownership violation: Variant ${variantId} does not belong to Product ${productId}.` };
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate safe unique storage filename using trusted extension mapping
    const uuid = crypto.randomUUID();
    const storagePath = variantId
      ? `products/${productId}/variants/${variantId}/${uuid}.${ext}`
      : `products/${productId}/default/${uuid}.${ext}`;

    // 3. Query existing asset to replace later (Inspect error on maybeSingle)
    const query = client
      .from("menu_product_assets")
      .select("id, storage_path");

    if (variantId) {
      query.eq("variant_id", variantId);
    } else {
      query.eq("product_id", productId).is("variant_id", null);
    }

    const { data: existingAsset, error: fetchError } = await query.maybeSingle();
    if (fetchError) {
      return { success: false, error: `Failed to query existing asset database records: ${fetchError.message}` };
    }

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await client.storage
      .from("menu-products")
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // 5. Update Database relationships
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
        // Cleanup uploaded file since database update failed
        const { error: cleanupError } = await client.storage.from("menu-products").remove([storagePath]);
        if (cleanupError) {
          console.error(`[ORPHAN ASSET CLEANUP FAILURE] Failed to clean up newly uploaded file after DB update failure. productId=${productId}, variantId=${variantId || 'null'}, storagePath=${storagePath}, operation=upload_cleanup, error=${cleanupError.message}`);
        }
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
        const { error: cleanupError } = await client.storage.from("menu-products").remove([storagePath]);
        if (cleanupError) {
          console.error(`[ORPHAN ASSET CLEANUP FAILURE] Failed to clean up newly uploaded file after DB insert failure. productId=${productId}, variantId=${variantId || 'null'}, storagePath=${storagePath}, operation=upload_cleanup, error=${cleanupError.message}`);
        }
        return { success: false, error: `Database asset insert failed: ${dbError.message}` };
      }
      dbResult = data;
    }

    // 6. Success! Now safely clean up the old storage object if it existed
    if (existingAsset) {
      const { error: removeOldError } = await client.storage.from("menu-products").remove([existingAsset.storage_path]);
      if (removeOldError) {
        console.warn(`[ORPHAN ASSET WARNING] Failed to delete old replaced storage asset. The product image was updated successfully in the database, but the old file remains in storage. productId=${productId}, variantId=${variantId || 'null'}, storagePath=${existingAsset.storage_path}, operation=delete_replaced, error=${removeOldError.message}`);
      }
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

    // 1. Validate Variant Ownership BEFORE Database Removal
    if (variantId) {
      const { data: variant, error: varError } = await client
        .from("menu_product_variants")
        .select("product_id")
        .eq("id", variantId)
        .maybeSingle();

      if (varError) {
        return { success: false, error: `Variant ownership validation query failed: ${varError.message}` };
      }
      if (!variant) {
        return { success: false, error: `Variant with ID ${variantId} does not exist.` };
      }
      if (variant.product_id !== productId) {
        return { success: false, error: `Logical ownership violation: Variant ${variantId} does not belong to Product ${productId}.` };
      }
    }

    // 2. Query asset to get path (Inspect error on maybeSingle)
    const query = client
      .from("menu_product_assets")
      .select("id, storage_path");

    if (variantId) {
      query.eq("variant_id", variantId);
    } else {
      query.eq("product_id", productId).is("variant_id", null);
    }

    const { data: asset, error: queryError } = await query.maybeSingle();
    if (queryError) {
      return { success: false, error: `Failed to query existing asset database records: ${queryError.message}` };
    }
    if (!asset) {
      return { success: false, error: "Asset not found or already deleted" };
    }

    // 3. Delete database relation first
    const { error: dbError } = await client
      .from("menu_product_assets")
      .delete()
      .eq("id", asset.id);

    if (dbError) {
      return { success: false, error: `Failed to remove database asset row: ${dbError.message}` };
    }

    // 4. Then remove from storage (Audit and Log Warning on Failure)
    const { error: storageRemoveError } = await client.storage.from("menu-products").remove([asset.storage_path]);
    if (storageRemoveError) {
      console.error(`[ORPHAN ASSET WARNING] Failed to delete storage asset after database record deletion. productId=${productId}, variantId=${variantId || 'null'}, storagePath=${asset.storage_path}, operation=delete_removed_asset, error=${storageRemoveError.message}`);
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

    return { success: true, data: asset.id };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
