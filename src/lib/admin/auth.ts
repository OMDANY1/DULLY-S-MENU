import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email?: string;
  role: string;
}

export async function requireAdmin(): Promise<AdminUser> {
  const client = await createServerSupabaseClient();
  
  // 1. Resolve current user
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Unauthenticated session");
  }

  // 2. Query admin authorization record from admin_profiles
  const { data: profile, error: dbError } = await client
    .from("admin_profiles")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (dbError || !profile) {
    throw new Error("Unauthorized: Missing administrative authorization profile");
  }

  if (!profile.is_active) {
    throw new Error("Unauthorized: Inactive administrative authorization profile");
  }

  if (profile.role !== "admin") {
    throw new Error("Unauthorized: Insufficient administrative privileges");
  }

  return {
    id: user.id,
    email: user.email,
    role: profile.role,
  };
}
