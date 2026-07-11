import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Custom cookie storage adapter with robust URL encoding/decoding
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === "undefined") return null;
    const name = key + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        // Decode only the target cookie value to prevent parsing corruption
        try {
          return decodeURIComponent(c.substring(name.length, c.length));
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === "undefined") return;
    // Expire session cookie in 7 days, set secure samesite lax path root
    const d = new Date();
    d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    // Encode the value to conform with HTTP cookie standards (avoiding raw double quotes/brackets)
    document.cookie = `${key}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax;Secure`;
  },
  removeItem: (key: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax;Secure`;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: cookieStorage,
    storageKey: "sb-auth-token",
    detectSessionInUrl: true,
    flowType: "implicit"
  }
});
