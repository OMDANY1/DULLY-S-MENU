"use client";

import { MenuItem } from "@/data/menu";
import ProductStage from "./ProductStage";

interface ProductChapterProps {
  products: MenuItem[];
}

export default function ProductChapter({ products }: ProductChapterProps) {
  // We group products dynamically into chapters (Monument, Duo, Triptych, Offset, Asymmetric Grid)
  const chapters: React.ReactNode[] = [];
  let index = 0;

  while (index < products.length) {
    const remaining = products.length - index;

    // Categorized layout pacing rules:
    if (remaining === 1) {
      // 1 product: MONUMENT (center block with wide space)
      const p = products[index];
      chapters.push(
        <div key={`monument-${p.id}`} className="py-16 flex justify-center">
          <div className="w-full max-w-xl">
            <ProductStage product={p} />
          </div>
        </div>
      );
      index += 1;
    } else if (remaining === 2) {
      // 2 products: DUO (two side-by-side but with offset/asymmetric height margins!)
      const p1 = products[index];
      const p2 = products[index + 1];
      chapters.push(
        <div key={`duo-${p1.id}`} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 py-16 items-start">
          <div className="md:mt-0">
            <ProductStage product={p1} />
          </div>
          <div className="md:mt-24">
            <ProductStage product={p2} />
          </div>
        </div>
      );
      index += 2;
    } else if (remaining === 3) {
      // 3 products: TRIPTYCH (three columns asymmetric layouts)
      const p1 = products[index];
      const p2 = products[index + 1];
      const p3 = products[index + 2];
      chapters.push(
        <div key={`triptych-${p1.id}`} className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 py-16 items-start">
          <div className="md:mt-16">
            <ProductStage product={p1} />
          </div>
          <div className="md:mt-0">
            <ProductStage product={p2} />
          </div>
          <div className="md:mt-24">
            <ProductStage product={p3} />
          </div>
        </div>
      );
      index += 3;
    } else {
      // 4+ products: Split them into a Duo, then a Monument, or similar layout pacing rhythm
      const p1 = products[index];
      const p2 = products[index + 1];
      const p3 = products[index + 2];
      const p4 = products[index + 3];
      chapters.push(
        <div key={`asymmetric-${p1.id}`} className="py-16 space-y-24">
          {/* First two: Duo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
            <div className="md:mt-0">
              <ProductStage product={p1} />
            </div>
            <div className="md:mt-16">
              <ProductStage product={p2} />
            </div>
          </div>
          
          {/* Next two: Offset Split */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <ProductStage product={p3} />
            </div>
            <div className="md:col-span-5 md:pl-12 md:mt-24">
              <ProductStage product={p4} />
            </div>
          </div>
        </div>
      );
      index += 4;
    }
  }

  return <div className="space-y-16">{chapters}</div>;
}
