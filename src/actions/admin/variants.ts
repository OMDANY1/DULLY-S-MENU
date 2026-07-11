"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActionResult } from "../types";
import { revalidatePath, revalidateTag } from "next/cache";

const VariantSchema = z.object({
  product_id: z.string().min(1),
  size_label: z.string().min(1),
  size_code: z.string().min(1).regex(/^[a-z0-9-]+$/),
  price: z.number().positive(),
  calories: z.number().int().nonnegative().nullable().optional(),
  calorie_note: z.string().nullable().optional(),
  oz: z.number().positive().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function createVariant(formData: any): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const parsed = VariantSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const {
      product_id,
      size_label,
      size_code,
      price,
      calories,
      calorie_note,
      oz,
      is_active,
    } = parsed.data;

    const client = await createServerSupabaseClient();

    // Get max display order for this product
    const { data: maxData } = await client
      .from("menu_product_variants")
      .select("display_order")
      .eq("product_id", product_id)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxData && maxData.length > 0 ? maxData[0].display_order + 1 : 0;

    const { data, error } = await client
      .from("menu_product_variants")
      .insert({
        product_id,
        size_label,
        size_code,
        price,
        calories: calories ?? null,
        calorie_note: calorie_note || null,
        oz: oz ?? null,
        display_order: nextOrder,
        is_active,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Invalidate caches
    const { data: prod } = await client
      .from("menu_products")
      .select("category_id")
      .eq("id", product_id)
      .single();

    const catSlug = prod?.category_id;
    revalidateTag("menu", "default");
    revalidateTag(`menu:product:${product_id}`, "default");
    revalidatePath("/", "layout");
    if (catSlug) {
      revalidateTag(`menu:category:${catSlug}`, "default");
      revalidatePath(`/menu/${catSlug}`, "page");
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function updateVariant(id: string, formData: any): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const UpdateSchema = VariantSchema.omit({ product_id: true, size_code: true });
    const parsed = UpdateSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const { size_label, price, calories, calorie_note, oz, is_active } = parsed.data;
    const client = await createServerSupabaseClient();

    // Fetch product info to invalidate cache
    const { data: variantObj } = await client
      .from("menu_product_variants")
      .select("product_id")
      .eq("id", id)
      .single();

    const { data, error } = await client
      .from("menu_product_variants")
      .update({
        size_label,
        price,
        calories: calories ?? null,
        calorie_note: calorie_note || null,
        oz: oz ?? null,
        is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const productId = variantObj?.product_id;
    if (productId) {
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
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function reorderVariants(productId: string, variantIds: string[]): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const client = await createServerSupabaseClient();

    for (let i = 0; i < variantIds.length; i++) {
      const { error } = await client
        .from("menu_product_variants")
        .update({ display_order: i })
        .eq("id", variantIds[i]);

      if (error) {
        return { success: false, error: `Failed to update variant display order: ${error.message}` };
      }
    }

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

    return { success: true, data: variantIds };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
