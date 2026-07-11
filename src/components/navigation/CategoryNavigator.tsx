"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { menuCategories } from "@/data/menu";

export default function CategoryNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const glyphRef = useRef<SVGSVGElement>(null);

  // Toggle overlay opening
  useEffect(() => {
    const overlay = overlayRef.current;
    const line = lineRef.current;
    const items = itemsRef.current.filter(Boolean);
    const glyph = glyphRef.current;
    if (!overlay || !line) return;

    if (isOpen) {
      // Darken page & show overlay
      gsap.to(overlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.8,
        ease: "power4.inOut",
      });

      // Draw vertical red line
      gsap.fromTo(line, 
        { scaleY: 0 }, 
        { scaleY: 1, duration: 1.0, ease: "power3.inOut", transformOrigin: "top" }
      );

      // Stagger item reveals
      gsap.fromTo(items,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power2.out", delay: 0.3 }
      );

      // Rotate geometric glyph
      if (glyph) {
        gsap.fromTo(glyph,
          { rotation: -90, scale: 0.8, opacity: 0 },
          { rotation: 0, scale: 1, opacity: 0.25, duration: 1.2, ease: "power3.out", delay: 0.2 }
        );
      }
    } else {
      // Hide items
      gsap.to(items, {
        x: 30,
        opacity: 0,
        stagger: 0.03,
        duration: 0.4,
        ease: "power2.in",
      });

      // Fade overlay
      gsap.to(overlay, {
        clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        duration: 0.8,
        ease: "power4.inOut",
        delay: 0.1,
      });
    }
  }, [isOpen]);

  // Close navigator on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Floating Menu Toggle Button */}
      <button
        ref={menuBtnRef}
        onClick={() => setIsOpen(!isOpen)}
        className="interactive-hover fixed top-6 right-6 z-[999] flex items-center space-x-3 select-none py-2.5 px-5 border border-white/5 rounded-full bg-charcoal/40 backdrop-blur-md hover:border-crimson/30 hover:bg-charcoal/60 transition-all duration-300 group"
        data-cursor-text={isOpen ? "Close" : "Open Menu"}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[0.25em] text-white">
          {isOpen ? "Close" : "Index"}
        </span>
        
        {/* Animated hamburger icon */}
        <div className="relative w-4 h-3 flex flex-col justify-between">
          <span className={`w-full h-[1.5px] bg-white transition-all duration-300 transform origin-top-left ${isOpen ? "rotate-45 translate-x-[2px] translate-y-[-1px] bg-crimson" : ""}`} />
          <span className={`w-3/4 h-[1.5px] bg-white transition-all duration-300 self-end ${isOpen ? "w-0 opacity-0" : ""}`} />
          <span className={`w-full h-[1.5px] bg-white transition-all duration-300 transform origin-bottom-left ${isOpen ? "-rotate-45 translate-x-[2px] translate-y-[1px] bg-crimson" : ""}`} />
        </div>
      </button>

      {/* Cinematic Sidebar Overlay Drawer */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-[#060606]/98 z-[998] flex items-center justify-center p-8 select-none"
        style={{ clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }}
      >
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-5">
          {Array.from({ length: 11 }).map((_, idx) => (
            <div key={idx} className="h-full border-r border-white" />
          ))}
        </div>

        {/* Geometric Symbol strip strip strip */}
        <svg
          ref={glyphRef}
          className="absolute left-[8%] md:left-[15%] w-64 h-64 md:w-96 md:h-96 text-crimson pointer-events-none opacity-0"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.15"
        >
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="30" />
          <rect x="25" y="25" width="50" height="50" />
          <rect x="30" y="30" width="40" height="40" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="10" y1="50" x2="90" y2="50" />
        </svg>

        {/* Index Container */}
        <div className="relative flex h-[75vh] max-w-4xl w-full z-10">
          {/* Vertical Red Drawing Line */}
          <div
            ref={lineRef}
            className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-crimson origin-top"
          />

          {/* Categories List */}
          <nav className="flex flex-col justify-center space-y-6 md:space-y-8 pl-8 md:pl-12 w-full overflow-y-auto">
            {menuCategories.map((cat, idx) => {
              const isActive = pathname === `/menu/${cat.id}`;
              return (
                <div
                  key={cat.id}
                  ref={(el) => { itemsRef.current[idx] = el; }}
                  className="group/item flex items-center space-x-6 md:space-x-8 opacity-0"
                >
                  {/* Category Number */}
                  <span className="font-condensed text-[12px] md:text-[14px] text-crimson tracking-wider font-bold">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  
                  {/* Category Name Link */}
                  <Link
                    href={`/menu/${cat.id}`}
                    className="interactive-hover block"
                    data-cursor-text="Explore"
                  >
                    <span className={`font-condensed text-[24px] md:text-[36px] font-bold uppercase tracking-[0.1em] transition-all duration-300 block group-hover/item:text-crimson ${
                      isActive ? "text-crimson" : "text-white"
                    }`}>
                      {cat.displayName}
                    </span>
                    <span
                      dir="rtl"
                      className="font-arabic text-[12px] md:text-[14px] text-white/40 block text-left group-hover/item:text-white/70 transition-colors mt-0.5"
                    >
                      {cat.arabicName}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
