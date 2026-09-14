/** feature-grid — even grid, column count adapts to count. No recorded defect; parity migration. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

function adaptiveGridCols(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count <= 3) return "grid-cols-1 md:grid-cols-2";
  if (count <= 6) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

export const FeatureGrid: FrameFC = ({ spec, slots, render }) => {
  const cells = [...(slots.cells ?? [])].sort((a, b) => {
    const ao = a.data?.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.data?.order ?? Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className={`flex-grow grid ${adaptiveGridCols(cells.length)} gap-8 w-full max-w-[1600px] mx-auto auto-rows-fr`}>
        {cells.map((c, i) => render(c, i))}
      </div>
    </div>
  );
};
