/**
 * Normalizes size labels (e.g. "16 OZ" -> "16oz", "Premium" -> "premium")
 * and returns the candidate asset paths in order of priority.
 */
export function getProductAssetCandidates(
  productId: string,
  sizeLabel: string
): string[] {
  const cleanSize = sizeLabel.toLowerCase().replace(/\s+/g, "");
  const candidates: string[] = [];

  // 1. Size-specific path if valid size suffix exists
  if (
    cleanSize &&
    (cleanSize.endsWith("oz") ||
      cleanSize === "premium" ||
      cleanSize === "standard")
  ) {
    candidates.push(`/assets/products/${productId}-${cleanSize}.png`);
  }

  // 2. Default product fallback image path
  candidates.push(`/assets/products/${productId}.png`);

  return candidates;
}
