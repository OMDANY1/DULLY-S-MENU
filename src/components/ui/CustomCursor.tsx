"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect touch device
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Enable cursor class on body
    document.body.classList.add("custom-cursor-active");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Set initial position out of screen
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    // GSAP quickTo for smooth lagging ring
    const xTo = gsap.quickTo(ring, "x", { duration: 0.2, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.2, ease: "power3.out" });

    // Dot is immediate
    const dotX = gsap.quickTo(dot, "x", { duration: 0.05, ease: "power1.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.05, ease: "power1.out" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);

    // Hover state management
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], input, select, textarea, .interactive-hover");
      if (interactive) {
        // Expand ring, change color
        gsap.to(ring, {
          scale: 1.8,
          borderColor: "#d92121",
          backgroundColor: "rgba(217, 33, 33, 0.05)",
          duration: 0.2,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.5,
          backgroundColor: "#d92121",
          duration: 0.2,
        });

        // Add special cursor text if element has data-cursor-text
        const textAttr = interactive.getAttribute("data-cursor-text");
        if (textAttr && ring) {
          ring.innerHTML = `<span class="text-[8px] font-condensed tracking-widest text-crimson uppercase font-bold">${textAttr}</span>`;
          gsap.set(ring, { width: 60, height: 60 });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactive = target.closest("a, button, [role='button'], input, select, textarea, .interactive-hover");
      if (interactive) {
        // Reset ring
        gsap.to(ring, {
          scale: 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
          backgroundColor: "transparent",
          duration: 0.2,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: "#ffffff",
          duration: 0.2,
        });
        ring.innerHTML = "";
        gsap.set(ring, { width: 24, height: 24 });
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
        className="pointer-events-none fixed top-0 left-0 w-6 h-6 rounded-full border border-white/30 z-[9999] flex items-center justify-center transition-transform duration-75 mix-blend-difference"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full z-[10000] mix-blend-difference"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
