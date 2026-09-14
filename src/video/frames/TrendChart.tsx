/**
 * trend-chart — a series with annotated thresholds.
 * The dedicated line/trend widget is still proposed (not built), so today this
 * renders whatever "media" component the script actually supplied (bar-chart is the
 * closest live widget) plus the annotation marks — the frame contract is satisfied
 * now, the visual sharpens once the trend-chart widget itself ships.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const TrendChart: FrameFC = ({ spec, slots, render }) => {
  const series = slots.series ?? [];
  const marks = slots.marks ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex flex-col gap-4 min-h-0">
        <div className="flex-grow min-h-0 flex items-center justify-center">
          {series.map((c, i) => <div key={c.id ?? i} className="w-full h-full">{render(c, i)}</div>)}
        </div>
        {marks.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center shrink-0">
            {marks.map((c, i) => (
              <div key={c.id ?? i} className="text-[10px]">{render(c, series.length + i)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
