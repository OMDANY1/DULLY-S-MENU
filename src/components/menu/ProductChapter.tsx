"use client";

import React from "react";
import { MenuItem } from "@/data/menu";
import ProductStage from "./ProductStage";

interface ProductChapterProps {
  products: MenuItem[];
  categoryId: string;
}

type LayoutType =
  | "MONUMENT"
  | "DUO_TENSION"
  | "TRIPTYCH_ARCHES"
  | "OFFSET_EDITORIAL"
  | "FULL_BLEED"
  | "TYPOGRAPHIC_SPLIT";

interface Chapter {
  layout: LayoutType;
  items: MenuItem[];
}

export default function ProductChapter({ products, categoryId }: ProductChapterProps) {
  // Deterministic partitioning based on category and count
  const partitionProducts = (): Chapter[] => {
    const list = [...products];
    const chapters: Chapter[] = [];

    if (categoryId === "hot-tea" || categoryId === "hot-tea-latte") {
      // 3 items -> Single triptych arches chapter matching visual references
      if (list.length === 3) {
        chapters.push({ layout: "TRIPTYCH_ARCHES", items: list });
        return chapters;
      }
    }

    let idx = 0;
    while (idx < list.length) {
      const remaining = list.length - idx;

      if (remaining === 1) {
        chapters.push({ layout: "MONUMENT", items: [list[idx]] });
        idx += 1;
      } else if (remaining === 2) {
        // Alternating duo layouts
        const layout = idx % 4 === 0 ? "DUO_TENSION" : "OFFSET_EDITORIAL";
        chapters.push({ layout, items: [list[idx], list[idx + 1]] });
        idx += 2;
      } else if (remaining === 3) {
        chapters.push({ layout: "TRIPTYCH_ARCHES", items: [list[idx], list[idx + 1], list[idx + 2]] });
        idx += 3;
      } else {
        // 4+ items: Take slices based on index patterns
        if (idx % 3 === 0) {
          chapters.push({ layout: "TYPOGRAPHIC_SPLIT", items: [list[idx], list[idx + 1]] });
          idx += 2;
        } else if (idx % 4 === 1) {
          chapters.push({ layout: "FULL_BLEED", items: [list[idx]] });
          idx += 1;
        } else {
          chapters.push({ layout: "TRIPTYCH_ARCHES", items: [list[idx], list[idx + 1], list[idx + 2]] });
          idx += 3;
        }
      }
    }

    return chapters;
  };

  const chapters = partitionProducts();

  return (
    <div className="space-y-32 md:space-y-48">
      {chapters.map((ch, cIdx) => {
        const key = `${categoryId}-chapter-${cIdx}-${ch.layout}`;

        switch (ch.layout) {
          case "MONUMENT": {
            const p = ch.items[0];
            return (
              <div
                key={key}
                className="relative py-12 md:py-24 flex flex-col items-center justify-center min-h-[70vh]"
              >
                {/* Decorative layout background detail */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                  <div className="text-[120px] md:text-[200px] font-condensed font-black tracking-widest text-white uppercase">
                    {p.name.split(" ")[0]}
                  </div>
                </div>

                <div className="w-full max-w-2xl relative z-10">
                  <ProductStage product={p} layoutMode="monument" />
                </div>
              </div>
            );
          }

          case "DUO_TENSION": {
            const [p1, p2] = ch.items;
            return (
              <div
                key={key}
                className="relative grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 py-16 items-start"
              >
                {/* Connecting geometric line */}
                <div className="hidden md:block absolute left-1/4 right-1/4 top-1/2 h-[0.5px] bg-crimson/20 -translate-y-1/2 pointer-events-none z-0" />
                
                <div className="relative z-10">
                  <ProductStage product={p1} layoutMode="duo-left" />
                </div>
                <div className="relative z-10 md:mt-32">
                  <ProductStage product={p2} layoutMode="duo-right" />
                </div>
              </div>
            );
          }

          case "TRIPTYCH_ARCHES": {
            const [p1, p2, p3] = ch.items;
            return (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 py-12 items-start"
              >
                <div className="relative z-10 md:mt-16">
                  <ProductStage product={p1} layoutMode="triptych-side" />
                </div>
                <div className="relative z-10">
                  <ProductStage product={p2} layoutMode="triptych-center" />
                </div>
                <div className="relative z-10 md:mt-24">
                  <ProductStage product={p3} layoutMode="triptych-side" />
                </div>
              </div>
            );
          }

          case "OFFSET_EDITORIAL": {
            const [p1, p2] = ch.items;
            return (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16 items-center"
              >
                <div className="md:col-span-7 relative z-10">
                  <ProductStage product={p1} layoutMode="offset-large" />
                </div>
                <div className="md:col-span-5 relative z-10 md:mt-24 md:pl-12">
                  <ProductStage product={p2} layoutMode="offset-small" />
                </div>
              </div>
            );
          }

          case "FULL_BLEED": {
            const p = ch.items[0];
            return (
              <div
                key={key}
                className="relative py-24 flex items-center justify-center min-h-[80vh] border-y border-white/5 bg-charcoal/5"
              >
                <div className="w-full max-w-3xl relative z-10">
                  <ProductStage product={p} layoutMode="full-bleed" />
                </div>
              </div>
            );
          }

          case "TYPOGRAPHIC_SPLIT": {
            const [p1, p2] = ch.items;
            return (
              <div
                key={key}
                className="relative grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 py-20 items-start"
              >
                {/* Large Background typography letters */}
                <div className="absolute inset-0 flex items-center justify-around opacity-5 pointer-events-none select-none">
                  <div className="text-[140px] md:text-[240px] font-condensed font-black tracking-widest text-white uppercase">
                    {p1.category.split("-")[0]}
                  </div>
                </div>

                <div className="relative z-10">
                  <ProductStage product={p1} layoutMode="typographic-left" />
                </div>
                <div className="relative z-10 md:mt-16">
                  <ProductStage product={p2} layoutMode="typographic-right" />
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
