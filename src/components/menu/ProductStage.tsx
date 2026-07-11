"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { MenuItem } from "@/data/menu";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getProductAssetCandidates } from "@/lib/productAssets";
import ArchFrame, { getArchFamily } from "@/components/ui/ArchFrame";
import StoneStage, { VolcanicStageVariant } from "@/components/ui/StoneStage";
import GeometricField from "@/components/ui/GeometricField";
import ProductSizeSelector from "./ProductSizeSelector";

interface ProductStageProps {
  product: MenuItem;
  layoutMode?: string;
}

export default function ProductStage({ product, layoutMode = "standard" }: ProductStageProps) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const selectedSize = product.sizes[sizeIdx];

  // Resolve VolcanicStage variant based on category
  const getStoneVariant = (cat: string): VolcanicStageVariant => {
    switch (cat) {
      case "hot-tea":
        return "slab";
      case "hot-tea-latte":
        return "monolith";
      case "iced-tea":
      case "iced-japanese-tea":
        return "fractured";
      case "iced-fruit-tea":
        return "low-rock";
      case "snow-ice":
        return "wide-platform";
      default:
        return "slab";
    }
  };

  // Sequential image candidates resolution chain
  useEffect(() => {
    let active = true;
    const candidates = getProductAssetCandidates(product.id, selectedSize.label);
    let idx = 0;

    const tryLoadNext = () => {
      if (idx >= candidates.length) {
        if (active) setImageError(true);
        return;
      }

      const candidatePath = candidates[idx];
      const img = new Image();
      img.onload = () => {
        if (!active) return;
        
        // Swapping image with GSAP fade transition
        const imageElement = imgRef.current;
        if (imageElement) {
          gsap.to(imageElement, {
            opacity: 0,
            scale: 0.96,
            duration: 0.15,
            onComplete: () => {
              if (!active) return;
              setResolvedSrc(candidatePath);
              setImageError(false);
              gsap.to(imageElement, {
                opacity: 1,
                scale: 1,
                duration: 0.35,
                ease: "power2.out",
              });
            },
          });
        } else {
          setResolvedSrc(candidatePath);
          setImageError(false);
        }
      };

      img.onerror = () => {
        idx++;
        tryLoadNext();
      };
      img.src = candidatePath;
    };

    tryLoadNext();

    return () => {
      active = false;
    };
  }, [product.id, selectedSize.label]);

  // Mouse-reactive pointer parallax with quickTo
  useEffect(() => {
    const container = containerRef.current;
    const wrapper = imgWrapperRef.current;
    if (!container || !wrapper) return;

    // Detect touch device or reduced-motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || reducedMotion) return;

    // quickTo indicators for smooth movements without queue bloat
    const xTo = gsap.quickTo(wrapper, "x", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(wrapper, "y", { duration: 0.4, ease: "power2.out" });
    const rotYTo = gsap.quickTo(wrapper, "rotationY", { duration: 0.4, ease: "power2.out" });
    const rotXTo = gsap.quickTo(wrapper, "rotationX", { duration: 0.4, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      xTo(x * 20);
      yTo(y * 20);
      rotYTo(x * 12);
      rotXTo(-y * 12);
    };

    const onMouseLeave = () => {
      xTo(0);
      yTo(0);
      rotYTo(0);
      rotXTo(0);
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [reducedMotion]);

  // size changes typographic transitions
  const onSizeChange = (idx: number) => {
    const priceEl = priceRef.current;
    const calEl = calRef.current;
    if (!priceEl || !calEl || reducedMotion) {
      setSizeIdx(idx);
      return;
    }

    const tl = gsap.timeline();
    tl.to([priceEl, calEl], {
      y: -6,
      opacity: 0,
      duration: 0.12,
      ease: "power2.in",
      onComplete: () => {
        setSizeIdx(idx);
        gsap.set([priceEl, calEl], { y: 6 });
      },
    });

    tl.to([priceEl, calEl], {
      y: 0,
      opacity: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const getImageSizeClass = () => {
    switch (layoutMode) {
      case "monument":
      case "full-bleed":
        return "w-60 h-60 md:w-72 md:h-72";
      case "offset-small":
        return "w-32 h-32 md:w-40 md:h-40";
      case "triptych-side":
        return "w-40 h-40 md:w-44 md:h-44";
      default:
        return "w-48 h-48 md:w-56 md:h-56";
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative w-full flex flex-col items-center select-none"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      {/* Background geometric line coordinates */}
      <GeometricField categoryId={product.category} />

      {/* Portal Arch System */}
      <ArchFrame family={getArchFamily(product.category)} />

      {/* Main product scene composition (No rounded cards or borders) */}
      <div className="relative w-full h-[260px] md:h-[320px] flex items-center justify-center z-10">
        <div
          ref={imgWrapperRef}
          className={`relative ${getImageSizeClass()} flex items-center justify-center`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {imageError ? (
            /* Cinematic Fallback Silhouette (No generic card backgrounds) */
            <div className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center border border-crimson/10 shadow-[0_0_30px_rgba(217,33,33,0.1)]">
              <svg
                className="absolute w-4/5 h-4/5 text-crimson/25 animate-spin-slow"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.2"
              >
                <circle cx="50" cy="50" r="40" />
                <line x1="50" y1="0" x2="50" y2="100" />
                <line x1="0" y1="50" x2="100" y2="50" />
              </svg>
              <span className="font-condensed text-[8px] uppercase tracking-[0.25em] text-white/30 text-center px-4 leading-normal z-10">
                {product.name}
              </span>
            </div>
          ) : (
            /* Resolved candidates chain image */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={resolvedSrc}
              alt={product.name}
              className="w-full h-full object-contain filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.85)]"
              style={{ transform: "translateZ(30px)" }}
            />
          )}
        </div>
      </div>

      {/* Volcanic rock pedestal base */}
      <div className="w-full max-w-sm px-8 z-10 mt-[-10px]">
        <StoneStage variant={getStoneVariant(product.category)} />
      </div>

      {/* Details Typography */}
      <div className="relative w-full text-center mt-6 z-10 flex flex-col items-center">
        {/* Identifier Number */}
        {product.num && (
          <span className="font-condensed text-[9px] text-crimson tracking-[0.25em] uppercase font-bold block mb-1">
            {product.num.padStart(2, "0")}
          </span>
        )}

        {/* English Name */}
        <h3 className="font-condensed text-[16px] md:text-[18px] font-bold text-white tracking-[0.12em] uppercase leading-tight">
          {product.name}
        </h3>

        {/* Arabic Name */}
        <span
          dir="rtl"
          className="font-arabic text-[11px] md:text-[12px] text-crimson mt-0.5 block leading-normal font-medium"
        >
          {product.arabicName}
        </span>

        {/* Price / Calorie transition window */}
        <div className="h-12 mt-2 flex flex-col justify-end overflow-hidden">
          <div ref={priceRef} className="flex items-baseline justify-center space-x-1">
            <span className="font-condensed text-[18px] font-bold text-white">
              {selectedSize.price}
            </span>
            <span className="font-condensed text-[8px] uppercase tracking-widest text-white/50">
              SAR
            </span>
          </div>

          <div ref={calRef} className="text-[9px] tracking-wider text-white/40">
            {/* explicit nullable checks replacing truthy check */}
            {selectedSize.calories !== null ? (
              <>
                <span className="text-crimson font-medium mr-1 font-condensed">CAL.</span>
                <span className="font-condensed font-medium text-white/60">{selectedSize.calories}</span>
              </>
            ) : selectedSize.calorieNote ? (
              <span className="text-[8px] uppercase tracking-[0.1em] text-white/30">{selectedSize.calorieNote}</span>
            ) : (
              <span className="opacity-0">-</span>
            )}
          </div>
        </div>

        {/* Sizes Selector */}
        <ProductSizeSelector
          sizes={product.sizes}
          selectedIdx={sizeIdx}
          onChange={onSizeChange}
        />
      </div>
    </div>
  );
}
