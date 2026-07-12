"use client";

import React from "react";
import { MenuItem } from "@/domain/menu/types";
import { useProductSizeTransition, SizeTransitionState } from "@/hooks/useProductSizeTransition";

interface ProductSceneProps {
  product: MenuItem;
  initialSizeIdx?: number;
  isPriority?: boolean;
  children: (state: SizeTransitionState) => React.ReactNode;
}

export default function ProductScene({
  product,
  initialSizeIdx = 0,
  isPriority = false,
  children,
}: ProductSceneProps) {
  const state = useProductSizeTransition(product, initialSizeIdx, isPriority);
  return <>{children(state)}</>;
}
export type { SizeTransitionState };
