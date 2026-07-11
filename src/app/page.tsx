"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { menuCategories } from "@/data/menu";
import { getVisibleCategories } from "@/config/menuConfig";
import { getArchFamily } from "@/components/ui/ArchFrame";
import CinematicLoader from "@/components/ui/CinematicLoader";
import CategoryNavigator from "@/components/navigation/CategoryNavigator";
import Atmosphere from "@/components/effects/Atmosphere";
import ArchFrame from "@/components/ui/ArchFrame";

export default function Home() {
  // Session-cached loader state to avoid replaying on internal return navigation
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hasLoaded = sessionStorage.getItem("dullys_loaded");
      return !hasLoaded;
    }
    return true;
  });

  const [activeIdx, setActiveIdx] = useState(0);

  // Central visibility system
  const categories = getVisibleCategories(menuCategories);
  const activeCategory = categories[activeIdx];

  const titleRef = useRef<HTMLHeadingElement>(null);
  const arTitleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);

  // Transition handler
  const transitionTo = useCallback((newIdx: number) => {
    if (newIdx === activeIdx) return;

    const title = titleRef.current;
    const arTitle = arTitleRef.current;
    const desc = descRef.current;
    const bg = bgWrapperRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIdx(newIdx);
      },
    });

    // Stagger clip-out and compress active atmosphere
    tl.to([title, arTitle, desc], {
      y: -25,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.05,
    });

    tl.to(bg, {
      scale: 0.96,
      opacity: 0.2,
      duration: 0.4,
      ease: "power2.inOut",
    }, "<");
  }, [activeIdx]);

  // Stagger reveal on category entry
  useEffect(() => {
    if (loading) return;

    const title = titleRef.current;
    const arTitle = arTitleRef.current;
    const desc = descRef.current;
    const bg = bgWrapperRef.current;

    gsap.fromTo([title, arTitle, desc],
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power2.out", stagger: 0.08, delay: 0.1 }
    );

    gsap.fromTo(bg,
      { scale: 1.04, opacity: 0.4 },
      { scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" }
    );
  }, [activeIdx, loading]);

  // Observer Scroll/Touch gesture binder
  useEffect(() => {
    if (loading) return;

    // Suspend global Lenis scroll on Home scene
    const globalLenis = (window as unknown as { lenis?: { stop: () => void } }).lenis;
    if (globalLenis) globalLenis.stop();

    gsap.registerPlugin(Observer);

    let isTransitioning = false;

    const obs = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: 0.8,
      tolerance: 15,
      onChangeY: (self) => {
        if (isTransitioning) return;

        if (self.deltaY > 15) {
          isTransitioning = true;
          const nextIdx = (activeIdx + 1) % categories.length;
          transitionTo(nextIdx);
          setTimeout(() => {
            isTransitioning = false;
          }, 800);
        } else if (self.deltaY < -15) {
          isTransitioning = true;
          const prevIdx = (activeIdx - 1 + categories.length) % categories.length;
          transitionTo(prevIdx);
          setTimeout(() => {
            isTransitioning = false;
          }, 800);
        }
      },
    });

    // Keyboard support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        isTransitioning = true;
        transitionTo((activeIdx + 1) % categories.length);
        setTimeout(() => { isTransitioning = false; }, 800);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        isTransitioning = true;
        transitionTo((activeIdx - 1 + categories.length) % categories.length);
        setTimeout(() => { isTransitioning = false; }, 800);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      obs.kill();
      window.removeEventListener("keydown", handleKeyDown);
      // Restore global Lenis scroll when navigating away
      const globalLenis = (window as unknown as { lenis?: { start: () => void } }).lenis;
      if (globalLenis) globalLenis.start();
    };
  }, [activeIdx, loading, categories.length, transitionTo]);

  const handleLoaderComplete = () => {
    setLoading(false);
    sessionStorage.setItem("dullys_loaded", "true");
  };

  return (
    <>
      {loading ? (
        <CinematicLoader onComplete={handleLoaderComplete} />
      ) : (
        <main className="relative w-full h-screen bg-[#060606] overflow-hidden flex flex-col justify-between p-8 md:p-12 select-none">


          {/* Navigation trigger (rebuilt burger index) */}
          <CategoryNavigator />

          {/* Background Exhibition Atmosphere portal */}
          <div ref={bgWrapperRef} className="absolute inset-0 z-0">
            <Atmosphere profile={activeCategory.id as "hot-tea"} />
            <div className="absolute inset-x-8 md:inset-x-28 top-[16vh] bottom-[16vh]">
              <ArchFrame family={getArchFamily(activeCategory.id)} />
            </div>
          </div>

          {/* Header Bar */}
          <header className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Brand icon logo */}
              <svg className="w-8 h-8 text-crimson" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M 30,50 L 50,22 L 70,50 L 50,78 Z" fill="currentColor" />
              </svg>
              <span className="font-condensed text-[16px] font-bold tracking-[0.25em] uppercase text-white">
                Dully&apos;s
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-white/35 text-[9px] font-condensed tracking-[0.2em] uppercase">
              <span>MENU 2026</span>
            </div>
          </header>

          {/* Category hero display */}
          <section className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-12">
            {/* Left page guides (Desktop only) */}
            <div className="hidden md:flex md:col-span-2 flex-col space-y-4 pl-4">
              {categories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => transitionTo(idx)}
                  className="interactive-hover text-left flex items-center space-x-3 group"
                  data-cursor-text="VIEW"
                >
                  <span className={`font-condensed text-[11px] font-bold transition-all duration-300 ${
                    idx === activeIdx ? "text-crimson tracking-[0.12em]" : "text-white/30 group-hover:text-white/60"
                  }`}>
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  <div className={`h-[1px] bg-crimson transition-all duration-300 ${
                    idx === activeIdx ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-3 group-hover:opacity-40"
                  }`} />
                </button>
              ))}
            </div>

            {/* Central details */}
            <div className="col-span-1 md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="overflow-hidden h-5 mb-2">
                <span className="font-condensed text-[11px] text-crimson tracking-[0.2em] font-bold block uppercase">
                  CHAPTER {(activeIdx + 1).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Masked Category Title */}
              <h2
                ref={titleRef}
                className="font-condensed text-[54px] md:text-[80px] lg:text-[96px] font-black uppercase tracking-[0.05em] text-white leading-none"
              >
                {activeCategory.displayName}
              </h2>

              {/* Arabic translation (RTL) */}
              <div
                ref={arTitleRef}
                dir="rtl"
                className="font-arabic text-[18px] md:text-[24px] text-crimson font-medium mt-2 leading-none"
              >
                {activeCategory.arabicName}
              </div>

              {/* Description */}
              <p
                ref={descRef}
                className="font-condensed text-[11px] md:text-[13px] text-white/45 tracking-[0.18em] uppercase mt-5 max-w-md leading-relaxed"
              >
                {activeCategory.description}
              </p>

              {/* Explore Button */}
              <Link
                href={`/menu/${activeCategory.id}`}
                className="interactive-hover mt-8 inline-flex items-center space-x-4 py-3 px-7 border border-crimson/25 bg-crimson/5 hover:bg-crimson/15 hover:border-crimson transition-all duration-300 group"
                data-cursor-text="EXPLORE"
              >
                <span className="font-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-white">
                  EXPLORE CATEGORY
                </span>
                <svg className="w-5 h-3 text-crimson transform group-hover:translate-x-1.5 transition-transform duration-300" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <line x1="0" y1="6" x2="18" y2="6" />
                  <path d="M 12,1 L 18,6 L 12,11" />
                </svg>
              </Link>
            </div>
            
            {/* Visual Abstraction Details (Right side decoration) */}
            <div className="hidden md:flex md:col-span-2 h-full items-center justify-center">
              <div className="w-48 h-48 border border-white/5 rounded-full flex items-center justify-center relative animate-spin-slow opacity-10">
                <svg className="w-4/5 h-4/5 text-crimson" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.25">
                  <circle cx="50" cy="50" r="45" />
                  <rect x="25" y="25" width="50" height="50" />
                  <line x1="50" y1="0" x2="50" y2="100" />
                  <line x1="0" y1="50" x2="100" y2="50" />
                </svg>
              </div>
            </div>
          </section>

          {/* Footer Bar */}
          <footer className="relative z-10 flex items-end justify-between text-white/30 text-[9px] font-condensed tracking-[0.2em] uppercase mt-auto">
            <div>
              <span>SCROLL TO EXPLORE</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-crimson font-bold">DULLY&apos;S</span>
              <span>© 2026</span>
            </div>
          </footer>
        </main>
      )}
    </>
  );
}
