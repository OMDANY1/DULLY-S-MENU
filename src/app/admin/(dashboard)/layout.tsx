import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Perform server-side active admin verification
    await requireAdmin();
  } catch (err) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col md:flex-row select-none">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#050505] border-r border-white/5 p-8 flex flex-col justify-between">
        <div className="space-y-12">
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-crimson" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M 30,50 L 50,22 L 70,50 L 50,78 Z" fill="currentColor" />
            </svg>
            <span className="font-condensed text-[14px] font-bold tracking-[0.2em] uppercase text-white">
              Dully&apos;s CMS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4 font-condensed text-[11px] font-bold tracking-[0.18em] uppercase">
            <Link
              href="/admin"
              className="text-white/60 hover:text-white hover:pl-2 transition-all duration-300"
            >
              [ DASHBOARD ]
            </Link>
            <Link
              href="/admin/categories"
              className="text-white/60 hover:text-white hover:pl-2 transition-all duration-300"
            >
              [ CATEGORIES ]
            </Link>
            <Link
              href="/admin/products"
              className="text-white/60 hover:text-white hover:pl-2 transition-all duration-300"
            >
              [ PRODUCTS ]
            </Link>
          </nav>
        </div>

        {/* User Info & Logout actions */}
        <div className="pt-8 border-t border-white/5 space-y-4">
          <div className="text-[9px] font-condensed tracking-widest text-white/30 uppercase">
            ADMIN SESSION ACTIVE
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main panel content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
