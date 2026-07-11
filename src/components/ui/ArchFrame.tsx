"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type ArchFamily =
  | "NARROW_TEA"
  | "MONUMENTAL_LATTE"
  | "TRIPLE_PORTAL"
  | "PRECISION_ICE"
  | "CEREMONIAL_JAPAN"
  | "ORGANIC_FRUIT"
  | "RHYTHMIC_BOBA"
  | "CRYSTALLINE_SNOW";

export function getArchFamily(categoryId: string): ArchFamily {
  switch (categoryId) {
    case "hot-tea":
      return "NARROW_TEA";
    case "hot-tea-latte":
      return "MONUMENTAL_LATTE";
    case "iced-tea":
      return "RHYTHMIC_BOBA";
    case "iced-japanese-tea":
      return "CEREMONIAL_JAPAN";
    case "iced-fruit-tea":
      return "ORGANIC_FRUIT";
    case "iced-boba-milk-tea":
    case "iced-boba-milk":
      return "TRIPLE_PORTAL";
    case "snow-ice":
      return "CRYSTALLINE_SNOW";
    case "special-drinks":
      return "PRECISION_ICE";
    default:
      return "NARROW_TEA";
  }
}

interface ArchFrameProps {
  family: ArchFamily;
  active?: boolean;
}

export default function ArchFrame({ family, active = true }: ArchFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef1 = useRef<SVGPathElement>(null);
  const pathRef2 = useRef<SVGPathElement>(null);
  const pathRef3 = useRef<SVGPathElement>(null);

  // Return the SVG paths and geometry based on the family type
  const getArchPaths = () => {
    switch (family) {
      case "NARROW_TEA":
        return {
          path1: "M 15,98 L 15,35 A 35,35 0 0,1 85,35 L 85,98", // Narrow gothic-like arch
          path2: "M 20,98 L 20,38 A 30,30 0 0,1 80,38 L 80,98", // Nested inner arch
          path3: "M 50,5 L 50,95", // Slender central axis line
        };
      case "MONUMENTAL_LATTE":
        return {
          path1: "M 5,98 L 5,50 A 45,45 0 0,1 95,50 L 95,98", // Wide monument arch
          path2: "M 10,98 L 10,53 A 40,40 0 0,1 90,53 L 90,98", // Inner offset
          path3: "M 5,50 L 95,50", // Horizontal baseline crossing
        };
      case "TRIPLE_PORTAL":
        return {
          path1: "M 10,98 L 10,40 A 40,40 0 0,1 90,40 L 90,98", // Concentric 1
          path2: "M 18,98 L 18,46 A 32,32 0 0,1 82,46 L 82,98", // Concentric 2
          path3: "M 26,98 L 26,52 A 24,24 0 0,1 74,52 L 74,98", // Concentric 3
        };
      case "PRECISION_ICE":
        return {
          path1: "M 12,98 L 12,30 A 38,38 0 0,1 88,30 L 88,98", // Ice arch
          path2: "M 12,30 L 88,30", // Corner brace
          path3: "M 50,15 L 50,45 M 35,30 L 65,30", // Precision crosshair
        };
      case "CEREMONIAL_JAPAN":
        return {
          path1: "M 15,98 L 15,40 A 35,35 0 0,1 85,40 L 85,98", // Base portal
          path2: "M 5,30 L 95,30", // Torii horizontal top beam
          path3: "M 5,22 L 95,22", // Torii secondary parallel top beam
        };
      case "ORGANIC_FRUIT":
        return {
          path1: "M 8,98 Q 15,35 50,35 Q 85,35 92,98", // Wave curves
          path2: "M 14,98 Q 20,42 50,42 Q 80,42 86,98",
          path3: "M 50,20 A 15,15 0 0,1 50,50 A 15,15 0 0,1 50,20 Z", // Central circle float
        };
      case "RHYTHMIC_BOBA":
        return {
          path1: "M 12,98 L 12,42 A 38,38 0 0,1 88,42 L 88,98", // Rhythmic arch
          path2: "M 50,42 A 8,8 0 1,1 50,41", // Center circle (Pearl)
          path3: "M 50,75 A 6,6 0 1,1 50,74", // Bottom circle (Pearl)
        };
      case "CRYSTALLINE_SNOW":
        return {
          path1: "M 10,98 L 10,50 L 30,30 L 70,30 L 90,50 L 90,98", // Hexagonal facet frame
          path2: "M 15,98 L 15,52 L 32,35 L 68,35 L 85,52 L 85,98", // Facet inner
          path3: "M 30,30 L 50,50 L 70,30", // Diagonal crystalline trusses
        };
      default:
        return {
          path1: "M 10,98 L 10,40 A 40,40 0 0,1 90,40 L 90,98",
          path2: "",
          path3: "",
        };
    }
  };

  const paths = getArchPaths();

  useEffect(() => {
    const p1 = pathRef1.current;
    const p2 = pathRef2.current;
    const p3 = pathRef3.current;

    const items = [p1, p2, p3].filter(Boolean) as SVGPathElement[];

    const ctx = gsap.context(() => {
      items.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

      if (active) {
        items.forEach((path, idx) => {
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.5 + idx * 0.4,
            ease: "power2.inOut",
            delay: 0.15 + idx * 0.1,
          });
        });
      }
    });

    return () => ctx.revert();
  }, [active, family]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center select-none"
    >
      <svg
        className="w-full h-full text-crimson/15 group-hover:text-crimson/35 transition-colors duration-700"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        {paths.path1 && (
          <path
            ref={pathRef1}
            d={paths.path1}
            stroke="currentColor"
            strokeWidth="0.25"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {paths.path2 && (
          <path
            ref={pathRef2}
            d={paths.path2}
            stroke="currentColor"
            strokeWidth="0.2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {paths.path3 && (
          <path
            ref={pathRef3}
            d={paths.path3}
            stroke="currentColor"
            strokeWidth="0.15"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
