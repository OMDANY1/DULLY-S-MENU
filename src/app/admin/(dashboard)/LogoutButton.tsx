"use client";

import { supabase } from "@/lib/supabase/client";

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.assign("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left font-condensed text-[10px] font-bold tracking-[0.2em] uppercase text-crimson hover:text-red-500 transition-colors duration-300 cursor-pointer"
    >
      [ SIGN OUT ]
    </button>
  );
}
