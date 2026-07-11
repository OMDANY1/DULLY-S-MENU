"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface GeometricFieldProps {
  categoryId: string;
  active?: boolean;
}

export default function GeometricField({ categoryId, active = true }: GeometricFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout paths based on category visual profile
  const renderFieldLines = () => {
    switch (categoryId) {
      case "hot-tea":
        // Quiet, meditative vertical straight line guides
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15">
            <line x1="20" y1="0" x2="20" y2="100" />
            <line x1="50" y1="0" x2="50" y2="100" strokeDasharray="2 2" />
            <line x1="80" y1="0" x2="80" y2="100" />
            <circle cx="50" cy="50" r="10" />
          </svg>
        );
      case "hot-tea-latte":
        // Thick massive brackets and offsets
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.2">
            <rect x="10" y="10" width="80" height="80" />
            <rect x="15" y="15" width="70" height="70" strokeDasharray="1 3" />
            <line x1="10" y1="50" x2="90" y2="50" />
          </svg>
        );
      case "iced-tea":
      case "iced-boba-milk-tea":
      case "iced-boba-milk":
        // Boba circles array / rhythmic coordinates grid
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15">
            <g>
              {Array.from({ length: 5 }).map((_, i) => (
                <g key={i}>
                  <circle cx={20 + i * 15} cy="25" r="3" />
                  <circle cx={20 + i * 15} cy="50" r="3" />
                  <circle cx={20 + i * 15} cy="75" r="3" />
                </g>
              ))}
            </g>
            <line x1="0" y1="25" x2="100" y2="25" />
            <line x1="0" y1="50" x2="100" y2="50" />
            <line x1="0" y1="75" x2="100" y2="75" />
          </svg>
        );
      case "iced-japanese-tea":
        // Fine line lattices, Shoji vertical grids
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.1">
            <line x1="10" y1="0" x2="10" y2="100" />
            <line x1="30" y1="0" x2="30" y2="100" />
            <line x1="50" y1="0" x2="50" y2="100" />
            <line x1="70" y1="0" x2="70" y2="100" />
            <line x1="90" y1="0" x2="90" y2="100" />
            <line x1="0" y1="50" x2="100" y2="50" strokeWidth="0.2" />
          </svg>
        );
      case "iced-fruit-tea":
        // Flowing curves
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15">
            <path d="M 0,20 Q 30,50 50,50 Q 70,50 100,80" />
            <path d="M 0,80 Q 30,50 50,50 Q 70,50 100,20" />
            <circle cx="50" cy="50" r="15" />
          </svg>
        );
      case "snow-ice":
        // Hexagonal crystalline lattices
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15">
            <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" />
            <line x1="50" y1="15" x2="50" y2="85" />
            <line x1="20" y1="32.5" x2="80" y2="67.5" />
            <line x1="20" y1="67.5" x2="80" y2="32.5" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full text-crimson/5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.15">
            <line x1="50" y1="0" x2="50" y2="100" />
            <line x1="0" y1="50" x2="100" y2="50" />
          </svg>
        );
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (active) {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
      );
    } else {
      gsap.to(el, { opacity: 0, scale: 0.98, duration: 0.5 });
    }
  }, [categoryId, active]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[1] select-none flex items-center justify-center p-12 overflow-hidden"
    >
      {renderFieldLines()}
    </div>
  );
}
