"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      } else {
        // Wait a brief moment to allow the hash parameters to be parsed by the client SDK
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setHasSession(true);
          } else {
            setError("No active recovery session found. Please request a new recovery link.");
          }
        }, 1000);
      }
    };
    checkSession();
  }, []);

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your password.");
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
            SET NEW PASSWORD
          </span>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
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

          {hasSession && (
            <>
              <div className="flex flex-col space-y-1.5">
                <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border border-white/10 p-3 text-[13px] text-white focus:outline-none focus:border-crimson transition-colors duration-300 font-condensed tracking-wider"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="font-condensed text-[9px] uppercase tracking-widest text-white/40">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black border border-white/10 p-3 text-[13px] text-white focus:outline-none focus:border-crimson transition-colors duration-300 font-condensed tracking-wider"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-crimson hover:bg-red-700 text-white font-condensed text-[12px] font-bold uppercase tracking-[0.2em] p-3.5 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "SAVING..." : "UPDATE PASSWORD"}
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/forgot-password"
            className="font-condensed text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300"
          >
            [ REQUEST NEW LINK ]
          </Link>
        </div>
      </div>
    </main>
  );
}
