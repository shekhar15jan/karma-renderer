/**
 * metric-trio — two or three headline numbers side by side.
 * Unlike big-number, each tile renders through its own widget (stat-card, etc.),
 * which already has a value display — no bespoke counting logic needed here.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const MetricTrio: FrameFC = ({ spec, slots, render }) => {
  const metrics = slots.metrics ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center justify-center gap-8 min-h-0">
        {metrics.map((c, i) => (
          <div key={c.id ?? i} className="flex-1 max-w-[360px]">{render(c, i)}</div>
        ))}
      </div>
    </div>
  );
};
