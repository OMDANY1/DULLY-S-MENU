import gsap from "gsap";

/**
 * Reusable premium GSAP visual motion primitives for Dully's digital menu.
 * These helpers perform precise clipping, path tracing, and depth enters
 * without relying on simple opacity/translateY fades.
 */

// 1. MASK REVEAL: clip-path wipe animation
export function maskReveal(
  element: gsap.TweenTarget,
  vars: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    element,
    { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1.2,
      ease: "power3.inOut",
      ...vars,
    }
  );
}

// 2. PATH TRACE: strokeDashoffset path drawing
export function pathTrace(
  path: SVGGeometryElement,
  vars: gsap.TweenVars = {}
) {
  const length = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  return gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: "power2.inOut",
    ...vars,
  });
}

// 3. STRUCTURAL LINE SWEEP: scaleX structural divider sweep
export function lineSweep(
  line: gsap.TweenTarget,
  vars: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    line,
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: 0.8,
      ease: "power2.out",
      transformOrigin: "left center",
      ...vars,
    }
  );
}

// 4. DEPTH ENTER: 3D scale, filter blur, and localized Z-translation
export function depthEnter(
  element: gsap.TweenTarget,
  vars: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    element,
    {
      scale: 0.94,
      filter: "blur(8px)",
      z: -100,
      opacity: 0,
    },
    {
      scale: 1,
      filter: "blur(0px)",
      z: 0,
      opacity: 1,
      duration: 1.0,
      ease: "power3.out",
      ...vars,
    }
  );
}

// 5. IMAGE CURTAIN: sweep curtain transition for swapping product assets
export function imageCurtain(
  curtain: gsap.TweenTarget,
  imageWrapper: gsap.TweenTarget,
  onMidpoint: () => void,
  vars: gsap.TweenVars = {}
) {
  const tl = gsap.timeline();
  // Curtain sweeps down/across
  tl.fromTo(
    curtain,
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.35,
      ease: "power2.in",
    }
  );

  // Swap target image at the midpoint (hidden behind the curtain)
  tl.add(() => {
    onMidpoint();
  });

  // Scale image slightly during swap
  tl.fromTo(
    imageWrapper,
    { scale: 0.96 },
    { scale: 1, duration: 0.4, ease: "power2.out" },
    "<"
  );

  // Curtain sweeps away
  tl.to(curtain, {
    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    duration: 0.35,
    ease: "power2.out",
    ...vars,
  });

  return tl;
}

// 6. TYPOGRAPHY CLIP: clip-path text wrapper vertical clip
export function typographyClip(
  textElement: gsap.TweenTarget,
  vars: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    textElement,
    { yPercent: 100, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      ...vars,
    }
  );
}

// 7. ATMOSPHERE WAKE: animate radial light scale and blur intensity
export function atmosphereWake(
  glow: gsap.TweenTarget,
  vars: gsap.TweenVars = {}
) {
  return gsap.fromTo(
    glow,
    { scale: 0.8, opacity: 0, filter: "blur(120px)" },
    {
      scale: 1,
      opacity: 1,
      filter: "blur(100px)",
      duration: 1.5,
      ease: "power2.out",
      ...vars,
    }
  );
}
