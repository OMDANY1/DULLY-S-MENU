"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface CategoryGlyphProps {
  categoryId: string;
  active?: boolean;
}

export default function CategoryGlyph({ categoryId, active = true }: CategoryGlyphProps) {
  const glyphRef = useRef<SVGSVGElement>(null);

  // Return the SVG content for the category glyph
  const renderGlyphContent = () => {
    switch (categoryId) {
      case "hot-tea":
        // Meditative circles + axis lines
        return (
          <>
            <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="25" />
            <line x1="50" y1="5" x2="50" y2="95" />
            <line x1="5" y1="50" x2="95" y2="50" />
          </>
        );
      case "hot-tea-latte":
        // Monumental squares & divided circles
        return (
          <>
            <rect x="20" y="20" width="60" height="60" />
            <circle cx="50" cy="50" r="30" />
            <line x1="20" y1="50" x2="80" y2="50" />
            <line x1="50" y1="20" x2="50" y2="80" />
          </>
        );
      case "iced-tea":
        // Boba lattice (diamond grid with circles)
        return (
          <>
            <path d="M 50,10 L 90,50 L 50,90 L 10,50 Z" />
            <circle cx="50" cy="50" r="8" fill="currentColor" fillOpacity="0.1" />
            <circle cx="50" cy="10" r="3" fill="currentColor" />
            <circle cx="90" cy="50" r="3" fill="currentColor" />
            <circle cx="50" cy="90" r="3" fill="currentColor" />
            <circle cx="10" cy="50" r="3" fill="currentColor" />
          </>
        );
      case "iced-japanese-tea":
        // Ceremonial Shoji shoji lattices
        return (
          <>
            <rect x="15" y="15" width="70" height="70" />
            <line x1="38" y1="15" x2="38" y2="85" />
            <line x1="62" y1="15" x2="62" y2="85" />
            <line x1="15" y1="38" x2="85" y2="38" />
            <line x1="15" y1="62" x2="85" y2="62" />
          </>
        );
      case "iced-fruit-tea":
        // Overlapping petal arcs
        return (
          <>
            <path d="M 50,15 A 35,35 0 0,0 15,50 A 35,35 0 0,0 50,85 A 35,35 0 0,0 85,50 A 35,35 0 0,0 50,15 Z" />
            <path d="M 50,25 Q 25,50 50,75 Q 75,50 50,25 Z" fill="currentColor" fillOpacity="0.05" />
          </>
        );
      case "iced-boba-milk-tea":
      case "iced-boba-milk":
        // Concentric pearl circles
        return (
          <>
            <circle cx="50" cy="50" r="42" />
            <circle cx="50" cy="50" r="28" />
            <circle cx="50" cy="50" r="14" />
            <line x1="50" y1="8" x2="50" y2="92" strokeDasharray="3 3" />
          </>
        );
      case "special-drinks":
        // Asymmetric offset lines
        return (
          <>
            <rect x="10" y="25" width="80" height="50" />
            <line x1="30" y1="25" x2="30" y2="75" />
            <line x1="70" y1="25" x2="70" y2="75" />
            <line x1="10" y1="40" x2="90" y2="40" />
            <circle cx="50" cy="50" r="10" />
          </>
        );
      case "snow-ice":
        // Crystalline hexagonal trusses
        return (
          <>
            <path d="M 50,5 L 89,27.5 L 89,72.5 L 50,95 L 11,72.5 L 11,27.5 Z" />
            <line x1="50" y1="5" x2="50" y2="95" />
            <line x1="11" y1="27.5" x2="89" y2="72.5" />
            <line x1="11" y1="72.5" x2="89" y2="27.5" />
          </>
        );
      case "mojitos":
        // Triangles and zesty geometric intersections
        return (
          <>
            <path d="M 50,10 L 90,80 L 10,80 Z" />
            <circle cx="50" cy="53" r="20" />
            <line x1="50" y1="10" x2="50" y2="80" />
          </>
        );
      default:
        return (
          <>
            <circle cx="50" cy="50" r="40" />
            <line x1="50" y1="10" x2="50" y2="90" />
          </>
        );
    }
  };

  useEffect(() => {
    const glyph = glyphRef.current;
    if (!glyph) return;

    // Self-drawing paths inside SVG
    const paths = glyph.querySelectorAll("path, line, rect, circle");
    paths.forEach((path) => {
      const el = path as SVGGeometryElement;
      const length = el.getTotalLength?.() || 300;
      gsap.set(el, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

    if (active) {
      paths.forEach((path, idx) => {
        const el = path as SVGGeometryElement;
        gsap.to(el, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.out",
          delay: idx * 0.08,
        });
      });
    }
  }, [categoryId, active]);

  return (
    <svg
      ref={glyphRef}
      className="w-full h-full text-crimson"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
    >
      {renderGlyphContent()}
    </svg>
  );
}
