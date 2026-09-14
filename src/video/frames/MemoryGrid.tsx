/**
 * memory-grid — indexed cells, position is the point. Backing widget (cell-grid) is
 * still proposed; today this renders whatever "media" component was supplied (a
 * table works reasonably as an indexed grid) plus the legend.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const MemoryGrid: FrameFC = ({ spec, slots, render }) => {
  const cells = slots.cells?.[0];
  const legend = slots.legend ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex flex-col items-center justify-center gap-4 min-h-0">
        {cells && <div className="w-full max-w-[1400px]">{render(cells, 0)}</div>}
        {legend.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center shrink-0">
            {legend.map((c, i) => <div key={c.id ?? i} className="text-[11px]">{render(c, 1 + i)}</div>)}
          </div>
        )}
      </div>
    </div>
  );
};
