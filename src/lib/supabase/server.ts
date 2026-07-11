import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  
  const cookieStore = await cookies();

  // Read-only server storage adapter with robust URL decoding fallback
  const serverStorage = {
    getItem: (key: string) => {
      const cookie = cookieStore.get(key);
      if (!cookie) return null;
      const val = cookie.value;
      if (val.startsWith("%")) {
        try {
          return decodeURIComponent(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    },
    setItem: () => {},
    removeItem: () => {}
  };

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: serverStorage,
      storageKey: "sb-auth-token",
      detectSessionInUrl: false
    }
  });
}
