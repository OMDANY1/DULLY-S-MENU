"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { MenuItem, MenuSize } from "@/domain/menu/types";
import { imageCurtain } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

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
  initialSizeIdx: number = 0
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

  // Reset state during render if product changes
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setRequestedIdx(initialSizeIdx);
    setDisplayedIdx(initialSizeIdx);
    setResolvedSrc("");
    setImageError(false);
    setIsTransitioning(false);
  }

  // Handle ref cleanup inside useEffect to satisfy ref lint rules
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
    const targetAsset = requestedSize?.image || product.image || "";

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

    return () => {
      active = false;
      if (transitionTimelineRef.current) {
        transitionTimelineRef.current.kill();
      }
    };
  }, [product.id, requestedIdx, reducedMotion, product.image, product.sizes]);

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
