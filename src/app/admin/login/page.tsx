"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Check if user has admin role in database
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role, is_active")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Access denied: missing administrative profile");
      }

      if (!profile.is_active || profile.role !== "admin") {
        throw new Error("Access denied: inactive or insufficient privileges");
      }

      // Redirect to admin area via full page load to flush cookies to headers
      window.location.assign("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
      await supabase.auth.signOut();
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#060606] text-white flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-crimson/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-charcoal/30 border border-white/5 p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/brand/dullys-logo.png"
            alt="DULLY'S"
            width={48}
            height={48}
            className="object-contain mb-3"
          />
          <span className="font-condensed text-[16px] font-bold tracking-[0.25em] uppercase text-white">
            DULLY&apos;S ADMIN PORTAL
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-crimson/10 border border-crimson/25 text-crimson text-[11px] font-condensed tracking-wider uppercase">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black border border-white/10 p-3 text-[13px] text-white focus:outline-none focus:border-crimson transition-colors duration-300 font-condensed tracking-wider"
              placeholder="admin@dullys.com"
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">
              Secret Key Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black border border-white/10 p-3 text-[13px] text-white focus:outline-none focus:border-crimson transition-colors duration-300 font-condensed tracking-wider"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson hover:bg-red-700 text-white font-condensed text-[12px] font-bold uppercase tracking-[0.2em] p-3.5 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/forgot-password"
            className="font-condensed text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300"
          >
            [ FORGOT PASSWORD? ]
          </Link>
        </div>
      </div>
    </main>
  );
}
