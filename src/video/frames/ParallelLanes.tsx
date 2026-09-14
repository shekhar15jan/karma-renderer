/** parallel-lanes — 2-3 concurrent tracks side by side, plus an optional shared note. */
import React from "react";
import { KarmaSlideHeader } from "../../components/widgets/HtmlWidgets";
import type { FrameFC } from "./types";

export const ParallelLanes: FrameFC = ({ spec, slots, render }) => {
  const lanes = slots.lanes ?? [];
  const shared = slots.shared?.[0];
  return (
    <div className="w-full h-full p-16 flex flex-col z-10 relative">
      <KarmaSlideHeader title={spec.title} subtitle={spec.subtitle} />
      <div className="flex-grow w-full flex flex-col gap-4 min-h-0">
        <div className="flex-grow w-full flex gap-6 min-h-0">
          {lanes.map((c, i) => (
            <div key={c.id ?? i} className="flex-1 min-w-0 rounded-xl p-5 flex flex-col gap-3"
                 style={{ background: "var(--scene-surface)", border: "1px solid var(--scene-border)" }}>
              {render(c, i)}
            </div>
          ))}
        </div>
        {shared && (
          <div className="shrink-0 rounded-lg px-5 py-3 text-center" style={{ background: "var(--scene-surface2)" }}>
            {render(shared, lanes.length)}
          </div>
        )}
      </div>
    </div>
  );
};
