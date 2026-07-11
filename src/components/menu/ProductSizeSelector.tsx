"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { MenuSize } from "@/domain/menu/types";

interface ProductSizeSelectorProps {
  sizes: MenuSize[];
  selectedIdx: number;
  onChange: (idx: number) => void;
}

export default function ProductSizeSelector({ sizes, selectedIdx, onChange }: ProductSizeSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeBtn = buttonsRef.current[selectedIdx];
    const line = lineRef.current;
    if (!activeBtn || !line) return;

    // Transition indicator line width and offset position using GSAP
    gsap.to(line, {
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [selectedIdx, sizes]);

  // If there's only one size (or grade Premium/Standard, which we want to select between too!),
  // we show the selector. If it's a single standard size, we hide it or show it disabled.
  if (sizes.length <= 1) return null;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center space-x-6 border-b border-white/5 pb-2 mt-4 select-none"
    >
      {sizes.map((size, idx) => (
        <button
          key={size.label}
          ref={(el) => { buttonsRef.current[idx] = el; }}
          onClick={() => onChange(idx)}
          className={`interactive-hover font-condensed text-[12px] uppercase tracking-[0.2em] pb-1 transition-colors duration-300 ${
            idx === selectedIdx ? "text-white font-bold" : "text-white/40 hover:text-white/80"
          }`}
          data-cursor-text="Select"
        >
          {size.label}
        </button>
      ))}

      {/* Sliding Underline indicator */}
      <div
        ref={lineRef}
        className="absolute bottom-0 h-[1.5px] bg-crimson"
        style={{ left: 0, width: 0 }}
      />
    </div>
  );
}
