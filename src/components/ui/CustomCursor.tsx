"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    // Detect touch device or pointer precision coarse
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    // Enable cursor lock class on body
    document.body.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Set initial position out of screen bounds
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // GSAP quickTo for smooth pointer tracking
    const xTo = gsap.quickTo(ring, "x", { duration: 0.18, ease: "power2.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.18, ease: "power2.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.04, ease: "power1.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.04, ease: "power1.out" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);

    // Hover state observer
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], input, select, textarea, .interactive-hover");
      if (interactive) {
        gsap.to(ring, {
          scale: 1.6,
          borderColor: "#d92121",
          backgroundColor: "rgba(217, 33, 33, 0.05)",
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.3,
          backgroundColor: "#d92121",
          duration: 0.25,
        });

        // Set React-rendered state label instead of modifying innerHTML
        const label = interactive.getAttribute("data-cursor-text");
        if (label) {
          setCursorText(label);
          gsap.to(ring, { width: 52, height: 52, duration: 0.2 });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], input, select, textarea, .interactive-hover");
      if (interactive) {
        gsap.to(ring, {
          scale: 1,
          borderColor: "rgba(255, 255, 255, 0.25)",
          backgroundColor: "transparent",
          duration: 0.25,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: "#ffffff",
          duration: 0.25,
        });
        setCursorText("");
        gsap.to(ring, { width: 24, height: 24, duration: 0.2 });
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 w-6 h-6 rounded-full border border-white/25 z-[9999] flex items-center justify-center pointer-events-none"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      >
        {cursorText && (
          <span className="font-condensed text-[7px] font-bold tracking-widest text-crimson uppercase">
            {cursorText}
          </span>
        )}
      </div>
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full z-[10000] pointer-events-none mix-blend-difference"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
