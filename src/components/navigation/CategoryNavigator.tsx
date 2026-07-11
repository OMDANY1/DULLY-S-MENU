"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { menuCategories } from "@/data/menu";
import { MenuCategory } from "@/domain/menu/types";
import { getVisibleCategories } from "@/config/menuConfig";
import { productAssetManifest } from "@/data/productAssetManifest";
import BrandLogo from "@/components/ui/BrandLogo";

const fallbackCategories: MenuCategory[] = menuCategories.map((cat) => ({
  id: cat.id,
  slug: cat.id,
  name: cat.name,
  displayName: cat.displayName,
  arabicName: cat.arabicName,
  description: cat.description,
  visibility: cat.visibility || "standard",
  heroImage: null,
  items: cat.items.map((item) => {
    const assetInfo = productAssetManifest[item.id] || { default: null, variants: {} };
    return {
      id: item.id,
      num: item.num,
      name: item.name,
      arabicName: item.arabicName,
      category: cat.id,
      image: assetInfo.default,
      dairyMilk: item.dairyMilk,
      sizes: item.sizes.map((sz) => {
        const sizeCode = sz.label.toLowerCase().replace(/\s+/g, "");
        return {
          label: sz.label,
          code: sizeCode,
          price: sz.price,
          calories: sz.calories,
          calorieNote: sz.calorieNote,
          oz: sz.oz,
          image: assetInfo.variants[sizeCode] || null,
        };
      }),
    };
  }),
}));

interface CategoryNavigatorProps {
  categories?: MenuCategory[];
}

export default function CategoryNavigator({ categories: propsCategories }: CategoryNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close menu during render if route changes, conforming to React practices
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const glyphRef = useRef<SVGSVGElement>(null);

  // Filter categories through business mode helper
  const rawCategories = propsCategories || fallbackCategories;
  const visibleCategories = getVisibleCategories(rawCategories);

  useEffect(() => {
    const overlay = overlayRef.current;
    const line = lineRef.current;
    const items = itemsRef.current.filter(Boolean);
    const glyph = glyphRef.current;
    if (!overlay || !line) return;

    const ctx = gsap.context(() => {
      if (isOpen) {
        // Suspend global scrolling when menu is open
        const globalLenis = (window as unknown as { lenis?: { stop: () => void } }).lenis;
        if (globalLenis) globalLenis.stop();

        // Open with clip-path wipe
        gsap.to(overlay, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.7,
          ease: "power3.inOut",
        });

        // Draw vertical key line
        gsap.fromTo(line, 
          { scaleY: 0 }, 
          { scaleY: 1, duration: 0.8, ease: "power2.inOut", transformOrigin: "top" }
        );

        // Stagger items with line assembly & masks
        items.forEach((item, idx) => {
          if (!item) return;
          const text = item.querySelector(".nav-link-text");
          const sub = item.querySelector(".nav-sub-text");
          const bar = item.querySelector(".nav-accent-bar");

          gsap.killTweensOf([text, sub, bar]);
          
          gsap.fromTo(text,
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.2 + idx * 0.04 }
          );
          gsap.fromTo(sub,
            { y: 5, opacity: 0 },
            { y: 0, opacity: 0.4, duration: 0.4, ease: "power2.out", delay: 0.35 + idx * 0.04 }
          );
          gsap.fromTo(bar,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.4, ease: "power1.out", delay: 0.25 + idx * 0.04, transformOrigin: "left" }
          );
        });

        // Rotate and draw background geometry glyph
        if (glyph) {
          gsap.fromTo(glyph,
            { rotation: -60, scale: 0.9, opacity: 0 },
            { rotation: 0, scale: 1, opacity: 0.15, duration: 1.0, ease: "power2.out", delay: 0.25 }
          );
        }
      } else {
        // Re-enable global scrolling
        const globalLenis = (window as unknown as { lenis?: { start: () => void } }).lenis;
        if (globalLenis) globalLenis.start();

        // Animate items out
        items.forEach((item) => {
          if (!item) return;
          const text = item.querySelector(".nav-link-text");
          const sub = item.querySelector(".nav-sub-text");
          const bar = item.querySelector(".nav-accent-bar");
          gsap.to([text, sub], { opacity: 0, y: -5, duration: 0.25, ease: "power2.in" });
          gsap.to(bar, { scaleX: 0, duration: 0.2, ease: "power1.in", transformOrigin: "right" });
        });

        // Close with clip-path wipe
        gsap.to(overlay, {
          clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
          duration: 0.6,
          ease: "power3.inOut",
          delay: 0.15,
        });
      }
    });

    return () => ctx.revert();
  }, [isOpen]);

  // Lock body scroll and register keyboard listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);



  return (
    <>
      {/* Structural Minimal Navigation Trigger (Geometric Trigger) */}
      <button
        ref={menuBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        className="interactive-hover fixed z-[999] flex items-center justify-center w-12 h-12 bg-charcoal/30 border border-white/5 hover:border-crimson/30 transition-colors duration-300"
        style={{
          top: "max(var(--site-gutter-top), env(safe-area-inset-top))",
          right: "max(var(--site-gutter-x), env(safe-area-inset-right))",
        }}
        data-cursor-text={isOpen ? "CLOSE" : "MENU"}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {/* Architectural Line-based Hamburger icon */}
        <div className="relative w-5 h-4 flex flex-col justify-between items-center">
          <span className={`w-full h-[1px] bg-white transition-all duration-300 transform ${isOpen ? "rotate-45 translate-y-[7.5px] bg-crimson" : ""}`} />
          <span className={`w-full h-[1px] bg-white transition-all duration-300 ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`w-full h-[1px] bg-white transition-all duration-300 transform ${isOpen ? "-rotate-45 -translate-y-[7.5px] bg-crimson" : ""}`} />
        </div>
      </button>

      {/* Cinematic Sidebar Overlay Drawer */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-[#060606]/98 z-[998] flex items-center justify-center p-8 select-none max-w-full overflow-hidden"
        style={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }}
      >
        {/* Branding in top-left of the overlay */}
        <div 
          className="absolute flex items-center space-x-3 pointer-events-none"
          style={{
            top: "max(var(--site-gutter-top), env(safe-area-inset-top))",
            left: "max(var(--site-gutter-x), env(safe-area-inset-left))",
          }}
        >
          <BrandLogo size={36} />
          <span className="font-condensed text-[14px] font-bold tracking-[0.2em] uppercase text-white">
            DULLY&apos;S
          </span>
        </div>

        {/* Background Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-5">
          {Array.from({ length: 11 }).map((_, idx) => (
            <div key={idx} className="h-full border-r border-white" />
          ))}
        </div>

        {/* Geometric Symbol Glyph */}
        <svg
          ref={glyphRef}
          className="absolute left-[10%] md:left-[18%] w-72 h-72 md:w-[480px] md:h-[480px] text-crimson pointer-events-none opacity-0"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.15"
        >
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="32" />
          <rect x="23" y="23" width="54" height="54" />
          <line x1="50" y1="5" x2="50" y2="95" />
          <line x1="5" y1="50" x2="95" y2="50" />
        </svg>

        {/* Index Container */}
        <div className="relative flex h-[80vh] max-w-4xl w-full z-10">
          {/* Vertical key line */}
          <div
            ref={lineRef}
            className="absolute left-0 top-0 bottom-0 w-[1px] bg-crimson origin-top"
          />

          {/* Categories List */}
          <nav className="flex flex-col justify-center space-y-6 md:space-y-7 pl-8 md:pl-16 w-full overflow-y-auto">
            {visibleCategories.map((cat, idx) => {
              const isActive = pathname === `/menu/${cat.slug}`;
              return (
                <div
                  key={cat.slug}
                  ref={(el) => { itemsRef.current[idx] = el; }}
                  className="relative flex items-center space-x-6 md:space-x-8 overflow-hidden py-1"
                >
                  {/* Category Number */}
                  <span className="font-condensed text-[12px] md:text-[14px] text-crimson tracking-wider font-bold">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  
                  {/* Staggered accent line segments */}
                  <div className="nav-accent-bar w-4 h-[1px] bg-crimson/50 origin-left" style={{ transform: "scaleX(0)" }} />

                  {/* Category Link */}
                  <div className="relative overflow-hidden flex flex-col">
                    <div className="overflow-hidden">
                      <Link
                        href={`/menu/${cat.slug}`}
                        className="interactive-hover block nav-link-text opacity-0 transform translate-y-full"
                        data-cursor-text="VIEW"
                      >
                        <span className={`font-condensed text-[22px] md:text-[32px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 block hover:text-crimson ${
                          isActive ? "text-crimson" : "text-white"
                        }`}>
                          {cat.displayName}
                        </span>
                      </Link>
                    </div>
                    <span
                      dir="rtl"
                      className="nav-sub-text font-arabic text-[11px] md:text-[12px] text-white/40 block text-left mt-0.5 opacity-0"
                    >
                      {cat.arabicName}
                    </span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
