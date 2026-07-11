"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // Trigger Supabase Auth password recovery
      const redirectToUrl = `${window.location.origin}/admin/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      if (resetError) {
        if (resetError.status === 429 || resetError.message.toLowerCase().includes("rate limit")) {
          throw new Error("Email rate limit exceeded. Please wait a few minutes before trying again or use the bootstrap access script.");
        }
        throw new Error(resetError.message);
      }

      setMessage("Password recovery email has been sent. Please check your inbox and click the reset link.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
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
            RECOVER PASSWORD
          </span>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-6">
          {error && (
            <div className="p-3 bg-crimson/10 border border-crimson/25 text-crimson text-[11px] font-condensed tracking-wider uppercase">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-500/10 border border-green-500/25 text-green-400 text-[11px] font-condensed tracking-wider uppercase">
              {message}
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border border-white/10 p-3 text-[13px] text-white focus:outline-none focus:border-crimson transition-colors duration-300 font-condensed tracking-wider"
              placeholder="emadadelgd@gmail.com"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson hover:bg-red-700 text-white font-condensed text-[12px] font-bold uppercase tracking-[0.2em] p-3.5 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "SENDING..." : "SEND RECOVERY LINK"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="font-condensed text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300"
          >
            [ RETURN TO LOGIN ]
          </Link>
        </div>
      </div>
    </main>
  );
}
