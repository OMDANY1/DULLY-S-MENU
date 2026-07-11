"use client";

export type VolcanicStageVariant =
  | "slab"
  | "fractured"
  | "monolith"
  | "low-rock"
  | "wide-platform";

interface StoneStageProps {
  variant?: VolcanicStageVariant;
}

export default function StoneStage({ variant = "slab" }: StoneStageProps) {
  // SVG paths for irregular jagged stone faces based on the variant
  const getStonePath = () => {
    switch (variant) {
      case "slab":
        return {
          top: "M 12,8 L 88,10 L 82,2 L 18,1 Z", // Jagged top face
          front: "M 12,8 L 88,10 L 85,28 L 15,29 Z", // Rugged front block
          cracks: ["M 35,8 L 38,20", "M 65,10 L 63,22"],
        };
      case "fractured":
        return {
          top: "M 10,8 L 48,9 L 46,2 L 18,1 Z M 52,9 L 90,8 L 82,1 L 54,2 Z", // Fractured split top face
          front: "M 10,8 L 48,9 L 47,28 L 14,29 Z M 52,9 L 90,8 L 86,28 L 53,29 Z", // Split front faces
          cracks: ["M 25,8 L 27,24", "M 75,8 L 73,26"],
        };
      case "monolith":
        return {
          top: "M 25,12 L 75,10 L 70,2 L 30,1 Z", // Tall heavy block top
          front: "M 25,12 L 75,10 L 73,42 L 27,44 Z", // High front block face
          cracks: ["M 40,12 L 42,35", "M 60,10 L 58,38", "M 50,2 L 50,42"],
        };
      case "low-rock":
        return {
          top: "M 15,6 L 85,7 L 78,1 L 22,2 Z", // Low profile rough face
          front: "M 15,6 L 85,7 L 83,16 L 17,17 Z", // Shallow front face
          cracks: ["M 30,6 L 31,12", "M 50,6 L 48,15", "M 70,7 L 69,13"],
        };
      case "wide-platform":
        return {
          top: "M 5,8 L 95,9 L 88,1 L 12,2 Z", // Wide platform block
          front: "M 5,8 L 95,9 L 92,25 L 8,26 Z",
          cracks: ["M 20,8 L 22,22", "M 45,9 L 43,24", "M 80,9 L 78,21"],
        };
      default:
        return {
          top: "M 15,8 L 85,8 L 80,2 L 20,2 Z",
          front: "M 15,8 L 85,8 L 83,28 L 17,28 Z",
          cracks: [],
        };
    }
  };

  const stone = getStonePath();
  const heightClass = variant === "monolith" ? "h-24" : variant === "low-rock" ? "h-10" : "h-16";

  return (
    <div className={`relative w-full ${heightClass} pointer-events-none mt-4 select-none`}>
      {/* Ground Contact Shadow */}
      <div className="absolute bottom-[-6px] inset-x-2 h-4 bg-black/85 blur-md rounded-full z-0" />
      
      {/* Dynamic Crimson Underglow spotlight behind the rock pedestal */}
      <div className="absolute inset-x-8 bottom-1 h-3 bg-crimson/30 blur-md rounded-full animate-glow-breathe z-0" />

      {/* Procedural Volcanic Rock SVG */}
      <svg
        className="w-full h-full text-[#101010]"
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        fill="currentColor"
        stroke="none"
      >
        {/* SVG Noise filter for rugged stone textures */}
        <defs>
          <filter id="stoneNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>
        </defs>

        {/* Stone top plane (slightly lighter grey highlight, catches downlight) */}
        <path
          d={stone.top}
          className="text-[#1e1e1e]"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.2"
        />

        {/* Stone front block (dark shadow texture face) */}
        <path
          d={stone.front}
          className="text-[#0a0a0a]"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.15"
          filter="url(#stoneNoise)"
        />

        {/* Jagged cracks / fractures */}
        {stone.cracks.map((crack, idx) => (
          <path
            key={idx}
            d={crack}
            fill="none"
            stroke="#020202"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
