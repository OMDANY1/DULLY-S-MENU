"use client";

export default function StoneStage() {
  return (
    <div className="relative w-full h-16 pointer-events-none mt-4 select-none">
      {/* 3D Volcanic stone look using layered gradients and noise */}
      <div className="absolute inset-x-4 top-0 h-4 bg-gradient-to-b from-[#141414] to-[#0d0d0d] rounded-[50%] border-t border-white/5 shadow-inner z-10" />
      
      {/* Stone Pedestal Body */}
      <div 
        className="absolute inset-x-4 top-2 bottom-0 bg-gradient-to-b from-[#0d0d0d] via-[#090909] to-[#040404] border-x border-white/5 shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
        style={{
          clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
        }}
      >
        {/* Irregular cracks and stone texture lines */}
        <div className="absolute inset-0 opacity-15 bg-repeat pointer-events-none noise-overlay mix-blend-overlay" />
        
        {/* Highlight/shadow contours */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/80 to-transparent" />
      </div>

      {/* Ground Contact Shadow */}
      <div className="absolute bottom-[-10px] inset-x-0 h-4 bg-black/90 blur-md rounded-[50%] z-0" />
    </div>
  );
}
