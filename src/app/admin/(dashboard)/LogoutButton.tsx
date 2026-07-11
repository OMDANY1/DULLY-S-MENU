"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
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
