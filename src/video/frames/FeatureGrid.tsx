/** feature-grid — even grid, column count adapts to count. No recorded defect; parity migration. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

function adaptiveGridCols(count: number): string {
  // Balanced rows: 4 cards as 2x2 rather than 3+1, 3 cards on one row.
  if (count <= 1) return "grid-cols-1";
  if (count === 2 || count === 4) return "grid-cols-2";
  if (count === 3 || count <= 6) return "grid-cols-3";
  return "grid-cols-4";
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
      {/* Cards keep their natural height and the grid is centred, instead of stretching to fill the frame. */}
      <div className="flex-grow w-full flex items-center">
        <div className={`grid ${adaptiveGridCols(cells.length)} gap-8 w-full max-w-[1600px] mx-auto items-start`}>
          {cells.map((c, i) => render(c, i))}
        </div>
      </div>
    </div>
  );
};
