"use client";

import React from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AtmosphereProps {
  profile:
    | "hot-tea"
    | "hot-tea-latte"
    | "iced-tea"
    | "iced-japanese-tea"
    | "iced-fruit-tea"
    | "iced-boba-milk-tea"
    | "iced-boba-milk"
    | "snow-ice"
    | "mojitos"
    | "special-drinks";
  color?: string;
}

export default function Atmosphere({ profile, color }: AtmosphereProps) {
  const reducedMotion = useReducedMotion();

  // Determine local light accents
  const getGlowColor = () => {
    if (color) return color;
    switch (profile) {
      case "hot-tea-latte":
        return "rgba(217, 33, 33, 0.28)"; // Heavy spotlight
      case "iced-japanese-tea":
        return "rgba(217, 33, 33, 0.08)"; // Minimal light
      case "iced-fruit-tea":
        return "rgba(217, 33, 33, 0.12)"; // Organic glow
      case "snow-ice":
        return "rgba(255, 255, 255, 0.05)"; // Cold white glow
      default:
        return "rgba(217, 33, 33, 0.16)"; // Standard crimson glow
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Background Radial Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full blur-[110px] transition-all duration-1000 ${
          reducedMotion ? "opacity-30" : "animate-glow-breathe"
        }`}
        style={{
          backgroundColor: getGlowColor(),
        }}
      />

      {/* SVG Displacement Filter block for realistic organic fog/smoke */}
      {!reducedMotion && (
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <filter id="proceduralAtmosphere">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="60"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Procedural organic smoke/steam layer (disabled under reduced-motion) */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 opacity-20 filter"
          style={{ filter: "url(#proceduralAtmosphere)" }}
        >
          {/* Steam / Smoke Columns */}
          {(profile === "hot-tea" || profile === "hot-tea-latte") && (
            <>
              {/* Foreground drifting cloud */}
              <div
                className="absolute bottom-12 left-[15%] w-60 h-60 rounded-full bg-crimson/20 animate-smoke-1 filter blur-[20px]"
                style={{ animationDuration: "14s" }}
              />
              {/* Background drifting cloud */}
              <div
                className="absolute bottom-24 right-[20%] w-72 h-72 rounded-full bg-crimson/15 animate-smoke-2 filter blur-[25px]"
                style={{ animationDuration: "18s" }}
              />
            </>
          )}

          {/* Low-lying crawling mist (Snow Ice / cold drinks) */}
          {(profile === "snow-ice" ||
            profile === "iced-tea" ||
            profile === "iced-fruit-tea" ||
            profile === "mojitos" ||
            profile === "iced-boba-milk" ||
            profile === "iced-boba-milk-tea") && (
            <>
              <div
                className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white/10 to-transparent filter blur-[15px] animate-smoke-1"
                style={{ animationDuration: "16s" }}
              />
              <div
                className="absolute bottom-2 left-10 right-10 h-20 bg-gradient-to-t from-crimson/15 to-transparent filter blur-[20px] animate-smoke-2"
                style={{ animationDuration: "22s" }}
              />
            </>
          )}
        </div>
      )}

      {/* Reduced-motion static fallback overlay */}
      {reducedMotion && (
        <div className="absolute inset-0 bg-repeat noise-overlay opacity-[0.02] mix-blend-overlay" />
      )}
    </div>
  );
}
