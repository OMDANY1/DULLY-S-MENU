"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { MenuItem } from "@/data/menu";
import ArchFrame from "@/components/ui/ArchFrame";
import StoneStage from "@/components/ui/StoneStage";
import Atmosphere from "@/components/effects/Atmosphere";
import ProductSizeSelector from "./ProductSizeSelector";

interface ProductStageProps {
  product: MenuItem;
}

export default function ProductStage({ product }: ProductStageProps) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);

  const selectedSize = product.sizes[sizeIdx];

  // Mouse-reactive spotlight & parallax movement
  useEffect(() => {
    const container = containerRef.current;
    const wrapper = imgWrapperRef.current;
    if (!container || !wrapper) return;

    // Throttle / requestAnimationFrame helper for performance
    let rafId: number;
    const onMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        // Calculate normalized mouse coords (-0.5 to 0.5)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Shift product image and shadow
        gsap.to(wrapper, {
          x: x * 15,
          y: y * 15,
          rotationY: x * 10,
          rotationX: -y * 10,
          duration: 0.4,
          ease: "power2.out",
        });

        // Spotlight highlight movement in CSS variable
        container.style.setProperty("--mouse-x", `${(e.clientX - rect.left)}px`);
        container.style.setProperty("--mouse-y", `${(e.clientY - rect.top)}px`);
      });
    };

    const onMouseLeave = () => {
      cancelAnimationFrame(rafId);
      gsap.to(wrapper, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Animate price / calorie transition when size changes
  const onSizeChange = (idx: number) => {
    const priceEl = priceRef.current;
    const calEl = calRef.current;
    if (!priceEl || !calEl) {
      setSizeIdx(idx);
      return;
    }

    const tl = gsap.timeline();
    // Fade & shift out
    tl.to([priceEl, calEl], {
      y: -8,
      opacity: 0,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setSizeIdx(idx);
        gsap.set([priceEl, calEl], { y: 8 });
      },
    });

    // Fade & shift in
    tl.to([priceEl, calEl], {
      y: 0,
      opacity: 1,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  // Determine local image path
  const sizeLabelClean = selectedSize.label.toLowerCase().replace(" ", "");
  const sizeSpecificPath = `/assets/products/${product.id}-${sizeLabelClean}.png`;
  const defaultPath = `/assets/products/${product.id}.png`;

  // Determine local lights based on product ID/category keywords
  const getProductLightColor = () => {
    if (product.id.includes("matcha")) return "rgba(34, 197, 94, 0.08)"; // Subtle green light
    if (product.id.includes("thai")) return "rgba(245, 158, 11, 0.1)"; // Subtle amber light
    if (product.id.includes("hojicha")) return "rgba(120, 53, 4, 0.1)"; // Subtle warm brown light
    return undefined;
  };

  return (
    <div
      ref={containerRef}
      className="group relative flex flex-col items-center justify-between w-full min-h-[480px] p-8 md:p-12 bg-charcoal/30 border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-crimson/20 hover:bg-charcoal/50"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Category-Specific Atmosphere Layer */}
      <Atmosphere profile={product.category as any} color={getProductLightColor()} />

      {/* Arch Frame Portal */}
      <ArchFrame category={product.category} />

      {/* Decorative SVG construction details */}
      <svg
        className="absolute top-4 right-4 w-12 h-12 text-white/5 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      >
        <circle cx="50" cy="50" r="40" />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
      </svg>

      {/* Product Image Stage / Stage Hero */}
      <div className="relative flex-1 w-full flex items-center justify-center min-h-[220px] z-10 select-none">
        <div
          ref={imgWrapperRef}
          className="relative w-44 h-44 md:w-52 md:h-52 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.05]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {imageError ? (
            /* Cinematic Fallback Silhouette vector */
            <div className="relative inset-0 w-full h-full flex flex-col items-center justify-center bg-black/40 rounded-full border border-crimson/10 shadow-[0_0_40px_var(--crimson-glow)]">
              {/* Backlight glow */}
              <div className="absolute inset-0 bg-crimson/10 rounded-full blur-xl animate-glow-breathe" />
              {/* Abstract line geometry */}
              <svg className="absolute w-4/5 h-4/5 text-crimson/30 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.25">
                <circle cx="50" cy="50" r="35" />
                <rect x="25" y="25" width="50" height="50" rx="4" />
                <line x1="50" y1="0" x2="50" y2="100" />
                <line x1="0" y1="50" x2="100" y2="50" />
              </svg>
              {/* Fallback typography overlay */}
              <span className="font-condensed text-[9px] uppercase tracking-[0.3em] text-white/40 text-center px-4 leading-relaxed z-10">
                {product.name}
              </span>
            </div>
          ) : (
            /* Actual PNG Image (resolving size-specific first, then default) */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={defaultPath}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.8)]"
            />
          )}
        </div>
      </div>

      {/* Volcanic Stone Pedestal base */}
      <StoneStage />

      {/* Product Information Typography (RTL Correct) */}
      <div className="relative w-full text-center mt-6 z-10 flex flex-col items-center">
        {/* Number identifier */}
        {product.num && (
          <span className="font-condensed text-[9px] text-crimson tracking-widest uppercase font-bold block mb-1">
            {product.num.padStart(2, "0")}
          </span>
        )}

        {/* English Header */}
        <h3 className="font-condensed text-[18px] md:text-[20px] font-bold text-white tracking-[0.15em] uppercase leading-tight">
          {product.name}
        </h3>

        {/* Arabic Subheader (RTL) */}
        <span
          dir="rtl"
          className="font-arabic text-[12px] text-crimson tracking-wide mt-1 block leading-normal font-medium"
        >
          {product.arabicName}
        </span>

        {/* Dynamic price/calorie tags with slide animation portal */}
        <div className="h-14 mt-3 flex flex-col justify-end overflow-hidden">
          <div ref={priceRef} className="flex items-baseline justify-center space-x-1.5">
            <span className="font-condensed text-[20px] font-bold text-white">
              {selectedSize.price}
            </span>
            <span className="font-condensed text-[9px] uppercase tracking-widest text-white/50">
              SAR
            </span>
          </div>

          <div ref={calRef} className="text-[10px] tracking-wider text-white/40 mt-0.5">
            {selectedSize.calories ? (
              <>
                <span className="text-crimson font-medium mr-1 font-condensed">Cal.</span>
                <span className="font-condensed font-medium text-white/60">{selectedSize.calories}</span>
              </>
            ) : selectedSize.calorieNote ? (
              <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">{selectedSize.calorieNote}</span>
            ) : (
              <span className="opacity-0">-</span>
            )}
          </div>
        </div>

        {/* Product size selector */}
        <ProductSizeSelector
          sizes={product.sizes}
          selectedIdx={sizeIdx}
          onChange={onSizeChange}
        />
      </div>
    </div>
  );
}
