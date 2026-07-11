"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MenuCategory } from "@/domain/menu/types";
import CategoryNavigator from "@/components/navigation/CategoryNavigator";
import ProductChapter from "@/components/menu/ProductChapter";
import Atmosphere from "@/components/effects/Atmosphere";
import Header from "@/components/navigation/Header";

interface CategoryClientPageProps {
  category: MenuCategory;
  categories: MenuCategory[];
}

export default function CategoryClientPage({ category, categories }: CategoryClientPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const redSegmentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const glyphRef = useRef<SVGSVGElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Entrance Choreography Sequence
  useEffect(() => {
    const line = lineRef.current;
    const redSegment = redSegmentRef.current;
    const title = titleRef.current;
    const glyph = glyphRef.current;
    const sub = subRef.current;
    const products = productsRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Initial state
      gsap.set(line, { scaleX: 0 });
      gsap.set(redSegment, { scaleX: 0, opacity: 0 });
      gsap.set(title, { y: 60, opacity: 0 });
      gsap.set(glyph, { scale: 0.2, rotation: -180, opacity: 0 });
      gsap.set(sub, { opacity: 0, letterSpacing: "0.1em" });
      gsap.set(products, { opacity: 0, y: 30 });

      // 1. White line draws itself
      tl.to(line, {
        scaleX: 1,
        duration: 1.0,
        ease: "power3.inOut",
        transformOrigin: "center",
      });

      // 2. Red segment enters
      tl.to(redSegment, {
        scaleX: 1,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        transformOrigin: "left",
      }, "-=0.4");

      // 3. Title clips upward and reveals
      tl.to(title, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.3");

      // 4. Category glyph draws
      tl.to(glyph, {
        scale: 1,
        rotation: 0,
        opacity: 0.4,
        duration: 0.8,
        ease: "back.out(1.7)",
      }, "-=0.4");

      // 5. Subtitle expanding letter-spacing
      tl.to(sub, {
        opacity: 1,
        letterSpacing: "0.25em",
        duration: 1.0,
        ease: "power2.out",
      }, "-=0.4");

      // 6. First products chapter starts entering
      tl.to(products, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");
    }, containerRef);

    return () => ctx.revert();
  }, [category.id]);

  // Split title styling for editorial header (e.g. "HOT TEA" -> HOT in white, TEA in red)
  const renderSplitTitle = (titleText: string) => {
    const words = titleText.split(" ");
    if (words.length <= 1) return titleText;
    const lastWord = words.pop();
    const leadingText = words.join(" ");
    return (
      <>
        <span className="text-white">{leadingText} </span>
        <span className="text-crimson">{lastWord}</span>
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-background overflow-x-hidden flex flex-col justify-between select-none"
      style={{
        paddingTop: "max(var(--site-gutter-top), env(safe-area-inset-top))",
        paddingBottom: "max(var(--site-gutter-bottom), env(safe-area-inset-bottom))",
      }}
    >
      {/* Floating Navigator menu overlay */}
      <CategoryNavigator categories={categories} />

      {/* Background Atmosphere */}
      <Atmosphere profile={category.id as "hot-tea"} />

      {/* TOP HEADER BAR */}
      <Header showBackLabel={true} />

      {/* EDITORIAL HERO OPENING */}
      <section className="site-container relative z-10 w-full pt-8 md:pt-16 pb-12 text-center flex flex-col items-center">
        {/* Horizontal White Line */}
        <div className="relative w-full max-w-4xl h-[1px] bg-white/10 mb-8 overflow-hidden">
          <div ref={lineRef} className="absolute inset-0 bg-white/40" />
          <div ref={redSegmentRef} className="absolute left-[35%] w-[30%] h-full bg-crimson" />
        </div>

        {/* Massive Title */}
        <div className="overflow-hidden mb-4">
          <h1
            ref={titleRef}
            className="font-condensed text-[48px] md:text-[80px] lg:text-[100px] font-black uppercase tracking-[0.05em] leading-none"
          >
            {renderSplitTitle(category.displayName)}
          </h1>
        </div>

        {/* Japanese inspired glyph inside divider */}
        <div className="my-2 flex items-center justify-center">
          <svg
            ref={glyphRef}
            className="w-10 h-10 text-crimson opacity-40 animate-spin-slow"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            {/* Modular symmetry */}
            <circle cx="50" cy="50" r="40" />
            <circle cx="50" cy="50" r="25" />
            <line x1="50" y1="10" x2="50" y2="90" />
            <line x1="10" y1="50" x2="90" y2="50" />
            {/* Petal structures */}
            <path d="M 50,10 A 15,15 0 0,0 35,25 A 15,15 0 0,0 50,40 A 15,15 0 0,0 65,25 A 15,15 0 0,0 50,10 Z" />
          </svg>
        </div>

        {/* Subtitle with expanding letter spacing */}
        <div
          ref={subRef}
          className="font-condensed text-[12px] md:text-[15px] uppercase text-white/50 tracking-[0.25em] leading-relaxed max-w-xl mt-4"
        >
          {category.description}
        </div>

        {/* Cinematic Category Hero Image */}
        {category.heroImage && (
          <div className="relative w-full max-w-4xl h-[30vh] md:h-[45vh] mt-8 mb-4 border border-white/5 bg-charcoal/5 overflow-hidden select-none flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.heroImage}
              alt={category.displayName}
              className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none" />
          </div>
        )}
      </section>

      {/* PRODUCTS CHAPTERS SYSTEM SECTION */}
      <section
        ref={productsRef}
        className="relative z-10 w-full py-12"
      >
        <ProductChapter products={category.items} categoryId={category.id} />
      </section>

      {/* FOOTER BAR */}
      <footer className="relative w-full z-20 pt-16 flex items-center justify-between text-white/30 text-[9px] font-condensed tracking-[0.2em] uppercase mt-auto">
        <div>
          <span>Dully&apos;s Digital Menu Experience</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-crimson font-bold">DULLY&apos;S</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
