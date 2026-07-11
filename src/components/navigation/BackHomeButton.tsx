"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function BackHomeButton() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const housePathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const path = housePathRef.current;
    if (!button || !path) return;

    // Hover animation
    const onMouseEnter = () => {
      gsap.to(button, {
        x: -4,
        duration: 0.3,
        ease: "power2.out",
      });
      // Morph or shift path slightly
      gsap.to(path, {
        strokeDashoffset: 10,
        fill: "rgba(217, 33, 33, 0.4)",
        duration: 0.3,
      });
    };

    const onMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(path, {
        strokeDashoffset: 0,
        fill: "rgba(217, 33, 33, 0.15)",
        duration: 0.4,
      });
    };

    button.addEventListener("mouseenter", onMouseEnter);
    button.addEventListener("mouseleave", onMouseLeave);

    return () => {
      button.removeEventListener("mouseenter", onMouseEnter);
      button.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <Link
      href="/"
      ref={buttonRef}
      className="interactive-hover flex items-center space-x-3 select-none py-2 px-4 border border-white/5 rounded-full bg-charcoal/20 hover:border-crimson/30 hover:bg-charcoal/40 transition-all duration-300 group"
      data-cursor-text="Go Home"
    >
      {/* Original Architectural Japanese house inspired icon */}
      <svg
        className="w-5 h-5 text-white group-hover:text-crimson transition-colors duration-300"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          ref={housePathRef}
          d="M 50,10 L 15,45 L 25,45 L 25,90 L 75,90 L 75,45 L 85,45 Z"
          fill="rgba(217, 33, 33, 0.15)"
          stroke="#ffffff"
          className="transition-colors duration-300"
          style={{ strokeDasharray: "400", strokeDashoffset: "0" }}
        />
        {/* Architectural central pillar */}
        <line x1="50" y1="45" x2="50" y2="90" stroke="var(--crimson)" strokeWidth="5" />
      </svg>

      <div className="flex flex-col text-left">
        <span className="font-condensed text-[9px] uppercase tracking-[0.25em] text-white/50 group-hover:text-white transition-colors">
          Back
        </span>
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[0.15em] text-white">
          To Home
        </span>
      </div>
    </Link>
  );
}
