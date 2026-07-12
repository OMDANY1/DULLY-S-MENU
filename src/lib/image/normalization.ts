/**
 * Client-side utility to normalize product image cutouts before upload.
 * It trims any transparent outer margins/padding and places the cropped
 * artwork centered on an 800x800 square transparent canvas.
 */
export async function normalizeProductImage(file: File): Promise<File> {
  // If the file is not an image, return it unchanged
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // We only normalize transparent PNG or WebP images
  if (file.type !== "image/png" && file.type !== "image/webp") {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Create temporary canvas to inspect pixel values
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0);

      // Analyze alpha channel to find bounding box of non-transparent pixels
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let minX = canvas.width;
      let maxX = 0;
      let minY = canvas.height;
      let maxY = 0;
      let hasContent = false;

      // Loop through all pixels. Alpha values range from 0 to 255.
      // A threshold of 5 is used to ignore compression artifacts / noise.
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];
          if (alpha > 5) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If the image is completely transparent or has no content, return original file
      if (!hasContent) {
        resolve(file);
        return;
      }

      // Calculate bounding box dimensions
      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;

      // Target normalized dimensions: 800x800 square
      const targetSize = 800;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = targetSize;
      finalCanvas.height = targetSize;
      const finalCtx = finalCanvas.getContext("2d");
      if (!finalCtx) {
        resolve(file);
        return;
      }

      // Scale the cropped artwork to occupy exactly 92% of the square canvas
      const maxDim = Math.max(cropW, cropH);
      const scale = (targetSize * 0.92) / maxDim;

      const drawW = cropW * scale;
      const drawH = cropH * scale;
      const drawX = (targetSize - drawW) / 2;
      const drawY = (targetSize - drawH) / 2;

      // Draw the cropped portion centered on the square canvas
      finalCtx.drawImage(
        canvas,
        minX,
        minY,
        cropW,
        cropH,
        drawX,
        drawY,
        drawW,
        drawH
      );

      // Export canvas to a Blob and package as a File
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            const origName = file.name;
            const dotIdx = origName.lastIndexOf(".");
            const baseName = dotIdx !== -1 ? origName.substring(0, dotIdx) : origName;
            
            // Output as standard PNG
            const newFile = new File([blob], `${baseName}_normalized.png`, {
              type: "image/png",
            });
            resolve(newFile);
          } else {
            resolve(file);
          }
        },
        "image/png"
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
