"use client";

import React from "react";
import { MenuItem } from "@/domain/menu/types";
import {
  ProductVisual,
  ProductIdentity,
  ProductPrice,
  ProductCalories,
} from "./ProductStage";
import ProductSizeSelector from "./ProductSizeSelector";
import ArchFrame, { getArchFamily } from "@/components/ui/ArchFrame";
import StoneStage from "@/components/ui/StoneStage";
import ProductScene from "./ProductScene";

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
  // Partition products into visual chapters
  const partitionProducts = (): Chapter[] => {
    const list = [...products];
    const chapters: Chapter[] = [];

    if (categoryId === "hot-tea" || categoryId === "hot-tea-latte") {
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
        const layout = idx % 4 === 0 ? "DUO_TENSION" : "OFFSET_EDITORIAL";
        chapters.push({ layout, items: [list[idx], list[idx + 1]] });
        idx += 2;
      } else if (remaining === 3) {
        chapters.push({ layout: "TRIPTYCH_ARCHES", items: [list[idx], list[idx + 1], list[idx + 2]] });
        idx += 3;
      } else {
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
    <div className="space-y-28 md:space-y-48 w-full">
      {chapters.map((ch, cIdx) => {
        const key = `${categoryId}-ch-${cIdx}-${ch.layout}`;

        switch (ch.layout) {
          // ==========================================
          // SCENE 01: MONUMENT (Hero Poster Layout)
          // ==========================================
          case "MONUMENT": {
            const p = ch.items[0];

            return (
              <div key={key} className="w-full">
                {/* Desktop Scene: Monumental off-center editorial */}
                <div className="hidden md:flex relative w-full min-h-[80svh] items-center justify-center overflow-hidden">
                  <ProductScene product={p} isPriority={cIdx === 0}>
                    {(scene) => (
                      <>
                        {/* Background Huge Crop Letter */}
                        <div className="absolute inset-0 flex items-center justify-start opacity-[0.03] select-none pointer-events-none z-0 px-8">
                          <span className="text-[28vw] font-condensed font-black tracking-widest text-white uppercase leading-none">
                            {p.name.split(" ")[0]}
                          </span>
                        </div>

                        {/* Chapter-owned architecture and grounds */}
                        <div className="absolute inset-y-0 right-10 w-1/2 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-[110%] h-[85%] scale-[1.1] opacity-75">
                            <ArchFrame family={getArchFamily(p.category)} />
                          </div>
                        </div>

                        <div className="absolute bottom-4 right-[10%] w-[45%] h-36 z-10 pointer-events-none">
                          <StoneStage variant="monolith" />
                        </div>

                        {/* Centered Site Container for Functional Content */}
                        <div className="site-container relative z-20 flex flex-row items-center justify-between w-full">
                          {/* Left Side: Edge Metadata arrangement */}
                          <div className="w-1/3 flex flex-col items-start justify-center pr-6">
                            <ProductIdentity
                              num={p.num}
                              name={p.name}
                              arabicName={p.arabicName}
                              align="left"
                            />

                            {/* Technical details roll block */}
                            <div className="mt-8 pt-6 border-t border-crimson/20 w-36 flex flex-col items-start space-y-3">
                              <ProductPrice price={scene.displayedSize.price} align="left" size="large" />
                              <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="left" />
                            </div>

                            <div className="mt-12">
                              <ProductSizeSelector
                                sizes={p.sizes}
                                selectedIdx={scene.requestedIdx}
                                onChange={scene.requestSizeChange}
                              />
                            </div>
                          </div>

                          {/* Right Side: Oversized Hero Product Visual */}
                          <div className="w-3/5 flex items-center justify-center">
                            <ProductVisual
                              product={p}
                              resolvedSrc={scene.resolvedSrc}
                              imageError={scene.imageError}
                              curtainRef={scene.curtainRef}
                              imgRef={scene.imgRef}
                              imageClass="w-[clamp(320px,34vw,660px)] h-[65vh] select-none"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </ProductScene>
                </div>

                {/* Mobile Scene: Single structured narrative view */}
                <div className="flex md:hidden flex-col items-center justify-center min-h-[75svh] w-full px-4">
                  <ProductScene product={p} isPriority={cIdx === 0}>
                    {(scene) => (
                      <>
                        <div className="relative w-full h-[48svh] flex items-center justify-center">
                          <div className="absolute inset-0 scale-[0.9] opacity-40">
                            <ArchFrame family={getArchFamily(p.category)} />
                          </div>
                          <div className="absolute bottom-0 w-4/5 h-20 opacity-60">
                            <StoneStage variant="slab" />
                          </div>
                          <ProductVisual
                            product={p}
                            resolvedSrc={scene.resolvedSrc}
                            imageError={scene.imageError}
                            curtainRef={scene.curtainRef}
                            imgRef={scene.imgRef}
                            imageClass="w-[72vw] h-[40svh]"
                          />
                        </div>
                        <div className="w-full text-center mt-6 flex flex-col items-center">
                          <ProductIdentity num={p.num} name={p.name} arabicName={p.arabicName} align="center" />
                          <div className="mt-3 flex items-center space-x-6">
                            <ProductPrice price={scene.displayedSize.price} align="center" />
                            <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="center" />
                          </div>
                          <div className="mt-5">
                            <ProductSizeSelector
                              sizes={p.sizes}
                              selectedIdx={scene.requestedIdx}
                              onChange={scene.requestSizeChange}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </ProductScene>
                </div>
              </div>
            );
          }

          // ==========================================
          // SCENE 02: DUO TENSION (Tension composition)
          // ==========================================
          case "DUO_TENSION": {
            const [p1, p2] = ch.items;

            return (
              <div key={key} className="w-full">
                {/* Desktop Scene */}
                <div className="hidden md:flex relative w-full min-h-[80svh] items-center justify-center overflow-hidden">
                  {/* Visual Connecting Red Coordinate Line */}
                  <div className="absolute left-[15%] right-[15%] top-1/2 h-[1px] bg-gradient-to-r from-crimson/5 via-crimson/30 to-crimson/5 -translate-y-1/2 pointer-events-none z-10" />

                  <div className="site-container relative z-20 flex flex-row items-center justify-between w-full">
                    {/* Left Column: Product A (Lower mass, large) */}
                    <div className="relative w-[47%] flex flex-row items-center justify-start mt-10">
                      <ProductScene product={p1} isPriority={cIdx === 0}>
                        {(scene1) => (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 scale-[1.05] opacity-50 pointer-events-none">
                                <ArchFrame family={getArchFamily(p1.category)} />
                              </div>
                              <div className="absolute bottom-4 left-4 w-4/5 h-20 opacity-80 pointer-events-none">
                                <StoneStage variant="slab" />
                              </div>
                              <ProductVisual
                                product={p1}
                                resolvedSrc={scene1.resolvedSrc}
                                imageError={scene1.imageError}
                                curtainRef={scene1.curtainRef}
                                imgRef={scene1.imgRef}
                                imageClass="w-[clamp(260px,27vw,500px)] h-[50vh]"
                              />
                            </div>

                            {/* Metadata right of image */}
                            <div className="ml-8 flex flex-col items-start max-w-[200px]">
                              <ProductIdentity num={p1.num} name={p1.name} arabicName={p1.arabicName} align="left" />
                              <div className="mt-4 flex flex-col items-start space-y-1">
                                <ProductPrice price={scene1.displayedSize.price} align="left" />
                                <ProductCalories calories={scene1.displayedSize.calories} calorieNote={scene1.displayedSize.calorieNote} align="left" />
                              </div>
                              <div className="mt-6">
                                <ProductSizeSelector
                                  sizes={p1.sizes}
                                  selectedIdx={scene1.requestedIdx}
                                  onChange={scene1.requestSizeChange}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </ProductScene>
                    </div>

                    {/* Right Column: Product B (Higher mass, smaller) */}
                    <div className="relative w-[47%] flex flex-row-reverse items-center justify-start mb-10">
                      <ProductScene product={p2} isPriority={cIdx === 0}>
                        {(scene2) => (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 scale-[1.05] opacity-50 pointer-events-none">
                                <ArchFrame family={getArchFamily(p2.category)} />
                              </div>
                              <div className="absolute bottom-4 right-4 w-4/5 h-20 opacity-80 pointer-events-none">
                                <StoneStage variant="fractured" />
                              </div>
                              <ProductVisual
                                product={p2}
                                resolvedSrc={scene2.resolvedSrc}
                                imageError={scene2.imageError}
                                curtainRef={scene2.curtainRef}
                                imgRef={scene2.imgRef}
                                imageClass="w-[clamp(220px,22vw,420px)] h-[44vh]"
                              />
                            </div>

                            {/* Metadata left of image */}
                            <div className="mr-8 flex flex-col items-end text-right max-w-[200px]">
                              <ProductIdentity num={p2.num} name={p2.name} arabicName={p2.arabicName} align="right" />
                              <div className="mt-4 flex flex-col items-end space-y-1">
                                <ProductPrice price={scene2.displayedSize.price} align="right" />
                                <ProductCalories calories={scene2.displayedSize.calories} calorieNote={scene2.displayedSize.calorieNote} align="right" />
                              </div>
                              <div className="mt-6">
                                <ProductSizeSelector
                                  sizes={p2.sizes}
                                  selectedIdx={scene2.requestedIdx}
                                  onChange={scene2.requestSizeChange}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </ProductScene>
                    </div>
                  </div>
                </div>

                {/* Mobile Scene: Two sequential narratives */}
                <div className="flex md:hidden flex-col space-y-24 w-full">
                  {[p1, p2].map((p) => (
                    <ProductScene key={p.id} product={p} isPriority={cIdx === 0}>
                      {(scene) => (
                        <div className="flex flex-col items-center min-h-[75svh] justify-center px-4">
                          <div className="relative w-full h-[45svh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[0.9] opacity-40">
                              <ArchFrame family={getArchFamily(p.category)} />
                            </div>
                            <div className="absolute bottom-0 w-4/5 h-16 opacity-60">
                              <StoneStage variant="slab" />
                            </div>
                            <ProductVisual
                              product={p}
                              resolvedSrc={scene.resolvedSrc}
                              imageError={scene.imageError}
                              curtainRef={scene.curtainRef}
                              imgRef={scene.imgRef}
                              imageClass="w-[68vw] h-[38svh]"
                            />
                          </div>
                          <div className="w-full text-center mt-6 flex flex-col items-center">
                            <ProductIdentity num={p.num} name={p.name} arabicName={p.arabicName} align="center" />
                            <div className="mt-2 flex items-center space-x-6">
                              <ProductPrice price={scene.displayedSize.price} align="center" />
                              <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-4">
                              <ProductSizeSelector
                                sizes={p.sizes}
                                selectedIdx={scene.requestedIdx}
                                onChange={scene.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>
                  ))}
                </div>
              </div>
            );
          }

          // ==========================================
          // SCENE 03: TRIPTYCH ARCHES (Concentric portals)
          // ==========================================
          case "TRIPTYCH_ARCHES": {
            const [p1, p2, p3] = ch.items;

            return (
              <div key={key} className="w-full">
                {/* Desktop Scene */}
                <div className="hidden md:flex flex-col relative w-full min-h-[70vh] justify-center overflow-hidden">
                  
                  {/* Main horizontal triptych row */}
                  <div className="site-container grid grid-cols-3 gap-8 items-end relative z-20 w-full mt-4">
                    
                    {/* Left Arch Portal */}
                    <ProductScene product={p1} isPriority={cIdx === 0}>
                      {(scene1) => (
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative w-full h-[38vh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[1.02] opacity-50">
                              <ArchFrame family={getArchFamily(p1.category)} />
                            </div>
                            <div className="absolute bottom-2 w-4/5 h-16 opacity-75 pointer-events-none">
                              <StoneStage variant="slab" />
                            </div>
                            <div className="absolute w-[180px] h-[180px] rounded-full bg-crimson/5 blur-[50px] pointer-events-none" />
                            <ProductVisual
                              product={p1}
                              resolvedSrc={scene1.resolvedSrc}
                              imageError={scene1.imageError}
                              curtainRef={scene1.curtainRef}
                              imgRef={scene1.imgRef}
                              imageClass="w-[clamp(180px,16vw,300px)] h-[32vh]"
                            />
                          </div>
                          <div className="text-center mt-6">
                            <ProductIdentity num={p1.num} name={p1.name} arabicName={p1.arabicName} align="center" />
                            <div className="mt-3 flex items-center justify-center space-x-4">
                              <ProductPrice price={scene1.displayedSize.price} align="center" />
                              <ProductCalories calories={scene1.displayedSize.calories} calorieNote={scene1.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-4">
                              <ProductSizeSelector
                                sizes={p1.sizes}
                                selectedIdx={scene1.requestedIdx}
                                onChange={scene1.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>

                    {/* Center Arch Portal (Dominant center portal) */}
                    <ProductScene product={p2} isPriority={cIdx === 0}>
                      {(scene2) => (
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative w-full h-[46vh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[1.08] opacity-75">
                              <ArchFrame family={getArchFamily(p2.category)} />
                            </div>
                            <div className="absolute bottom-2 w-4/5 h-16 opacity-90 pointer-events-none">
                              <StoneStage variant="low-rock" />
                            </div>
                            <div className="absolute w-[240px] h-[240px] rounded-full bg-crimson/10 blur-[60px] pointer-events-none" />
                            <ProductVisual
                              product={p2}
                              resolvedSrc={scene2.resolvedSrc}
                              imageError={scene2.imageError}
                              curtainRef={scene2.curtainRef}
                              imgRef={scene2.imgRef}
                              imageClass="w-[clamp(240px,22vw,400px)] h-[40vh]"
                            />
                          </div>
                          <div className="text-center mt-8">
                            <ProductIdentity num={p2.num} name={p2.name} arabicName={p2.arabicName} align="center" />
                            <div className="mt-3 flex items-center justify-center space-x-6">
                              <ProductPrice price={scene2.displayedSize.price} align="center" size="large" />
                              <ProductCalories calories={scene2.displayedSize.calories} calorieNote={scene2.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-5">
                              <ProductSizeSelector
                                sizes={p2.sizes}
                                selectedIdx={scene2.requestedIdx}
                                onChange={scene2.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>

                    {/* Right Arch Portal */}
                    <ProductScene product={p3} isPriority={cIdx === 0}>
                      {(scene3) => (
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative w-full h-[38vh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[1.02] opacity-50">
                              <ArchFrame family={getArchFamily(p3.category)} />
                            </div>
                            <div className="absolute bottom-2 w-4/5 h-16 opacity-75 pointer-events-none">
                              <StoneStage variant="fractured" />
                            </div>
                            <div className="absolute w-[180px] h-[180px] rounded-full bg-crimson/5 blur-[50px] pointer-events-none" />
                            <ProductVisual
                              product={p3}
                              resolvedSrc={scene3.resolvedSrc}
                              imageError={scene3.imageError}
                              curtainRef={scene3.curtainRef}
                              imgRef={scene3.imgRef}
                              imageClass="w-[clamp(180px,16vw,300px)] h-[32vh]"
                            />
                          </div>
                          <div className="text-center mt-6">
                            <ProductIdentity num={p3.num} name={p3.name} arabicName={p3.arabicName} align="center" />
                            <div className="mt-3 flex items-center justify-center space-x-4">
                              <ProductPrice price={scene3.displayedSize.price} align="center" />
                              <ProductCalories calories={scene3.displayedSize.calories} calorieNote={scene3.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-4">
                              <ProductSizeSelector
                                sizes={p3.sizes}
                                selectedIdx={scene3.requestedIdx}
                                onChange={scene3.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>

                  </div>
                </div>

                {/* Mobile Scene: Three sequential narratives */}
                <div className="flex md:hidden flex-col space-y-24 w-full">
                  {[p1, p2, p3].map((p) => (
                    <ProductScene key={p.id} product={p} isPriority={cIdx === 0}>
                      {(scene) => (
                        <div className="flex flex-col items-center min-h-[75svh] justify-center px-4">
                          <div className="relative w-full h-[45svh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[0.9] opacity-40">
                              <ArchFrame family={getArchFamily(p.category)} />
                            </div>
                            <div className="absolute bottom-0 w-4/5 h-16 opacity-60">
                              <StoneStage variant="slab" />
                            </div>
                            <ProductVisual
                              product={p}
                              resolvedSrc={scene.resolvedSrc}
                              imageError={scene.imageError}
                              curtainRef={scene.curtainRef}
                              imgRef={scene.imgRef}
                              imageClass="w-[68vw] h-[38svh]"
                            />
                          </div>
                          <div className="w-full text-center mt-6 flex flex-col items-center">
                            <ProductIdentity num={p.num} name={p.name} arabicName={p.arabicName} align="center" />
                            <div className="mt-2 flex items-center space-x-6">
                              <ProductPrice price={scene.displayedSize.price} align="center" />
                              <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-4">
                              <ProductSizeSelector
                                sizes={p.sizes}
                                selectedIdx={scene.requestedIdx}
                                onChange={scene.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>
                  ))}
                </div>
              </div>
            );
          }

          // ==========================================
          // SCENE 04: OFFSET EDITORIAL (Imbalanced sizing)
          // ==========================================
          case "OFFSET_EDITORIAL": {
            const [p1, p2] = ch.items;

            return (
              <div key={key} className="w-full">
                {/* Desktop Scene */}
                <div className="hidden md:flex relative w-full min-h-[85svh] items-center justify-center overflow-hidden">
                  
                  <div className="site-container relative z-20 flex flex-row items-center justify-between w-full">
                    {/* Left Column: Product A (Visual giant) */}
                    <div className="relative w-[54%] flex flex-col items-start">
                      <ProductScene product={p1} isPriority={cIdx === 0}>
                        {(scene1) => (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 scale-[1.05] opacity-60 pointer-events-none">
                                <ArchFrame family={getArchFamily(p1.category)} />
                              </div>
                              <div className="absolute bottom-2 left-6 w-[85%] h-24 opacity-80 pointer-events-none">
                                <StoneStage variant="monolith" />
                              </div>
                              <ProductVisual
                                product={p1}
                                resolvedSrc={scene1.resolvedSrc}
                                imageError={scene1.imageError}
                                curtainRef={scene1.curtainRef}
                                imgRef={scene1.imgRef}
                                imageClass="w-[clamp(360px,38vw,720px)] h-[62vh]"
                              />
                            </div>

                            {/* Metadata anchored in negative bottom left space */}
                            <div className="mt-8 flex flex-row items-end space-x-12">
                              <ProductIdentity num={p1.num} name={p1.name} arabicName={p1.arabicName} align="left" />
                              <div className="flex flex-col items-start justify-end pb-1 space-y-1">
                                <ProductPrice price={scene1.displayedSize.price} align="left" />
                                <ProductCalories calories={scene1.displayedSize.calories} calorieNote={scene1.displayedSize.calorieNote} align="left" />
                              </div>
                              <div className="pb-1">
                                <ProductSizeSelector
                                  sizes={p1.sizes}
                                  selectedIdx={scene1.requestedIdx}
                                  onChange={scene1.requestSizeChange}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </ProductScene>
                    </div>

                    {/* Right Column: Product B (Small edge product) */}
                    <div className="relative w-[38%] flex flex-col items-end justify-center pr-4 mt-20">
                      <ProductScene product={p2} isPriority={cIdx === 0}>
                        {(scene2) => (
                          <>
                            <div className="relative">
                              <div className="absolute inset-0 scale-[0.98] opacity-35 pointer-events-none">
                                <ArchFrame family={getArchFamily(p2.category)} />
                              </div>
                              <div className="absolute bottom-0 w-[90%] h-14 opacity-50 pointer-events-none">
                                <StoneStage variant="low-rock" />
                              </div>
                              <ProductVisual
                                product={p2}
                                resolvedSrc={scene2.resolvedSrc}
                                imageError={scene2.imageError}
                                curtainRef={scene2.curtainRef}
                                imgRef={scene2.imgRef}
                                imageClass="w-[clamp(210px,19vw,340px)] h-[38vh]"
                              />
                            </div>
                            
                            <div className="mt-6 text-right flex flex-col items-end">
                              <ProductIdentity num={p2.num} name={p2.name} arabicName={p2.arabicName} align="right" />
                              <div className="mt-3 flex items-center space-x-4">
                                <ProductPrice price={scene2.displayedSize.price} align="right" />
                                <ProductCalories calories={scene2.displayedSize.calories} calorieNote={scene2.displayedSize.calorieNote} align="right" />
                              </div>
                              <div className="mt-4">
                                <ProductSizeSelector
                                  sizes={p2.sizes}
                                  selectedIdx={scene2.requestedIdx}
                                  onChange={scene2.requestSizeChange}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </ProductScene>
                    </div>
                  </div>

                </div>

                {/* Mobile Scene: Two sequential narratives */}
                <div className="flex md:hidden flex-col space-y-24 w-full">
                  {[p1, p2].map((p) => (
                    <ProductScene key={p.id} product={p} isPriority={cIdx === 0}>
                      {(scene) => (
                        <div className="flex flex-col items-center min-h-[75svh] justify-center px-4">
                          <div className="relative w-full h-[45svh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[0.9] opacity-40">
                              <ArchFrame family={getArchFamily(p.category)} />
                            </div>
                            <div className="absolute bottom-0 w-4/5 h-16 opacity-60">
                              <StoneStage variant="slab" />
                            </div>
                            <ProductVisual
                              product={p}
                              resolvedSrc={scene.resolvedSrc}
                              imageError={scene.imageError}
                              curtainRef={scene.curtainRef}
                              imgRef={scene.imgRef}
                              imageClass="w-[68vw] h-[38svh]"
                            />
                          </div>
                          <div className="w-full text-center mt-6 flex flex-col items-center">
                            <ProductIdentity num={p.num} name={p.name} arabicName={p.arabicName} align="center" />
                            <div className="mt-2 flex items-center space-x-6">
                              <ProductPrice price={scene.displayedSize.price} align="center" />
                              <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-4">
                              <ProductSizeSelector
                                sizes={p.sizes}
                                selectedIdx={scene.requestedIdx}
                                onChange={scene.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>
                  ))}
                </div>
              </div>
            );
          }

          // ==========================================
          // SCENE 05: TYPOGRAPHIC SPLIT (Letter overlap)
          // ==========================================
          case "TYPOGRAPHIC_SPLIT": {
            const [p1, p2] = ch.items;

            return (
              <div key={key} className="w-full">
                {/* Desktop Scene */}
                <div className="hidden md:flex relative w-full min-h-[80vh] items-center justify-center overflow-hidden">
                  
                  {/* Giant physical text background that products pass through */}
                  <div aria-hidden="true" className="absolute inset-x-0 top-1/4 flex justify-between px-12 pointer-events-none select-none z-0">
                    <span className="text-[18vw] font-condensed font-black tracking-widest text-crimson/[0.015] leading-none uppercase">
                      TEA
                    </span>
                    <span className="text-[18vw] font-condensed font-black tracking-widest text-crimson/[0.015] leading-none uppercase">
                      LATTE
                    </span>
                  </div>

                  <div className="site-container relative z-20 flex flex-row items-center justify-between w-full">
                    {/* Left product overlapping the letters */}
                    <div className="relative w-[45%] flex flex-col items-start mt-6">
                      <ProductScene product={p1} isPriority={cIdx === 0}>
                        {(scene1) => (
                          <div className="flex flex-col items-start w-full">
                            <div className="relative">
                              <div className="absolute inset-0 scale-[1.04] opacity-50">
                                <ArchFrame family={getArchFamily(p1.category)} />
                              </div>
                              <div className="absolute bottom-2 w-4/5 h-20 opacity-70">
                                <StoneStage variant="slab" />
                              </div>
                              <ProductVisual
                                product={p1}
                                resolvedSrc={scene1.resolvedSrc}
                                imageError={scene1.imageError}
                                curtainRef={scene1.curtainRef}
                                imgRef={scene1.imgRef}
                                imageClass="w-[clamp(220px,24vw,440px)] h-[44vh] z-10"
                              />
                            </div>
                            
                            {/* Metadata stacked vertically under the visual */}
                            <div className="mt-6 flex flex-col items-start w-full max-w-[340px] space-y-4">
                              <ProductIdentity num={p1.num} name={p1.name} arabicName={p1.arabicName} align="left" />
                              <div className="flex items-center space-x-6">
                                <ProductPrice price={scene1.displayedSize.price} align="left" />
                                <ProductCalories calories={scene1.displayedSize.calories} calorieNote={scene1.displayedSize.calorieNote} align="left" />
                              </div>
                              <ProductSizeSelector
                                sizes={p1.sizes}
                                selectedIdx={scene1.requestedIdx}
                                onChange={scene1.requestSizeChange}
                              />
                            </div>
                          </div>
                        )}
                      </ProductScene>
                    </div>

                    {/* Right product overlapping letters */}
                    <div className="relative w-[45%] flex flex-col items-end mb-6">
                      <ProductScene product={p2} isPriority={cIdx === 0}>
                        {(scene2) => (
                          <div className="flex flex-col items-end w-full">
                            <div className="relative">
                              <div className="absolute inset-0 scale-[1.04] opacity-50">
                                <ArchFrame family={getArchFamily(p2.category)} />
                              </div>
                              <div className="absolute bottom-2 right-4 w-4/5 h-20 opacity-70">
                                <StoneStage variant="fractured" />
                              </div>
                              <ProductVisual
                                product={p2}
                                resolvedSrc={scene2.resolvedSrc}
                                imageError={scene2.imageError}
                                curtainRef={scene2.curtainRef}
                                imgRef={scene2.imgRef}
                                imageClass="w-[clamp(220px,24vw,440px)] h-[44vh] z-10"
                              />
                            </div>

                            {/* Metadata stacked vertically under the visual (aligned right) */}
                            <div className="mt-6 flex flex-col items-end w-full max-w-[340px] space-y-4 text-right">
                              <ProductIdentity num={p2.num} name={p2.name} arabicName={p2.arabicName} align="right" />
                              <div className="flex items-center space-x-6 space-x-reverse">
                                <ProductPrice price={scene2.displayedSize.price} align="right" />
                                <ProductCalories calories={scene2.displayedSize.calories} calorieNote={scene2.displayedSize.calorieNote} align="right" />
                              </div>
                              <ProductSizeSelector
                                sizes={p2.sizes}
                                selectedIdx={scene2.requestedIdx}
                                onChange={scene2.requestSizeChange}
                              />
                            </div>
                          </div>
                        )}
                      </ProductScene>
                    </div>
                  </div>

                </div>

                {/* Mobile Scene */}
                <div className="flex md:hidden flex-col space-y-24 w-full">
                  {[p1, p2].map((p) => (
                    <ProductScene key={p.id} product={p} isPriority={cIdx === 0}>
                      {(scene) => (
                        <div className="flex flex-col items-center min-h-[75svh] justify-center px-4">
                          <div className="relative w-full h-[45svh] flex items-center justify-center">
                            <div className="absolute inset-0 scale-[0.9] opacity-40">
                              <ArchFrame family={getArchFamily(p.category)} />
                            </div>
                            <div className="absolute bottom-0 w-4/5 h-16 opacity-60">
                              <StoneStage variant="slab" />
                            </div>
                            <ProductVisual
                              product={p}
                              resolvedSrc={scene.resolvedSrc}
                              imageError={scene.imageError}
                              curtainRef={scene.curtainRef}
                              imgRef={scene.imgRef}
                              imageClass="w-[68vw] h-[38svh]"
                            />
                          </div>
                          <div className="w-full text-center mt-6 flex flex-col items-center">
                            <ProductIdentity num={p.num} name={p.name} arabicName={p.arabicName} align="center" />
                            <div className="mt-2 flex items-center space-x-6">
                              <ProductPrice price={scene.displayedSize.price} align="center" />
                              <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="center" />
                            </div>
                            <div className="mt-4">
                              <ProductSizeSelector
                                sizes={p.sizes}
                                selectedIdx={scene.requestedIdx}
                                onChange={scene.requestSizeChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </ProductScene>
                  ))}
                </div>
              </div>
            );
          }

          // ==========================================
          // SCENE 06: FULL BLEED (Viewport scene composition)
          // ==========================================
          case "FULL_BLEED": {
            const p = ch.items[0];

            return (
              <div key={key} className="w-full">
                {/* Desktop Scene: Full viewport bleed */}
                <div className="hidden md:flex relative w-full h-[95svh] items-center justify-center overflow-hidden">
                  <ProductScene product={p} isPriority={cIdx === 0}>
                    {(scene) => (
                      <>
                        {/* Huge crop arch overlay */}
                        <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center opacity-30 pointer-events-none scale-[1.3] z-10">
                          <ArchFrame family={getArchFamily(p.category)} />
                        </div>

                        {/* Volcanic Stage extending past screen borders */}
                        <div className="absolute bottom-0 inset-x-0 h-40 scale-x-125 pointer-events-none z-15 opacity-80">
                          <StoneStage variant="wide-platform" />
                        </div>

                        {/* Gigantic visual occupying 55vw */}
                        <div className="relative z-20 flex items-center justify-center">
                          <ProductVisual
                            product={p}
                            resolvedSrc={scene.resolvedSrc}
                            imageError={scene.imageError}
                            curtainRef={scene.curtainRef}
                            imgRef={scene.imgRef}
                            imageClass="w-[clamp(420px,50vw,900px)] h-[75vh]"
                          />
                        </div>

                        {/* Site Container overlay for corner anchored functional metadata */}
                        <div className="site-container absolute inset-0 pointer-events-none z-35 flex flex-col justify-between py-12">
                          {/* Top row */}
                          <div className="flex justify-between items-start w-full">
                            {/* Top Left: English Identity */}
                            <div className="text-left select-none pointer-events-auto">
                              <span className="font-condensed text-[11px] text-crimson tracking-[0.25em] uppercase font-bold block mb-1">
                                {p.num ? p.num.padStart(2, "0") : "00"}
                              </span>
                              <h3 className="font-condensed text-[24px] font-black text-white tracking-[0.15em] uppercase leading-tight">
                                {p.name}
                              </h3>
                            </div>

                            {/* Top Right: Arabic Identity */}
                            <div className="text-right select-none pointer-events-auto" dir="rtl">
                              <span className="font-arabic text-[18px] text-crimson font-medium leading-none">
                                {p.arabicName}
                              </span>
                            </div>
                          </div>

                          {/* Bottom row */}
                          <div className="flex justify-between items-end w-full">
                            {/* Bottom Left: Size control */}
                            <div className="pointer-events-auto">
                              <ProductSizeSelector
                                sizes={p.sizes}
                                selectedIdx={scene.requestedIdx}
                                onChange={scene.requestSizeChange}
                              />
                            </div>

                            {/* Bottom Right: Price / Calories specification */}
                            <div className="flex flex-col items-end space-y-1 select-none pointer-events-auto">
                              <ProductPrice price={scene.displayedSize.price} align="right" size="large" />
                              <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="right" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </ProductScene>
                </div>

                {/* Mobile Scene */}
                <div className="flex md:hidden flex-col items-center justify-center min-h-[75svh] w-full px-4">
                  <ProductScene product={p} isPriority={cIdx === 0}>
                    {(scene) => (
                      <>
                        <div className="relative w-full h-[48svh] flex items-center justify-center">
                          <div className="absolute inset-0 scale-[0.9] opacity-40">
                            <ArchFrame family={getArchFamily(p.category)} />
                          </div>
                          <div className="absolute bottom-0 w-4/5 h-20 opacity-60">
                            <StoneStage variant="slab" />
                          </div>
                          <ProductVisual
                            product={p}
                            resolvedSrc={scene.resolvedSrc}
                            imageError={scene.imageError}
                            curtainRef={scene.curtainRef}
                            imgRef={scene.imgRef}
                            imageClass="w-[72vw] h-[40svh]"
                          />
                        </div>
                        <div className="w-full text-center mt-6 flex flex-col items-center">
                          <ProductIdentity num={p.num} name={p.name} arabicName={p.arabicName} align="center" />
                          <div className="mt-3 flex items-center space-x-6">
                            <ProductPrice price={scene.displayedSize.price} align="center" />
                            <ProductCalories calories={scene.displayedSize.calories} calorieNote={scene.displayedSize.calorieNote} align="center" />
                          </div>
                          <div className="mt-5">
                            <ProductSizeSelector
                              sizes={p.sizes}
                              selectedIdx={scene.requestedIdx}
                              onChange={scene.requestSizeChange}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </ProductScene>
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
