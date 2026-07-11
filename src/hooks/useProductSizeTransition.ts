"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { MenuItem, MenuSize } from "@/domain/menu/types";
import { getProductAssetCandidates } from "@/lib/productAssets";
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
  const activePreloadRequestRef = useRef<boolean>(true);

  const requestSizeChange = (idx: number) => {
    if (idx === requestedIdx) return;
    setRequestedIdx(idx);
  };

  // Reset indices if product changes
  useEffect(() => {
    setRequestedIdx(initialSizeIdx);
    setDisplayedIdx(initialSizeIdx);
    setResolvedSrc("");
    setImageError(false);
    setIsTransitioning(false);
    currentAssetRef.current = "";
    activePreloadUrlRef.current = "";
    activePreloadRequestRef.current = true;
    if (transitionTimelineRef.current) {
      transitionTimelineRef.current.kill();
      transitionTimelineRef.current = null;
    }
  }, [product.id, initialSizeIdx]);

  useEffect(() => {
    let active = true;
    activePreloadRequestRef.current = active;
    const requestedSize = product.sizes[requestedIdx];
    const candidates = getProductAssetCandidates(product.id, requestedSize.label);
    
    // Resolve which candidate to load sequentially
    let candidateIdx = 0;

    const tryLoadNext = () => {
      if (!active) return;
      if (candidateIdx >= candidates.length) {
        setImageError(true);
        setIsTransitioning(false);
        return;
      }

      const targetPath = candidates[candidateIdx];

      // If the target path is already displayed, just update metadata and indices
      if (targetPath === currentAssetRef.current) {
        setDisplayedIdx(requestedIdx);
        setImageError(false);
        setIsTransitioning(false);
        return;
      }

      // Track active preloaded URL
      activePreloadUrlRef.current = targetPath;

      const img = new Image();
      img.onload = () => {
        if (!active || activePreloadUrlRef.current !== targetPath) return;

        const performWipeSwap = () => {
          if (!active) return;
          setDisplayedIdx(requestedIdx);
          setResolvedSrc(targetPath);
          currentAssetRef.current = targetPath;
          setImageError(false);
        };

        // If the elements exist and we have a current image, do the curtain transition
        if (
          imgRef.current &&
          curtainRef.current &&
          currentAssetRef.current &&
          !reducedMotion
        ) {
          setIsTransitioning(true);

          // Kill any active running size timelines
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
          // Instantly swap for first render or reduced motion
          performWipeSwap();
          setIsTransitioning(false);
        }
      };

      img.onerror = () => {
        candidateIdx++;
        tryLoadNext();
      };

      img.src = targetPath;
    };

    tryLoadNext();

    return () => {
      active = false;
      activePreloadRequestRef.current = false;
      // Kill timelines on unmount
      if (transitionTimelineRef.current) {
        transitionTimelineRef.current.kill();
      }
    };
  }, [product.id, requestedIdx, reducedMotion]);

  const displayedSize = product.sizes[displayedIdx];

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
