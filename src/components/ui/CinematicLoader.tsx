"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CinematicLoaderProps {
  onComplete: () => void;
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const pathsRef = useRef<SVGSVGElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // OFFICIAL BRAND LOGO ANIMATION EXPLANATION:
  // We searched for the official brand logo JSON inside the project directory, but no such asset exists yet.
  // Standard local expected path: "/assets/logo-animation.json"
  // Thus, as instructed by P0, we STOP the logo-animation JSON integration and render a static typographic logo layout instead.

  useEffect(() => {
    if (reducedMotion) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: onComplete,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.0,
            ease: "power4.inOut",
            onComplete: onComplete,
          });
        },
      });

      // Initial state
      gsap.set(containerRef.current, { display: "flex" });
      gsap.set(dotRef.current, { scale: 0, opacity: 0 });
      gsap.set(circleRef.current, { strokeDasharray: 283, strokeDashoffset: 283, opacity: 0 });
      gsap.set(pathsRef.current, { opacity: 0, scale: 0.85 });
      gsap.set(logoRef.current, { opacity: 0, letterSpacing: "1.2em" });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.6 });

      // Step 1: Tiny red point appears
      tl.to(dotRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      });

      // Step 2: Dot fades as circle outline draws
      tl.to(dotRef.current, {
        scale: 0.2,
        opacity: 0,
        duration: 0.3,
      }, "+=0.1");

      tl.to(circleRef.current, {
        opacity: 0.8,
        strokeDashoffset: 0,
        duration: 0.8,
        ease: "power2.inOut",
      }, "<");

      // Step 3: Draw Japanese geometric outline grids
      tl.to(pathsRef.current, {
        opacity: 0.25,
        scale: 1,
        rotation: 30,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.2");

      // Step 4: Typographic Logo Reveal
      tl.to(logoRef.current, {
        opacity: 1,
        letterSpacing: "0.3em",
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.4");

      // Step 5: Red ambient backlight glow
      tl.to(glowRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.0,
        ease: "power2.out",
      }, "-=0.6");

      // Step 6: Visual compression before entering
      tl.to([logoRef.current, pathsRef.current, circleRef.current], {
        scale: 0.95,
        opacity: 0,
        duration: 0.5,
        ease: "power3.in",
      }, "+=0.2");

      tl.to(glowRef.current, {
        scale: 1.3,
        opacity: 0,
        duration: 0.5,
        ease: "power3.in",
      }, "<");
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[#060606] z-[99999] flex flex-col items-center justify-center select-none"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      {/* Background radial spotlight */}
      <div
        ref={glowRef}
        className="absolute w-[350px] h-[350px] rounded-full bg-crimson/15 blur-[100px] pointer-events-none z-0"
      />

      <div className="relative w-48 h-48 flex items-center justify-center z-10">
        {/* Central red point */}
        <div
          ref={dotRef}
          className="absolute w-2 h-2 bg-crimson rounded-full"
        />

        {/* Concentric circle draw */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            ref={circleRef}
            cx="50"
            cy="50"
            r="42"
            fill="transparent"
            stroke="#d92121"
            strokeWidth="0.4"
            strokeDasharray="264"
            strokeDashoffset="264"
          />
        </svg>

        {/* Abstract Japanese geometric grids */}
        <svg
          ref={pathsRef}
          className="absolute w-4/5 h-4/5 text-crimson/30"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.2"
        >
          <rect x="25" y="25" width="50" height="50" />
          <circle cx="50" cy="50" r="28" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="10" y1="50" x2="90" y2="50" />
        </svg>
      </div>

      {/* Typographic Logo */}
      <div className="absolute mt-36 z-10 text-center">
        <h1
          ref={logoRef}
          className="font-condensed text-[24px] md:text-[30px] font-bold text-white tracking-[0.3em] uppercase"
        >
          Dully&apos;s
        </h1>
      </div>
    </div>
  );
}
