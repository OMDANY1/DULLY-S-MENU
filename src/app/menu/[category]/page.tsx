"use client";

import { useEffect, useRef } from "react";
import { useParams, notFound } from "next/navigation";
import gsap from "gsap";
import { menuCategories } from "@/data/menu";
import { isCategoryVisible } from "@/config/menuConfig";
import CategoryNavigator from "@/components/navigation/CategoryNavigator";
import BackHomeButton from "@/components/navigation/BackHomeButton";
import ProductChapter from "@/components/menu/ProductChapter";
import Atmosphere from "@/components/effects/Atmosphere";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.category as string;

  // Find the category in normalized database and check visibility
  const category = menuCategories.find((cat) => cat.id === categoryId);
  if (!category || !isCategoryVisible(category)) {
    notFound();
  }

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
  }, [categoryId]);

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
      className="relative min-h-screen bg-background overflow-x-hidden flex flex-col justify-between p-6 md:p-12 select-none"
    >


      {/* Floating Navigator menu overlay */}
      <CategoryNavigator />

      {/* Background Atmosphere */}
      <Atmosphere profile={category.id as "hot-tea"} />

      {/* TOP HEADER BAR */}
      <header className="relative w-full z-20 flex items-center justify-between pb-8">
        <BackHomeButton />
        <div className="flex items-center space-x-2">
          {/* Decorative small logo symbol */}
          <span className="font-condensed text-[12px] font-bold tracking-[0.2em] uppercase text-white/40">
            MENU 2026
          </span>
        </div>
      </header>

      {/* EDITORIAL HERO OPENING */}
      <section className="relative z-10 w-full max-w-6xl mx-auto pt-8 md:pt-16 pb-12 text-center flex flex-col items-center">
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
      </section>

      {/* PRODUCTS CHAPTERS SYSTEM SECTION */}
      <section
        ref={productsRef}
        className="relative z-10 w-full max-w-6xl mx-auto py-12 px-2 md:px-6"
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
