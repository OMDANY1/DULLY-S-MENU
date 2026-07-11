"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { MenuCategory } from "@/domain/menu/types";
import { getVisibleCategories } from "@/config/menuConfig";
import { getArchFamily } from "@/components/ui/ArchFrame";
import CinematicLoader from "@/components/ui/CinematicLoader";
import CategoryNavigator from "@/components/navigation/CategoryNavigator";
import Atmosphere from "@/components/effects/Atmosphere";
import ArchFrame from "@/components/ui/ArchFrame";
import Header from "@/components/navigation/Header";

// ==========================================
// CATEGORY FOCAL VISUAL COMPONENT
// ==========================================
function CategoryFocalVisual({ categoryId }: { categoryId: string }) {
  switch (categoryId) {
    case "hot-tea":
      // three narrow vertical steam traces with slight animation
      return (
        <svg className="w-full h-full text-crimson/35" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
          <line x1="45" y1="20" x2="45" y2="80" strokeDasharray="2,2" />
          <line x1="50" y1="15" x2="50" y2="85" strokeDasharray="3,3" />
          <line x1="55" y1="20" x2="55" y2="80" strokeDasharray="2,2" />
        </svg>
      );
    case "hot-tea-latte":
      // broad arch with a giant central circular line (disc)
      return (
        <svg className="w-full h-full text-crimson/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3">
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="15" fill="currentColor" className="text-crimson/5" />
          <line x1="15" y1="50" x2="85" y2="50" />
        </svg>
      );
    case "iced-tea":
      // horizontal precision rails and condensation nodes
      return (
        <svg className="w-full h-full text-crimson/35" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
          <line x1="10" y1="40" x2="90" y2="40" />
          <line x1="10" y1="60" x2="90" y2="60" />
          <circle cx="30" cy="40" r="2.5" fill="currentColor" />
          <circle cx="70" cy="40" r="2.5" fill="currentColor" />
          <circle cx="50" cy="60" r="2.5" fill="currentColor" />
        </svg>
      );
    case "iced-japanese-tea":
      // ceremonial gate abstraction (Torii inspired) and modular geometry
      return (
        <svg className="w-full h-full text-crimson/25" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.35">
          <path d="M 20,30 L 80,30 M 30,30 L 30,80 M 70,30 L 70,80 M 20,40 L 80,40" />
          <circle cx="50" cy="60" r="16" />
        </svg>
      );
    case "iced-fruit-tea":
      // organic curved growth paths and cropped arcs
      return (
        <svg className="w-full h-full text-crimson/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.45">
          <path d="M 20,80 Q 50,20 80,80" />
          <path d="M 30,80 Q 50,40 70,80" strokeDasharray="1.5,1.5" />
        </svg>
      );
    case "iced-boba-milk-tea":
      // dense vertical boba pearl suspension
      return (
        <svg className="w-full h-full text-crimson/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
          <circle cx="35" cy="75" r="4.5" fill="currentColor" />
          <circle cx="50" cy="82" r="5" fill="currentColor" />
          <circle cx="65" cy="78" r="4.5" fill="currentColor" />
          <circle cx="42" cy="68" r="5" fill="currentColor" />
          <circle cx="58" cy="72" r="4" fill="currentColor" />
          <line x1="50" y1="10" x2="50" y2="60" />
        </svg>
      );
    case "iced-boba-milk":
      // fluid milk density columns and stacked layers
      return (
        <svg className="w-full h-full text-crimson/25" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.35">
          <path d="M 30,90 C 30,50 40,40 40,10" />
          <path d="M 70,90 C 70,60 60,50 60,10" />
          <circle cx="50" cy="50" r="22" strokeDasharray="3,3" />
        </svg>
      );
    case "snow-ice":
      // crystalline structures and low mist coordinates
      return (
        <svg className="w-full h-full text-crimson/35" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.35">
          <polygon points="50,15 80,65 20,65" />
          <line x1="20" y1="75" x2="80" y2="75" strokeWidth="0.8" />
          <line x1="10" y1="82" x2="90" y2="82" strokeDasharray="2,2" />
        </svg>
      );
    case "mojitos":
      // diagonal citrus path and compressed bubbles (iPad mode only)
      return (
        <svg className="w-full h-full text-crimson/35" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.4">
          <path d="M 15,85 L 85,15" />
          <circle cx="30" cy="65" r="3" />
          <circle cx="45" cy="45" r="2" />
          <circle cx="65" cy="30" r="4.5" />
          <circle cx="50" cy="50" r="6" strokeDasharray="2,2" />
        </svg>
      );
    default:
      // default abstract coordinate lattice
      return (
        <svg className="w-full h-full text-crimson/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.25">
          <rect x="20" y="20" width="60" height="60" />
          <line x1="50" y1="0" x2="50" y2="100" />
          <line x1="0" y1="50" x2="100" y2="50" />
        </svg>
      );
  }
}

interface HomeClientPageProps {
  categories: MenuCategory[];
}

export default function HomeClientPage({ categories: rawCategories }: HomeClientPageProps) {
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hasLoaded = sessionStorage.getItem("dullys_loaded");
      return !hasLoaded;
    }
    return true;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const isTransitioningRef = useRef(false);
  const masterTransitionRef = useRef<gsap.core.Timeline | null>(null);

  const categories = getVisibleCategories(rawCategories);
  const activeCategory = categories[activeIdx];

  const titleRef = useRef<HTMLHeadingElement>(null);
  const arTitleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);
  const focalRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  // Transition handler (Departure Phase)
  const transitionTo = useCallback((newIdx: number) => {
    if (newIdx === activeIdx || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Kill any active running timelines
    if (masterTransitionRef.current) {
      masterTransitionRef.current.kill();
    }

    const title = titleRef.current;
    const arTitle = arTitleRef.current;
    const desc = descRef.current;
    const bg = bgWrapperRef.current;
    const focal = focalRef.current;
    const heroImage = heroImageRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        // Switch state (which triggers the arrival phase effect)
        setActiveIdx(newIdx);
      },
    });

    masterTransitionRef.current = tl;

    // 1. DEPARTURE PHASE: Retract coordinates, compress, and clip-reveal out
    tl.to([title, arTitle, desc], {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      y: -35,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      stagger: 0.05,
    });

    tl.to(focal, {
      scale: 0.88,
      opacity: 0,
      filter: "blur(12px)",
      duration: 0.45,
      ease: "power2.in",
    }, "<");

    tl.to(bg, {
      scale: 0.95,
      opacity: 0.15,
      duration: 0.5,
      ease: "power2.inOut",
    }, "<");

    if (heroImage) {
      tl.to(heroImage, {
        opacity: 0,
        y: -20,
        scale: 0.95,
        duration: 0.4,
        ease: "power3.in",
      }, "<");
    }
  }, [activeIdx]);

  // Stagger reveal on category entry (Arrival Phase)
  useEffect(() => {
    if (loading) return;

    const title = titleRef.current;
    const arTitle = arTitleRef.current;
    const desc = descRef.current;
    const bg = bgWrapperRef.current;
    const focal = focalRef.current;
    const heroImage = heroImageRef.current;

    // Kill any active timelines
    if (masterTransitionRef.current) {
      masterTransitionRef.current.kill();
    }

    // Reset initial states for arrival
    gsap.set([title, arTitle, desc], {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      y: 40,
      opacity: 0,
    });
    gsap.set(focal, {
      scale: 1.1,
      opacity: 0,
      filter: "blur(15px)",
    });
    gsap.set(bg, {
      scale: 1.06,
      opacity: 0.25,
    });
    if (heroImage) {
      gsap.set(heroImage, {
        opacity: 0,
        y: 20,
        scale: 1.05,
      });
    }

    // 3. ARRIVAL PHASE Timeline
    const arrivalTimeline = gsap.timeline({
      onComplete: () => {
        // Unlock only when arrival is fully complete
        isTransitioningRef.current = false;
        masterTransitionRef.current = null;
      },
    });

    masterTransitionRef.current = arrivalTimeline;

    arrivalTimeline.to(bg, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
    });

    if (focal) {
      const paths = focal.querySelectorAll("path, line, circle, rect, polygon");
      paths.forEach((path: any) => {
        try {
          const length = path.getTotalLength ? path.getTotalLength() : 350;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });
          arrivalTimeline.to(path, {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.out",
          }, "-=0.7");
        } catch (e) {
          gsap.set(path, { opacity: 0 });
          arrivalTimeline.to(path, { opacity: 1, duration: 0.6 }, "-=0.6");
        }
      });
    }

    arrivalTimeline.to(focal, {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: 1.0,
      ease: "power3.out",
    }, "-=0.6");

    arrivalTimeline.to(title, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      y: 0,
      opacity: 1,
      duration: 0.75,
      ease: "power3.out",
    }, "-=0.6");

    arrivalTimeline.to(arTitle, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      y: 0,
      opacity: 1,
      duration: 0.65,
      ease: "power2.out",
    }, "-=0.5");

    arrivalTimeline.to(desc, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      y: 0,
      opacity: 1,
      duration: 0.65,
      ease: "power2.out",
    }, "-=0.5");

    if (heroImage) {
      arrivalTimeline.to(heroImage, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");
    }

    return () => {
      arrivalTimeline.kill();
    };
  }, [activeIdx, loading]);

  // Bind GSAP Observer for mouse wheel & touch swipes
  useEffect(() => {
    if (loading) return;

    if ((window as unknown as { lenis?: { stop: () => void } }).lenis) {
      (window as unknown as { lenis?: { stop: () => void } }).lenis?.stop();
    }

    gsap.registerPlugin(Observer);

    const obs = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: 0.8,
      tolerance: 15,
      onChangeY: (self) => {
        if (isTransitioningRef.current) return;

        if (self.deltaY > 15) {
          const nextIdx = (activeIdx + 1) % categories.length;
          transitionTo(nextIdx);
        } else if (self.deltaY < -15) {
          const prevIdx = (activeIdx - 1 + categories.length) % categories.length;
          transitionTo(prevIdx);
        }
      },
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        transitionTo((activeIdx + 1) % categories.length);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        transitionTo((activeIdx - 1 + categories.length) % categories.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      obs.kill();
      window.removeEventListener("keydown", handleKeyDown);
      if ((window as unknown as { lenis?: { start: () => void } }).lenis) {
        (window as unknown as { lenis?: { start: () => void } }).lenis?.start();
      }
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
        <main 
          className="relative w-full h-screen bg-[#060606] overflow-hidden flex flex-col justify-between select-none"
          style={{
            paddingTop: "max(var(--site-gutter-top), env(safe-area-inset-top))",
            paddingBottom: "max(var(--site-gutter-bottom), env(safe-area-inset-bottom))",
          }}
        >
          
          {/* Burger Navigation Overlay */}
          <CategoryNavigator categories={categories} />

          {/* Background Exhibition Atmosphere & Arches */}
          <div ref={bgWrapperRef} className="absolute inset-0 z-0">
            <Atmosphere profile={activeCategory.id as "hot-tea"} />
            <div className="absolute inset-x-8 md:inset-x-32 top-[16vh] bottom-[16vh]">
              <ArchFrame family={getArchFamily(activeCategory.id)} />
            </div>
          </div>

          {/* Category-Specific Focal Visual Layer */}
          <div
            ref={focalRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 scale-[1.08]"
          >
            <div className="w-[300px] h-[300px] md:w-[480px] md:h-[480px] opacity-60">
              <CategoryFocalVisual categoryId={activeCategory.id} />
            </div>
          </div>

          {/* Header Bar */}
          <Header />

          {/* Category Hero Composition Area */}
          <section className="site-container relative z-20 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6 w-full">
            
            {/* Left Column: Visual Guide Indicator (Index) */}
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

            {/* Central Content Zone: Massive Composition Title */}
            <div className="col-span-1 md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left relative h-full justify-center">
              <div className="overflow-hidden h-5 mb-2">
                <span className="font-condensed text-[11px] text-crimson tracking-[0.2em] font-bold block uppercase">
                  CHAPTER {(activeIdx + 1).toString().padStart(2, "0")}
                </span>
              </div>

              {/* English Category Title */}
              <h2
                ref={titleRef}
                className="font-condensed text-[54px] md:text-[90px] lg:text-[115px] font-black uppercase tracking-[0.03em] text-white leading-[0.85] w-full"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
              >
                {activeCategory.displayName}
              </h2>

              {/* Arabic translation on an opposite, offset baseline */}
              <div
                ref={arTitleRef}
                dir="rtl"
                className="font-arabic text-[22px] md:text-[28px] text-crimson font-bold mt-4 leading-none select-none"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
              >
                {activeCategory.arabicName}
              </div>

              {/* Description */}
              <p
                ref={descRef}
                className="font-condensed text-[11px] md:text-[13px] text-white/45 tracking-[0.18em] uppercase mt-6 max-w-md leading-relaxed"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
              >
                {activeCategory.description}
              </p>

              {/* Exploration control button */}
              <Link
                href={`/menu/${activeCategory.slug}`}
                className="interactive-hover mt-10 inline-flex items-center space-x-6 py-2 group"
                data-cursor-text="EXPLORE"
              >
                <span className="font-condensed text-[11px] font-bold tracking-[0.25em] uppercase text-white group-hover:text-crimson transition-colors duration-300">
                  [ {(activeIdx + 1).toString().padStart(2, "0")} ] &nbsp; EXPLORE CATEGORY
                </span>
                <span className="text-crimson text-[14px] font-condensed tracking-tighter transform group-hover:translate-x-3 transition-transform duration-300">
                  ─────────────→
                </span>
              </Link>
            </div>

            {/* Right Visual Zone: Category Hero Image */}
            <div 
              ref={heroImageRef}
              className="col-span-1 md:col-span-4 flex items-center justify-center relative w-full h-[25vh] md:h-[40vh] px-4 md:px-0"
            >
              {activeCategory.heroImage && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCategory.heroImage}
                    alt={activeCategory.displayName}
                    className="max-w-full max-h-full object-contain filter brightness-[0.95] contrast-[1.02]"
                  />
                </div>
              )}
            </div>

          </section>

          {/* Footer Bar */}
          <footer className="site-container relative z-20 flex items-end justify-between text-white/30 text-[9px] font-condensed tracking-[0.2em] uppercase mt-auto w-full">
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
