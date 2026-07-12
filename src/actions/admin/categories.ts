"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActionResult } from "../types";
import { revalidatePath, revalidateTag } from "next/cache";

const CategorySchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  name_en: z.string().min(2),
  name_ar: z.string().min(2),
  description: z.string().min(2),
  visibility_mode: z.enum(["standard", "ipad"]),
  is_active: z.boolean().default(true),
});

export async function createCategory(formData: any): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const parsed = CategorySchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const { slug, name_en, name_ar, description, visibility_mode, is_active } = parsed.data;
    const client = await createServerSupabaseClient();

    // Get max display order to append
    const { data: maxData } = await client
      .from("menu_categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxData && maxData.length > 0 ? maxData[0].display_order + 1 : 0;

    const { data, error } = await client
      .from("menu_categories")
      .insert({
        id: slug,
        display_name: name_en,
        arabic_name: name_ar,
        description,
        visibility_mode,
        display_order: nextOrder,
        is_active,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateTag("menu", "default");
    revalidatePath("/", "layout");

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function updateCategory(slug: string, formData: any): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    // Validate (omit slug if slug is not editable, but we let them modify metadata)
    const UpdateSchema = CategorySchema.omit({ slug: true });
    const parsed = UpdateSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = parsed.error.flatten().fieldErrors;
      return { success: false, error: "Validation failed", fieldErrors };
    }

    const { name_en, name_ar, description, visibility_mode, is_active } = parsed.data;
    const client = await createServerSupabaseClient();

    const { data, error } = await client
      .from("menu_categories")
      .update({
        display_name: name_en,
        arabic_name: name_ar,
        description,
        visibility_mode,
        is_active,
      })
      .eq("id", slug)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateTag("menu", "default");
    revalidatePath("/", "layout");
    revalidatePath(`/menu/${slug}`, "page");

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}

export async function reorderCategories(slugs: string[]): Promise<ActionResult<any>> {
  try {
    await requireAdmin();

    const client = await createServerSupabaseClient();

    // Perform updates in batch (standard loop is simple and reliable for menu lists < 20 items)
    for (let i = 0; i < slugs.length; i++) {
      const { error } = await client
        .from("menu_categories")
        .update({ display_order: i })
        .eq("id", slugs[i]);

      if (error) {
        return { success: false, error: `Failed to update display order for ${slugs[i]}: ${error.message}` };
      }
    }

    revalidateTag("menu", "default");
    revalidatePath("/", "layout");

    return { success: true, data: slugs };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
