"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { menuCategories } from "@/data/menu";
import CinematicLoader from "@/components/ui/CinematicLoader";
import CustomCursor from "@/components/ui/CustomCursor";
import CategoryNavigator from "@/components/navigation/CategoryNavigator";
import Atmosphere from "@/components/effects/Atmosphere";
import ArchFrame from "@/components/ui/ArchFrame";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  
  // Filter out iPad-only categories (like mojitos) for standard homepage
  const categories = menuCategories.filter(cat => cat.visibility !== "ipad");
  const activeCategory = categories[activeIdx];

  const titleRef = useRef<HTMLHeadingElement>(null);
  const arTitleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);

  // Transition between active categories
  const transitionTo = (newIdx: number) => {
    if (newIdx === activeIdx) return;

    const title = titleRef.current;
    const arTitle = arTitleRef.current;
    const desc = descRef.current;
    const bg = bgWrapperRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIdx(newIdx);
      }
    });

    // Animate out current details
    tl.to([title, arTitle, desc], {
      y: -20,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      stagger: 0.05
    });

    tl.to(bg, {
      scale: 0.95,
      opacity: 0.3,
      duration: 0.3,
      ease: "power2.in"
    }, "<");
  };

  // Animate in the details when activeIdx changes
  useEffect(() => {
    if (loading) return;

    const title = titleRef.current;
    const arTitle = arTitleRef.current;
    const desc = descRef.current;
    const bg = bgWrapperRef.current;

    gsap.fromTo([title, arTitle, desc],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1, delay: 0.1 }
    );

    gsap.fromTo(bg,
      { scale: 1.05, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }
    );
  }, [activeIdx, loading]);

  // Support scroll events to slide between categories
  useEffect(() => {
    if (loading) return;

    let lastScrollTime = Date.now();
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < 1000) return; // Debounce wheel actions

      if (e.deltaY > 30) {
        // Next category
        const nextIdx = (activeIdx + 1) % categories.length;
        transitionTo(nextIdx);
        lastScrollTime = now;
      } else if (e.deltaY < -30) {
        // Previous category
        const prevIdx = (activeIdx - 1 + categories.length) % categories.length;
        transitionTo(prevIdx);
        lastScrollTime = now;
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeIdx, loading, categories.length]);

  return (
    <>
      {loading ? (
        <CinematicLoader onComplete={() => setLoading(false)} />
      ) : (
        <main className="relative w-full h-screen bg-background overflow-hidden flex flex-col justify-between p-8 md:p-12 select-none">
          {/* Custom Cursor System */}
          <CustomCursor />

          {/* Floating Category Navigation index */}
          <CategoryNavigator />

          {/* Background Atmospheric Portal */}
          <div ref={bgWrapperRef} className="absolute inset-0 z-0">
            <Atmosphere profile={activeCategory.id as any} />
            <div className="absolute inset-x-8 md:inset-x-24 top-[15vh] bottom-[15vh]">
              <ArchFrame category={activeCategory.id} />
            </div>
          </div>

          {/* TOP BAR Brand & Metadata */}
          <header className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Dully's Brand Identifier logo symbol */}
              <svg className="w-8 h-8 text-crimson" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 30,50 L 50,20 L 70,50 L 50,80 Z" fill="currentColor" />
              </svg>
              <span className="font-condensed text-[16px] font-bold tracking-[0.3em] uppercase text-white">
                Dully&apos;s
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-white/40 text-[9px] font-condensed tracking-[0.2em] uppercase">
              <span>Ritual Beverage Experience</span>
              <span>•</span>
              <span>Official Menu 2026</span>
            </div>
          </header>

          {/* CENTER HERO active Category portal */}
          <section className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-12">
            {/* Side Progress indicators (Desktop only) */}
            <div className="hidden md:flex md:col-span-2 flex-col space-y-4 pl-4">
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => transitionTo(idx)}
                  className="interactive-hover text-left flex items-center space-x-3 group"
                  data-cursor-text={`Go to ${cat.displayName}`}
                >
                  <span className={`font-condensed text-[11px] font-bold transition-all duration-300 ${
                    idx === activeIdx ? "text-crimson tracking-[0.15em] scale-110" : "text-white/30 group-hover:text-white/60"
                  }`}>
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  <div className={`h-[1px] bg-crimson transition-all duration-300 ${
                    idx === activeIdx ? "w-8 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-40"
                  }`} />
                </button>
              ))}
            </div>

            {/* Dominated Viewport Details */}
            <div className="col-span-1 md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
              {/* Category Number vertical roll */}
              <div className="overflow-hidden h-6 mb-2">
                <span className="font-condensed text-[14px] text-crimson tracking-[0.25em] font-bold block uppercase">
                  Exhibition Chapter {(activeIdx + 1).toString().padStart(2, "0")}
                </span>
              </div>

              {/* English Category title revealed through mask */}
              <h2
                ref={titleRef}
                className="font-condensed text-[54px] md:text-[86px] lg:text-[104px] font-black uppercase tracking-[0.05em] text-white leading-none"
              >
                {activeCategory.displayName}
              </h2>

              {/* Arabic Category title (RTL) */}
              <div
                ref={arTitleRef}
                dir="rtl"
                className="font-arabic text-[20px] md:text-[28px] text-crimson font-medium mt-2 leading-none"
              >
                {activeCategory.arabicName}
              </div>

              {/* Description */}
              <p
                ref={descRef}
                className="font-condensed text-[12px] md:text-[14px] text-white/50 tracking-[0.2em] uppercase mt-6 max-w-md leading-relaxed"
              >
                {activeCategory.description}
              </p>

              {/* ENTER MENU Portal button */}
              <Link
                href={`/menu/${activeCategory.id}`}
                className="interactive-hover mt-10 inline-flex items-center space-x-6 py-4 px-8 border border-crimson/30 rounded-full bg-crimson/5 hover:bg-crimson/15 hover:border-crimson transition-all duration-300 group"
                data-cursor-text="Enter Portal"
              >
                <span className="font-condensed text-[12px] font-bold tracking-[0.25em] uppercase text-white">
                  Enter Menu Altar
                </span>
                {/* Original SVG construction directional arrow */}
                <svg className="w-5 h-3 text-crimson transform group-hover:translate-x-2 transition-transform duration-300" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="0" y1="6" x2="18" y2="6" />
                  <path d="M 12,1 L 18,6 L 12,11" />
                </svg>
              </Link>
            </div>
            
            {/* Visual Abstraction Details (Right side, desktop only) */}
            <div className="hidden md:flex md:col-span-3 h-full items-center justify-center">
              <div className="w-64 h-64 border border-white/5 rounded-full flex items-center justify-center relative animate-spin-slow opacity-15">
                <svg className="w-4/5 h-4/5 text-crimson" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.25">
                  <circle cx="50" cy="50" r="45" />
                  <rect x="25" y="25" width="50" height="50" />
                  <line x1="50" y1="0" x2="50" y2="100" />
                  <line x1="0" y1="50" x2="100" y2="50" />
                </svg>
              </div>
            </div>
          </section>

          {/* BOTTOM BAR Footer Info */}
          <footer className="relative z-10 flex items-end justify-between text-white/30 text-[9px] font-condensed tracking-[0.2em] uppercase mt-auto">
            <div>
              <span>Scroll or select to browse index</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-crimson font-bold">DULLY&apos;S</span>
              <span>© 2026</span>
            </div>
          </footer>
        </main>
      )}
    </>
  );
}
