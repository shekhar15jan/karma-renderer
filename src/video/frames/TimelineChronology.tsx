/**
 * timeline-chronology — dated milestones along a horizontal axis.
 * Spacing is even, not proportional to the actual date gaps (proportional spacing
 * needs date parsing beyond what's available here) — a documented simplification,
 * not a silent one. roadmap-timeline is status-based; this is date-based.
 */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const TimelineChronology: FrameFC = ({ spec, slots, render }) => {
  const marks = slots.marks ?? [];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex items-center justify-center min-h-0">
        <div className="w-full max-w-[1400px] relative flex items-center justify-between">
          <div className="absolute left-0 right-0 h-0.5" style={{ background: "var(--scene-border)", top: "50%" }} />
          {marks.map((c, i) => (
            <div key={c.id ?? i} className="relative z-10 flex flex-col items-center" style={{ flex: "1 1 0" }}>
              {render(c, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
