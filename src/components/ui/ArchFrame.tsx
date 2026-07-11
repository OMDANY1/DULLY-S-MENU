"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ArchFrameProps {
  category: string;
  active?: boolean;
}

export default function ArchFrame({ category, active = true }: ArchFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Vary proportions subtly based on category
  const getArchPath = (cat: string) => {
    switch (cat) {
      case "hot-tea":
        // Tall and calm arch
        return "M 10,95 L 10,40 A 40,40 0 0,1 90,40 L 90,95";
      case "hot-tea-latte":
        // Wide, strong, monumental arch
        return "M 5,95 L 5,50 A 45,45 0 0,1 95,50 L 95,95";
      case "iced-tea":
        // Elongated and precise
        return "M 15,95 L 15,30 A 35,35 0 0,1 85,30 L 85,95";
      case "iced-japanese-tea":
        // Minimal and isolated, straight top corners rounded slightly or semi-circle
        return "M 12,95 L 12,35 A 38,38 0 0,1 88,35 L 88,95";
      case "iced-fruit-tea":
        // Organic curves
        return "M 8,95 L 8,45 A 42,42 0 0,1 92,45 L 92,95";
      case "iced-boba-milk-tea":
      case "iced-boba-milk":
        // Rhythmic geometry
        return "M 10,95 L 10,38 A 40,40 0 0,1 90,38 L 90,95";
      case "snow-ice":
        // Wide cold portal
        return "M 5,95 L 5,55 A 45,45 0 0,1 95,55 L 95,95";
      default:
        return "M 10,95 L 10,40 A 40,40 0 0,1 90,40 L 90,95";
    }
  };

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Get total length of path for drawing effect
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    if (active) {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2.0,
        ease: "power3.inOut",
        delay: 0.2,
      });
    }
  }, [active, category]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
    >
      <svg
        className="w-full h-full text-crimson/20 hover:text-crimson/50 transition-colors duration-500"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          ref={pathRef}
          className="arch-path"
          d={getArchPath(category)}
          stroke="currentColor"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
