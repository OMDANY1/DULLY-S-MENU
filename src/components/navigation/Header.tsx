import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

interface HeaderProps {
  showBackLabel?: boolean;
}

export default function Header({ showBackLabel = false }: HeaderProps) {
  return (
    <header 
      className="site-container relative z-20 flex items-center justify-between select-none pointer-events-none"
      style={{
        paddingTop: "max(var(--site-gutter-top), env(safe-area-inset-top))",
        paddingBottom: "var(--space-section-sm)",
      }}
    >
      {/* Left: Official DULLY'S logo link home */}
      <Link href="/" className="interactive-hover flex items-center space-x-3 group pointer-events-auto">
        <BrandLogo size={40} />
        <span className="font-condensed text-[16px] font-bold tracking-[0.25em] uppercase text-white group-hover:text-crimson transition-colors duration-300">
          DULLY&apos;S
        </span>
      </Link>

      {/* Middle/Right: MENU 2026 label */}
      <div className="flex items-center space-x-2 text-white/40 font-condensed text-[10px] md:text-[12px] font-bold tracking-[0.2em] uppercase mr-16">
        {showBackLabel && (
          <span className="hidden sm:inline-block mr-4 text-white/20">
            [ BACK TO HOME ]
          </span>
        )}
        <span>MENU 2026</span>
      </div>
    </header>
  );
}
