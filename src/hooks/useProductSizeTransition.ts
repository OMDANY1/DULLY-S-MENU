"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { MenuItem, MenuSize } from "@/domain/menu/types";
import { imageCurtain } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";
import { getOptimizedImageUrl } from "@/lib/image/normalization";

export interface SizeTransitionState {
  product: MenuItem;
  requestedIdx: number;
  displayedIdx: number;
  displayedSize: MenuSize;
  isTransitioning: boolean;
  resolvedSrc: string;
  imageError: boolean;
  requestSizeChange: (idx: number) => void;
  curtainRef: React.RefObject<HTMLDivElement | null>;
  imgRef: React.RefObject<HTMLImageElement | null>;
}

export function useProductSizeTransition(
  product: MenuItem,
  initialSizeIdx: number = 0,
  isPriority: boolean = false
): SizeTransitionState {
  const [requestedIdx, setRequestedIdx] = useState(initialSizeIdx);
  const [displayedIdx, setDisplayedIdx] = useState(initialSizeIdx);
  const [resolvedSrc, setResolvedSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reducedMotion = useReducedMotion();

  const curtainRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const currentAssetRef = useRef<string>("");
  const activePreloadUrlRef = useRef<string>("");
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const requestSizeChange = (idx: number) => {
    if (idx === requestedIdx) return;
    setRequestedIdx(idx);
  };

  // Reset state during render when product changes (React-recommended pattern
  // to avoid cascading renders from setState inside useEffect)
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setRequestedIdx(initialSizeIdx);
    setDisplayedIdx(initialSizeIdx);
    setResolvedSrc("");
    setImageError(false);
    setIsTransitioning(false);
  }

  // Handle ref cleanup inside useEffect (refs must only be mutated in effects/callbacks)
  useEffect(() => {
    currentAssetRef.current = "";
    activePreloadUrlRef.current = "";
    if (transitionTimelineRef.current) {
      transitionTimelineRef.current.kill();
      transitionTimelineRef.current = null;
    }
  }, [product.id]);

  useEffect(() => {
    let active = true;
    const requestedSize = product.sizes[requestedIdx];
    
    // Resolution order: requestedSize.image -> product.image -> fallback (null / "")
    const rawAsset = requestedSize?.image || product.image || "";
    const targetAsset = getOptimizedImageUrl(rawAsset, 384);

    // If the target path is already displayed, just update metadata and indices
    if (targetAsset === currentAssetRef.current) {
      setDisplayedIdx(requestedIdx);
      setIsTransitioning(false);
      return;
    }

    activePreloadUrlRef.current = targetAsset;

    const performTransition = (srcToSet: string, hasError: boolean) => {
      const performWipeSwap = () => {
        if (!active) return;
        setDisplayedIdx(requestedIdx);
        setResolvedSrc(srcToSet);
        currentAssetRef.current = srcToSet;
        setImageError(hasError);
      };

      // Play curtain transition if we have elements, an existing asset, and reduced motion is off
      if (
        imgRef.current &&
        curtainRef.current &&
        currentAssetRef.current &&
        !reducedMotion
      ) {
        setIsTransitioning(true);

        if (transitionTimelineRef.current) {
          transitionTimelineRef.current.kill();
        }

        const tl = imageCurtain(
          curtainRef.current,
          imgRef.current,
          performWipeSwap,
          {
            onComplete: () => {
              if (active) setIsTransitioning(false);
            },
          }
        );
        
        transitionTimelineRef.current = tl;
      } else {
        // Swap instantly for first render or reduced motion
        performWipeSwap();
        setIsTransitioning(false);
      }
    };

    let observer: IntersectionObserver | null = null;
    let hasLoadedOrObserved = false;

    const startPreload = () => {
      if (hasLoadedOrObserved) return;
      hasLoadedOrObserved = true;

      if (!targetAsset) {
        // Transition immediately to empty image state
        performTransition("", true);
      } else {
        // Preload image
        const img = new Image();
        img.onload = () => {
          if (!active || activePreloadUrlRef.current !== targetAsset) return;
          performTransition(targetAsset, false);
        };

        img.onerror = () => {
          if (!active || activePreloadUrlRef.current !== targetAsset) return;
          console.warn(`[IMAGE PRELOAD FAILURE] Failed to load target image: ${targetAsset}`);
          performTransition("", true);
        };

        img.src = targetAsset;
      }
    };

    if (isPriority) {
      startPreload();
    } else {
      // Use IntersectionObserver to lazy load below-fold products
      const elementToObserve = imgRef.current || curtainRef.current;
      if (elementToObserve && typeof window !== "undefined" && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                startPreload();
                if (observer) {
                  observer.disconnect();
                  observer = null;
                }
              }
            });
          },
          { rootMargin: "200px" }
        );
        observer.observe(elementToObserve);
      } else {
        startPreload();
      }
    }

    return () => {
      active = false;
      if (observer) {
        observer.disconnect();
      }
      if (transitionTimelineRef.current) {
        transitionTimelineRef.current.kill();
      }
    };
  }, [product.id, requestedIdx, reducedMotion, product.image, product.sizes, isPriority]);

  const displayedSize = product.sizes[displayedIdx] || product.sizes[0];

  return {
    product,
    requestedIdx,
    displayedIdx,
    displayedSize,
    isTransitioning,
    resolvedSrc,
    imageError,
    requestSizeChange,
    curtainRef,
    imgRef,
  };
}
