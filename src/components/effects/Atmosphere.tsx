"use client";

import React from "react";

interface AtmosphereProps {
  profile: "hot-tea" | "hot-tea-latte" | "iced-tea" | "iced-japanese-tea" | "iced-fruit-tea" | "snow-ice" | "mojitos";
  color?: string; // Optional custom local light color overrides (e.g. green for matcha, amber for thai)
}

export default function Atmosphere({ profile, color }: AtmosphereProps) {
  // Determine gradient color based on profile or custom color overrides
  const getGlowColor = () => {
    if (color) return color;
    switch (profile) {
      case "hot-tea-latte":
        return "rgba(217, 33, 33, 0.22)"; // Heavy spotlight crimson
      case "iced-japanese-tea":
        return "rgba(217, 33, 33, 0.08)"; // Minimal light
      case "iced-fruit-tea":
        return "rgba(217, 33, 33, 0.12)"; // Organic glow
      case "snow-ice":
        return "rgba(255, 255, 255, 0.06)"; // Colder white/red spotlight glow
      default:
        return "rgba(217, 33, 33, 0.16)"; // Standard crimson glow
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full blur-[100px] animate-glow-breathe transition-all duration-700"
        style={{
          backgroundColor: getGlowColor(),
        }}
      />

      {/* Steam effect for Hot Tea */}
      {profile === "hot-tea" && (
        <div className="absolute inset-x-0 top-1/4 bottom-16 opacity-30 flex justify-center space-x-12">
          {/* Layered steam curves */}
          <div className="w-1.5 h-full bg-gradient-to-t from-white/30 via-white/5 to-transparent rounded-full filter blur-[6px] animate-steam-1" />
          <div className="w-2 h-full bg-gradient-to-t from-white/20 via-white/5 to-transparent rounded-full filter blur-[8px] animate-steam-2" />
        </div>
      )}

      {/* Heavy Red Smoke for Hot Tea Latte */}
      {profile === "hot-tea-latte" && (
        <div className="absolute inset-0 opacity-25">
          <div
            className="absolute top-1/2 left-1/4 w-[160px] h-[160px] rounded-full filter blur-[35px] animate-smoke-1"
            style={{ backgroundColor: "rgba(217, 33, 33, 0.3)" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-[180px] h-[180px] rounded-full filter blur-[40px] animate-smoke-2"
            style={{ backgroundColor: "rgba(217, 33, 33, 0.25)" }}
          />
        </div>
      )}

      {/* Cold Mist for Snow Ice */}
      {profile === "snow-ice" && (
        <div className="absolute inset-x-0 bottom-8 h-20 opacity-20">
          {/* Low lying creeping cold mist */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/5 to-transparent filter blur-md" />
          <div className="absolute inset-0 bg-repeat bg-[length:20px_20px] noise-overlay mix-blend-overlay opacity-30" />
        </div>
      )}

      {/* Crystalline or Organic noise/masks for Iced Tea and Fruits */}
      {(profile === "iced-tea" || profile === "iced-fruit-tea" || profile === "mojitos") && (
        <div className="absolute inset-0 opacity-[0.03] noise-overlay pointer-events-none" />
      )}
    </div>
  );
}
