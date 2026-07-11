"use client";

import { useEffect, useRef, useState } from "react";
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
  const pctRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setProgress(100);
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
            duration: 1.2,
            ease: "power4.inOut",
            onComplete: onComplete,
          });
        },
      });

      // Initial state
      gsap.set(containerRef.current, { display: "flex" });
      gsap.set(dotRef.current, { scale: 0, opacity: 0 });
      gsap.set(circleRef.current, { strokeDasharray: 1000, strokeDashoffset: 1000, opacity: 0 });
      gsap.set(pathsRef.current, { opacity: 0, scale: 0.8 });
      gsap.set(logoRef.current, { opacity: 0, letterSpacing: "1.5em" });
      gsap.set(pctRef.current, { opacity: 0, y: 20 });
      gsap.set(glowRef.current, { opacity: 0, scale: 0.5 });

      // Step 1: Tiny red point appears
      tl.to(dotRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      });

      // Step 2: Dot expands into circle and draws itself
      tl.to(dotRef.current, {
        scale: 0.2,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
      }, "+=0.2");

      tl.to(circleRef.current, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.inOut",
      }, "<");

      // Step 3: Draw Japanese geometric pattern and count progress
      tl.to(pathsRef.current, {
        opacity: 0.4,
        scale: 1,
        duration: 1.0,
        ease: "power3.out",
      }, "-=0.3");

      tl.to(pctRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "<");

      // Count percentage to 100
      const countObj = { val: 0 };
      tl.to(countObj, {
        val: 100,
        duration: 2.2,
        ease: "power1.inOut",
        onUpdate: () => {
          setProgress(Math.floor(countObj.val));
          gsap.set(pathsRef.current, { rotation: countObj.val * 0.9 });
          if (circleRef.current) {
            gsap.set(circleRef.current, { strokeDashoffset: (100 - countObj.val) * 10 });
          }
        },
      });

      // Step 4: Logo reveal
      tl.to(logoRef.current, {
        opacity: 1,
        letterSpacing: "0.4em",
        duration: 1.5,
        ease: "power3.out",
      }, "-=1.5");

      // Step 5: Red atmospheric glow breathes behind the logo
      tl.to(glowRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        ease: "power2.out",
      }, "-=1.0");

      // Final ritual compression before opening
      tl.to([logoRef.current, pathsRef.current, circleRef.current, pctRef.current], {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: "power4.in",
      }, "+=0.3");

      tl.to(glowRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.8,
        ease: "power4.in",
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
      {/* Background Red Glow */}
      <div
        ref={glowRef}
        className="absolute w-[450px] h-[450px] rounded-full bg-crimson/15 blur-[120px] pointer-events-none z-0"
      />

      {/* Circle & Japanese Construction lines */}
      <div className="relative w-64 h-64 flex items-center justify-center z-10">
        {/* Tiny Red Dot */}
        <div
          ref={dotRef}
          className="absolute w-2 h-2 bg-crimson rounded-full"
        />

        {/* SVG Circle Drawing */}
        <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            ref={circleRef}
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="#d92121"
            strokeWidth="0.5"
            strokeDasharray="283"
            strokeDashoffset="283"
          />
        </svg>

        {/* Japanese construction lines */}
        <svg
          ref={pathsRef}
          className="absolute w-4/5 h-4/5 text-crimson/30"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.25"
        >
          <rect x="20" y="20" width="60" height="60" />
          <circle cx="50" cy="50" r="30" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="20" y1="20" x2="80" y2="80" />
          <line x1="80" y1="20" x2="20" y2="80" />
        </svg>

        {/* Loading percentage */}
        <div
          ref={pctRef}
          className="absolute bottom-[-60px] font-condensed tracking-[0.25em] text-[10px] text-white/50"
        >
          {progress}%
        </div>
      </div>

      {/* DULLY'S Identity Logo */}
      <div className="absolute mt-48 z-10 text-center">
        <h1
          ref={logoRef}
          className="font-condensed text-[32px] md:text-[40px] font-bold text-white tracking-[0.4em] uppercase"
        >
          Dully&apos;s
        </h1>
        <p className="text-[9px] font-condensed tracking-[0.5em] text-crimson uppercase mt-2 opacity-50">
          Contemporary Tea ritual
        </p>
      </div>
    </div>
  );
}
