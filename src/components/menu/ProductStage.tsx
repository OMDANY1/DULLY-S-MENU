"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { MenuItem } from "@/data/menu";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getProductAssetCandidates } from "@/lib/productAssets";
import { imageCurtain } from "@/lib/motion";
import ProductSizeSelector from "./ProductSizeSelector";

// ==========================================
// 1. PRODUCT VISUAL PRIMITIVE
// ==========================================
interface ProductVisualProps {
  product: MenuItem;
  sizeLabel: string;
  imageClass?: string;
}

export function ProductVisual({ product, sizeLabel, imageClass = "" }: ProductVisualProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reducedMotion = useReducedMotion();

  // Load and resolve size-specific candidates sequentially with curtain sweep
  useEffect(() => {
    let active = true;
    const candidates = getProductAssetCandidates(product.id, sizeLabel);
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

        // Perform premium curtain sweep transition on size swap
        if (imgRef.current && curtainRef.current && resolvedSrc && !reducedMotion) {
          imageCurtain(
            curtainRef.current,
            imgRef.current,
            () => {
              if (active) {
                setResolvedSrc(candidatePath);
                setImageError(false);
              }
            }
          );
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
  }, [product.id, sizeLabel, resolvedSrc, reducedMotion]);

  // Pointer Parallax quickTo
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const xTo = gsap.quickTo(container, "x", { duration: 0.4, ease: "power2.out" });
    const yTo = gsap.quickTo(container, "y", { duration: 0.4, ease: "power2.out" });
    const rotYTo = gsap.quickTo(container, "rotationY", { duration: 0.4, ease: "power2.out" });
    const rotXTo = gsap.quickTo(container, "rotationX", { duration: 0.4, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      xTo(x * 25);
      yTo(y * 25);
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

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${imageClass}`}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      {/* Visual sweep transition curtain overlay */}
      <div
        ref={curtainRef}
        className="absolute inset-0 bg-crimson z-20 pointer-events-none"
        style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }}
      />

      {imageError ? (
        /* Restrained missing-asset locator (No generic rotating targets) */
        <div className="relative w-36 h-36 flex flex-col items-center justify-center border-l border-crimson/30 px-4">
          <div className="w-[1px] h-12 bg-crimson mb-2" />
          <span className="font-condensed text-[9px] uppercase tracking-[0.25em] text-white/30 text-center leading-normal">
            {product.name}
          </span>
          <span className="text-[7px] font-condensed tracking-widest text-crimson/50 uppercase mt-1">
            Locator {product.num || "00"}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={resolvedSrc}
          alt={product.name}
          className="w-full h-full object-contain filter drop-shadow-[0_24px_32px_rgba(0,0,0,0.9)]"
          style={{ transform: "translateZ(30px)" }}
        />
      )}
    </div>
  );
}

// ==========================================
// 2. PRODUCT IDENTITY PRIMITIVE
// ==========================================
interface ProductIdentityProps {
  num: string | null;
  name: string;
  arabicName: string;
  align?: "center" | "left" | "right" | "vertical";
}

export function ProductIdentity({ num, name, arabicName, align = "center" }: ProductIdentityProps) {
  const isVertical = align === "vertical";
  
  const alignClass =
    align === "left"
      ? "text-left items-start"
      : align === "right"
      ? "text-right items-end"
      : "text-center items-center";

  if (isVertical) {
    return (
      <div className="relative flex flex-col items-start text-left select-none pl-4 border-l border-white/5">
        {num && (
          <span className="font-condensed text-[10px] text-crimson tracking-[0.25em] uppercase font-bold block mb-2">
            {num.padStart(2, "0")}
          </span>
        )}
        {/* Vertical lettering for English */}
        <h3 
          className="font-condensed text-[24px] md:text-[32px] font-black text-white tracking-[0.2em] uppercase leading-none"
          style={{ writingMode: "vertical-lr" }}
        >
          {name}
        </h3>
        <span className="font-arabic text-[12px] text-crimson mt-4 block leading-normal font-medium">
          {arabicName}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col select-none ${alignClass}`}>
      {num && (
        <span className="font-condensed text-[9px] text-crimson tracking-[0.25em] uppercase font-bold block mb-1">
          {num.padStart(2, "0")}
        </span>
      )}
      <h3 className="font-condensed text-[16px] md:text-[20px] font-bold text-white tracking-[0.12em] uppercase leading-tight">
        {name}
      </h3>
      <span dir="rtl" className="font-arabic text-[11px] md:text-[12px] text-crimson mt-0.5 block leading-normal font-medium">
        {arabicName}
      </span>
    </div>
  );
}

// ==========================================
// 3. PRODUCT PRICE PRIMITIVE
// ==========================================
interface ProductPriceProps {
  price: number;
  align?: "center" | "left" | "right";
  size?: "standard" | "large";
}

export function ProductPrice({ price, align = "center", size = "standard" }: ProductPriceProps) {
  const alignClass =
    align === "left"
      ? "justify-start text-left"
      : align === "right"
      ? "justify-end text-right"
      : "justify-center text-center";

  const sizeClass = size === "large" ? "text-[26px] md:text-[36px]" : "text-[18px] md:text-[22px]";

  return (
    <div className={`flex items-baseline select-none ${alignClass} ${sizeClass} font-condensed font-bold text-white`}>
      <span>{price}</span>
      <span className="text-[9px] uppercase tracking-widest text-white/40 ml-1.5 font-medium">
        SAR
      </span>
    </div>
  );
}

// ==========================================
// 4. PRODUCT CALORIES PRIMITIVE
// ==========================================
interface ProductCaloriesProps {
  calories: number | null;
  calorieNote?: string | null;
  align?: "center" | "left" | "right";
}

export function ProductCalories({ calories, calorieNote, align = "center" }: ProductCaloriesProps) {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : "text-center";

  return (
    <div className={`text-[9px] tracking-wider text-white/40 select-none ${alignClass}`}>
      {calories !== null ? (
        <>
          <span className="text-crimson font-medium mr-1 font-condensed">CAL.</span>
          <span className="font-condensed font-medium text-white/60">{calories}</span>
        </>
      ) : calorieNote ? (
        <span className="text-[8px] uppercase tracking-[0.1em] text-white/30">{calorieNote}</span>
      ) : (
        <span className="opacity-0">-</span>
      )}
    </div>
  );
}

// ==========================================
// 5. COMPOSITE DEFAULT PRODUCTSTAGE
// ==========================================
interface ProductStageProps {
  product: MenuItem;
}

export default function ProductStage({ product }: ProductStageProps) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const selectedSize = product.sizes[sizeIdx];

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Product Image Stage (No background containers or borders) */}
      <ProductVisual
        product={product}
        sizeLabel={selectedSize.label}
        imageClass="w-48 h-48 md:w-56 md:h-56"
      />

      {/* Identity block */}
      <div className="relative w-full text-center mt-6 z-10 flex flex-col items-center">
        <ProductIdentity
          num={product.num}
          name={product.name}
          arabicName={product.arabicName}
          align="center"
        />

        {/* Price / Calories block */}
        <div className="h-12 mt-2 flex flex-col justify-end overflow-hidden">
          <ProductPrice price={selectedSize.price} align="center" />
          <ProductCalories
            calories={selectedSize.calories}
            calorieNote={selectedSize.calorieNote}
            align="center"
          />
        </div>

        {/* Sizes Selector */}
        <ProductSizeSelector
          sizes={product.sizes}
          selectedIdx={sizeIdx}
          onChange={setSizeIdx}
        />
      </div>
    </div>
  );
}
