"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActionResult } from "../types";
import { revalidatePath, revalidateTag } from "next/cache";

const ProductSchema = z.object({
  id: z.string().min(2).regex(/^[a-z0-9-]+$/),
  category_id: z.string().min(1),
  menu_code: z.string().min(1),
  name_en: z.string().min(2),
  name_ar: z.string().min(2),
  dairy_milk: z.string().nullable().optional(),
  availability_status: z.enum(["available", "out_of_stock"]),
  launch_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export async function createProduct(formData: any): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const parsed = ProductSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const {
      id,
      category_id,
      menu_code,
      name_en,
      name_ar,
      dairy_milk,
      availability_status,
      launch_date,
      end_date,
      is_active,
    } = parsed.data;

    const client = await createServerSupabaseClient();

    // Get max display order for this category to append
    const { data: maxData } = await client
      .from("menu_products")
      .select("display_order")
      .eq("category_id", category_id)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxData && maxData.length > 0 ? maxData[0].display_order + 1 : 0;

    const { data, error } = await client
      .from("menu_products")
      .insert({
        id,
        category_id,
        menu_code,
        name: name_en,
        arabic_name: name_ar,
        dairy_milk: dairy_milk || null,
        availability_status,
        launch_date: launch_date ? new Date(launch_date).toISOString() : null,
        end_date: end_date ? new Date(end_date).toISOString() : null,
        display_order: nextOrder,
        is_active,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Get category slug for precise cache invalidation
    const { data: cat } = await client
      .from("menu_categories")
      .select("id")
      .eq("id", category_id)
      .single();

    const catSlug = cat?.id || category_id;
    revalidateTag("menu", "default");
    revalidateTag(`menu:category:${catSlug}`, "default");
    revalidatePath("/", "layout");
    revalidatePath(`/menu/${catSlug}`, "page");

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function updateProduct(id: string, formData: any): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const UpdateSchema = ProductSchema.omit({ id: true });
    const parsed = UpdateSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const {
      category_id,
      menu_code,
      name_en,
      name_ar,
      dairy_milk,
      availability_status,
      launch_date,
      end_date,
      is_active,
    } = parsed.data;

    const client = await createServerSupabaseClient();

    // Fetch current product to check if category assignment is changing
    const { data: currentProduct } = await client
      .from("menu_products")
      .select("category_id")
      .eq("id", id)
      .single();

    const { data, error } = await client
      .from("menu_products")
      .update({
        category_id,
        menu_code,
        name: name_en,
        arabic_name: name_ar,
        dairy_milk: dairy_milk || null,
        availability_status,
        launch_date: launch_date ? new Date(launch_date).toISOString() : null,
        end_date: end_date ? new Date(end_date).toISOString() : null,
        is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Invalidate affected categories cache
    revalidateTag("menu", "default");
    revalidateTag(`menu:product:${id}`, "default");
    revalidatePath("/", "layout");

    const oldCatSlug = currentProduct?.category_id;
    if (oldCatSlug) {
      revalidateTag(`menu:category:${oldCatSlug}`, "default");
      revalidatePath(`/menu/${oldCatSlug}`, "page");
    }

    if (category_id !== oldCatSlug) {
      revalidateTag(`menu:category:${category_id}`, "default");
      revalidatePath(`/menu/${category_id}`, "page");
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function reorderProducts(categoryId: string, productIds: string[]): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const client = await createServerSupabaseClient();

    for (let i = 0; i < productIds.length; i++) {
      const { error } = await client
        .from("menu_products")
        .update({ display_order: i })
        .eq("id", productIds[i]);

      if (error) {
        return { success: false, error: `Failed to update display order for product ${productIds[i]}: ${error.message}` };
      }
    }

    revalidateTag("menu", "default");
    revalidateTag(`menu:category:${categoryId}`, "default");
    revalidatePath("/", "layout");
    revalidatePath(`/menu/${categoryId}`, "page");

    return { success: true, data: productIds };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
